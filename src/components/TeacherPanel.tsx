import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { 
  Teacher, Student, ClassItem, SubjectItem, Material, JournalEntry, Exam, ExamQuestion, QuestionType, TeacherScheduleNote, TeacherAnnouncement, QuestionBank, ExamSubmission, ShareRequest, CheatLog
} from '../types';

import { 
  BookOpen, Plus, Trash2, Calendar, FileText, ToggleLeft, ToggleRight, ListTodo, Key, Clock, HelpCircle, Save, Check,
  FileSpreadsheet, Upload, AlertCircle, Clipboard, Download, Info, Printer, Filter, BarChart3, X, Settings, Building, UserCheck, ShieldAlert,
  Edit3, Camera, User, Image, MapPin, Bell, Megaphone, AlertTriangle, Sparkles, Send, Database, CheckCircle, FileCode, Users
} from 'lucide-react';

export interface SchoolIdentityConfig {
  header1: string;
  header2: string;
  schoolName: string;
  address: string;
  cityLocation: string;
  principalName: string;
  principalNip: string;
}

interface TeacherPanelProps {
  currentTeacher: Teacher;
  classes: ClassItem[];
  subjects: SubjectItem[];
  students: Student[];
  materials: Material[];
  exams: Exam[];
  questionBanks?: QuestionBank[];
  journals: JournalEntry[];
  submissions?: ExamSubmission[];
  cheatLogs?: CheatLog[];
  onSaveMaterial: (materi: Omit<Material, 'id' | 'createdAt'>) => void;
  onUpdateMaterial?: (materi: Material) => void;
  onToggleMaterial: (id: string, currentStatus: 'Aktif' | 'Draft') => void;
  onDeleteMaterial?: (id: string) => void;
  onSaveExam: (exam: Omit<Exam, 'id' | 'createdAt'>) => void;
  onUpdateExam?: (exam: Exam) => void;
  onDeleteExam?: (id: string) => void;
  onSaveQuestionBank?: (bank: Omit<QuestionBank, 'id' | 'createdAt' | 'updatedAt'> | QuestionBank) => void;
  onDeleteQuestionBank?: (id: string) => void;
  onSaveJournal: (entry: Omit<JournalEntry, 'id'>) => void;
  onUpdateTeacher?: (updated: Teacher) => void;
  announcements?: TeacherAnnouncement[];
  shareRequests?: ShareRequest[];
  teachers?: Teacher[];
  onShareToTeacher?: (request: Omit<ShareRequest, 'id' | 'createdAt'>) => void;
  onRespondShare?: (requestId: string, response: 'Accepted' | 'Rejected') => void;
  onSaveAnnouncement?: (ann: Omit<TeacherAnnouncement, 'id' | 'createdAt'>) => void;
  onDeleteAnnouncement?: (id: string) => void;
  onToggleAnnouncement?: (id: string) => void;
}

export function renderFormattedText(text: string, fontPreset?: 'Sans' | 'Serif' | 'Grotesk' | 'Mono') {
  if (!text) return null;

  // Font family determination based on preset
  let fontClass = 'font-sans';
  if (fontPreset === 'Serif') fontClass = 'font-serif tracking-normal font-normal text-slate-800';
  if (fontPreset === 'Grotesk') fontClass = 'font-sans tracking-tight font-extrabold text-slate-900';
  if (fontPreset === 'Mono') fontClass = 'font-mono text-xs text-slate-800 bg-slate-50/50 p-2.5 rounded-lg border border-slate-200/50';

  // Split text by markdown bold, italic, underline, code, and links
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);

  return (
    <div className={`${fontClass} leading-relaxed whitespace-pre-wrap`}>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index} className="font-extrabold text-slate-950">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={index} className="italic text-slate-800">{part.slice(1, -1)}</em>;
        }
        if (part.startsWith('__') && part.endsWith('__')) {
          return <span key={index} className="underline decoration-indigo-500 decoration-2">{part.slice(2, -2)}</span>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={index} className="bg-slate-100 text-pink-600 px-1.5 py-0.5 rounded font-mono text-[11px] border border-slate-200">{part.slice(1, -1)}</code>;
        }
        if (part.startsWith('[') && part.includes('](')) {
          const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
          if (match) {
            const [_, linkText, linkUrl] = match;
            return (
              <a
                key={index}
                href={linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-indigo-600 hover:text-indigo-800 font-bold underline decoration-indigo-300 hover:decoration-indigo-600 transition"
              >
                {linkText} 🔗
              </a>
            );
          }
        }
        return part;
      })}
    </div>
  );
}

export default function TeacherPanel({
  currentTeacher,
  classes,
  subjects,
  students,
  materials,
  exams,
  questionBanks = [],
  journals,
  submissions = [],
  onSaveMaterial,
  onUpdateMaterial,
  onToggleMaterial,
  onDeleteMaterial,
  onSaveExam,
  onUpdateExam,
  onDeleteExam,
  onSaveQuestionBank,
  onDeleteQuestionBank,
  onSaveJournal,
  onUpdateTeacher,
  announcements = [],
  shareRequests = [],
  teachers = [],
  onShareToTeacher,
  onRespondShare,
  onSaveAnnouncement,
  onDeleteAnnouncement,
  onToggleAnnouncement,
  cheatLogs = []
}: TeacherPanelProps) {
  const [activeTab, setActiveTab] = useState<'journal' | 'materials' | 'exams' | 'bank_soal' | 'daftar_nilai' | 'profile' | 'announcements' | 'cheatlogs'>('journal');

  // --- 0. IDENTITAS SEKOLAH & KEPALA SEKOLAH STATE ---
  const [schoolIdentity, setSchoolIdentity] = useState<SchoolIdentityConfig>(() => {
    const saved = localStorage.getItem('smpn1beji_school_identity');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      header1: 'PEMERINTAH KABUPATEN PASURUAN',
      header2: 'DINAS PENDIDIKAN',
      schoolName: 'SMP NEGERI 1 BEJI',
      address: 'Jl. Wicaksana No. 22A Gununggangsir Beji, Kab Pasuruan',
      cityLocation: 'Beji, Kab. Pasuruan',
      principalName: 'Dr. H. Ahmad Wijaya, M.Pd.',
      principalNip: '19720512 199802 1 004'
    };
  });

  const [editIdentityForm, setEditIdentityForm] = useState<SchoolIdentityConfig>(schoolIdentity);

  useEffect(() => {
    setEditIdentityForm(schoolIdentity);
  }, [schoolIdentity]);

  const handleSaveSchoolIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    setSchoolIdentity(editIdentityForm);
    localStorage.setItem('smpn1beji_school_identity', JSON.stringify(editIdentityForm));
    toast('Identitas Sekolah & Nama Kepala Sekolah berhasil diperbarui!');
  };

  // --- 0.5. PROFILE & SCHEDULE STATE ---
  const [profilePhotoInput, setProfilePhotoInput] = useState(currentTeacher.photoUrl || '');
  const [profileNameInput, setProfileNameInput] = useState(currentTeacher.name || '');
  const [profileNipInput, setProfileNipInput] = useState(currentTeacher.nip || '');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  useEffect(() => {
    setProfilePhotoInput(currentTeacher.photoUrl || '');
    setProfileNameInput(currentTeacher.name || '');
    setProfileNipInput(currentTeacher.nip || '');
  }, [currentTeacher]);

  const handleProfilePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProfilePhotoInput(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfileChanges = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedTeacher: Teacher = {
      ...currentTeacher,
      name: profileNameInput,
      nip: profileNipInput,
      photoUrl: profilePhotoInput
    };
    if (onUpdateTeacher) {
      onUpdateTeacher(updatedTeacher);
    }
    setProfileSuccessMsg('Foto Profil & Biodata Guru Mapel berhasil diperbarui!');
    setTimeout(() => setProfileSuccessMsg(''), 4000);
  };

  // Schedule Notes State
  const [scheduleNotes, setScheduleNotes] = useState<TeacherScheduleNote[]>(() => {
    const saved = localStorage.getItem(`gas_schedule_${currentTeacher.id}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: 'sch_1',
        teacherId: currentTeacher.id,
        day: 'Senin',
        jamKe: 'Jam Ke 1 - 2 (2 Jam Pelajaran)',
        classId: classes[0]?.id || 'c1',
        className: classes[0]?.name || 'VII-A',
        room: 'Ruang Kelas VII-A',
        note: 'Materi Pengantar & Absensi Sesi Pagi'
      },
      {
        id: 'sch_2',
        teacherId: currentTeacher.id,
        day: 'Rabu',
        jamKe: 'Jam Ke 3 - 4 (2 Jam Pelajaran)',
        classId: classes[1]?.id || 'c2',
        className: classes[1]?.name || 'VIII-A',
        room: 'Lab Komputer / Ruang Kelas',
        note: 'Latihan Soal & Diskusi Kelompok'
      }
    ];
  });

  const parseJamsFromText = (text: string): number[] => {
    const rangeMatch = text.match(/Jam Ke\s*(\d+)\s*-\s*(\d+)/i);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10);
      const end = parseInt(rangeMatch[2], 10);
      if (!isNaN(start) && !isNaN(end) && start <= end && end <= 12) {
        const arr: number[] = [];
        for (let i = start; i <= end; i++) arr.push(i);
        return arr;
      }
    }
    const numbersMatch = text.match(/\d+/g);
    if (numbersMatch) {
      const nums = numbersMatch.map(n => parseInt(n, 10)).filter(n => !isNaN(n) && n >= 1 && n <= 12);
      if (nums.length > 0) return Array.from(new Set(nums)).sort((a,b)=>a-b);
    }
    return [];
  };

  const formatJamsText = (nums: number[]): string => {
    if (nums.length === 0) return '';
    const sorted = [...nums].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const isConsecutive = sorted.length === max - min + 1;
    if (sorted.length === 1) {
      return `Jam Ke ${min} (1 Jam Pelajaran)`;
    }
    if (isConsecutive) {
      return `Jam Ke ${min} - ${max} (${sorted.length} Jam Pelajaran)`;
    }
    return `Jam Ke ${sorted.join(', ')} (${sorted.length} Jam Pelajaran)`;
  };

  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('Semua');
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [schedDay, setSchedDay] = useState<'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jum\'at' | 'Sabtu'>('Senin');
  const [schedJam, setSchedJam] = useState('Jam Ke 1 - 2 (2 Jam Pelajaran)');
  const [selectedJams, setSelectedJams] = useState<number[]>([1, 2]);
  const [schedClass, setSchedClass] = useState('');
  const [schedRoom, setSchedRoom] = useState('Ruang Kelas');
  const [schedNote, setSchedNote] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const handleToggleJam = (num: number) => {
    const exists = selectedJams.includes(num);
    const next = exists ? selectedJams.filter(n => n !== num) : [...selectedJams, num];
    setSelectedJams(next);
    setSchedJam(formatJamsText(next));
  };

  const handleSetPresetJams = (nums: number[]) => {
    setSelectedJams(nums);
    setSchedJam(formatJamsText(nums));
  };

  const handleOpenAddSchedule = () => {
    setEditingScheduleId(null);
    setSchedDay('Senin');
    setSchedJam('Jam Ke 1 - 2 (2 Jam Pelajaran)');
    setSelectedJams([1, 2]);
    setSchedClass(classes[0]?.name || 'VII-A');
    setSchedRoom('Ruang Kelas');
    setSchedNote('');
    setShowScheduleModal(true);
  };

  const handleOpenEditSchedule = (note: TeacherScheduleNote) => {
    setEditingScheduleId(note.id);
    setSchedDay(note.day);
    setSchedJam(note.jamKe);
    setSelectedJams(parseJamsFromText(note.jamKe));
    setSchedClass(note.className);
    setSchedRoom(note.room || '');
    setSchedNote(note.note);
    setShowScheduleModal(true);
  };

  const handleSaveScheduleNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedJam || !schedClass) return;

    let updated: TeacherScheduleNote[];
    if (editingScheduleId) {
      updated = scheduleNotes.map(n => n.id === editingScheduleId ? {
        ...n,
        day: schedDay,
        jamKe: schedJam,
        className: schedClass,
        classId: classes.find(c => c.name === schedClass)?.id || schedClass,
        room: schedRoom,
        note: schedNote
      } : n);
    } else {
      const newNode: TeacherScheduleNote = {
        id: `sch_${Math.random().toString(36).substring(7)}`,
        teacherId: currentTeacher.id,
        day: schedDay,
        jamKe: schedJam,
        classId: classes.find(c => c.name === schedClass)?.id || schedClass,
        className: schedClass,
        room: schedRoom,
        note: schedNote
      };
      updated = [...scheduleNotes, newNode];
    }
    setScheduleNotes(updated);
    localStorage.setItem(`gas_schedule_${currentTeacher.id}`, JSON.stringify(updated));
    setShowScheduleModal(false);
  };

  const handleDeleteScheduleNote = (id: string) => {
    const updated = scheduleNotes.filter(n => n.id !== id);
    setScheduleNotes(updated);
    localStorage.setItem(`gas_schedule_${currentTeacher.id}`, JSON.stringify(updated));
  };

  // --- ANNOUNCEMENTS / NOTIFICATIONS STATE ---
  const [showAddAnnModal, setShowAddAnnModal] = useState(false);
  const [annTitleInput, setAnnTitleInput] = useState('');
  const [annContentInput, setAnnContentInput] = useState('');
  const [annTargetType, setAnnTargetType] = useState<'all' | 'class'>('all');
  const [annTargetClass, setAnnTargetClass] = useState(classes[0]?.name || 'VII-A');
  const [annPriority, setAnnPriority] = useState<'normal' | 'penting' | 'mendesak'>('penting');

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitleInput.trim() || !annContentInput.trim()) return;
    if (onSaveAnnouncement) {
      onSaveAnnouncement({
        teacherId: currentTeacher.id,
        teacherName: currentTeacher.name,
        teacherSubject: currentTeacher.subject,
        targetType: annTargetType,
        targetClassId: annTargetType === 'class' ? classes.find(c => c.name === annTargetClass)?.id : undefined,
        targetClassName: annTargetType === 'class' ? annTargetClass : undefined,
        title: annTitleInput.trim(),
        content: annContentInput.trim(),
        priority: annPriority,
        isActive: true
      });
    }
    setAnnTitleInput('');
    setAnnContentInput('');
    setShowAddAnnModal(false);
    toast('Notifikasi Catatan / Informasi berhasil dikirim kepada Siswa!');
  };

  const teacherAnnouncements = announcements.filter(a => {
    if (currentTeacher.name === 'Semua Guru') return true;
    const currentSubjects = (currentTeacher.subject || '').split(',').map(s => s.trim().toLowerCase());
    const annSubjects = (a.teacherSubject || '').split(',').map(s => s.trim().toLowerCase());
    const hasSubjectOverlap = currentTeacher.subject !== 'Semua Mata Pelajaran' && currentSubjects.some(s => annSubjects.includes(s));
    return a.teacherId === currentTeacher.id || 
           a.teacherName === currentTeacher.name || 
           hasSubjectOverlap;
  });

  // --- 1. JOURNAL STATE ---
  const [journalSubTab, setJournalSubTab] = useState<'form' | 'recap_daily' | 'recap_weekly' | 'recap_monthly' | 'settings'>('form');
  const [journalDate, setJournalDate] = useState(new Date().toISOString().split('T')[0]);
  const [journalClass, setJournalClass] = useState('');
  const [journalSubject, setJournalSubject] = useState('');
  const [journalStartPeriod, setJournalStartPeriod] = useState<number>(2);
  const [journalEndPeriod, setJournalEndPeriod] = useState<number>(4);
  const [journalTopic, setJournalTopic] = useState('');
  const [journalObjectives, setJournalObjectives] = useState('');
  const [journalNotes, setJournalNotes] = useState('');
  const [attendance, setAttendance] = useState<{ [studentId: string]: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' }>({});
  const [journalSuccessMessage, setJournalSuccessMessage] = useState('');

  // Recap filter states
  const [recapFilterDate, setRecapFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [recapFilterMonth, setRecapFilterMonth] = useState(new Date().toISOString().slice(0, 7)); // e.g. "2026-07"
  const [printModalData, setPrintModalData] = useState<{ isOpen: boolean; title: string; subtitle: string; entries: JournalEntry[] }>({
    isOpen: false,
    title: '',
    subtitle: '',
    entries: []
  });

  // Get active student lists matching selected class
  const classStudents = students.filter(s => s.classId === journalClass);

  useEffect(() => {
    // Set default attendance for newly selected class
    const initialAtt: typeof attendance = {};
    classStudents.forEach(s => {
      initialAtt[s.id] = 'Hadir';
    });
    setAttendance(initialAtt);
  }, [journalClass, students]);

  const handleAttendanceChange = (studentId: string, status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa') => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalClass || !journalSubject || !journalTopic || !journalObjectives) {
      toast('Mohon lengkapi data kelas, mapel, topik, dan tujuan pembelajaran!');
      return;
    }

    if (journalStartPeriod > journalEndPeriod) {
      toast('Jam mulai pembelajaran tidak boleh lebih besar dari jam selesai!');
      return;
    }

    const attendanceList = classStudents.map(s => ({
      studentId: s.id,
      status: attendance[s.id] || 'Hadir'
    }));

    onSaveJournal({
      date: journalDate,
      classId: journalClass,
      subjectId: journalSubject,
      teacherId: currentTeacher.id,
      topic: journalTopic,
      learningObjectives: journalObjectives,
      notes: journalNotes,
      startPeriod: Number(journalStartPeriod),
      endPeriod: Number(journalEndPeriod),
      attendance: attendanceList
    });

    setJournalTopic('');
    setJournalObjectives('');
    setJournalNotes('');
    setJournalSuccessMessage('Jurnal Mengajar Digital berhasil disimpan ke Google Sheets!');
    setTimeout(() => setJournalSuccessMessage(''), 4000);
  };

  const getAbsentStudentDetails = (entry: JournalEntry) => {
    const sakitNames = entry.attendance
      .filter(a => a.status === 'Sakit')
      .map(a => students.find(s => s.id === a.studentId)?.name || a.studentId);
    const izinNames = entry.attendance
      .filter(a => a.status === 'Izin')
      .map(a => students.find(s => s.id === a.studentId)?.name || a.studentId);
    const alpaNames = entry.attendance
      .filter(a => a.status === 'Alpa')
      .map(a => students.find(s => s.id === a.studentId)?.name || a.studentId);

    return { sakitNames, izinNames, alpaNames };
  };

  const renderAbsentStudentsCell = (entry: JournalEntry) => {
    const hadir = entry.attendance.filter(a => a.status === 'Hadir').length;
    const { sakitNames, izinNames, alpaNames } = getAbsentStudentDetails(entry);
    const totalAbsent = sakitNames.length + izinNames.length + alpaNames.length;

    return (
      <div className="space-y-1.5 min-w-[200px]">
        <div className="font-mono text-[11px] font-bold text-center bg-slate-100/80 py-1 px-2 rounded-lg border border-slate-200">
          <span className="text-emerald-700">{hadir}H</span> / <span className="text-blue-600">{sakitNames.length}S</span> / <span className="text-amber-600">{izinNames.length}I</span> / <span className="text-red-600">{alpaNames.length}A</span>
        </div>
        {totalAbsent === 0 ? (
          <div className="text-center">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-extrabold text-[10px] border border-emerald-200">
              ✅ Semua Hadir (100%)
            </span>
          </div>
        ) : (
          <div className="space-y-1 text-[10px] text-left">
            {sakitNames.length > 0 && (
              <div className="p-1.5 bg-blue-50 border border-blue-200 text-blue-950 rounded-md leading-relaxed shadow-2xs">
                <span className="font-black text-blue-700">🤒 Sakit ({sakitNames.length}): </span>
                <span className="font-semibold">{sakitNames.join(', ')}</span>
              </div>
            )}
            {izinNames.length > 0 && (
              <div className="p-1.5 bg-amber-50 border border-amber-200 text-amber-950 rounded-md leading-relaxed shadow-2xs">
                <span className="font-black text-amber-700">📩 Izin ({izinNames.length}): </span>
                <span className="font-semibold">{izinNames.join(', ')}</span>
              </div>
            )}
            {alpaNames.length > 0 && (
              <div className="p-1.5 bg-red-50 border border-red-200 text-red-950 rounded-md leading-relaxed shadow-2xs">
                <span className="font-black text-red-700">❌ Alpa ({alpaNames.length}): </span>
                <span className="font-semibold">{alpaNames.join(', ')}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const getDayNameIndo = (dateStr: string) => {
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return '-';
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[dateObj.getDay()];
  };

  const formatMonthIndo = (monthStr: string) => {
    if (!monthStr || !monthStr.includes('-')) return monthStr;
    const parts = monthStr.split('-');
    const year = parts[0];
    const month = parseInt(parts[1], 10);
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    if (month >= 1 && month <= 12) {
      return `${months[month - 1]} ${year}`;
    }
    return monthStr;
  };

  const formatDateIndo = (dateStr: string) => {
    if (!dateStr || !dateStr.includes('-')) return dateStr;
    const parts = dateStr.split('-');
    const year = parts[0];
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    if (month >= 1 && month <= 12 && !isNaN(day)) {
      return `${day} ${months[month - 1]} ${year}`;
    }
    return dateStr;
  };

  const handleExportJournalRecap = (entries: JournalEntry[], filenameTitle: string) => {
    if (entries.length === 0) {
      toast('Tidak ada data jurnal untuk diekspor!');
      return;
    }

    const rows = entries.map((j, idx) => {
      const cls = classes.find(c => c.id === j.classId)?.name || j.classId;
      const subj = subjects.find(s => s.id === j.subjectId)?.name || j.subjectId;
      const tchr = j.teacherId === currentTeacher.id ? currentTeacher.name : j.teacherId;
      
      const attHadir = j.attendance.filter(a => a.status === 'Hadir').length;
      const { sakitNames, izinNames, alpaNames } = getAbsentStudentDetails(j);

      const jamStr = (j.startPeriod && j.endPeriod) 
        ? `Jam Ke ${j.startPeriod} s/d ${j.endPeriod}` 
        : '-';

      const daftarTidakHadir = [
        sakitNames.length > 0 ? `Sakit: ${sakitNames.join(', ')}` : null,
        izinNames.length > 0 ? `Izin: ${izinNames.join(', ')}` : null,
        alpaNames.length > 0 ? `Alpa: ${alpaNames.join(', ')}` : null,
      ].filter(Boolean).join(' | ') || 'Nihil (Semua Hadir)';

      return {
        'No': idx + 1,
        'Tanggal': j.date,
        'Hari': getDayNameIndo(j.date),
        'Jam Ke-': jamStr,
        'Kelas': cls,
        'Mata Pelajaran': subj,
        'Guru Mapel': tchr,
        'NIP Guru': j.teacherId === currentTeacher.id ? (currentTeacher.nip || '-') : '-',
        'Topik / Materi': j.topic,
        'Tujuan Pembelajaran': j.learningObjectives || '-',
        'Hadir (Jml)': attHadir,
        'Sakit (Jml)': sakitNames.length,
        'Nama Siswa Sakit': sakitNames.join(', ') || '-',
        'Izin (Jml)': izinNames.length,
        'Nama Siswa Izin': izinNames.join(', ') || '-',
        'Alpa (Jml)': alpaNames.length,
        'Nama Siswa Alpa': alpaNames.join(', ') || '-',
        'Catatan Siswa Tidak Hadir': daftarTidakHadir,
        'Catatan / Kendala KBM': j.notes || '-'
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      {wch: 5}, {wch: 12}, {wch: 10}, {wch: 16}, {wch: 14}, {wch: 22}, {wch: 24}, {wch: 35}, {wch: 40},
      {wch: 10}, {wch: 10}, {wch: 25}, {wch: 10}, {wch: 25}, {wch: 10}, {wch: 25}, {wch: 40}, {wch: 30}
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rekap Jurnal');
    XLSX.writeFile(wb, `${filenameTitle.replace(/\s+/g, '_')}.xlsx`);
  };

  const generateAndOpenPrintWindow = (entriesToPrint: JournalEntry[], title: string, subtitle: string) => {
    if (entriesToPrint.length === 0) {
      toast('Tidak ada data jurnal untuk dicetak!');
      return;
    }

    const htmlRows = entriesToPrint.map((j, idx) => {
      const cls = classes.find(c => c.id === j.classId)?.name || j.classId;
      const subj = subjects.find(s => s.id === j.subjectId)?.name || j.subjectId;
      const tchr = j.teacherId === currentTeacher.id ? currentTeacher.name : j.teacherId;
      const hadir = j.attendance.filter(a => a.status === 'Hadir').length;
      const { sakitNames, izinNames, alpaNames } = getAbsentStudentDetails(j);
      
      const hari = getDayNameIndo(j.date);
      const jamStr = (j.startPeriod && j.endPeriod) ? `Jam Ke ${j.startPeriod} - ${j.endPeriod}` : '-';

      let absenHtml = '<span style="color:#059669;font-weight:bold;">Semua Hadir (100%)</span>';
      if (sakitNames.length + izinNames.length + alpaNames.length > 0) {
        const list = [];
        if (sakitNames.length > 0) list.push(`<b>Sakit (${sakitNames.length}):</b> ${sakitNames.join(', ')}`);
        if (izinNames.length > 0) list.push(`<b>Izin (${izinNames.length}):</b> ${izinNames.join(', ')}`);
        if (alpaNames.length > 0) list.push(`<b>Alpa (${alpaNames.length}):</b> ${alpaNames.join(', ')}`);
        absenHtml = list.join('<br/>');
      }

      return `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td style="white-space:nowrap;"><b>${hari}</b><br/>${j.date}</td>
          <td style="text-align:center;">${jamStr}</td>
          <td><b>${cls}</b><br/><span style="color:#475569;">${subj}</span></td>
          <td><b>${j.topic}</b>${j.learningObjectives ? `<br/><small style="color:#64748b;">TP: ${j.learningObjectives}</small>` : ''}</td>
          <td style="text-align:center;font-family:monospace;font-weight:bold;">${hadir}H / ${sakitNames.length}S / ${izinNames.length}I / ${alpaNames.length}A</td>
          <td style="font-size:11px;">${absenHtml}</td>
          <td style="font-size:11px;">${j.notes || '-'}</td>
        </tr>
      `;
    }).join('');

    const htmlDocument = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          @page { size: A4 landscape; margin: 15mm; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; margin: 0; padding: 20px; }
          .header { text-align: center; border-bottom: 3px double #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
          .header h1 { font-size: 18px; margin: 0; text-transform: uppercase; color: #0f172a; }
          .header h2 { font-size: 14px; margin: 4px 0 0 0; color: #334155; font-weight: normal; }
          .meta { margin-bottom: 16px; font-size: 13px; display: flex; justify-content: space-between; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px; }
          th, td { border: 1px solid #94a3b8; padding: 8px 10px; vertical-align: top; }
          th { background-color: #f1f5f9; color: #0f172a; font-weight: bold; text-align: left; text-transform: uppercase; font-size: 11px; }
          .footer { display: flex; justify-content: space-between; margin-top: 36px; font-size: 13px; page-break-inside: avoid; }
          .sign-box { text-align: center; width: 220px; }
          .sign-space { height: 70px; }
          .btn-print { background: #4f46e5; color: white; border: none; padding: 10px 20px; font-weight: bold; border-radius: 6px; cursor: pointer; font-size: 14px; margin-bottom: 20px; }
          @media print { .no-print { display: none; } body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align:right;">
          <button class="btn-print" onclick="window.print()">🖨️ Cetak Dokumen / Simpan PDF</button>
        </div>
        <div class="header">
          <h1>${schoolIdentity.header1}</h1>
          <h1>${schoolIdentity.header2}</h1>
          <h1 style="font-size:20px;margin-top:2px;">${schoolIdentity.schoolName}</h1>
          <h2>${schoolIdentity.address}</h2>
        </div>
        <div style="text-align:center;margin-bottom:16px;">
          <h3 style="margin:0;font-size:16px;text-decoration:underline;">${title.toUpperCase()}</h3>
          <p style="margin:4px 0 0 0;font-size:13px;color:#475569;">${subtitle}</p>
        </div>
        <div class="meta">
          <div>Nama Guru Mapel: ${currentTeacher.name}</div>
          <div>Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width:30px;text-align:center;">No</th>
              <th style="width:110px;">Hari & Tanggal</th>
              <th style="width:85px;text-align:center;">Jam Ke</th>
              <th style="width:140px;">Kelas & Mapel</th>
              <th>Topik & Capaian Pembelajaran</th>
              <th style="width:110px;text-align:center;">Presensi</th>
              <th style="width:200px;">Siswa Tidak Hadir</th>
              <th style="width:150px;">Catatan KBM</th>
            </tr>
          </thead>
          <tbody>
            ${htmlRows}
          </tbody>
        </table>
        <div class="footer">
          <div class="sign-box">
            <p>Mengetahui,<br/>Kepala Sekolah</p>
            <div class="sign-space"></div>
            <p><b><u>${schoolIdentity.principalName}</u></b><br/>NIP. ${schoolIdentity.principalNip}</p>
          </div>
          <div class="sign-box">
            <p>${schoolIdentity.cityLocation}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>Guru Mapel,</p>
            <div class="sign-space"></div>
            <p><b><u>${currentTeacher.name}</u></b><br/>NIP. ${currentTeacher.nip || '-'}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Coba buka jendela baru, atau tampilkan modal preview di UI jika terblokir
    const printWin = window.open('', '_blank', 'width=1100,height=800');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(htmlDocument);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => {
        printWin.print();
      }, 500);
    } else {
      // Jika pop-up blocker aktif, buka modal pratinjau cetak di dalam app
      setPrintModalData({
        isOpen: true,
        title,
        subtitle,
        entries: entriesToPrint
      });
    }
  };

  const handlePrintJournalRecap = (entriesToPrint: JournalEntry[], title: string, subtitle: string) => {
    // Selalu buka modal pratinjau cetak rapi sekaligus buka print window
    setPrintModalData({
      isOpen: true,
      title,
      subtitle,
      entries: entriesToPrint
    });
    generateAndOpenPrintWindow(entriesToPrint, title, subtitle);
  };


  const printGradesDocument = (selectedExamId: string) => {
    const exam = exams.find(e => e.id === selectedExamId);
    if (!exam) return;
    
    const examSubmissions = teacherSubmissions.filter(s => s.examId === selectedExamId);
    const cls = getClassName(exam.classId);
    const subj = getSubjectName(exam.subjectId);
    
    const rows = examSubmissions.map((s, idx) => `
      <tr>
        <td style="text-align:center;">${idx + 1}</td>
        <td>${s.studentNis}</td>
        <td><b>${s.studentName}</b></td>
        <td style="text-align:center; font-weight:bold; font-size:14px; color: ${s.score >= 70 ? '#059669' : '#e11d48'}">${s.score}</td>
        <td style="text-align:center;">${new Date(s.submittedAt).toLocaleString('id-ID')}</td>
      </tr>
    `).join('');

    const htmlDocument = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Daftar Nilai - ${exam.title}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; margin: 0; padding: 20px; }
          .header { text-align: center; border-bottom: 3px double #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
          .header h1 { font-size: 18px; margin: 0; text-transform: uppercase; color: #0f172a; }
          .header h2 { font-size: 14px; margin: 4px 0 0 0; color: #334155; font-weight: normal; }
          .meta { margin-bottom: 16px; font-size: 13px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
          th, td { border: 1px solid #94a3b8; padding: 8px 10px; }
          th { background-color: #f1f5f9; color: #0f172a; font-weight: bold; text-align: left; text-transform: uppercase; font-size: 12px; }
          .footer { display: flex; justify-content: flex-end; margin-top: 36px; font-size: 13px; page-break-inside: avoid; }
          .sign-box { text-align: center; width: 220px; }
          .sign-space { height: 70px; }
          .btn-print { background: #4f46e5; color: white; border: none; padding: 10px 20px; font-weight: bold; border-radius: 6px; cursor: pointer; font-size: 14px; margin-bottom: 20px; }
          @media print { .no-print { display: none; } body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align:right;">
          <button class="btn-print" onclick="window.print()">🖨️ Cetak / Simpan PDF</button>
        </div>
        <div class="header">
          <h1>${schoolIdentity.header1}</h1>
          <h1>${schoolIdentity.header2}</h1>
          <h1 style="font-size:20px;margin-top:2px;">${schoolIdentity.schoolName}</h1>
          <h2>${schoolIdentity.address}</h2>
        </div>
        <div style="text-align:center;margin-bottom:16px;">
          <h3 style="margin:0;font-size:16px;text-decoration:underline;">DAFTAR NILAI ${exam.title.toUpperCase()}</h3>
          <p style="margin:4px 0 0 0;font-size:13px;color:#475569;">Kelas: ${cls} | Mapel: ${subj}</p>
        </div>
        <div class="meta">
          <div>Guru Mata Pelajaran: ${currentTeacher.name}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width:50px;text-align:center;">No</th>
              <th>NIS</th>
              <th>Nama Siswa</th>
              <th style="text-align:center;">Nilai</th>
              <th style="text-align:center;">Waktu Pengumpulan</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="5" style="text-align:center;">Belum ada siswa yang mengerjakan.</td></tr>'}
          </tbody>
        </table>
        <div class="footer">
          <div class="sign-box">
            <div>Mengetahui,</div>
            <div><b>Guru Mata Pelajaran</b></div>
            <div class="sign-space"></div>
            <div><b><u>${currentTeacher.name}</u></b></div>
            <div>NIP. ${currentTeacher.nip || '-'}</div>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(htmlDocument);
      printWin.document.close();
    }
  };

  // --- 2. MATERIALS STATE ---
  const [showAddMateriModal, setShowAddMateriModal] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [materiTitle, setMateriTitle] = useState('');
  const [materiClasses, setMateriClasses] = useState<string[]>([]);
  const [materiSubject, setMateriSubject] = useState('');
  const [materiType, setMateriType] = useState<'PDF' | 'Video' | 'Link' | 'Article'>('Article');
  const [materiUrl, setMateriUrl] = useState('');
  const [materiContent, setMateriContent] = useState('');
  const [uploading, setUploading] = useState(false);

  const [showShareMateriModal, setShowShareMateriModal] = useState(false);
  const [shareMateriId, setShareMateriId] = useState<string | null>(null);
  const [shareMateriSelectedClasses, setShareMateriSelectedClasses] = useState<string[]>([]);
  const [shareMateriTargetType, setShareMateriTargetType] = useState<'Class' | 'Teacher'>('Class');
  const [shareMateriSelectedTeacher, setShareMateriSelectedTeacher] = useState<string>('');
  const [shareMateriSuccess, setShareMateriSuccess] = useState<boolean>(false);

  const handleSimulatedMateriUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setTimeout(() => {
      const simulatedDriveUrl = `https://drive.google.com/file/d/materi_drive_${Math.random().toString(36).substring(7)}/view`;
      setMateriUrl(simulatedDriveUrl);
      setUploading(false);
    }, 1500);
  };

  const handleShareMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareMateriId) return;
    const sourceMat = materials.find(m => m.id === shareMateriId);
    if (!sourceMat) return;

    if (shareMateriTargetType === 'Teacher') {
      if (!shareMateriSelectedTeacher) {
        toast('Pilih guru tujuan!');
        return;
      }
      if (onShareToTeacher) {
        onShareToTeacher({
          senderId: currentTeacher.id,
          senderName: currentTeacher.name,
          receiverId: shareMateriSelectedTeacher,
          itemId: sourceMat.id,
          itemType: 'Material',
          itemTitle: sourceMat.title,
          status: 'Pending'
        });
        toast('Permintaan berbagi berhasil dikirim ke guru yang bersangkutan. Menunggu persetujuan.');
        setShowShareMateriModal(false);
        setShareMateriId(null);
      }
      return;
    }

    if (shareMateriSelectedClasses.length === 0) {
      toast('Pilih minimal 1 kelas!');
      return;
    }

    // Convert existing classId to array if it isn't
    const existingClasses = Array.isArray(sourceMat.classId) ? sourceMat.classId : [sourceMat.classId];
    
    // Add new classes avoiding duplicates
    const newClassesSet = new Set([...existingClasses, ...shareMateriSelectedClasses]);
    const mergedClasses = Array.from(newClassesSet);

    if (onUpdateMaterial) {
      onUpdateMaterial({
        ...sourceMat,
        classId: mergedClasses
      });
    }

    setShareMateriSuccess(true);
  };

  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materiTitle || materiClasses.length === 0 || !materiSubject) {
      toast('Mohon isi Judul Materi, Kelas, dan Mata Pelajaran.');
      return;
    }
    if (materiType !== 'Article' && !materiUrl) {
      toast('Mohon unggah berkas atau masukkan link materi.');
      return;
    }
    if (materiType === 'Article' && (!materiContent || materiContent === '<p><br></p>')) {
      toast('Mohon isi konten materi artikel.');
      return;
    }

    if (editingMaterialId && onUpdateMaterial) {
      const existing = materials.find(m => m.id === editingMaterialId);
      if (existing) {
        onUpdateMaterial({
          ...existing,
          title: materiTitle,
          classId: materiClasses,
          subjectId: materiSubject,
          fileType: materiType,
          fileUrl: materiType === 'Article' ? '' : materiUrl,
          content: materiType === 'Article' ? materiContent : undefined,
        });
      }
    } else {
      onSaveMaterial({
        title: materiTitle,
        classId: materiClasses,
        subjectId: materiSubject,
        fileType: materiType,
        fileUrl: materiType === 'Article' ? '' : materiUrl,
        content: materiType === 'Article' ? materiContent : undefined,
        status: 'Aktif',
        teacherId: currentTeacher.id
      });
    }

    // Reset Form
    setEditingMaterialId(null);
    setMateriTitle('');
    setMateriUrl('');
    setMateriContent('');
    setShowAddMateriModal(false);
  };


  // --- 3. EXAMS STATE ---
  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [isQuestionBankMode, setIsQuestionBankMode] = useState(false);
  const [examTitle, setExamTitle] = useState('');
  const [examClass, setExamClass] = useState('');
  const [examSubject, setExamSubject] = useState('');
  const [examToken, setExamToken] = useState('');
  const [examDuration, setExamDuration] = useState(30);

  // --- 4. QUESTION BANK STATE ---
  const [showAddQuestionBankModal, setShowAddQuestionBankModal] = useState(false);
  const [qbTitle, setQbTitle] = useState('');
  const [qbSubject, setQbSubject] = useState('');
  const [editingQbId, setEditingQbId] = useState<string | null>(null);

  // --- 4.5. SHARE QUESTION BANK STATE ---
  const [showShareQbModal, setShowShareQbModal] = useState(false);
  const [shareQbId, setShareQbId] = useState<string | null>(null);
  const [shareSelectedClasses, setShareSelectedClasses] = useState<string[]>([]);
  const [shareQbTargetType, setShareQbTargetType] = useState<'Class' | 'Teacher'>('Class');
  const [shareQbSelectedTeacher, setShareQbSelectedTeacher] = useState<string>('');
  const [shareDuration, setShareDuration] = useState(60);
  const [shareSuccessResult, setShareSuccessResult] = useState<{classId: string, className: string, token: string}[] | null>(null);

  // --- 4.6. DAFTAR NILAI STATE ---
  const [selectedClassForGrades, setSelectedClassForGrades] = useState<string>('');
  const [selectedExamForGrades, setSelectedExamForGrades] = useState<string>('');

  // Custom exam questions creator (shared between exams and question bank)
  const [targetQuestionCount, setTargetQuestionCount] = useState<number>(10);
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([]);
  const [currentQType, setCurrentQType] = useState<QuestionType>('PilihanGanda');
  
  // --- DELETE CONFIRMATION STATE ---
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'Materi' | 'Ujian' | 'Bank Soal', name: string } | null>(null);
  
  // Single question form
  const [qText, setQText] = useState('');
  // Pilihan Ganda Standard inputs
  const [pgOptions, setPgOptions] = useState<string[]>(['', '', '', '']);
  const [pgCorrect, setPgCorrect] = useState('0');
  // Pilihan Ganda Kompleks inputs
  const [pgkOptions, setPgkOptions] = useState<string[]>(['', '', '', '']);
  const [pgkCorrects, setPgkCorrects] = useState<boolean[]>([false, false, false, false]);
  // Pilihan Asosiatif inputs
  const [asoStatements, setAsoStatements] = useState<string[]>([
    '(1) Hasil dari x + y = 5',
    '(2) Hasil dari x - y = 1',
    '(3) Titik potong grafik berada di (3, 2)',
    '(4) Grafik melintasi titik (0, 0)'
  ]);
  const [asoCorrects, setAsoCorrects] = useState<boolean[]>([false, false, false, false]);
  // Pilihan Sebab-Akibat inputs
  const [saStatement, setSaStatement] = useState('Kecepatan linear partikel yang bergerak melingkar adalah konstan.');
  const [saReason, setSaReason] = useState('Arah kecepatan partikel selalu menyinggung lintasan lingkaran.');
  const [saStatementTrue, setSaStatementTrue] = useState(false);
  const [saReasonTrue, setSaReasonTrue] = useState(true);
  const [saCausality, setSaCausality] = useState(false);

  // Media & Score state for current question
  const [qFontPreset, setQFontPreset] = useState<'Sans' | 'Serif' | 'Grotesk' | 'Mono'>('Sans');
  const [qMediaType, setQMediaType] = useState<'Image' | 'Video' | 'Audio' | 'None'>('None');
  const [qMediaUrl, setQMediaUrl] = useState('');
  const [qScore, setQScore] = useState<number>(10);

  // Spreadsheet / Excel import states
  const [showImportSection, setShowImportSection] = useState(false);
  const [showBankSoalImporter, setShowBankSoalImporter] = useState(false);
  const [importText, setImportText] = useState('');
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccessCount, setImportSuccessCount] = useState<number>(0);

  const insertTextAtCursor = (before: string, after: string = '') => {
    setQText(prev => prev + before + (after ? 'teks' + after : ''));
  };

  const handleAddQuestionToExam = () => {
    if (!qText.trim()) {
      toast('Teks pertanyaan tidak boleh kosong!');
      return;
    }

    const questionId = `q_${Math.random().toString(36).substring(7)}`;
    let questionNode: ExamQuestion;

    const mediaObj = qMediaType !== 'None' ? {
      mediaType: qMediaType,
      mediaUrl: qMediaUrl
    } : {};

    if (currentQType === 'PilihanGanda') {
      questionNode = {
        id: questionId,
        questionText: qText,
        type: 'PilihanGanda',
        options: pgOptions.filter(o => o.trim() !== ''),
        correctAnswer: String.fromCharCode(65 + Number(pgCorrect)), // A, B, C, D
        score: qScore,
        fontPreset: qFontPreset,
        ...mediaObj
      };
    } else if (currentQType === 'PilihanGandaKompleks') {
      const activeOptions = pgkOptions.filter(o => o.trim() !== '');
      const activeCorrects = activeOptions.filter((_, idx) => pgkCorrects[idx]);
      questionNode = {
        id: questionId,
        questionText: qText,
        type: 'PilihanGandaKompleks',
        options: activeOptions,
        correctAnswers: activeCorrects,
        score: qScore,
        fontPreset: qFontPreset,
        ...mediaObj
      };
    } else if (currentQType === 'PilihanAsosiatif') {
      const correctCombination: number[] = [];
      asoCorrects.forEach((val, idx) => {
        if (val) correctCombination.push(idx + 1);
      });
      questionNode = {
        id: questionId,
        questionText: qText,
        type: 'PilihanAsosiatif',
        statements: asoStatements.filter(s => s.trim() !== ''),
        correctCombination: correctCombination,
        score: qScore,
        fontPreset: qFontPreset,
        ...mediaObj
      };
    } else {
      // SebabAkibat
      questionNode = {
        id: questionId,
        questionText: qText,
        type: 'SebabAkibat',
        statement: saStatement,
        reason: saReason,
        correctStatementTrue: saStatementTrue,
        correctReasonTrue: saReasonTrue,
        correctCausality: saCausality,
        score: qScore,
        fontPreset: qFontPreset,
        ...mediaObj
      };
    }

    setExamQuestions(prev => [...prev, questionNode]);
    
    // Clear question fields
    setQText('');
    setPgOptions(['', '', '', '']);
    setPgkOptions(['', '', '', '']);
    setPgkCorrects([false, false, false, false]);
    setAsoCorrects([false, false, false, false]);
    setQMediaType('None');
    setQMediaUrl('');
    setQScore(10);
    setQFontPreset('Sans');
  };

  const handleRemoveQuestion = (idx: number) => {
    setExamQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const processRowsMatrix = (rows: string[][]) => {
    if (rows.length === 0) {
      toast('Tidak ada baris data yang ditemukan!');
      return;
    }

    const parsedQuestions: ExamQuestion[] = [];
    const errors: string[] = [];
    let successCount = 0;

    // Determine if first row is header
    let startIdx = 0;
    const firstRowStr = (rows[0] || []).join(' ').toLowerCase();
    const isHeader = firstRowStr.includes('tipe') || 
                     firstRowStr.includes('soal') || 
                     firstRowStr.includes('pertanyaan') || 
                     firstRowStr.includes('opsi') ||
                     firstRowStr.includes('kunci') ||
                     firstRowStr.includes('skor');

    if (isHeader) {
      startIdx = 1;
    }

    for (let i = startIdx; i < rows.length; i++) {
      let cols = rows[i].map(c => (c || '').replace(/^["']|["']$/g, '').trim());

      if (cols.length < 2 || !cols[1]) {
        if (cols.join('').trim() !== '') {
          errors.push(`Baris ${i + 1}: Kolom tidak lengkap atau Pertanyaan kosong.`);
        }
        continue;
      }

      const rawType = cols[0] || 'PilihanGanda';
      const rawQuestionText = cols[1];
      const col2 = cols[2] || '';
      const col3 = cols[3] || '';
      const col4 = cols[4] || '';
      const col5 = cols[5] || '';
      const rawKunci = cols[6] || '';
      const rawScore = cols[7] ? parseFloat(cols[7]) : 10;
      const rawMediaType = cols[8] || 'None';
      const rawMediaUrl = cols[9] || '';
      const rawFontPreset = cols[10] || 'Sans';

      // Determine clean question type
      let type: QuestionType = 'PilihanGanda';
      const typeLower = rawType.toLowerCase();
      if (typeLower.includes('kompleks') || typeLower === 'pilihangandakompleks') {
        type = 'PilihanGandaKompleks';
      } else if (typeLower.includes('asosiatif') || typeLower === 'pilihanasosiatif') {
        type = 'PilihanAsosiatif';
      } else if (typeLower.includes('sebab') || typeLower === 'sebabaquibat' || typeLower === 'sebabakibat') {
        type = 'SebabAkibat';
      }

      const score = isNaN(rawScore) ? 10 : rawScore;
      const fontPreset = (['Sans', 'Serif', 'Grotesk', 'Mono'].includes(rawFontPreset) 
        ? rawFontPreset 
        : 'Sans') as any;
      const mediaType = (['None', 'Image', 'Video', 'Audio'].includes(rawMediaType)
        ? rawMediaType
        : 'None') as any;

      const mediaObj = mediaType !== 'None' && rawMediaUrl ? {
        mediaType,
        mediaUrl: rawMediaUrl
      } : {};

      const questionId = `q_import_${Math.random().toString(36).substring(7)}_${i}`;

      const baseQuestion = {
        id: questionId,
        questionText: rawQuestionText,
        score,
        fontPreset,
        ...mediaObj
      };

      if (type === 'PilihanGanda') {
        const options = [col2, col3, col4, col5].filter(o => o !== '');
        if (options.length < 2) {
          errors.push(`Baris ${i + 1} (${type}): Pilihan ganda harus memiliki minimal 2 opsi.`);
          continue;
        }

        let correctAnswer = 'A';
        const cleanKunci = rawKunci.toUpperCase().trim();
        if (['A', 'B', 'C', 'D', 'E'].includes(cleanKunci)) {
          correctAnswer = cleanKunci;
        } else {
          // Fallback if index like 1, 2, 3
          const num = parseInt(cleanKunci);
          if (!isNaN(num) && num >= 1 && num <= 5) {
            correctAnswer = String.fromCharCode(64 + num);
          }
        }

        parsedQuestions.push({
          ...baseQuestion,
          type: 'PilihanGanda',
          options,
          correctAnswer
        } as ExamQuestion);
        successCount++;
      } else if (type === 'PilihanGandaKompleks') {
        const options = [col2, col3, col4, col5].filter(o => o !== '');
        if (options.length < 2) {
          errors.push(`Baris ${i + 1} (${type}): Pilihan Ganda Kompleks harus memiliki minimal 2 opsi.`);
          continue;
        }

        // Kunci should be like A,C or A,B,D
        const cleanKunci = rawKunci.toUpperCase();
        const correctAnswers: string[] = [];
        options.forEach((opt, idx) => {
          const letter = String.fromCharCode(65 + idx);
          if (cleanKunci.includes(letter)) {
            correctAnswers.push(opt);
          }
        });

        parsedQuestions.push({
          ...baseQuestion,
          type: 'PilihanGandaKompleks',
          options,
          correctAnswers
        } as ExamQuestion);
        successCount++;
      } else if (type === 'PilihanAsosiatif') {
        const statements = [col2, col3, col4, col5].filter(s => s !== '');
        if (statements.length === 0) {
          errors.push(`Baris ${i + 1} (${type}): Pernyataan asosiatif tidak boleh kosong.`);
          continue;
        }

        // correctCombination: number[] (like [1, 2, 3] or [1, 3] parsed from rawKunci)
        const combination: number[] = [];
        const cleanKunci = rawKunci.replace(/\s/g, ''); // remove spaces
        const parts = cleanKunci.split(/[,;|]/);
        parts.forEach(p => {
          const num = parseInt(p);
          if (!isNaN(num) && num >= 1 && num <= 4) {
            combination.push(num);
          }
        });

        // Default to [1, 3] if invalid combination
        const correctCombination = combination.length > 0 ? combination : [1, 3];

        parsedQuestions.push({
          ...baseQuestion,
          type: 'PilihanAsosiatif',
          statements,
          correctCombination
        } as ExamQuestion);
        successCount++;
      } else if (type === 'SebabAkibat') {
        // col2: Sebab statement, col3: Alasan statement
        if (!col2 || !col3) {
          errors.push(`Baris ${i + 1} (${type}): Sebab-Akibat memerlukan pernyataan Sebab (Opsi A) & Alasan (Opsi B).`);
          continue;
        }

        // rawKunci like BENAR,BENAR,YA or TRUE,TRUE,YES or B,B,Y or 1,1,1
        // format: [PernyataanSebabTrue, PernyataanAlasanTrue, KausalitasTrue]
        const cleanKunci = rawKunci.toUpperCase().replace(/\s/g, '');
        const parts = cleanKunci.split(/[,;|]/);

        const correctStatementTrue = parts[0] === 'BENAR' || parts[0] === 'TRUE' || parts[0] === 'YA' || parts[0] === 'YES' || parts[0] === 'B' || parts[0] === 'Y' || parts[0] === '1';
        const correctReasonTrue = parts[1] === 'BENAR' || parts[1] === 'TRUE' || parts[1] === 'YA' || parts[1] === 'YES' || parts[1] === 'B' || parts[1] === 'Y' || parts[1] === '1';
        const correctCausality = parts[2] === 'BENAR' || parts[2] === 'TRUE' || parts[2] === 'YA' || parts[2] === 'YES' || parts[2] === 'B' || parts[2] === 'Y' || parts[2] === '1';

        parsedQuestions.push({
          ...baseQuestion,
          type: 'SebabAkibat',
          statement: col2,
          reason: col3,
          correctStatementTrue,
          correctReasonTrue,
          correctCausality
        } as ExamQuestion);
        successCount++;
      }
    }

    if (parsedQuestions.length > 0) {
      setExamQuestions(prev => [...prev, ...parsedQuestions]);
      setImportSuccessCount(successCount);
      setImportText(''); // reset text on success
      toast(`Berhasil mengimpor ${successCount} butir soal dari spreadsheet!`);
    } else {
      toast('Gagal mengimpor soal. Periksa format berkas/tabel dan coba lagi.');
    }

    setImportErrors(errors);
  };

  const handleImportFromSpreadsheet = () => {
    if (!importText.trim()) {
      toast('Teks / data spreadsheet kosong!');
      return;
    }

    const lines = importText.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) {
      toast('Tidak ada baris data yang ditemukan!');
      return;
    }

    const stringRows = lines.map(line => {
      if (line.includes('\t')) return line.split('\t');
      if (line.includes(';')) return line.split(';');
      return line.split(',');
    });

    processRowsMatrix(stringRows);
  };

  const handleFileUploadExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        const stringRows = jsonRows.map(row => row.map(cell => cell !== undefined && cell !== null ? String(cell) : ''));
        
        processRowsMatrix(stringRows);
      } catch (err) {
        toast('Gagal membaca berkas Excel. Pastikan berkas berformat .xls, .xlsx, atau .csv yang valid.');
        console.error(err);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = ''; // Reset input
  };

  const handleDownloadTemplateExcel = () => {
    // Sheet 1: Contoh Soal
    const headers = [
      'Tipe Soal', 'Pertanyaan', 'Opsi A / Sebab', 'Opsi B / Alasan', 'Opsi C', 'Opsi D', 
      'Kunci Jawaban', 'Skor', 'Tipe Media', 'Link Media', 'Font Preset'
    ];
    
    const rows = [
      [
        'PilihanGanda', 
        'Siapakah presiden pertama Republik Indonesia yang memproklamasikan kemerdekaan?', 
        'Ir. Soekarno', 'Drs. Moh. Hatta', 'B.J. Habibie', 'Jenderal Soedirman', 
        'A', '10', 'None', '', 'Sans'
      ],
      [
        'PilihanGandaKompleks', 
        'Manakah di bawah ini yang merupakan organ penyusun sistem pencernaan manusia? (Pilih lebih dari 1)', 
        'Lambung', 'Paru-paru', 'Usus Halus', 'Jantung', 
        'A,C', '10', 'None', '', 'Sans'
      ],
      [
        'PilihanAsosiatif', 
        'Berikut adalah pernyataan mengenai ciri-ciri sel makhluk hidup:', 
        '(1) Memiliki dinding sel yang kaku', '(2) Memiliki kloroplas untuk fotosintesis', '(3) Memiliki lisosom aktif', '(4) Memiliki vakuola sentral yang besar', 
        '1,2,4', '15', 'None', '', 'Mono'
      ],
      [
        'SebabAkibat', 
        'Perhatikan pernyataan dan alasan mengenai pemanasan global di bawah ini:', 
        'Meningkatnya kadar gas karbon dioksida (CO2) di atmosfer menyebabkan efek rumah kaca.', 
        'Gas karbon dioksida memiliki sifat menyerap dan memantulkan kembali radiasi panas matahari ke bumi.', 
        'Kosongkan', 'Kosongkan', 
        'BENAR,BENAR,YA', '10', 'None', '', 'Serif'
      ]
    ];

    // Sheet 2: Panduan & Aturan Pengisian Kolom
    const panduanHeaders = ['Kolom', 'Nama Kolom', 'Pilihan Nilai / Format yang Diizinkan', 'Keterangan & Cara Isi'];
    const panduanRows = [
      ['1', 'Tipe Soal', 'PilihanGanda | PilihanGandaKompleks | PilihanAsosiatif | SebabAkibat', 'Tentukan tipe model soal literasi/numerasi ANBK.'],
      ['2', 'Pertanyaan', 'Teks bebas (Mendukung **teks tebal** & *miring*)', 'Tuliskan butir pertanyaan atau wacana soal.'],
      ['3', 'Opsi A / Sebab', 'Teks Opsi A (untuk PG/PGK/Asosiatif) atau Pernyataan SEBAB (untuk SebabAkibat)', 'Wajib diisi.'],
      ['4', 'Opsi B / Alasan', 'Teks Opsi B (untuk PG/PGK/Asosiatif) atau Pernyataan ALASAN (untuk SebabAkibat)', 'Wajib diisi.'],
      ['5', 'Opsi C', 'Teks Opsi C', 'Isi jika ada opsi ke-3 (Kosongkan jika Sebab-Akibat).'],
      ['6', 'Opsi D', 'Teks Opsi D', 'Isi jika ada opsi ke-4 (Kosongkan jika Sebab-Akibat).'],
      ['7', 'Kunci Jawaban', 'Lihat aturan khusus per tipe soal di bawah:', 'PG: huruf A/B/C/D\nPGK: huruf dipisah koma (cth: A,C atau A,B,D)\nAsosiatif: angka urutan (cth: 1,2,3)\nSebabAkibat: 3 status BENAR/SALAH & YA/TIDAK (cth: BENAR,BENAR,YA)'],
      ['8', 'Skor', 'Angka (contoh: 10, 15, 20)', 'Bobot nilai soal tersebut.'],
      ['9', 'Tipe Media', 'None | Image | Video | Audio', 'Kosongkan atau isi None jika tanpa media.'],
      ['10', 'Link Media', 'URL https://... (gambar/video/audio)', 'Link berkas media jika kolom ke-9 bukan None.'],
      ['11', 'Font Preset', 'Sans | Serif | Grotesk | Mono', 'Gaya huruf tampilan soal. Standar: Sans.']
    ];

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const ws2 = XLSX.utils.aoa_to_sheet([panduanHeaders, ...panduanRows]);

    // Set column widths for better readability
    ws1['!cols'] = [{wch: 22}, {wch: 60}, {wch: 30}, {wch: 30}, {wch: 25}, {wch: 25}, {wch: 15}, {wch: 8}, {wch: 12}, {wch: 25}, {wch: 12}];
    ws2['!cols'] = [{wch: 8}, {wch: 18}, {wch: 55}, {wch: 60}];

    XLSX.utils.book_append_sheet(wb, ws1, 'Template Soal ANBK');
    XLSX.utils.book_append_sheet(wb, ws2, 'Panduan & Aturan Kolom');

    XLSX.writeFile(wb, 'Template_Soal_ANBK_Literasi_Numerasi.xlsx');
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle || !examClass || !examSubject || !examToken) {
      toast('Mohon lengkapi info paket ujian!');
      return;
    }
    if (examQuestions.length === 0) {
      toast('Paket ujian harus memiliki minimal 1 soal!');
      return;
    }

    onSaveExam({
      title: examTitle,
      classId: examClass,
      subjectId: examSubject,
      token: examToken.toUpperCase(),
      durationMinutes: Number(examDuration),
      questions: examQuestions,
      teacherId: currentTeacher.id
    });

    // Reset Form
    setExamTitle('');
    setExamToken('');
    setExamQuestions([]);
    setShowAddExamModal(false);
  };

  const handleShareQuestionBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareQbId) return;

    const qb = questionBanks.find(q => q.id === shareQbId);
    if (!qb) return;

    if (shareQbTargetType === 'Teacher') {
      if (!shareQbSelectedTeacher) {
        toast('Pilih guru tujuan!');
        return;
      }
      if (onShareToTeacher) {
        onShareToTeacher({
          senderId: currentTeacher.id,
          senderName: currentTeacher.name,
          receiverId: shareQbSelectedTeacher,
          itemId: qb.id,
          itemType: 'QuestionBank',
          itemTitle: qb.title,
          status: 'Pending'
        });
        toast('Permintaan berbagi berhasil dikirim ke guru yang bersangkutan. Menunggu persetujuan.');
        setShowShareQbModal(false);
        setShareQbId(null);
      }
      return;
    }

    if (shareSelectedClasses.length === 0) {
      toast('Pilih minimal 1 kelas!');
      return;
    }
    
    const results: {classId: string, className: string, token: string}[] = [];

    shareSelectedClasses.forEach(classId => {
      const generatedToken = Math.random().toString(36).substring(2, 8).toUpperCase();
      const cls = classes.find(c => c.id === classId);
      
      onSaveExam({
        title: qb.title,
        classId: classId,
        subjectId: qb.subjectId,
        token: generatedToken,
        durationMinutes: shareDuration,
        questions: [...qb.questions],
        teacherId: currentTeacher.id,
      });

      results.push({
        classId,
        className: cls?.name || classId,
        token: generatedToken
      });
    });
    
    setShareSuccessResult(results);
    setShareQbId(null);
    setShareSelectedClasses([]);
    setShareDuration(60);
  };

  const handleSaveQuestionBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qbTitle || !qbSubject) {
      toast('Mohon lengkapi judul dan mapel Bank Soal!');
      return;
    }
    if (examQuestions.length === 0) {
      toast('Bank Soal harus memiliki minimal 1 soal!');
      return;
    }

    if (onSaveQuestionBank) {
      onSaveQuestionBank({
        ...(editingQbId ? { id: editingQbId } : {}),
        title: qbTitle,
        subjectId: qbSubject,
        teacherId: currentTeacher.id,
        questions: examQuestions,
      } as QuestionBank);
    }

    setQbTitle('');
    setQbSubject('');
    setExamQuestions([]);
    setEditingQbId(null);
    setShowAddQuestionBankModal(false);
  };


  // Helper resolvers
  const getClassName = (classId: string) => classes.find(c => c.id === classId)?.name || 'N/A';
  const getSubjectName = (subjectId: string) => subjects.find(s => s.id === subjectId)?.name || 'N/A';

  // Filters for Teacher's own content
  const teacherMaterials = materials.filter(m => m.teacherId === currentTeacher.id);
  const teacherExams = exams.filter(e => classes.some(c => c.id === e.classId));
  const teacherQuestionBanks = questionBanks.filter(qb => qb.teacherId === currentTeacher.id);
  const teacherSubmissions = submissions.filter(s => teacherExams.some(e => e.id === s.examId));
  const teacherExamTitles = teacherExams.map(e => e.title);
  const teacherCheatLogs = cheatLogs.filter(log => teacherExamTitles.includes(log.examTitle));

  return (
    <div className="space-y-6 max-w-7xl mx-auto" id="teacher-panel-container">
      {/* Teacher Profile Quick Card */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentTeacher.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop'}
            alt={currentTeacher.name}
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-full object-cover border-4 border-indigo-800/80"
          />
          <div>
            <h2 className="text-xl font-bold">{currentTeacher.name}</h2>
            <div className="mt-1.5 inline-block">
              <span className="text-[10px] bg-indigo-500/30 text-indigo-200 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                NIP. {currentTeacher.nip}
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-2">Mata Pelajaran : <strong>{currentTeacher.subject}</strong></p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('journal')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'journal'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'bg-indigo-800/40 text-indigo-100 hover:bg-indigo-800/60'
            }`}
          >
            📝 Jurnal Mengajar
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'materials'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'bg-indigo-800/40 text-indigo-100 hover:bg-indigo-800/60'
            }`}
          >
            📚 Materi Pelajaran
          </button>
          <button
            onClick={() => setActiveTab('exams')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'exams'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'bg-indigo-800/40 text-indigo-100 hover:bg-indigo-800/60'
            }`}
          >
            ✍️ Ujian / Tugas & Evaluasi
          </button>
          <button
            onClick={() => setActiveTab('daftar_nilai')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'daftar_nilai'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'bg-indigo-800/40 text-indigo-100 hover:bg-indigo-800/60'
            }`}
          >
            📊 Daftar Nilai
          </button>
          <button
            onClick={() => setActiveTab('cheatlogs')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'cheatlogs'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'bg-indigo-800/40 text-indigo-100 hover:bg-indigo-800/60'
            }`}
          >
            🚨 Log Anti-Contek
            {teacherCheatLogs && teacherCheatLogs.length > 0 && (
              <span className="ml-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px]">
                {teacherCheatLogs.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('bank_soal')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'bank_soal'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'bg-indigo-800/40 text-indigo-100 hover:bg-indigo-800/60'
            }`}
          >
            🗄️ Bank Soal
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'bg-indigo-800/40 text-indigo-100 hover:bg-indigo-800/60'
            }`}
          >
            👤 Profil & Jadwal Mengajar
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'announcements'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-amber-500/20 text-amber-200 hover:bg-amber-500/30'
            }`}
          >
            <Bell className="w-3.5 h-3.5 animate-bounce" /> Notifikasi Siswa
          </button>
          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'inbox'
                ? 'bg-purple-400 text-slate-950 shadow-xs'
                : 'bg-purple-500/20 text-purple-200 hover:bg-purple-500/30'
            }`}
          >
            <Send className="w-3.5 h-3.5" /> Kotak Masuk Berbagi
            {shareRequests.filter(r => r.receiverId === currentTeacher.id && r.status === 'Pending').length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-md font-black">
                {shareRequests.filter(r => r.receiverId === currentTeacher.id && r.status === 'Pending').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 1. JURNAL MENGAJAR FORM & REKAPITULASI (THE CORE FEATURE) */}
      {activeTab === 'journal' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Jurnal Mengajar Digital & Rekapitulasi Jam Pembelajaran
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Catat jam pembelajaran, topik, dan presensi kelas, atau lihat rekapitulasi harian, mingguan, dan bulanan.
              </p>
            </div>

            {/* Sub Tabs Navigation */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl overflow-x-auto">
              <button
                type="button"
                onClick={() => setJournalSubTab('form')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  journalSubTab === 'form'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ✍️ Input Jurnal Baru
              </button>
              <button
                type="button"
                onClick={() => setJournalSubTab('recap_daily')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  journalSubTab === 'recap_daily'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📅 Rekap Harian
              </button>
              <button
                type="button"
                onClick={() => setJournalSubTab('recap_weekly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  journalSubTab === 'recap_weekly'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📆 Rekap Mingguan
              </button>
              <button
                type="button"
                onClick={() => setJournalSubTab('recap_monthly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  journalSubTab === 'recap_monthly'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📊 Rekap Bulanan
              </button>
              <button
                type="button"
                onClick={() => setJournalSubTab('settings')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  journalSubTab === 'settings'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                }`}
              >
                ⚙️ Pengaturan Kop & Kepala Sekolah
              </button>
            </div>
          </div>

          {/* SUB-TAB 1: FORM INPUT JURNAL */}
          {journalSubTab === 'form' && (
            <div className="space-y-6">
              {journalSuccessMessage && (
                <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-2 animate-pulse">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{journalSuccessMessage}</span>
                </div>
              )}

              <form onSubmit={handleSaveJournal} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-slate-700">Tanggal KBM</label>
                    <input
                      type="date"
                      required
                      value={journalDate}
                      onChange={(e) => setJournalDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-slate-700">Kelas Pembelajaran</label>
                    <select
                      required
                      value={journalClass}
                      onChange={(e) => setJournalClass(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Pilih Kelas</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-slate-700">Mata Pelajaran</label>
                    <select
                      required
                      value={journalSubject}
                      onChange={(e) => setJournalSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Pilih Mapel</option>
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* FORM JAM PEMBELAJARAN KE BERAPA */}
                <div className="bg-indigo-50/70 border border-indigo-200 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      Jadwal Jam Pembelajaran Ke- Berapa? (Input Sesuai Sesi KBM Guru) *
                    </label>
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                      Durasi: {Math.max(0, (journalEndPeriod || 0) - (journalStartPeriod || 0) + 1)} Jam Pelajaran (JP)
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[11px] font-bold text-slate-700 block mb-1">Mulai Pada Jam Ke-</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-900 bg-white border border-slate-200 px-2.5 py-2 rounded-lg shrink-0">Jam Ke -</span>
                        <input
                          type="number"
                          min="1"
                          max="15"
                          required
                          value={journalStartPeriod}
                          onChange={(e) => setJournalStartPeriod(Number(e.target.value))}
                          placeholder="2"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-extrabold text-indigo-950 bg-white focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-700 block mb-1">Sampai Dengan Jam Ke-</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-900 bg-white border border-slate-200 px-2.5 py-2 rounded-lg shrink-0">Jam Ke -</span>
                        <input
                          type="number"
                          min="1"
                          max="15"
                          required
                          value={journalEndPeriod}
                          onChange={(e) => setJournalEndPeriod(Number(e.target.value))}
                          placeholder="4"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-extrabold text-indigo-950 bg-white focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-indigo-800 font-medium">
                    💡 Contoh pengisian: Jika Anda mengajar hari ini pada jam pembelajaran ke 2 hingga jam ke 4, masukkan angka <strong>2</strong> pada kolom Mulai dan angka <strong>4</strong> pada kolom Sampai.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-slate-700">Topik / Sub-Bab Pembelajaran *</label>
                  <input
                    type="text"
                    required
                    placeholder="Misal: Sistem Aljabar Kuadrat Dua Variabel, atau Teks Eksplanasi Fenomena Alam"
                    value={journalTopic}
                    onChange={(e) => setJournalTopic(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-slate-700">Tujuan Pembelajaran (TP) *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Masukkan capaian atau tujuan pembelajaran yang ingin dicapai siswa pada sesi ini..."
                    value={journalObjectives}
                    onChange={(e) => setJournalObjectives(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-slate-700">Catatan Kelas / Kendala Mengajar (Opsional)</label>
                  <textarea
                    rows={2}
                    placeholder="Tulis catatan penting seperti siswa yang butuh bimbingan khusus, media ajar yang digunakan, atau hambatan selama KBM..."
                    value={journalNotes}
                    onChange={(e) => setJournalNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Attendance checklist section */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <ListTodo className="w-4 h-4 text-indigo-600" />
                    Presensi & Kehadiran Siswa
                  </h4>
                  
                  {!journalClass ? (
                    <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                      <p className="text-slate-400 text-xs">Pilih kelas di atas terlebih dahulu untuk memuat daftar absensi siswa.</p>
                    </div>
                  ) : (
                    <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                      <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-6 py-3 font-semibold text-slate-500">Nama Siswa</th>
                            <th className="px-4 py-3 font-semibold text-slate-500 text-center w-24">Hadir</th>
                            <th className="px-4 py-3 font-semibold text-slate-500 text-center w-24">Sakit</th>
                            <th className="px-4 py-3 font-semibold text-slate-500 text-center w-24">Izin</th>
                            <th className="px-4 py-3 font-semibold text-slate-500 text-center w-24">Alpa</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {classStudents.map(s => (
                            <tr key={s.id} className="hover:bg-slate-50/50 transition">
                              <td className="px-6 py-3 font-bold text-slate-900">{s.name} <span className="text-[10px] text-slate-400 font-mono">({s.nis})</span></td>
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="radio"
                                  name={`att_${s.id}`}
                                  checked={attendance[s.id] === 'Hadir'}
                                  onChange={() => handleAttendanceChange(s.id, 'Hadir')}
                                  className="text-indigo-600 w-4 h-4 cursor-pointer"
                                />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="radio"
                                  name={`att_${s.id}`}
                                  checked={attendance[s.id] === 'Sakit'}
                                  onChange={() => handleAttendanceChange(s.id, 'Sakit')}
                                  className="text-blue-500 w-4 h-4 cursor-pointer"
                                />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="radio"
                                  name={`att_${s.id}`}
                                  checked={attendance[s.id] === 'Izin'}
                                  onChange={() => handleAttendanceChange(s.id, 'Izin')}
                                  className="text-amber-500 w-4 h-4 cursor-pointer"
                                />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="radio"
                                  name={`att_${s.id}`}
                                  checked={attendance[s.id] === 'Alpa'}
                                  onChange={() => handleAttendanceChange(s.id, 'Alpa')}
                                  className="text-red-500 w-4 h-4 cursor-pointer"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl transition cursor-pointer text-sm shadow-md flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Simpan Jurnal & Presensi Kelas ke Sheets
                </button>
              </form>
            </div>
          )}

          {/* SUB-TAB 2: REKAP HARIAN */}
          {journalSubTab === 'recap_daily' && (() => {
            const dailyFiltered = journals.filter(j => j.date === recapFilterDate);
            const totalJP = dailyFiltered.reduce((acc, j) => {
              const dur = (j.startPeriod && j.endPeriod) ? (j.endPeriod - j.startPeriod + 1) : 2;
              return acc + Math.max(0, dur);
            }, 0);

            return (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <Filter className="w-5 h-5 text-indigo-600" />
                    <div>
                      <label className="block text-xs font-bold text-slate-700">Filter Tanggal Pembelajaran:</label>
                      <input
                        type="date"
                        value={recapFilterDate}
                        onChange={(e) => setRecapFilterDate(e.target.value)}
                        className="mt-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-indigo-950"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleExportJournalRecap(dailyFiltered, `Rekap_Jurnal_Harian_${recapFilterDate}`)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <FileSpreadsheet className="w-4 h-4" /> Unduh Excel (.XLSX)
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePrintJournalRecap(dailyFiltered, 'Rekap Jurnal Pembelajaran Harian', `Periode Tanggal: ${formatDateIndo(recapFilterDate)}`)}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <Printer className="w-4 h-4" /> Cetak Laporan
                    </button>
                    <button
                      type="button"
                      onClick={() => setJournalSubTab('settings')}
                      className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                      title="Ubah Nama Kepala Sekolah atau Kop Surat"
                    >
                      <Settings className="w-4 h-4" /> Edit Kop & Kepsek
                    </button>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-xl">
                    <span className="text-xs font-bold text-indigo-700 block">Total Sesi Mengajar Hari Ini</span>
                    <span className="text-2xl font-extrabold text-indigo-950 mt-1 block">{dailyFiltered.length} <span className="text-xs font-normal text-slate-500">Sesi Kelas</span></span>
                  </div>
                  <div className="bg-teal-50/60 border border-teal-100 p-4 rounded-xl">
                    <span className="text-xs font-bold text-teal-700 block">Total Jam Pembelajaran (JP)</span>
                    <span className="text-2xl font-extrabold text-teal-950 mt-1 block">{totalJP} <span className="text-xs font-normal text-slate-500">Jam Pelajaran</span></span>
                  </div>
                  <div className="bg-purple-50/60 border border-purple-100 p-4 rounded-xl">
                    <span className="text-xs font-bold text-purple-700 block">Status Laporan</span>
                    <span className="text-sm font-extrabold text-purple-950 mt-2 block flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" /> Terverifikasi Digital
                    </span>
                  </div>
                </div>

                {/* Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left divide-y divide-slate-200">
                    <thead className="bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="px-4 py-3">Jam Ke-</th>
                        <th className="px-4 py-3">Kelas & Mapel</th>
                        <th className="px-4 py-3">Topik Pembelajaran</th>
                        <th className="px-4 py-3 text-center">Presensi & Siswa Tidak Hadir</th>
                        <th className="px-4 py-3">Catatan / Kendala</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {dailyFiltered.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                            Tidak ada jurnal mengajar tercatat pada tanggal {recapFilterDate}.
                          </td>
                        </tr>
                      ) : (
                        dailyFiltered.map((j) => {
                          const cls = classes.find(c => c.id === j.classId)?.name || j.classId;
                          const subj = subjects.find(s => s.id === j.subjectId)?.name || j.subjectId;
                          const hadir = j.attendance.filter(a => a.status === 'Hadir').length;
                          const sakit = j.attendance.filter(a => a.status === 'Sakit').length;
                          const izin = j.attendance.filter(a => a.status === 'Izin').length;
                          const alpa = j.attendance.filter(a => a.status === 'Alpa').length;

                          return (
                            <tr key={j.id} className="hover:bg-slate-50 transition">
                              <td className="px-4 py-3.5 whitespace-nowrap">
                                {j.startPeriod && j.endPeriod ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-900 font-extrabold text-[11px]">
                                    <Clock className="w-3 h-3 text-indigo-600" /> Jam ke {j.startPeriod} - {j.endPeriod}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic">Standar (2 JP)</span>
                                )}
                              </td>
                              <td className="px-4 py-3.5 font-bold text-slate-800">
                                {cls} <span className="block text-[11px] font-normal text-indigo-600">{subj}</span>
                              </td>
                              <td className="px-4 py-3.5">
                                <span className="font-semibold text-slate-900 block">{j.topic}</span>
                                {j.learningObjectives && <span className="text-[11px] text-slate-500 block line-clamp-1">TP: {j.learningObjectives}</span>}
                              </td>
                              <td className="px-4 py-3.5 align-top">
                                {renderAbsentStudentsCell(j)}
                              </td>
                              <td className="px-4 py-3.5 text-slate-600 text-[11px]">
                                {j.notes || '-'}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* SUB-TAB 3: REKAP MINGGUAN (7 HARI TERAKHIR) */}
          {journalSubTab === 'recap_weekly' && (() => {
            const now = Date.now();
            const sevenDaysAgo = now - 7 * 86400000;
            const weeklyFiltered = journals.filter(j => {
              const dTime = Date.parse(j.date);
              return !isNaN(dTime) && dTime >= sevenDaysAgo && dTime <= now + 86400000;
            }).sort((a, b) => b.date.localeCompare(a.date));

            const totalWeeklyJP = weeklyFiltered.reduce((acc, j) => {
              const dur = (j.startPeriod && j.endPeriod) ? (j.endPeriod - j.startPeriod + 1) : 2;
              return acc + Math.max(0, dur);
            }, 0);

            return (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      📆 Rekap Jurnal Mingguan (7 Hari Terakhir)
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">Menampilkan seluruh aktivitas KBM dalam 7 hari terakhir beserta jam pembelajarannya.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleExportJournalRecap(weeklyFiltered, 'Rekap_Jurnal_Mingguan')}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <FileSpreadsheet className="w-4 h-4" /> Unduh Excel Mingguan
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePrintJournalRecap(weeklyFiltered, 'Rekap Jurnal Pembelajaran Mingguan', 'Periode: 7 Hari Terakhir')}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <Printer className="w-4 h-4" /> Cetak
                    </button>
                    <button
                      type="button"
                      onClick={() => setJournalSubTab('settings')}
                      className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                      title="Ubah Nama Kepala Sekolah atau Kop Surat"
                    >
                      <Settings className="w-4 h-4" /> Edit Kop & Kepsek
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-indigo-700">Total Sesi Mingguan</span>
                      <span className="text-2xl font-extrabold text-indigo-950 mt-1 block">{weeklyFiltered.length} <span className="text-xs font-normal text-slate-500">Pertemuan</span></span>
                    </div>
                    <BarChart3 className="w-8 h-8 text-indigo-400 opacity-80" />
                  </div>
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-700">Total Jam Pembelajaran (JP) Mingguan</span>
                      <span className="text-2xl font-extrabold text-emerald-950 mt-1 block">{totalWeeklyJP} <span className="text-xs font-normal text-slate-500">JP Terekam</span></span>
                    </div>
                    <Clock className="w-8 h-8 text-emerald-400 opacity-80" />
                  </div>
                </div>

                {/* Table Mingguan */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left divide-y divide-slate-200">
                    <thead className="bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="px-4 py-3">Hari & Tanggal</th>
                        <th className="px-4 py-3">Jam Ke-</th>
                        <th className="px-4 py-3">Kelas & Mapel</th>
                        <th className="px-4 py-3">Topik Pembelajaran</th>
                        <th className="px-4 py-3 text-center">Presensi & Siswa Tidak Hadir</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {weeklyFiltered.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                            Belum ada aktivitas jurnal mengajar dalam 7 hari terakhir.
                          </td>
                        </tr>
                      ) : (
                        weeklyFiltered.map((j) => {
                          const cls = classes.find(c => c.id === j.classId)?.name || j.classId;
                          const subj = subjects.find(s => s.id === j.subjectId)?.name || j.subjectId;
                          const hadir = j.attendance.filter(a => a.status === 'Hadir').length;
                          const sakit = j.attendance.filter(a => a.status === 'Sakit').length;
                          const izin = j.attendance.filter(a => a.status === 'Izin').length;
                          const alpa = j.attendance.filter(a => a.status === 'Alpa').length;
                          
                          const dObj = new Date(j.date);
                          const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
                          const dayStr = !isNaN(dObj.getTime()) ? dayNames[dObj.getDay()] : '';

                          return (
                            <tr key={j.id} className="hover:bg-slate-50 transition">
                              <td className="px-4 py-3.5 whitespace-nowrap font-bold text-slate-900">
                                {dayStr}, {j.date}
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap">
                                {j.startPeriod && j.endPeriod ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 font-bold text-[11px]">
                                    Jam {j.startPeriod} - {j.endPeriod}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">2 JP</span>
                                )}
                              </td>
                              <td className="px-4 py-3.5 font-bold text-slate-800">
                                {cls} <span className="block text-[11px] font-normal text-indigo-600">{subj}</span>
                              </td>
                              <td className="px-4 py-3.5 text-slate-800">
                                {j.topic}
                              </td>
                              <td className="px-4 py-3.5 align-top">
                                {renderAbsentStudentsCell(j)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* SUB-TAB 4: REKAP BULANAN */}
          {journalSubTab === 'recap_monthly' && (() => {
            const monthlyFiltered = journals.filter(j => j.date.startsWith(recapFilterMonth)).sort((a, b) => b.date.localeCompare(a.date));
            const totalMonthlyJP = monthlyFiltered.reduce((acc, j) => {
              const dur = (j.startPeriod && j.endPeriod) ? (j.endPeriod - j.startPeriod + 1) : 2;
              return acc + Math.max(0, dur);
            }, 0);

            return (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <Filter className="w-5 h-5 text-indigo-600" />
                    <div>
                      <label className="block text-xs font-bold text-slate-700">Pilih Bulan & Tahun Pembelajaran:</label>
                      <input
                        type="month"
                        value={recapFilterMonth}
                        onChange={(e) => setRecapFilterMonth(e.target.value)}
                        className="mt-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-indigo-950"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleExportJournalRecap(monthlyFiltered, `Rekap_Jurnal_Bulanan_${recapFilterMonth}`)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <FileSpreadsheet className="w-4 h-4" /> Unduh Excel Bulanan
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePrintJournalRecap(monthlyFiltered, 'Rekap Jurnal Pembelajaran Bulanan', `Periode Bulan: ${formatMonthIndo(recapFilterMonth)}`)}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <Printer className="w-4 h-4" /> Cetak Bulanan
                    </button>
                    <button
                      type="button"
                      onClick={() => setJournalSubTab('settings')}
                      className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                      title="Ubah Nama Kepala Sekolah atau Kop Surat"
                    >
                      <Settings className="w-4 h-4" /> Edit Kop & Kepsek
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-indigo-900 text-white p-5 rounded-2xl flex items-center justify-between shadow-sm">
                    <div>
                      <span className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">Total Pertemuan Bulan Ini</span>
                      <span className="text-3xl font-extrabold mt-1 block">{monthlyFiltered.length} <span className="text-sm font-normal text-indigo-200">Sesi KBM</span></span>
                    </div>
                    <BookOpen className="w-10 h-10 text-indigo-400 opacity-60" />
                  </div>
                  <div className="bg-emerald-800 text-white p-5 rounded-2xl flex items-center justify-between shadow-sm">
                    <div>
                      <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">Akumulasi Jam Pelajaran (JP)</span>
                      <span className="text-3xl font-extrabold mt-1 block">{totalMonthlyJP} <span className="text-sm font-normal text-emerald-200">Jam Pelajaran</span></span>
                    </div>
                    <Clock className="w-10 h-10 text-emerald-300 opacity-60" />
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left divide-y divide-slate-200">
                    <thead className="bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="px-4 py-3">Tanggal</th>
                        <th className="px-4 py-3">Jam Ke-</th>
                        <th className="px-4 py-3">Kelas & Mapel</th>
                        <th className="px-4 py-3">Topik & Capaian Pembelajaran</th>
                        <th className="px-4 py-3 text-center">Presensi & Siswa Tidak Hadir</th>
                        <th className="px-4 py-3">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {monthlyFiltered.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                            Belum ada jurnal tercatat untuk periode bulan {formatMonthIndo(recapFilterMonth)}.
                          </td>
                        </tr>
                      ) : (
                        monthlyFiltered.map((j) => {
                          const cls = classes.find(c => c.id === j.classId)?.name || j.classId;
                          const subj = subjects.find(s => s.id === j.subjectId)?.name || j.subjectId;
                          const hadir = j.attendance.filter(a => a.status === 'Hadir').length;
                          const sakit = j.attendance.filter(a => a.status === 'Sakit').length;
                          const izin = j.attendance.filter(a => a.status === 'Izin').length;
                          const alpa = j.attendance.filter(a => a.status === 'Alpa').length;

                          return (
                            <tr key={j.id} className="hover:bg-slate-50 transition">
                              <td className="px-4 py-3.5 whitespace-nowrap font-bold text-slate-900">
                                {j.date}
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap">
                                {j.startPeriod && j.endPeriod ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-800 font-extrabold text-[11px] border border-indigo-200">
                                    Jam {j.startPeriod} - {j.endPeriod}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">2 JP</span>
                                )}
                              </td>
                              <td className="px-4 py-3.5 font-bold text-slate-800">
                                {cls} <span className="block text-[11px] font-normal text-indigo-600">{subj}</span>
                              </td>
                              <td className="px-4 py-3.5">
                                <span className="font-bold text-slate-900 block">{j.topic}</span>
                                {j.learningObjectives && <span className="text-[11px] text-slate-500 block line-clamp-1">{j.learningObjectives}</span>}
                              </td>
                              <td className="px-4 py-3.5 align-top">
                                {renderAbsentStudentsCell(j)}
                              </td>
                              <td className="px-4 py-3.5 text-[11px] text-slate-600">
                                {j.notes || '-'}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {journalSubTab === 'settings' && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-sm">
                    <Settings className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">Form Pengaturan Kop Surat & Data Kepala Sekolah</h4>
                    <p className="text-xs text-slate-500">Sesuaikan nama sekolah, alamat resmi, serta Nama & NIP Kepala Sekolah untuk cetakan laporan resmi.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const defaults: SchoolIdentityConfig = {
                      header1: 'PEMERINTAH KABUPATEN PASURUAN',
                      header2: 'DINAS PENDIDIKAN',
                      schoolName: 'SMP NEGERI 1 BEJI',
                      address: 'Jl. Wicaksana No. 22A Gununggangsir Beji, Kab Pasuruan',
                      cityLocation: 'Beji, Kab. Pasuruan',
                      principalName: 'Dr. H. Ahmad Wijaya, M.Pd.',
                      principalNip: '19720512 199802 1 004'
                    };
                    setEditIdentityForm(defaults);
                    setSchoolIdentity(defaults);
                    localStorage.setItem('smpn1beji_school_identity', JSON.stringify(defaults));
                    toast('Identitas berhasil dikembalikan ke standar awal SMPN 1 BEJI!');
                  }}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer self-start sm:self-center"
                >
                  🔄 Kembalikan ke Standar
                </button>
              </div>

              <form onSubmit={handleSaveSchoolIdentity} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Kolom Kiri: Form Input */}
                <div className="space-y-4">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                    <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2 text-indigo-900">
                      <Building className="w-4 h-4 text-indigo-600" />
                      1. Identitas & Kop Surat Sekolah
                    </h5>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Instansi Tingkat 1 (Baris Atas)</label>
                      <input
                        type="text"
                        value={editIdentityForm.header1}
                        onChange={(e) => setEditIdentityForm({ ...editIdentityForm, header1: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="PEMERINTAH KABUPATEN PASURUAN"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Instansi Tingkat 2 (Baris Kedua)</label>
                      <input
                        type="text"
                        value={editIdentityForm.header2}
                        onChange={(e) => setEditIdentityForm({ ...editIdentityForm, header2: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="DINAS PENDIDIKAN"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nama Satuan Pendidikan / Sekolah</label>
                      <input
                        type="text"
                        value={editIdentityForm.schoolName}
                        onChange={(e) => setEditIdentityForm({ ...editIdentityForm, schoolName: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-extrabold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="SMP NEGERI 1 BEJI"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Resmi Sekolah</label>
                      <input
                        type="text"
                        value={editIdentityForm.address}
                        onChange={(e) => setEditIdentityForm({ ...editIdentityForm, address: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Jl. Wicaksana No. 22A Gununggangsir Beji, Kab Pasuruan"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                    <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2 text-indigo-900">
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      2. Penandatangan (Kepala Sekolah & Kota TTD)
                    </h5>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Kota / Tempat Tanda Tangan</label>
                      <input
                        type="text"
                        value={editIdentityForm.cityLocation}
                        onChange={(e) => setEditIdentityForm({ ...editIdentityForm, cityLocation: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Beji, Kab. Pasuruan"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kepala Sekolah (Lengkap dengan Gelar)</label>
                      <input
                        type="text"
                        value={editIdentityForm.principalName}
                        onChange={(e) => setEditIdentityForm({ ...editIdentityForm, principalName: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Dr. H. Ahmad Wijaya, M.Pd."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">NIP Kepala Sekolah</label>
                      <input
                        type="text"
                        value={editIdentityForm.principalNip}
                        onChange={(e) => setEditIdentityForm({ ...editIdentityForm, principalNip: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="19720512 199802 1 004"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Simpan Pengaturan & Perbarui Cetakan
                  </button>
                </div>

                {/* Kolom Kanan: Live Preview Kertas Cetak */}
                <div className="bg-slate-200/80 p-5 rounded-2xl border border-slate-300 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                        👁️ Pratinjau Kop & Kolom Tanda Tangan
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded">Live Preview</span>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-300 shadow-sm text-slate-900">
                      {/* Kop Pratinjau */}
                      <div className="text-center border-b-3 border-double border-slate-900 pb-3 mb-4">
                        <h1 className="text-xs font-black uppercase text-slate-900 leading-tight">{editIdentityForm.header1 || '-'}</h1>
                        <h2 className="text-xs font-black uppercase text-slate-800 leading-tight mt-0.5">{editIdentityForm.header2 || '-'}</h2>
                        <h3 className="text-base font-black text-indigo-950 uppercase tracking-tight mt-1">{editIdentityForm.schoolName || '-'}</h3>
                        <p className="text-[10px] text-slate-600 font-medium mt-1">{editIdentityForm.address || '-'}</p>
                      </div>

                      <div className="py-4 text-center border-y border-dashed border-slate-200 text-slate-400 text-[11px] italic">
                        [ Konten Tabel Rekapitulasi Jurnal Pembelajaran Akan Ditampilkan Di Sini ]
                      </div>

                      {/* TTD Pratinjau */}
                      <div className="mt-6 grid grid-cols-2 gap-4 text-[11px] font-medium text-slate-800">
                        <div className="text-center">
                          <p>Mengetahui,<br/>Kepala Sekolah</p>
                          <div className="h-12"></div>
                          <p className="font-extrabold underline text-slate-950">{editIdentityForm.principalName || '-'}</p>
                          <p className="text-[10px] text-slate-500">NIP. {editIdentityForm.principalNip || '-'}</p>
                        </div>
                        <div className="text-center">
                          <p>{editIdentityForm.cityLocation || '-'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>Guru Mapel,</p>
                          <div className="h-12"></div>
                          <p className="font-extrabold underline text-slate-950">{currentTeacher.name}</p>
                          <p className="text-[10px] text-slate-500">NIP. {currentTeacher.nip || '-'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-indigo-900/10 border border-indigo-200 rounded-xl text-indigo-950 text-xs">
                    💡 <b>Catatan:</b> Pengaturan ini langsung berlaku untuk semua fitur cetak (Rekap Harian, Mingguan, Bulanan) baik dalam bentuk pratinjau, cetak printer, maupun unduh PDF.
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* 2. MATERIALS TAB */}
      {activeTab === 'materials' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Materi Pelajaran</h3>
              <p className="text-slate-500 text-xs mt-0.5">Berkas materi dan kelola status publikasinya.</p>
            </div>
            <button
              onClick={() => {
                setEditingMaterialId(null);
                setMateriTitle('');
                setMateriClasses([]);
                setMateriSubject('');
                setMateriType('Article');
                setMateriUrl('');
                setMateriContent('');
                setShowAddMateriModal(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" /> Buat Materi Baru
            </button>
          </div>

          {teacherMaterials.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl">
              <p className="text-slate-400 text-xs">Belum ada materi pelajaran yang Anda unggah.</p>
            </div>
          ) : (
            <div className="border border-slate-100 rounded-2xl overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-slate-500">Judul Materi</th>
                    <th className="px-6 py-3 font-semibold text-slate-500">Mata Pelajaran</th>
                    <th className="px-6 py-3 font-semibold text-slate-500">Kelas</th>
                    <th className="px-6 py-3 font-semibold text-slate-500">Format</th>
                    <th className="px-6 py-3 font-semibold text-slate-500">Tautan Berkas</th>
                    <th className="px-6 py-3 font-semibold text-slate-500">Publikasi</th>
                    <th className="px-6 py-3 font-semibold text-slate-500 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {teacherMaterials.map((mat) => (
                    <tr key={mat.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-3 font-bold text-slate-900">{mat.title}</td>
                      <td className="px-6 py-3 text-slate-500">{getSubjectName(mat.subjectId)}</td>
                      <td className="px-6 py-3">
                        <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px]">
                          {Array.isArray(mat.classId) 
                            ? `Kelas ${mat.classId.map(cId => getClassName(cId).replace(/^Kelas\s+/i, '')).join(', ')}`
                            : `Kelas ${getClassName(mat.classId).replace(/^Kelas\s+/i, '')}`}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          mat.fileType === 'PDF' ? 'bg-red-50 text-red-700 border border-red-100' :
                          mat.fileType === 'Video' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          'bg-slate-50 text-slate-700 border border-slate-100'
                        }`}>
                          {mat.fileType}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <a
                          href={mat.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline font-mono truncate max-w-[200px] block"
                        >
                          Google Drive Link
                        </a>
                      </td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => onToggleMaterial(mat.id, mat.status)}
                          className="flex items-center gap-1.5 font-bold cursor-pointer hover:opacity-85 transition"
                        >
                          {mat.status === 'Aktif' ? (
                            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
                              <ToggleRight className="w-4 h-4 text-emerald-600" /> Aktif
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full text-[10px]">
                              <ToggleLeft className="w-4 h-4 text-slate-400" /> Draft
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingMaterialId(mat.id);
                              setMateriTitle(mat.title);
                              setMateriClasses(Array.isArray(mat.classId) ? mat.classId : [mat.classId]);
                              setMateriSubject(mat.subjectId);
                              setMateriType(mat.fileType);
                              setMateriUrl(mat.fileUrl);
                              setMateriContent(mat.content || '');
                              setShowAddMateriModal(true);
                            }}
                            className="text-slate-400 hover:text-indigo-600 transition p-1.5 rounded-lg hover:bg-indigo-50"
                            title="Edit Materi"
                          >
                            <FileCode className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setShareMateriId(mat.id);
                              setShareMateriSelectedClasses([]);
                              setShareMateriSuccess(false);
                              setShowShareMateriModal(true);
                            }}
                            className="text-slate-400 hover:text-emerald-600 transition p-1.5 rounded-lg hover:bg-emerald-50"
                            title="Bagikan Materi ke Kelas Lain"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setItemToDelete({ id: mat.id, type: 'Materi', name: mat.title });
                            }}
                            className="text-slate-400 hover:text-rose-600 transition p-1.5 rounded-lg hover:bg-rose-50"
                            title="Hapus Materi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. EXAMS TAB */}
      {activeTab === 'exams' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">LMS Tugas/Soal Mapel</h3>
              <p className="text-slate-500 text-xs mt-0.5">LMS Interaktif</p>
            </div>
            <button
              onClick={() => {
                setIsQuestionBankMode(false);
                setShowAddExamModal(true);
                setExamQuestions([]);
                setTargetQuestionCount(10);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" /> Buat Paket Ujian Baru
            </button>
          </div>

          {teacherExams.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl">
              <p className="text-slate-400 text-xs">Belum ada paket ujian terdaftar untuk kelas Anda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teacherExams.map((exam) => (
                <div key={exam.id} className="border border-slate-100 rounded-2xl p-5 hover:shadow-md transition bg-slate-50/50 flex flex-col justify-between space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          Kelas {getClassName(exam.classId)}
                        </span>
                        <span className="bg-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          {getSubjectName(exam.subjectId)}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-950 text-base">{exam.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      {onUpdateExam && (
                        <button 
                          onClick={() => {
                            const newToken = Math.random().toString(36).substring(2, 8).toUpperCase();
                            onUpdateExam({
                              ...exam,
                              token: newToken
                            });
                            toast(`Token berhasil direset menjadi: ${newToken}`);
                          }}
                          className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-lg transition flex-shrink-0 flex items-center gap-1.5 text-xs font-bold"
                          title="Reset Token Ujian"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Reset
                        </button>
                      )}
                      {onDeleteExam && (
                        <button
                          onClick={() => setItemToDelete({ id: exam.id, type: 'Ujian', name: exam.title })}
                          className="text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 p-2 rounded-lg transition flex-shrink-0 flex items-center gap-1.5 text-xs font-bold"
                          title="Hapus Ujian"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Hapus
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 border-y border-slate-200/50 py-3 text-center text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Token Kunci</span>
                      <span className="font-mono font-black text-slate-800 flex items-center justify-center gap-0.5 mt-0.5">
                        <Key className="w-3.5 h-3.5 text-amber-500" /> {exam.token}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Waktu Ujian</span>
                      <span className="font-bold text-slate-800 flex items-center justify-center gap-0.5 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" /> {exam.durationMinutes} mnt
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Jumlah Soal</span>
                      <span className="font-bold text-slate-800 flex items-center justify-center gap-0.5 mt-0.5">
                        <FileText className="w-3.5 h-3.5 text-emerald-500" /> {exam.questions.length} Butir
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block">Rincian Komposisi Soal ANBK:</span>
                    <div className="flex gap-2 flex-wrap text-[9px] font-semibold">
                      <span className="bg-white border px-1.5 py-0.5 rounded text-slate-600">
                        Pilihan Ganda: {exam.questions.filter(q => q.type === 'PilihanGanda').length}
                      </span>
                      <span className="bg-white border px-1.5 py-0.5 rounded text-slate-600">
                        Pilihan Kompleks: {exam.questions.filter(q => q.type === 'PilihanGandaKompleks').length}
                      </span>
                      <span className="bg-white border px-1.5 py-0.5 rounded text-slate-600">
                        Asosiatif: {exam.questions.filter(q => q.type === 'PilihanAsosiatif').length}
                      </span>
                      <span className="bg-white border px-1.5 py-0.5 rounded text-slate-600">
                        Sebab-Akibat: {exam.questions.filter(q => q.type === 'SebabAkibat').length}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3.4. DAFTAR NILAI TAB */}
      {activeTab === 'daftar_nilai' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Daftar Nilai Siswa</h3>
              <p className="text-slate-500 text-xs mt-0.5">Lihat hasil pengerjaan siswa dari paket ujian dan tugas yang telah diberikan.</p>
            </div>
            {selectedExamForGrades && (
              <button
                onClick={() => printGradesDocument(selectedExamForGrades)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" /> Cetak Daftar Nilai
              </button>
            )}
          </div>

          <div className="space-y-4">
            {!selectedClassForGrades ? (
              <div className="space-y-3">
                <p className="text-sm font-bold text-slate-700">Pilih Kelas yang Anda Ajar:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {classes.map(c => {
                    // Cek apakah guru punya materi atau ujian di kelas ini, atau tampilkan semua kelas saja
                    const classExamsCount = teacherExams.filter(e => Array.isArray(e.classId) ? e.classId.includes(c.id) : e.classId === c.id).length;
                    return (
                      <button
                        key={c.id}
                        onClick={() => { setSelectedClassForGrades(c.id); setSelectedExamForGrades(''); }}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-indigo-50 hover:border-indigo-200 transition text-left flex flex-col justify-between h-full group"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900">Kelas {c.name}</h4>
                            <p className="text-[11px] font-bold text-slate-500 mt-0.5">{classExamsCount} Tugas / Ujian</p>
                          </div>
                        </div>
                        <div className="w-full text-center text-xs font-bold text-indigo-600 bg-white border border-indigo-100 py-1.5 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          Lihat Daftar Nilai
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                {!selectedExamForGrades ? (
                  <div className="space-y-4">
                    <button
                      onClick={() => setSelectedClassForGrades('')}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-lg w-fit transition"
                    >
                      ← Kembali ke Daftar Kelas
                    </button>
                    <p className="text-sm font-bold text-slate-700">Daftar Tugas & Ujian Kelas {getClassName(selectedClassForGrades)}:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {teacherExams.filter(e => Array.isArray(e.classId) ? e.classId.includes(selectedClassForGrades) : e.classId === selectedClassForGrades).map(exam => {
                        const submissionCount = teacherSubmissions.filter(s => s.examId === exam.id).length;
                        return (
                          <button
                            key={exam.id}
                            onClick={() => setSelectedExamForGrades(exam.id)}
                            className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-md transition text-left space-y-2 flex flex-col justify-between"
                          >
                            <div>
                              <h5 className="font-extrabold text-slate-900">{exam.title}</h5>
                              <p className="text-xs text-slate-500 mt-1">{getSubjectName(exam.subjectId)}</p>
                            </div>
                            <div className="flex justify-between items-center w-full mt-4 pt-3 border-t border-slate-100">
                              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{submissionCount} Siswa Mengerjakan</span>
                              <span className="text-[11px] font-bold text-indigo-600 flex items-center gap-1">Lihat Nilai <FileText className="w-3.5 h-3.5" /></span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
                      <button
                        onClick={() => setSelectedExamForGrades('')}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 bg-white border border-indigo-100 px-3 py-1.5 rounded-lg transition"
                      >
                        ← Kembali
                      </button>
                      <div className="h-4 w-px bg-slate-300"></div>
                      <h4 className="font-bold text-slate-800 text-sm">{teacherExams.find(e => e.id === selectedExamForGrades)?.title}</h4>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase">
                          <tr>
                            <th className="px-4 py-3 font-bold w-12 text-center">No</th>
                            <th className="px-4 py-3 font-bold">NIS</th>
                            <th className="px-4 py-3 font-bold w-1/3">Nama Siswa</th>
                            <th className="px-4 py-3 font-bold text-center">Nilai</th>
                            <th className="px-4 py-3 font-bold text-center">Waktu Pengerjaan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {teacherSubmissions.filter(s => s.examId === selectedExamForGrades).length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-4 py-8 text-center text-slate-500 text-sm italic">
                                Belum ada siswa yang mengumpulkan tugas/ujian ini.
                              </td>
                            </tr>
                          ) : (
                            teacherSubmissions
                              .filter(s => s.examId === selectedExamForGrades)
                              .sort((a, b) => b.score - a.score)
                              .map((s, idx) => (
                                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-4 py-3 text-center text-slate-500">{idx + 1}</td>
                                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{s.studentNis}</td>
                                  <td className="px-4 py-3 font-bold text-slate-800">{s.studentName}</td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md font-extrabold text-sm ${s.score >= 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                      {s.score}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center text-xs text-slate-500">
                                    {new Date(s.submittedAt).toLocaleString('id-ID')}
                                  </td>
                                </tr>
                              ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3.5. BANK SOAL TAB */}
      {activeTab === 'bank_soal' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Bank Soal Guru</h3>
              <p className="text-slate-500 text-xs mt-0.5">Kelola koleksi soal yang dapat digunakan kembali untuk tugas atau ujian.</p>
            </div>
            <button
              onClick={() => {
                setIsQuestionBankMode(true);
                setShowAddQuestionBankModal(true);
                setQbTitle('');
                setQbSubject('');
                setExamQuestions([]);
                setTargetQuestionCount(10);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-xs shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Buat Bank Soal Baru
            </button>
          </div>

          {teacherQuestionBanks.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Database className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-medium">Belum ada bank soal yang dibuat.</p>
              <p className="text-slate-400 text-xs mt-1">Gunakan tombol di atas untuk membuat koleksi soal pertama Anda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teacherQuestionBanks.map((qb) => (
                <div key={qb.id} className="border border-slate-100 rounded-2xl p-4 sm:p-5 hover:border-indigo-100 hover:shadow-md transition bg-white space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h4 className="font-extrabold text-slate-800 text-sm leading-tight">{qb.title}</h4>
                      <p className="text-[11px] font-semibold text-indigo-600 mt-1">{getSubjectName(qb.subjectId)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShareQbId(qb.id);
                          setShareSelectedClasses([]);
                          setShareDuration(60);
                          setShowShareQbModal(true);
                        }}
                        className="text-white bg-indigo-600 hover:bg-indigo-700 p-1.5 rounded transition cursor-pointer flex items-center gap-1.5 px-2.5 shadow-xs font-bold text-xs"
                        title="Bagikan ke Kelas"
                      >
                        <Send className="w-3.5 h-3.5" /> Bagikan
                      </button>
                      <button
                        onClick={() => {
                          const w = window.open('', '_blank');
                          if (w) {
                            w.document.write(`
                              <html>
                                <head>
                                  <title>Cetak Bank Soal - ${qb.title}</title>
                                  <style>
                                    body { font-family: system-ui, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; line-height: 1.6; }
                                    h1 { margin-bottom: 5px; font-size: 24px; text-align: center; }
                                    h2 { font-size: 16px; font-weight: normal; margin-top: 0; color: #475569; text-align: center; margin-bottom: 30px; }
                                    .question { margin-bottom: 25px; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; }
                                    .q-text { font-weight: bold; margin-bottom: 10px; }
                                    .options { margin-left: 20px; }
                                    .type-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; background: #f1f5f9; font-size: 11px; margin-bottom: 10px; font-weight: bold; }
                                    @media print { body { padding: 0; max-width: 100%; } .no-print { display: none; } }
                                  </style>
                                </head>
                                <body>
                                  <button class="no-print" onclick="window.print()" style="margin-bottom: 20px; padding: 10px 20px; cursor: pointer;">Cetak Dokumen</button>
                                  <h1>${qb.title}</h1>
                                  <h2>Mata Pelajaran: ${getSubjectName(qb.subjectId)} | ${qb.questions.length} Soal</h2>
                                  <div>
                                    ${qb.questions.map((q, idx) => `
                                      <div class="question">
                                        <div class="type-badge">${q.type}</div>
                                        <div class="q-text">${idx + 1}. ${q.questionText}</div>
                                        ${q.type === 'PilihanGanda' || q.type === 'PilihanGandaKompleks' ? `
                                          <div class="options">
                                            ${(q as any).options.map((opt: string, oIdx: number) => `
                                              <div>${String.fromCharCode(65 + oIdx)}. ${opt}</div>
                                            `).join('')}
                                          </div>
                                        ` : ''}
                                        ${q.type === 'PilihanAsosiatif' ? `
                                          <div class="options">
                                            ${(q as any).statements.map((stmt: string) => `
                                              <div>${stmt}</div>
                                            `).join('')}
                                          </div>
                                        ` : ''}
                                        ${q.type === 'SebabAkibat' ? `
                                          <div class="options">
                                            <div><strong>Sebab:</strong> ${(q as any).statement}</div>
                                            <div><strong>Akibat:</strong> ${(q as any).reason}</div>
                                          </div>
                                        ` : ''}
                                      </div>
                                    `).join('')}
                                  </div>
                                </body>
                              </html>
                            `);
                            w.document.close();
                          }
                        }}
                        className="text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 p-1.5 rounded transition cursor-pointer"
                        title="Cetak Bank Soal"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setIsQuestionBankMode(true);
                          setEditingQbId(qb.id);
                          setQbTitle(qb.title);
                          setQbSubject(qb.subjectId);
                          setExamQuestions(qb.questions);
                          setTargetQuestionCount(Math.max(10, qb.questions.length));
                          setShowAddQuestionBankModal(true);
                        }}
                        className="text-slate-400 hover:text-amber-600 bg-slate-50 hover:bg-amber-50 p-1.5 rounded transition cursor-pointer"
                        title="Edit Bank Soal"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {onDeleteQuestionBank && (
                        <button
                          onClick={() => {
                            setItemToDelete({ id: qb.id, type: 'Bank Soal', name: qb.title });
                          }}
                          className="text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 p-1.5 rounded transition cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Dibuat</span>
                      <span className="font-bold text-slate-800 flex items-center gap-0.5 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" /> {new Date(qb.createdAt).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Jumlah Soal</span>
                      <span className="font-bold text-slate-800 flex items-center gap-0.5 mt-0.5">
                        <FileText className="w-3.5 h-3.5 text-emerald-500" /> {qb.questions.length} Butir
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CHEATLOGS */}
      {activeTab === 'cheatlogs' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Log Pelanggaran Siswa</h2>
              <p className="text-sm text-slate-500">
                Catatan otomatis siswa yang keluar dari aplikasi/tab saat ujian berlangsung.
              </p>
            </div>
          </div>

          {teacherCheatLogs.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-3xl bg-white shadow-sm">
              <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Belum ada pelanggaran yang tercatat pada ujian Anda.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="p-4 font-bold border-b border-slate-200">Waktu</th>
                      <th className="p-4 font-bold border-b border-slate-200">Siswa</th>
                      <th className="p-4 font-bold border-b border-slate-200">Kelas</th>
                      <th className="p-4 font-bold border-b border-slate-200">Ujian</th>
                      <th className="p-4 font-bold border-b border-slate-200">Pelanggaran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {teacherCheatLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition">
                        <td className="p-4 text-slate-600 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString('id-ID')}
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-slate-900">{log.studentName}</p>
                          <p className="text-xs text-slate-500">{log.studentNis}</p>
                        </td>
                        <td className="p-4 text-slate-700 font-medium">{log.className}</td>
                        <td className="p-4 text-slate-700 font-medium">{log.examTitle}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-700">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {log.violationType}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. TAB PROFIL GURU & JADWAL MENGAJAR PRIBADI */}
      {activeTab === 'profile' && (
        <div className="space-y-8 animate-fade-in">
          {/* A. KELOLA FOTO PROFIL & BIODATA GURU MAPEL */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2.5">
                  <UserCheck className="w-6 h-6 text-indigo-600" /> Pengaturan Foto Profil & Biodata Guru Mapel
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Sesuaikan foto profil profesional Anda, nama lengkap beserta gelar, dan NIP yang akan tercetak otomatis di setiap dokumen resmi.
                </p>
              </div>
              {profileSuccessMsg && (
                <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce">
                  <Check className="w-4 h-4 shrink-0" /> {profileSuccessMsg}
                </div>
              )}
            </div>

            <form onSubmit={handleSaveProfileChanges} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Live Preview Foto Profil */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 flex flex-col items-center text-center space-y-4">
                <div className="relative group">
                  <img
                    src={profilePhotoInput || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop'}
                    alt="Preview Profil"
                    referrerPolicy="no-referrer"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-105 transition duration-300"
                  />
                  <label className="absolute bottom-1 right-1 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow-md cursor-pointer transition">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePhotoFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{profileNameInput || currentTeacher.name}</h4>
                  <p className="text-[11px] font-semibold text-indigo-600 mt-0.5">NIP. {profileNipInput || currentTeacher.nip}</p>
                  <span className="inline-block mt-2 px-2.5 py-1 bg-slate-200/70 text-slate-700 rounded-lg text-[10px] font-bold">
                    Mapel: {currentTeacher.subject}
                  </span>
                </div>
                <label className="w-full py-2.5 px-3 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 cursor-pointer shadow-2xs transition flex items-center justify-center gap-2">
                  <Upload className="w-3.5 h-3.5 text-indigo-600" /> Pilih File Foto dari Perangkat
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Form Input URL & Biodata */}
              <div className="lg:col-span-2 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Image className="w-4 h-4 text-indigo-600" /> Link / URL Foto Profil (Opsi Alternatif)
                  </label>
                  <input
                    type="text"
                    value={profilePhotoInput}
                    onChange={(e) => setProfilePhotoInput(e.target.value)}
                    placeholder="Tempel tautan gambar (URL langsung / Google Drive) atau unggah file di kiri..."
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Tips: Anda dapat mengunggah file langsung menggunakan tombol di foto atas, atau menyalin link foto eksternal ke dalam kotak ini.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-indigo-600" /> Nama Lengkap Guru Mapel (Serta Gelar) *
                    </label>
                    <input
                      type="text"
                      required
                      value={profileNameInput}
                      onChange={(e) => setProfileNameInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-indigo-600" /> NIP Guru Mapel *
                    </label>
                    <input
                      type="text"
                      required
                      value={profileNipInput}
                      onChange={(e) => setProfileNipInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Simpan Perubahan Profil Guru Mapel
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* B. MENU KELENGKAPAN: JADWAL MENGAJAR & CATATAN KELAS PRIBADI */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2.5">
                  <Calendar className="w-6 h-6 text-indigo-600" /> Agenda Jadwal Mengajar & Catatan Kelas Guru Mapel
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Catat hari, jam pelajaran, ruangan, dan agenda khusus di tiap kelas. Anda dapat mengedit perubahan jadwal sewaktu-waktu jika ada pergeseran jam atau tugas kelas.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddSchedule}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Tambah Jadwal & Catatan Baru
              </button>
            </div>

            {/* Filter Hari */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100">
              {(['Semua', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jum\'at', 'Sabtu']).map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDayFilter(d)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition shrink-0 cursor-pointer ${
                    selectedDayFilter === d
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d === 'Semua' ? '📅 Semua Hari' : d}
                </button>
              ))}
            </div>

            {/* Grid Kartu Jadwal & Note */}
            {scheduleNotes.filter(n => selectedDayFilter === 'Semua' || n.day === selectedDayFilter).length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-700 text-sm">Belum Ada Catatan Jadwal Mengajar</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Tambahkan jadwal hari dan jam mengajar kelas Anda dengan mengklik tombol Tambah Jadwal di kanan atas.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {scheduleNotes
                  .filter(n => selectedDayFilter === 'Semua' || n.day === selectedDayFilter)
                  .map((note) => (
                    <div
                      key={note.id}
                      className="bg-gradient-to-br from-white to-slate-50/80 border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-800 font-black text-xs rounded-lg uppercase tracking-wide flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-indigo-600" /> {note.day}
                          </span>
                          <span className="text-[11px] font-bold text-slate-600 bg-slate-200/70 px-2.5 py-1 rounded-md">
                            {note.jamKe}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                            <Building className="w-4 h-4 text-indigo-600 shrink-0" /> Kelas : {note.className}
                          </h4>
                          {note.room && (
                            <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {note.room}
                            </p>
                          )}
                        </div>

                        <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3 text-xs text-slate-700">
                          <span className="font-extrabold text-amber-900 block mb-1 text-[11px] uppercase tracking-wider flex items-center gap-1">
                            📌 Catatan & Agenda KBM:
                          </span>
                          <p className="leading-relaxed whitespace-pre-wrap">{note.note || 'Tidak ada catatan khusus.'}</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditSchedule(note)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit Jadwal & Catatan
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteScheduleNote(note.id)}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition cursor-pointer"
                          title="Hapus Jadwal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: PENGUMUMAN & NOTIFIKASI SISWA */}
      {activeTab === 'announcements' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                <Bell className="w-3 h-3" /> Siaran Khusus Mapel {currentTeacher.subject} ({currentTeacher.name})
              </span>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2 mt-1">
                <Megaphone className="w-5 h-5 text-amber-600" />
                Manajemen Notifikasi & Informasi Beranda Siswa
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Kirim pengumuman penting, tugas cepat, atau informasi agenda mengajar yang akan langsung muncul sebagai notifikasi pop-up & banner di beranda siswa saat login.
              </p>
            </div>

            <button
              onClick={() => setShowAddAnnModal(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" /> Kirim Notifikasi Baru
            </button>
          </div>

          <div className="space-y-4">
            {teacherAnnouncements.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 font-semibold text-xs">Belum ada catatan atau informasi notifikasi untuk mata pelajaran {currentTeacher.subject}.</p>
                <p className="text-slate-400 text-[11px] mt-1">Tekan tombol "Kirim Notifikasi Baru" untuk memberi tahu siswa mengenai jadwal, materi, atau tugas mapel ini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teacherAnnouncements
                  .map(ann => (
                    <div
                      key={ann.id}
                      className={`p-5 rounded-2xl border transition flex flex-col justify-between space-y-4 ${
                        ann.isActive
                          ? 'bg-gradient-to-br from-amber-50/50 via-white to-white border-amber-200/80 shadow-xs'
                          : 'bg-slate-50 border-slate-200/60 opacity-60'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] uppercase tracking-wider ${
                              ann.priority === 'mendesak' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                              ann.priority === 'penting' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                              'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}>
                              {ann.priority === 'mendesak' ? '🚨 Mendesak' : ann.priority === 'penting' ? '⭐ Penting' : 'ℹ️ Informasi'}
                            </span>
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                              {ann.targetType === 'all' ? '🌐 Semua Kelas Siswa' : `🎯 Khusus Kelas ${ann.targetClassName}`}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {onToggleAnnouncement && (
                              <button
                                onClick={() => onToggleAnnouncement(ann.id)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                                  ann.isActive ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                }`}
                                title={ann.isActive ? 'Klik untuk nonaktifkan notifikasi' : 'Klik untuk aktifkan notifikasi'}
                              >
                                {ann.isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                                {ann.isActive ? 'Aktif' : 'Nonaktif'}
                              </button>
                            )}
                            {onDeleteAnnouncement && (
                              <button
                                onClick={() => onDeleteAnnouncement(ann.id)}
                                className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                title="Hapus Notifikasi"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <h4 className="font-extrabold text-slate-900 text-sm">{ann.title}</h4>
                        <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed bg-white/80 p-3 rounded-xl border border-slate-150/60">
                          {ann.content}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-150/80 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                        <span>Oleh: <strong className="text-slate-700">{ann.teacherName}</strong> ({ann.teacherSubject})</span>
                        <span>{new Date(ann.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. TAB INBOX (KOTAK MASUK BERBAGI) */}
      {activeTab === 'inbox' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Send className="w-5 h-5 text-purple-600" />
                Kotak Masuk Berbagi
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">Permintaan berbagi materi atau bank soal dari guru lain yang perlu konfirmasi Anda.</p>
            </div>
          </div>

          <div className="space-y-4">
            {shareRequests.filter(r => r.receiverId === currentTeacher.id).length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Send className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 font-bold">Tidak ada kotak masuk</p>
                <p className="text-xs text-slate-400 mt-1">Belum ada permintaan berbagi dari guru lain.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {shareRequests
                  .filter(r => r.receiverId === currentTeacher.id)
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map(req => (
                    <div key={req.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${req.itemType === 'Material' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                            {req.itemType === 'Material' ? 'Materi' : 'Bank Soal'}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            req.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                            req.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {req.status === 'Pending' ? 'Menunggu Konfirmasi' : req.status === 'Accepted' ? 'Diterima' : 'Ditolak'}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-base">{req.itemTitle}</h4>
                        <p className="text-xs text-slate-500 mt-1">Dari: <span className="font-bold text-slate-700">{req.senderName}</span> • {new Date(req.createdAt).toLocaleString('id-ID')}</p>
                      </div>
                      
                      {req.status === 'Pending' && onRespondShare && (
                        <div className="flex items-center gap-2 w-full md:w-auto">
                          <button
                            onClick={() => onRespondShare(req.id, 'Rejected')}
                            className="flex-1 md:flex-none px-4 py-2 text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
                          >
                            Tolak
                          </button>
                          <button
                            onClick={() => onRespondShare(req.id, 'Accepted')}
                            className="flex-1 md:flex-none px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md rounded-lg transition flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle className="w-4 h-4" /> Terima & Salin
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL ADD MATERI */}
      {showAddMateriModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center sm:p-4 lg:p-6 z-50 animate-fade-in">
          <div className="bg-slate-50 sm:rounded-[2rem] shadow-2xl w-full h-full max-w-[1400px] flex flex-col overflow-hidden animate-fade-in-up border border-white/20">
            <form onSubmit={handleSaveMaterial} className="flex flex-col h-full w-full">
              {/* HEADER (Sticky) */}
              <div className="bg-white px-6 lg:px-8 py-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shrink-0 z-10 relative">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-600">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-xl tracking-tight">Buat Materi Baru</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Tulis artikel materi atau lampirkan berkas untuk siswa</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddMateriModal(false)}
                    className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer flex items-center gap-2 shadow-xs"
                  >
                    <X className="w-4 h-4" /> Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition cursor-pointer flex items-center gap-2 shadow-md"
                  >
                    <Save className="w-4 h-4" /> Publikasikan Materi
                  </button>
                </div>
              </div>

              {/* BODY (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 max-w-[1200px] mx-auto">
                  
                  {/* LEFT COLUMN: Config */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <Settings className="w-5 h-5 text-slate-400" />
                        <h4 className="font-extrabold text-slate-900 text-sm tracking-wide uppercase">Pengaturan Materi</h4>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1 text-slate-700">Judul Materi *</label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: Bab 2 - Struktur Sel Tumbuhan"
                          value={materiTitle}
                          onChange={(e) => setMateriTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-xs font-semibold mb-1 text-slate-700">Untuk Kelas *</label>
                          <div className="flex flex-wrap gap-2">
                            {classes.map(c => (
                              <label key={c.id} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border cursor-pointer transition ${materiClasses.includes(c.id) ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                <input
                                  type="checkbox"
                                  className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-600"
                                  checked={materiClasses.includes(c.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setMateriClasses([...materiClasses, c.id]);
                                    } else {
                                      setMateriClasses(materiClasses.filter(id => id !== c.id));
                                    }
                                  }}
                                />
                                <span className="font-bold text-xs">{c.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-semibold mb-1 text-slate-700">Mata Pelajaran *</label>
                          <select
                            required
                            value={materiSubject}
                            onChange={(e) => setMateriSubject(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden"
                          >
                            <option value="">Pilih Mapel</option>
                            {subjects.map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-2 text-slate-700">Format Konten *</label>
                        <div className="grid grid-cols-2 gap-3">
                          {(['Article', 'PDF', 'Video', 'Link'] as const).map(type => (
                            <label 
                              key={type} 
                              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                                materiType === type 
                                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                                  : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name="materiType"
                                checked={materiType === type}
                                onChange={() => setMateriType(type)}
                                className="hidden"
                              />
                              <span className="text-xs font-bold">{type === 'Article' ? 'Tulis Artikel' : type}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Content Editor / Uploader */}
                  <div className="lg:col-span-8">
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm h-full flex flex-col min-h-[500px]">
                      
                      {materiType === 'Article' ? (
                        <div className="flex flex-col h-full space-y-4">
                          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <FileText className="w-5 h-5 text-indigo-500" />
                            <h4 className="font-extrabold text-slate-900 text-sm tracking-wide uppercase">Editor Artikel</h4>
                          </div>
                          <div className="flex-1 bg-slate-50 rounded-2xl p-1 border border-slate-200">
                            <ReactQuill
                              theme="snow"
                              value={materiContent}
                              onChange={setMateriContent}
                              modules={{
                                toolbar: [
                                  [{ 'header': [1, 2, 3, false] }],
                                  ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                  [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                                  ['link', 'image', 'video'],
                                  ['clean']
                                ],
                              }}
                              formats={[
                                'header',
                                'bold', 'italic', 'underline', 'strike', 'blockquote',
                                'list', 'indent',
                                'link', 'image', 'video'
                              ]}
                              placeholder="Ketikkan materi pembelajaran di sini... (Dukung format teks panjang, rapi, dan mendetail layaknya artikel blog atau wiki)"
                              className="h-[400px] overflow-hidden"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col h-full space-y-6">
                          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <Upload className="w-5 h-5 text-indigo-500" />
                            <h4 className="font-extrabold text-slate-900 text-sm tracking-wide uppercase">Lampirkan Berkas / Tautan</h4>
                          </div>

                          <div className="space-y-6 flex-1">
                            <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100/50">
                              <label className="block text-xs font-semibold mb-3 text-slate-700">Opsi A: Unggah Berkas (Simulasi Google Drive)</label>
                              <div className="flex flex-col sm:flex-row items-center gap-4">
                                <input
                                  type="file"
                                  id="materiFile"
                                  accept={materiType === 'PDF' ? 'application/pdf' : materiType === 'Video' ? 'video/*' : '*/*'}
                                  onChange={handleSimulatedMateriUpload}
                                  className="hidden"
                                />
                                <button
                                  type="button"
                                  onClick={() => document.getElementById('materiFile')?.click()}
                                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold text-sm px-6 py-3 rounded-xl transition shadow-xs"
                                >
                                  <Upload className="w-4 h-4" /> Pilih File {materiType}
                                </button>
                                {uploading && (
                                  <span className="text-xs text-indigo-600 font-bold animate-pulse flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                    Mengunggah...
                                  </span>
                                )}
                                {materiUrl && materiUrl.includes('materi_drive_') && !uploading && (
                                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg">
                                    <CheckCircle className="w-4 h-4" /> Berhasil diunggah
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center py-2">
                              <div className="flex-1 border-t border-slate-100"></div>
                              <span className="text-[10px] text-slate-400 font-extrabold px-4 bg-white rounded-full mx-2">ATAU MASUKKAN LINK</span>
                              <div className="flex-1 border-t border-slate-100"></div>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold mb-2 text-slate-700">Opsi B: Tempel Link / Tautan Langsung *</label>
                              <input
                                type="url"
                                required={!materiUrl}
                                placeholder="Contoh: https://youtube.com/... atau https://drive.google.com/..."
                                value={materiUrl}
                                onChange={(e) => setMateriUrl(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                              />
                              <p className="text-[11px] text-slate-400 mt-2 font-medium">Anda bisa menempelkan link YouTube, dokumen Google Docs/Sheets/Drive, presentasi Canva, atau web belajar lainnya.</p>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SHARE MATERI TO CLASSES */}
      {(showShareMateriModal || shareMateriSuccess) && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up border border-white/20">
            {shareMateriSuccess ? (
              <div>
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Materi Berhasil Dibagikan</h3>
                      <p className="text-xs text-slate-500">Materi telah diduplikasi ke kelas tujuan.</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setShareMateriSuccess(false)} className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <button type="button" onClick={() => { setShareMateriSuccess(false); setShowShareMateriModal(false); setShareMateriId(null); }} className="px-5 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition">
                    Tutup
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleShareMaterialSubmit}>
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
                      <Send className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Bagikan Materi</h3>
                      <p className="text-xs text-slate-500">Duplikasi materi ini ke kelas lain</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setShowShareMateriModal(false)} className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-xs font-bold mb-3 text-slate-700">Pilih Tujuan Berbagi</label>
                    <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
                      <button
                        type="button"
                        onClick={() => setShareMateriTargetType('Class')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${shareMateriTargetType === 'Class' ? 'bg-white shadow-xs text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Ke Kelas Saya
                      </button>
                      <button
                        type="button"
                        onClick={() => setShareMateriTargetType('Teacher')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${shareMateriTargetType === 'Teacher' ? 'bg-white shadow-xs text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Ke Guru Lain
                      </button>
                    </div>

                    {shareMateriTargetType === 'Class' ? (
                      <>
                        <label className="block text-xs font-bold mb-2 text-slate-700">Pilih Kelas Tujuan *</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {classes.map(c => (
                            <label key={c.id} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition ${shareMateriSelectedClasses.includes(c.id) ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-600"
                                checked={shareMateriSelectedClasses.includes(c.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setShareMateriSelectedClasses([...shareMateriSelectedClasses, c.id]);
                                  } else {
                                    setShareMateriSelectedClasses(shareMateriSelectedClasses.filter(id => id !== c.id));
                                  }
                                }}
                              />
                              <span className="font-bold text-sm">{c.name}</span>
                            </label>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <label className="block text-xs font-bold mb-2 text-slate-700">Pilih Guru Tujuan *</label>
                        <select
                          value={shareMateriSelectedTeacher}
                          onChange={(e) => setShareMateriSelectedTeacher(e.target.value)}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-slate-50"
                        >
                          <option value="">-- Pilih Guru --</option>
                          {teachers.filter(t => t.id !== currentTeacher.id).map(t => (
                            <option key={t.id} value={t.id}>{t.name} (Mapel: {t.subject})</option>
                          ))}
                        </select>
                        <p className="text-[11px] text-slate-500 mt-2">
                          Materi akan dikirim sebagai permintaan. Guru yang bersangkutan harus menyetujui agar materi disalin ke akun mereka.
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowShareMateriModal(false)} className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition">
                    Batal
                  </button>
                  <button type="submit" className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md rounded-xl transition flex items-center gap-2">
                    <Send className="w-4 h-4" /> Bagikan Sekarang
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL SHARE QUESTION BANK TO CLASSES */}
      {(showShareQbModal || shareSuccessResult) && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up border border-white/20">
            {shareSuccessResult ? (
              <div>
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Berhasil Dibagikan</h3>
                      <p className="text-xs text-slate-500">Berikut adalah token unik untuk masing-masing kelas</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setShareSuccessResult(null)} className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {shareSuccessResult.map((res, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Kelas</p>
                          <p className="font-bold text-slate-900">{res.className}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Token Ujian</p>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-indigo-700 bg-indigo-100 px-3 py-1 rounded-lg text-lg tracking-widest">{res.token}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(res.token);
                                toast(`Token Kelas ${res.className} berhasil disalin!`);
                              }}
                              className="p-2 text-indigo-600 hover:bg-indigo-200 bg-indigo-50 rounded-lg transition"
                              title="Salin Token"
                            >
                              <Clipboard className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <button type="button" onClick={() => setShareSuccessResult(null)} className="px-5 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition">
                    Tutup
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleShareQuestionBankSubmit}>
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
                      <Send className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Bagikan Bank Soal</h3>
                      <p className="text-xs text-slate-500">Buat paket ujian dari bank soal ini</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setShowShareQbModal(false)} className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-xs font-bold mb-3 text-slate-700">Pilih Tujuan Berbagi</label>
                    <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
                      <button
                        type="button"
                        onClick={() => setShareQbTargetType('Class')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${shareQbTargetType === 'Class' ? 'bg-white shadow-xs text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Jadikan Ujian Kelas
                      </button>
                      <button
                        type="button"
                        onClick={() => setShareQbTargetType('Teacher')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${shareQbTargetType === 'Teacher' ? 'bg-white shadow-xs text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Bagikan ke Guru Lain
                      </button>
                    </div>

                    {shareQbTargetType === 'Class' ? (
                      <>
                        <label className="block text-xs font-bold mb-2 text-slate-700">Pilih Kelas Tujuan *</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                          {classes.map(c => (
                            <label key={c.id} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition ${shareSelectedClasses.includes(c.id) ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-600"
                                checked={shareSelectedClasses.includes(c.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setShareSelectedClasses([...shareSelectedClasses, c.id]);
                                  } else {
                                    setShareSelectedClasses(shareSelectedClasses.filter(id => id !== c.id));
                                  }
                                }}
                              />
                              <span className="font-bold text-sm">{c.name}</span>
                            </label>
                          ))}
                        </div>
                        <div>
                          <label className="block text-xs font-bold mb-1.5 text-slate-700">Durasi Pengerjaan (Menit) *</label>
                          <input
                            type="number"
                            required
                            min="5"
                            value={shareDuration}
                            onChange={(e) => setShareDuration(Number(e.target.value))}
                            className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition"
                          />
                          <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                            Token unik untuk setiap kelas akan otomatis dibuatkan oleh sistem.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <label className="block text-xs font-bold mb-2 text-slate-700">Pilih Guru Tujuan *</label>
                        <select
                          value={shareQbSelectedTeacher}
                          onChange={(e) => setShareQbSelectedTeacher(e.target.value)}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-slate-50"
                        >
                          <option value="">-- Pilih Guru --</option>
                          {teachers.filter(t => t.id !== currentTeacher.id).map(t => (
                            <option key={t.id} value={t.id}>{t.name} (Mapel: {t.subject})</option>
                          ))}
                        </select>
                        <p className="text-[11px] text-slate-500 mt-2">
                          Bank soal akan dikirim sebagai permintaan. Guru yang bersangkutan harus menyetujui agar bank soal disalin ke akun mereka.
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowShareQbModal(false)} className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition">
                    Batal
                  </button>
                  <button type="submit" className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md rounded-xl transition flex items-center gap-2">
                    <Send className="w-4 h-4" /> Bagikan Sekarang
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL ADD EXAM / QUESTION BANK & CUSTOM ANBK QUESTION BUILDER */}
      {(showAddExamModal || showAddQuestionBankModal) && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center sm:p-4 lg:p-6 z-50">
          <div className="bg-slate-50 sm:rounded-[2rem] shadow-2xl w-full h-full max-w-[1800px] flex flex-col overflow-hidden animate-fade-in-up border border-white/20">
            <form onSubmit={isQuestionBankMode ? handleSaveQuestionBankSubmit : handleSaveExam} className="flex flex-col h-full w-full">
              {/* HEADER (Sticky) */}
              <div className="bg-white px-6 lg:px-8 py-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shrink-0 z-10 relative">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${isQuestionBankMode ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                    {isQuestionBankMode ? <Database className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-xl tracking-tight">
                      {isQuestionBankMode ? (editingQbId ? 'Edit Bank Soal' : 'Buat Bank Soal Baru') : 'Pembuatan Paket Ujian'}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {isQuestionBankMode ? 'Koleksi butir soal untuk digunakan kembali.' : 'Rakit soal interaktif untuk dikerjakan siswa.'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddExamModal(false);
                      setShowAddQuestionBankModal(false);
                      setEditingQbId(null);
                    }}
                    className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer flex items-center gap-2 shadow-xs"
                  >
                    <X className="w-4 h-4" /> Tutup
                  </button>
                  <button
                    type="submit"
                    disabled={examQuestions.length === 0}
                    className={`px-6 py-2.5 text-white font-bold rounded-xl disabled:opacity-50 transition cursor-pointer flex items-center gap-2 shadow-md ${
                      isQuestionBankMode ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    <Save className="w-4 h-4" /> {isQuestionBankMode ? 'Simpan Bank Soal' : 'Simpan Paket Ujian'}
                  </button>
                </div>
              </div>

              {/* BODY (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 max-w-[1600px] mx-auto">
                  {/* LEFT COLUMN: Editor & Config */}
                  <div className="xl:col-span-8 space-y-6 lg:space-y-8">
                    
                    {/* Exam / QB Config */}
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                        <Settings className="w-5 h-5 text-slate-400" />
                        <h4 className="font-extrabold text-slate-900 text-sm tracking-wide uppercase">Pengaturan Dasar</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold mb-1 text-slate-700">{isQuestionBankMode ? 'Judul Bank Soal *' : 'Judul Paket Ujian *'}</label>
                  <input
                    type="text"
                    required
                    placeholder={isQuestionBankMode ? "Contoh: Bank Soal Matematika K-13" : "Contoh: Penilaian Harian Aljabar"}
                    value={isQuestionBankMode ? qbTitle : examTitle}
                    onChange={(e) => isQuestionBankMode ? setQbTitle(e.target.value) : setExamTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Rencana Jml Soal *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={targetQuestionCount}
                    onChange={(e) => setTargetQuestionCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                {!isQuestionBankMode && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-700">Untuk Kelas *</label>
                      <select
                        required
                        value={examClass}
                        onChange={(e) => setExamClass(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden"
                      >
                        <option value="">Pilih Kelas</option>
                        {classes.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-700">Token *</label>
                      <input
                        type="text"
                        required
                        placeholder="E.g. ALJB99"
                        value={examToken}
                        onChange={(e) => setExamToken(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-700">Durasi (Menit) *</label>
                      <input
                        type="number"
                        required
                        value={examDuration}
                        onChange={(e) => setExamDuration(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                  </>
                )}
                {isQuestionBankMode && (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold mb-1 text-slate-700">Mata Pelajaran *</label>
                    <select
                      required
                      value={qbSubject}
                      onChange={(e) => setQbSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    >
                      <option value="">Pilih Mapel</option>
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Subject Selection for Exam */}
              {!isQuestionBankMode && (
                <div className="w-1/3">
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Mata Pelajaran *</label>
                  <select
                    required
                    value={examSubject}
                    onChange={(e) => setExamSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="">Pilih Mapel</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div> {/* END CONFIG CARD */}

              {/* BANK SOAL IMPORTER SECTION */}
              {!isQuestionBankMode && (
                <div className="border border-indigo-100 rounded-2xl p-5 bg-indigo-50/20 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div className="flex items-start gap-2.5">
                      <Database className="w-5 h-5 text-indigo-600 mt-0.5" />
                      <div>
                        <h4 className="font-extrabold text-indigo-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                          🗄️ Import dari Bank Soal
                        </h4>
                        <p className="text-[11px] text-indigo-700 font-medium leading-relaxed mt-0.5">
                          Tarik soal dari koleksi Bank Soal Anda untuk mempercepat pembuatan paket ujian.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowBankSoalImporter(!showBankSoalImporter)}
                      className="text-xs font-extrabold text-indigo-700 hover:text-indigo-950 bg-indigo-100 hover:bg-indigo-200 px-3 py-1.5 rounded-lg transition shrink-0 border border-indigo-200"
                    >
                      {showBankSoalImporter ? 'Sembunyikan Panel ✕' : 'Pilih Bank Soal 📥'}
                    </button>
                  </div>

                  {showBankSoalImporter && (
                    <div className="space-y-4 border-t border-indigo-100/50 pt-4">
                      {teacherQuestionBanks.length === 0 ? (
                         <div className="text-center py-6 bg-white rounded-xl border border-dashed border-indigo-200">
                           <p className="text-indigo-400 text-xs font-medium">Anda belum memiliki bank soal.</p>
                         </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
                          {teacherQuestionBanks.map(qb => (
                            <div key={qb.id} className="border border-slate-200 p-3 rounded-xl bg-white flex flex-col justify-between hover:border-indigo-300 transition">
                              <div>
                                <h5 className="font-bold text-slate-800 text-sm mb-1">{qb.title}</h5>
                                <span className="text-[10px] text-slate-500">{getSubjectName(qb.subjectId)} • {qb.questions.length} Soal</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setExamQuestions(prev => [...prev, ...qb.questions]);
                                  toast(`Berhasil menambahkan ${qb.questions.length} soal dari ${qb.title}`);
                                }}
                                className="mt-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs py-1.5 px-3 rounded-lg w-full text-center transition cursor-pointer"
                              >
                                Tambahkan Semua Soal
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* SPREADSHEET IMPORTER SECTION */}
              <div className="border border-emerald-150 rounded-2xl p-5 bg-emerald-50/15 space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div className="flex items-start gap-2.5">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-emerald-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        📥 Import Soal Massal dari Spreadsheet (Excel / CSV)
                      </h4>
                      <p className="text-[11px] text-emerald-700 font-medium leading-relaxed mt-0.5">
                        Salin-tempel baris tabel langsung dari Google Sheets / Microsoft Excel atau berkas CSV.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowImportSection(!showImportSection)}
                    className="text-xs font-extrabold text-emerald-700 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition shrink-0 border border-emerald-200"
                  >
                    {showImportSection ? 'Sembunyikan Panel ✕' : 'Mulai Import Soal 📥'}
                  </button>
                </div>

                {showImportSection && (
                  <div className="space-y-5 border-t border-emerald-100/50 pt-4">
                    {/* LANGKAH 1 & UNDUH TEMPLATE EXCEL */}
                    <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 border border-emerald-300 p-4 rounded-xl space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-600 text-white shadow-xs">
                            <Download className="w-3 h-3" /> Langkah 1: Unduh Template Excel Lengkap
                          </span>
                          <h5 className="font-extrabold text-emerald-950 text-sm">
                            Gunakan Format File Standar (.xlsx) beserta Petunjuk Pengisian
                          </h5>
                          <p className="text-xs text-emerald-800 leading-relaxed">
                            Unduh berkas contoh di bawah ini. Berkas terdiri dari 2 sheet: <strong>Sheet 1 (Contoh Soal)</strong> dengan contoh soal Pilihan Ganda, PG Kompleks, Asosiatif, dan Sebab-Akibat, serta <strong>Sheet 2 (Panduan & Aturan Kolom)</strong>.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleDownloadTemplateExcel}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition shrink-0 cursor-pointer active:scale-95"
                        >
                          <Download className="w-4 h-4" /> Unduh Template Soal (.XLSX)
                        </button>
                      </div>
                    </div>

                    {/* LANGKAH 2: UNGGAH BERKAS EXCEL */}
                    <div className="bg-white border-2 border-dashed border-emerald-300 rounded-2xl p-5 text-center space-y-3 hover:border-emerald-500 transition-colors">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                          Langkah 2: Langsung Unggah Berkas Excel
                        </span>
                        <h5 className="font-bold text-slate-800 text-sm">
                          Pilih atau Tarik Berkas Soal Anda (.XLSX, .XLS, .CSV)
                        </h5>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                          Setelah Anda mengisi soal pada berkas Excel yang diunduh, pilih berkas tersebut di bawah ini untuk langsung memproses seluruh butir soal secara otomatis.
                        </p>
                      </div>
                      <div className="flex justify-center pt-1">
                        <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4" /> Pilih File Excel / CSV
                          <input
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            onChange={handleFileUploadExcel}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* LANGKAH ALTERNATIF: SALIN-TEMPEL TEKS */}
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                          <Clipboard className="w-4 h-4 text-slate-500" />
                          Alternatif Langkah 2: Salin-Tempel Baris dari Google Sheets / Excel
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const mockHeader = "Tipe Soal\tPertanyaan\tOpsi A / Sebab\tOpsi B / Alasan\tOpsi C\tOpsi D\tKunci Jawaban\tSkor\tTipe Media\tLink Media\tFont Preset\n" +
                              "PilihanGanda\tContoh soal matematika **aljabar** dasar\t5\t10\t15\t20\tB\t10\tNone\t\tSans\n" +
                              "PilihanGandaKompleks\tMana sajakah yang merupakan organ ekskresi manusia?\tGinjal\tParu-paru\tJantung\tKulit\tA,B,D\t10\tNone\t\tSans\n" +
                              "PilihanAsosiatif\tPernyataan matriks ordo 2x2:\t(1) Determinan = 0\t(2) Memiliki invers\t(3) Matriks identitas\t(4) Matriks singular\t1,4\t15\tNone\t\tMono\n" +
                              "SebabAkibat\tContoh soal IPA fisika optik\tCahaya dapat mengalami polarisasi.\tCahaya merupakan gelombang transversal.\t\t\tBENAR,BENAR,YA\t10\tImage\thttps://picsum.photos/400/300\tSerif";
                            navigator.clipboard.writeText(mockHeader);
                            toast("Template baris contoh berhasil disalin! Silakan tempel (Ctrl+V) ke Excel atau Google Sheets untuk latihan.");
                          }}
                          className="px-2.5 py-1 bg-white text-slate-700 hover:bg-slate-100 rounded text-[10px] font-bold border border-slate-300 transition"
                        >
                          📋 Salin Teks Contoh ke Clipboard
                        </button>
                      </div>
                      <textarea
                        rows={4}
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
                        placeholder="Jika tidak ingin mengunggah file .xlsx, Anda dapat langsung menyalin (Copy) baris dari spreadsheet lalu menempelkannya (Paste) di sini..."
                        className="w-full px-3 py-2 border border-slate-300 bg-white rounded-xl text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-hidden leading-relaxed"
                      />
                      <div className="flex justify-end gap-2 text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => {
                            setImportText('');
                            setImportErrors([]);
                          }}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition"
                        >
                          Bersihkan
                        </button>
                        <button
                          type="button"
                          onClick={handleImportFromSpreadsheet}
                          className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg flex items-center gap-1 transition shadow-xs"
                        >
                          <Upload className="w-3.5 h-3.5" /> Proses Teks
                        </button>
                      </div>
                    </div>

                    {/* Guidance detail collapsible / table */}
                    <details className="bg-white border border-slate-200 p-3.5 rounded-xl text-xs">
                      <summary className="font-bold text-slate-700 text-xs cursor-pointer select-none flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Info className="w-4 h-4 text-indigo-600" /> Referensi Tabel Struktur Kolom (11 Kolom Berurutan)
                        </span>
                        <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">Klik untuk buka / tutup detail</span>
                      </summary>
                      <div className="mt-3 space-y-2 pt-3 border-t border-slate-100">
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Urutan kolom dalam berkas Excel (.xlsx / .csv) Anda harus persis mengikuti <strong>11 kolom</strong> di bawah ini:
                        </p>
                        <div className="overflow-x-auto border border-slate-150 rounded-lg max-h-48 bg-slate-50">
                          <table className="w-full text-[10px] text-left border-collapse font-mono">
                            <thead>
                              <tr className="bg-slate-100 text-slate-700 uppercase font-bold border-b">
                                <th className="p-2 border-r whitespace-nowrap">Kolom 1: Tipe</th>
                                <th className="p-2 border-r whitespace-nowrap">Kolom 2: Pertanyaan</th>
                                <th className="p-2 border-r whitespace-nowrap">Kolom 3: Opsi A / Sebab</th>
                                <th className="p-2 border-r whitespace-nowrap">Kolom 4: Opsi B / Alasan</th>
                                <th className="p-2 border-r whitespace-nowrap">Kolom 5: Opsi C</th>
                                <th className="p-2 border-r whitespace-nowrap">Kolom 6: Opsi D</th>
                                <th className="p-2 border-r whitespace-nowrap">Kolom 7: Kunci</th>
                                <th className="p-2 border-r whitespace-nowrap">Kolom 8: Skor</th>
                                <th className="p-2 border-r whitespace-nowrap">Kolom 9: Media</th>
                                <th className="p-2 border-r whitespace-nowrap">Kolom 10: Tautan Media</th>
                                <th className="p-2 whitespace-nowrap">Kolom 11: Font</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b bg-white">
                                <td className="p-2 border-r font-bold text-indigo-700">PilihanGanda</td>
                                <td className="p-2 border-r text-slate-700 font-semibold text-xs whitespace-nowrap">**Tebal** Hasil dari 5+3?</td>
                                <td className="p-2 border-r">6</td>
                                <td className="p-2 border-r">8</td>
                                <td className="p-2 border-r">10</td>
                                <td className="p-2 border-r">12</td>
                                <td className="p-2 border-r font-extrabold text-emerald-700">B</td>
                                <td className="p-2 border-r text-indigo-600">10</td>
                                <td className="p-2 border-r text-slate-500">None</td>
                                <td className="p-2 border-r text-slate-400">-</td>
                                <td className="p-2 text-slate-500">Sans</td>
                              </tr>
                              <tr className="border-b bg-slate-50/50">
                                <td className="p-2 border-r font-bold text-purple-700">PilihanGandaKompleks</td>
                                <td className="p-2 border-r text-slate-700 font-semibold text-xs whitespace-nowrap">Manakah bilangan genap?</td>
                                <td className="p-2 border-r">2</td>
                                <td className="p-2 border-r">3</td>
                                <td className="p-2 border-r">4</td>
                                <td className="p-2 border-r">5</td>
                                <td className="p-2 border-r font-extrabold text-emerald-700">A,C</td>
                                <td className="p-2 border-r text-indigo-600">10</td>
                                <td className="p-2 border-r text-slate-500">None</td>
                                <td className="p-2 border-r text-slate-400">-</td>
                                <td className="p-2 text-slate-500">Sans</td>
                              </tr>
                              <tr className="border-b bg-white">
                                <td className="p-2 border-r font-bold text-teal-700">PilihanAsosiatif</td>
                                <td className="p-2 border-r text-slate-700 font-semibold text-xs whitespace-nowrap">Kombinasi nilai x + y = 5:</td>
                                <td className="p-2 border-r">(1) x=2, y=3</td>
                                <td className="p-2 border-r">(2) x=1, y=4</td>
                                <td className="p-2 border-r">(3) x=3, y=2</td>
                                <td className="p-2 border-r">(4) x=0, y=0</td>
                                <td className="p-2 border-r font-extrabold text-emerald-700">1,2,3</td>
                                <td className="p-2 border-r text-indigo-600">15</td>
                                <td className="p-2 border-r text-slate-500">None</td>
                                <td className="p-2 border-r text-slate-400">-</td>
                                <td className="p-2 text-slate-500">Mono</td>
                              </tr>
                              <tr className="bg-slate-50/50">
                                <td className="p-2 border-r font-bold text-amber-700">SebabAkibat</td>
                                <td className="p-2 border-r text-slate-700 font-semibold text-xs whitespace-nowrap">Sistem organ manusia sangat kompleks...</td>
                                <td className="p-2 border-r">Manusia memiliki jantung 4 ruang.</td>
                                <td className="p-2 border-r">Jantung bertugas memompa darah ke seluruh tubuh.</td>
                                <td className="p-2 border-r text-slate-300">Kosongkan</td>
                                <td className="p-2 border-r text-slate-300">Kosongkan</td>
                                <td className="p-2 border-r font-extrabold text-emerald-700">BENAR,BENAR,YA</td>
                                <td className="p-2 border-r text-indigo-600">10</td>
                                <td className="p-2 border-r text-slate-500">Image</td>
                                <td className="p-2 border-r text-indigo-600">https://image.com/anatomy.jpg</td>
                                <td className="p-2 text-slate-500">Serif</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </details>

                    {importErrors.length > 0 && (
                      <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl space-y-1 text-xs text-red-700 max-h-36 overflow-y-auto">
                        <span className="font-bold flex items-center gap-1.5 text-red-800">
                          <AlertCircle className="w-4 h-4" /> Peringatan / Error Import:
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                          {importErrors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Question Editor section */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
                  <Edit3 className="w-5 h-5 text-slate-400" />
                  <h4 className="font-extrabold text-slate-900 text-sm tracking-wide uppercase">Editor Butir Soal</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-xs font-bold text-slate-700">Pertanyaan / Stimulus Utama *</label>
                    
                    {/* Rich Formatting Toolbar (Google Forms style) */}
                    <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-lg border border-slate-200">
                      {/* Font Preset Selector */}
                      <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200 shadow-2xs">
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Font:</span>
                        <select
                          value={qFontPreset}
                          onChange={(e) => setQFontPreset(e.target.value as any)}
                          className="text-[10px] font-bold text-slate-700 bg-transparent focus:outline-hidden cursor-pointer"
                        >
                          <option value="Sans">Default Sans</option>
                          <option value="Serif">Elegant Serif</option>
                          <option value="Grotesk">Modern Grotesk</option>
                          <option value="Mono">Tech Monospace</option>
                        </select>
                      </div>

                      <div className="h-4 w-px bg-slate-300 mx-0.5"></div>

                      {/* Formatting buttons */}
                      <button
                        type="button"
                        onClick={() => insertTextAtCursor('**', '**')}
                        title="Tebalkan Teks (Bold)"
                        className="p-1 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded transition font-black text-xs px-2 cursor-pointer border border-slate-200 bg-white"
                      >
                        B
                      </button>

                      <button
                        type="button"
                        onClick={() => insertTextAtCursor('*', '*')}
                        title="Miringkan Teks (Italic)"
                        className="p-1 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded transition italic text-xs px-2.5 cursor-pointer border border-slate-200 bg-white"
                      >
                        I
                      </button>

                      <button
                        type="button"
                        onClick={() => insertTextAtCursor('__', '__')}
                        title="Garis Bawah (Underline)"
                        className="p-1 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded transition underline text-xs px-2 cursor-pointer border border-slate-200 bg-white"
                      >
                        U
                      </button>

                      <button
                        type="button"
                        onClick={() => insertTextAtCursor('`', '`')}
                        title="Teks Kode / Monospace"
                        className="p-1 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded transition font-mono text-xs px-1.5 cursor-pointer border border-slate-200 bg-white"
                      >
                        &lt;/&gt;
                      </button>

                      <div className="h-4 w-px bg-slate-300 mx-0.5"></div>

                      <button
                        type="button"
                        onClick={() => {
                          const linkText = prompt("Masukkan Teks Tautan (Contoh: Buka Website Pembelajaran):", "Buka Website");
                          if (linkText === null) return;
                          const linkUrl = prompt("Masukkan URL / Tautan Tujuan (Contoh: https://...):", "https://");
                          if (!linkUrl) return;
                          setQText(prev => prev + ` [${linkText}](${linkUrl}) `);
                        }}
                        title="Sematkan Link / Tautan"
                        className="p-1.5 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded transition text-[10px] font-extrabold cursor-pointer border border-slate-200 bg-white flex items-center gap-1"
                      >
                        🔗 Link
                      </button>

                      <button
                        type="button"
                        onClick={() => setQText(prev => prev + '\n- Item 1\n- Item 2')}
                        title="Tambah Daftar Poin (List)"
                        className="p-1.5 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded transition text-[10px] font-extrabold cursor-pointer border border-slate-200 bg-white flex items-center gap-1"
                      >
                        • Daftar
                      </button>

                      <button
                        type="button"
                        onClick={() => setQText(prev => prev + '\n\n[Paragraf Baru]\n')}
                        title="Tambah Paragraf Baru"
                        className="p-1.5 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded transition text-[10px] font-extrabold cursor-pointer border border-slate-200 bg-white flex items-center gap-1"
                      >
                        ¶ Paragraf
                      </button>
                    </div>

                    <textarea
                      rows={3}
                      placeholder="Tulis stimulus teks, narasi, atau pertanyaan utama..."
                      value={qText}
                      onChange={(e) => setQText(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                    />

                    {/* LIVE RENDER PREVIEW (NEW) */}
                    {qText && (
                      <div className="bg-white border border-slate-150 p-3 rounded-xl shadow-2xs">
                        <span className="text-[9px] font-extrabold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded tracking-wider uppercase">Live Preview Hasil Tampilan Soal:</span>
                        <div className="mt-2 text-slate-900 leading-relaxed border-l-2 border-indigo-400 pl-2.5">
                          {renderFormattedText(qText, qFontPreset)}
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-700">Jenis Soal *</label>
                    <select
                      value={currentQType}
                      onChange={(e) => setCurrentQType(e.target.value as QuestionType)}
                      className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-sm font-bold text-indigo-900"
                    >
                      <option value="PilihanGanda">1. Pilihan Ganda Standar</option>
                      <option value="PilihanGandaKompleks">2. Pilihan Ganda Kompleks (Multi)</option>
                      <option value="PilihanAsosiatif">3. Pilihan Asosiatif (Kombinasi 1,2,3,4)</option>
                      <option value="SebabAkibat">4. Pilihan Sebab-Akibat</option>
                    </select>
                  </div>
                </div>

                {/* PILIHAN MEDIA & BOBOT SKOR (NEW) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3.5 bg-slate-100/50 rounded-xl border border-slate-200/50">
                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-700">Sematkan Media</label>
                    <select
                      value={qMediaType}
                      onChange={(e) => setQMediaType(e.target.value as 'Image' | 'Video' | 'Audio' | 'None')}
                      className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs font-semibold focus:outline-hidden"
                    >
                      <option value="None">Tanpa Media (Teks Saja)</option>
                      <option value="Image">🖼️ Gambar / Ilustrasi</option>
                      <option value="Video">🎥 Video Pembelajaran</option>
                      <option value="Audio">🔊 Audio / Suara / Listening</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold mb-1 text-slate-700">Tautan / URL Media {qMediaType !== 'None' && '*'}</label>
                    <input
                      type="url"
                      disabled={qMediaType === 'None'}
                      placeholder={
                        qMediaType === 'None'
                          ? "Pilih opsi media terlebih dahulu..."
                          : qMediaType === 'Image'
                          ? "https://contoh.com/gambar.jpg"
                          : qMediaType === 'Video'
                          ? "https://youtube.com/embed/... atau .mp4"
                          : "https://contoh.com/audio.mp3"
                      }
                      required={qMediaType !== 'None'}
                      value={qMediaUrl}
                      onChange={(e) => setQMediaUrl(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs font-mono disabled:bg-slate-50 disabled:text-slate-400 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-700">Bobot Skor Soal *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0.1"
                      placeholder="Contoh: 10 atau 2.5"
                      value={qScore}
                      onChange={(e) => setQScore(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs font-bold focus:outline-hidden text-indigo-700"
                    />
                    <p className="text-[9px] text-slate-400 mt-1 leading-tight">Bisa berupa angka desimal (e.g., 2.5), genap, atau ganjil sesuai bobot kesulitan.</p>
                  </div>
                </div>

                {/* DYNAMIC SOAL PARAMETERS */}
                {currentQType === 'PilihanGanda' && (
                  <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-500">Parameter Pilihan Ganda Tunggal (Pilih Satu Jawaban Benar)</p>
                    <div className="grid grid-cols-2 gap-3">
                      {pgOptions.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-400 text-xs">{String.fromCharCode(65 + idx)}.</span>
                          <input
                            type="text"
                            placeholder={`Pilihan ${String.fromCharCode(65 + idx)}`}
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...pgOptions];
                              newOpts[idx] = e.target.value;
                              setPgOptions(newOpts);
                            }}
                            className="w-full px-2.5 py-1 border border-slate-200 rounded-md text-xs"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-bold text-slate-700">Kunci Jawaban Benar:</span>
                      <select
                        value={pgCorrect}
                        onChange={(e) => setPgCorrect(e.target.value)}
                        className="border border-slate-200 rounded px-2 py-0.5 text-xs font-bold"
                      >
                        {pgOptions.map((_, idx) => (
                          <option key={idx} value={idx}>{String.fromCharCode(65 + idx)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {currentQType === 'PilihanGandaKompleks' && (
                  <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-500">Parameter Pilihan Ganda Kompleks (Centang Semua Pilihan Yang Benar)</p>
                    <div className="space-y-2">
                      {pgkOptions.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={pgkCorrects[idx]}
                            onChange={(e) => {
                              const newCorrects = [...pgkCorrects];
                              newCorrects[idx] = e.target.checked;
                              setPgkCorrects(newCorrects);
                            }}
                            className="text-indigo-600"
                          />
                          <input
                            type="text"
                            placeholder={`Pilihan Opsi ${idx + 1}`}
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...pgkOptions];
                              newOpts[idx] = e.target.value;
                              setPgkOptions(newOpts);
                            }}
                            className="w-full px-2.5 py-1 border border-slate-200 rounded-md text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentQType === 'PilihanAsosiatif' && (
                  <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-100">
                    <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg text-slate-600 text-[10px] leading-relaxed">
                      <HelpCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      <p>
                        Siswa akan disajikan 4 pernyataan berangka (1, 2, 3, 4). Sistem Penilaian ANBK di Apps Script secara otomatis menghitung kunci jawaban kombinasi:<br />
                        <strong>A</strong> (1,2,3 benar) | <strong>B</strong> (1,3 benar) | <strong>C</strong> (2,4 benar) | <strong>D</strong> (hanya 4 benar) | <strong>E</strong> (semua benar).
                      </p>
                    </div>
                    <div className="space-y-2">
                      {asoStatements.map((st, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={asoCorrects[idx]}
                            onChange={(e) => {
                              const newCorrects = [...asoCorrects];
                              newCorrects[idx] = e.target.checked;
                              setAsoCorrects(newCorrects);
                            }}
                            className="text-indigo-600"
                          />
                          <input
                            type="text"
                            value={st}
                            onChange={(e) => {
                              const newSts = [...asoStatements];
                              newSts[idx] = e.target.value;
                              setAsoStatements(newSts);
                            }}
                            className="w-full px-2.5 py-1 border border-slate-200 rounded-md text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentQType === 'SebabAkibat' && (
                  <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-100">
                    <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg text-slate-600 text-[10px] leading-relaxed">
                      <HelpCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      <p>
                        Ujian Sebab-Akibat mengevaluasi dua komponen pernyataan. Kunci pilihan akhir dihitung otomatis di backend Apps Script:<br />
                        <strong>A:</strong> Keduanya Benar & saling berhubungan Kausalitas • <strong>B:</strong> Keduanya Benar tapi tidak ada hubungan • <strong>C:</strong> Pernyataan Benar, Alasan Salah • <strong>D:</strong> Pernyataan Salah, Alasan Benar • <strong>E:</strong> Keduanya Salah.
                      </p>
                    </div>
                    
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold mb-1">Pernyataan Pertama (Sebab):</label>
                        <input
                          type="text"
                          value={saStatement}
                          onChange={(e) => setSaStatement(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md"
                        />
                        <label className="flex items-center gap-1.5 mt-1 cursor-pointer font-semibold text-indigo-700">
                          <input
                            type="checkbox"
                            checked={saStatementTrue}
                            onChange={(e) => setSaStatementTrue(e.target.checked)}
                          />
                          Pernyataan ini BENAR secara ilmiah
                        </label>
                      </div>

                      <div>
                        <label className="block font-bold mb-1">Pernyataan Kedua (Alasan):</label>
                        <input
                          type="text"
                          value={saReason}
                          onChange={(e) => setSaReason(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md"
                        />
                        <label className="flex items-center gap-1.5 mt-1 cursor-pointer font-semibold text-indigo-700">
                          <input
                            type="checkbox"
                            checked={saReasonTrue}
                            onChange={(e) => setSaReasonTrue(e.target.checked)}
                          />
                          Alasan ini BENAR secara ilmiah
                        </label>
                      </div>

                      {saStatementTrue && saReasonTrue && (
                        <div>
                          <label className="flex items-center gap-1.5 cursor-pointer font-bold text-emerald-700">
                            <input
                              type="checkbox"
                              checked={saCausality}
                              onChange={(e) => setSaCausality(e.target.checked)}
                            />
                            Kedua pernyataan memiliki hubungan Sebab-Akibat yang logis
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAddQuestionToExam}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition shadow-xs"
                >
                  Tambahkan Soal ini ke {isQuestionBankMode ? 'Bank Soal' : 'Paket Ujian'}
                </button>
              </div>
              
            </div>
            {/* END LEFT COLUMN */}

            {/* RIGHT COLUMN: Nav & Review */}
            <div className="xl:col-span-4 space-y-6 lg:space-y-8">
              <div className="sticky top-0 space-y-6 lg:space-y-8">
                {/* Question Navigation / Progress */}
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-extrabold text-slate-800 text-sm">Progress Rencana Soal</h4>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      {examQuestions.length} / {targetQuestionCount} Terisi
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: Math.max(targetQuestionCount, examQuestions.length) }).map((_, idx) => {
                      const isFilled = idx < examQuestions.length;
                      return (
                        <div 
                          key={idx}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                            isFilled ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border border-slate-300 text-slate-400'
                          }`}
                          title={isFilled ? `Soal #${idx + 1} Terisi` : `Slot Soal #${idx + 1} Kosong`}
                        >
                          {idx + 1}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* QUESTIONS LIST REVIEW */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col" style={{ maxHeight: 'calc(100vh - 350px)' }}>
                  <h4 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase mb-4 shrink-0">
                    Daftar Soal Terbuat ({examQuestions.length} Butir)
                  </h4>
                  
                  <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                    {examQuestions.length === 0 ? (
                      <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center h-full">
                        <Database className="w-10 h-10 text-slate-300 mb-3" />
                        <p className="text-sm font-medium text-slate-500">Belum ada soal dimasukkan.</p>
                        <p className="text-xs text-slate-400 mt-1">Gunakan Editor Butir Soal untuk mengisi.</p>
                      </div>
                    ) : (
                      examQuestions.map((q, idx) => (
                        <div key={q.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-start gap-4 hover:border-indigo-100 transition">
                          <div className="text-xs space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md text-[10px]">
                                Soal #{idx + 1} ({q.type})
                              </span>
                              <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-1 rounded-md text-[10px]">
                                Bobot: {q.score !== undefined ? q.score : 10}
                              </span>
                              {q.mediaType && q.mediaType !== 'None' && (
                                <span className="bg-amber-50 text-amber-700 font-bold px-2 py-1 rounded-md text-[10px] flex items-center gap-1">
                                  {q.mediaType === 'Image' ? '🖼️' : q.mediaType === 'Video' ? '🎥' : '🔊'} {q.mediaType}
                                </span>
                              )}
                            </div>
                            <div className="font-medium text-slate-900 leading-relaxed text-[13px]">
                              {renderFormattedText(q.questionText, q.fontPreset)}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(idx)}
                            className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition"
                            title="Hapus Soal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            </div>
          </div>
        </form>
      </div>
    </div>
  )}

      {/* MODAL PRINT PREVIEW LAPORAN RESMI SEKOLAH */}
      {printModalData.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            {/* Header / Action Bar Modal (Tidak ikutan ter-print) */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between gap-4 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-xl">
                  <Printer className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Pratinjau Dokumen Cetak Laporan KBM</h3>
                  <p className="text-xs text-slate-400">Dokumen siap cetak dalam format resmi sekolah (A4 Landscape)</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setPrintModalData({ isOpen: false, title: '', subtitle: '', entries: [] });
                    setJournalSubTab('settings');
                  }}
                  className="px-3 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  title="Ubah Nama Kepala Sekolah / Kop Surat"
                >
                  <Settings className="w-4 h-4" /> Ubah Kop & Kepsek
                </button>
                <button
                  type="button"
                  onClick={() => generateAndOpenPrintWindow(printModalData.entries, printModalData.title, printModalData.subtitle)}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Buka Jendela Cetak / Simpan PDF
                </button>
                <button
                  type="button"
                  onClick={() => handleExportJournalRecap(printModalData.entries, printModalData.title)}
                  className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" /> Unduh Excel
                </button>
                <button
                  type="button"
                  onClick={() => setPrintModalData({ isOpen: false, title: '', subtitle: '', entries: [] })}
                  className="p-2.5 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white rounded-xl transition cursor-pointer ml-2"
                  title="Tutup Preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Laporan Kertas Resmi (Tampilan Kertas A4) */}
            <div className="p-6 sm:p-10 overflow-y-auto bg-slate-100/60 grow">
              <div className="bg-white max-w-5xl mx-auto p-8 sm:p-12 shadow-md rounded-xl border border-slate-300 text-slate-900">
                {/* Kop Surat Sekolah */}
                <div className="text-center border-b-4 border-double border-slate-900 pb-4 mb-6">
                  <h1 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-900">{schoolIdentity.header1}</h1>
                  <h1 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-800 mt-0.5">{schoolIdentity.header2}</h1>
                  <h2 className="text-xl sm:text-2xl font-black text-indigo-950 uppercase tracking-tight mt-1">{schoolIdentity.schoolName}</h2>
                  <p className="text-xs text-slate-600 font-medium mt-1">{schoolIdentity.address}</p>
                </div>

                {/* Judul Dokumen */}
                <div className="text-center mb-6">
                  <h3 className="text-lg font-black underline uppercase tracking-wide text-slate-900">{printModalData.title}</h3>
                  <p className="text-xs font-bold text-slate-600 mt-1">{printModalData.subtitle}</p>
                </div>

                {/* Info Metadata */}
                <div className="flex flex-col sm:flex-row justify-between gap-2 text-xs font-bold mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-500 font-normal">Nama Guru Mapel:</span> <span className="text-indigo-900 font-extrabold">{currentTeacher.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-normal">Total Sesi Terangkum:</span> <span className="text-emerald-700 font-extrabold">{printModalData.entries.length} Sesi Pertemuan</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-normal">Tanggal Dicetak:</span> <span className="text-slate-800">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Tabel Laporan */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-400 text-xs text-left">
                    <thead>
                      <tr className="bg-slate-200 text-slate-900 uppercase font-extrabold text-[11px] tracking-wider divide-x divide-slate-400">
                        <th className="border border-slate-400 p-2 text-center w-10">No</th>
                        <th className="border border-slate-400 p-2 w-28">Hari & Tanggal</th>
                        <th className="border border-slate-400 p-2 text-center w-20">Jam Ke</th>
                        <th className="border border-slate-400 p-2 w-36">Kelas & Mapel</th>
                        <th className="border border-slate-400 p-2">Topik & Capaian Pembelajaran</th>
                        <th className="border border-slate-400 p-2 text-center w-28">Presensi</th>
                        <th className="border border-slate-400 p-2 w-48">Siswa Tidak Hadir</th>
                        <th className="border border-slate-400 p-2 w-36">Catatan KBM</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {printModalData.entries.map((j, idx) => {
                        const cls = classes.find(c => c.id === j.classId)?.name || j.classId;
                        const subj = subjects.find(s => s.id === j.subjectId)?.name || j.subjectId;
                        const hadir = j.attendance.filter(a => a.status === 'Hadir').length;
                        const { sakitNames, izinNames, alpaNames } = getAbsentStudentDetails(j);
                        const hari = getDayNameIndo(j.date);
                        const jamStr = (j.startPeriod && j.endPeriod) ? `Jam Ke ${j.startPeriod} - ${j.endPeriod}` : '-';

                        return (
                          <tr key={idx} className="hover:bg-slate-50/80 divide-x divide-slate-300 align-top">
                            <td className="border border-slate-300 p-2 text-center font-bold">{idx + 1}</td>
                            <td className="border border-slate-300 p-2 whitespace-nowrap">
                              <span className="font-extrabold text-indigo-900 block">{hari}</span>
                              <span className="text-[11px] text-slate-600">{j.date}</span>
                            </td>
                            <td className="border border-slate-300 p-2 text-center font-bold text-purple-900">{jamStr}</td>
                            <td className="border border-slate-300 p-2">
                              <span className="font-extrabold text-slate-900 block">{cls}</span>
                              <span className="text-[11px] text-slate-600">{subj}</span>
                            </td>
                            <td className="border border-slate-300 p-2">
                              <span className="font-bold text-slate-900 block">{j.topic}</span>
                              {j.learningObjectives && <span className="text-[10px] text-slate-500 block mt-0.5">TP: {j.learningObjectives}</span>}
                            </td>
                            <td className="border border-slate-300 p-2 text-center font-mono font-extrabold text-[11px]">
                              <span className="text-emerald-700">{hadir}H</span> / <span className="text-blue-600">{sakitNames.length}S</span> / <span className="text-amber-600">{izinNames.length}I</span> / <span className="text-red-600">{alpaNames.length}A</span>
                            </td>
                            <td className="border border-slate-300 p-2 text-[11px]">
                              {sakitNames.length === 0 && izinNames.length === 0 && alpaNames.length === 0 ? (
                                <span className="text-emerald-700 font-bold">✅ Semua Hadir (100%)</span>
                              ) : (
                                <div className="space-y-1">
                                  {sakitNames.length > 0 && <div className="text-blue-900"><b>🤒 Sakit ({sakitNames.length}):</b> {sakitNames.join(', ')}</div>}
                                  {izinNames.length > 0 && <div className="text-amber-900"><b>📩 Izin ({izinNames.length}):</b> {izinNames.join(', ')}</div>}
                                  {alpaNames.length > 0 && <div className="text-red-900"><b>❌ Alpa ({alpaNames.length}):</b> {alpaNames.join(', ')}</div>}
                                </div>
                              )}
                            </td>
                            <td className="border border-slate-300 p-2 text-[11px] text-slate-700">
                              {j.notes || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Kolom Tanda Tangan Resmi */}
                <div className="mt-12 grid grid-cols-2 gap-8 text-xs font-medium text-slate-800 page-break-inside-avoid">
                  <div className="text-center">
                    <p>Mengetahui,<br/>Kepala Sekolah</p>
                    <div className="h-20"></div>
                    <p className="font-extrabold underline text-slate-950">{schoolIdentity.principalName}</p>
                    <p className="text-[11px] text-slate-500">NIP. {schoolIdentity.principalNip}</p>
                  </div>
                  <div className="text-center">
                    <p>{schoolIdentity.cityLocation}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>Guru Mapel,</p>
                    <div className="h-20"></div>
                    <p className="font-extrabold underline text-slate-950">{currentTeacher.name}</p>
                    <p className="text-[11px] text-slate-500">NIP. {currentTeacher.nip || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ADD / EDIT SCHEDULE NOTE */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-950 text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                {editingScheduleId ? 'Edit Jadwal & Catatan Kelas' : 'Tambah Jadwal Mengajar Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveScheduleNote} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hari Mengajar *</label>
                  <select
                    value={schedDay}
                    onChange={(e: any) => setSchedDay(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="Senin">Senin</option>
                    <option value="Selasa">Selasa</option>
                    <option value="Rabu">Rabu</option>
                    <option value="Kamis">Kamis</option>
                    <option value="Jum'at">Jum'at</option>
                    <option value="Sabtu">Sabtu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kelas Tujuan *</label>
                  <select
                    required
                    value={schedClass}
                    onChange={(e) => setSchedClass(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                    <option value="Ekstrakurikuler / Lainnya">Ekstrakurikuler / Lainnya</option>
                  </select>
                </div>
              </div>

              {/* Pemilihan Jam Ke Pembelajaran (Bisa Pilih > 3 Jam Tanpa Tampilan Waktu Jam) */}
              <div className="bg-gradient-to-br from-indigo-50/70 to-slate-50 border border-indigo-100/80 rounded-2xl p-4 space-y-3 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <label className="block text-xs font-black text-indigo-950 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-indigo-600" /> Pilih Jam Pembelajaran *
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Klik nomor jam di bawah (opsional bebas pilih, mendukung lebih dari 3 jam tanpa tampilan waktu jam).
                    </p>
                  </div>
                  {selectedJams.length > 0 && (
                    <button
                      type="button"
                      onClick={() => { setSelectedJams([]); setSchedJam(''); }}
                      className="text-[11px] text-rose-600 font-bold hover:underline cursor-pointer shrink-0"
                    >
                      Reset Pilihan
                    </button>
                  )}
                </div>

                {/* Tombol Interaktif Jam 1 - 10 */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                    const isSelected = selectedJams.includes(num);
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleToggleJam(num)}
                        className={`w-9 h-9 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md scale-105 ring-2 ring-indigo-400/50'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300'
                        }`}
                        title={`Jam Ke ${num}`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>

                {/* Preset Rentang Jam Cepat */}
                <div className="pt-2 border-t border-indigo-100/70 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] font-extrabold text-indigo-900 mr-1 uppercase tracking-wider">Preset Cepat:</span>
                  {[
                    { label: 'Jam 1 - 2 (2 Jam)', nums: [1, 2] },
                    { label: 'Jam 1 - 3 (3 Jam)', nums: [1, 2, 3] },
                    { label: 'Jam 1 - 4 (4 Jam)', nums: [1, 2, 3, 4] },
                    { label: 'Jam 3 - 5 (3 Jam)', nums: [3, 4, 5] },
                    { label: 'Jam 4 - 6 (3 Jam)', nums: [4, 5, 6] },
                    { label: 'Jam 6 - 8 (3 Jam)', nums: [6, 7, 8] },
                    { label: 'Jam 1 - 6 (6 Jam)', nums: [1, 2, 3, 4, 5, 6] },
                    { label: 'Full Proyek (8 Jam)', nums: [1, 2, 3, 4, 5, 6, 7, 8] },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSetPresetJams(preset.nums)}
                      className="px-2.5 py-1 bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-600 hover:text-white rounded-lg text-[11px] font-bold text-slate-700 transition cursor-pointer shadow-2xs"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Input Text Hasil Formasi / Manual */}
                <div className="pt-1.5">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Hasil Keterangan Jam (Bisa diedit manual jika perlu):</label>
                  <input
                    type="text"
                    required
                    placeholder="Pilih jam di atas atau ketik manual..."
                    value={schedJam}
                    onChange={(e) => {
                      setSchedJam(e.target.value);
                      setSelectedJams(parseJamsFromText(e.target.value));
                    }}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-indigo-950 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ruangan / Lab</label>
                <input
                  type="text"
                  placeholder="Contoh: Ruang Kelas VII-A / Lab Komputer"
                  value={schedRoom}
                  onChange={(e) => setSchedRoom(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Khusus & Agenda Mengajar di Kelas</label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Materi Bab 3 (Tata Negara), pengumpulan tugas proyek, persiapan Ulangan Harian..."
                  value={schedNote}
                  onChange={(e) => setSchedNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Simpan Jadwal & Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADD ANNOUNCEMENT / NOTIFIKASI */}
      {showAddAnnModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-950 text-base flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" /> Kirim Notifikasi & Catatan Kepada Siswa
              </h3>
              <button
                onClick={() => setShowAddAnnModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">Judul Informasi / Catatan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 📢 Persiapan Ulangan Harian Bab Aljabar / Tugas PR Halaman 45"
                  value={annTitleInput}
                  onChange={(e) => setAnnTitleInput(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700">Sasaran Siswa Penerima</label>
                  <select
                    value={annTargetType}
                    onChange={(e) => setAnnTargetType(e.target.value as 'all' | 'class')}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  >
                    <option value="all">🌐 Seluruh Siswa (Semua Kelas)</option>
                    <option value="class">🎯 Khusus Kelas Tertentu</option>
                  </select>
                </div>

                {annTargetType === 'class' && (
                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-700">Pilih Kelas Sasaran</label>
                    <select
                      value={annTargetClass}
                      onChange={(e) => setAnnTargetClass(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-indigo-700 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">Tingkat Prioritas Notifikasi</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAnnPriority('normal')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      annPriority === 'normal' ? 'bg-blue-50 text-blue-700 border-blue-400' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    ℹ️ Informasi
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnnPriority('penting')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      annPriority === 'penting' ? 'bg-amber-50 text-amber-800 border-amber-400' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    ⭐ Penting
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnnPriority('mendesak')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      annPriority === 'mendesak' ? 'bg-rose-50 text-rose-800 border-rose-400' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    🚨 Mendesak
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">Isi Pesan Catatan / Informasi Untuk Siswa *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tuliskan isi pesan atau arahan yang perlu dibaca dan diketahui oleh siswa saat mereka membuka beranda..."
                  value={annContentInput}
                  onChange={(e) => setAnnContentInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setShowAddAnnModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer font-extrabold"
                >
                  <Send className="w-4 h-4" /> Kirim Sekarang Ke Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HAPUS KONFIRMASI */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-center text-lg">Hapus {itemToDelete.type}?</h3>
            <p className="text-slate-500 text-sm text-center mt-2 leading-relaxed">
              Anda yakin ingin menghapus <strong>"{itemToDelete.name}"</strong>? Data yang sudah dihapus tidak dapat dikembalikan.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (itemToDelete.type === 'Materi' && onDeleteMaterial) onDeleteMaterial(itemToDelete.id);
                  if (itemToDelete.type === 'Ujian' && onDeleteExam) onDeleteExam(itemToDelete.id);
                  if (itemToDelete.type === 'Bank Soal' && onDeleteQuestionBank) onDeleteQuestionBank(itemToDelete.id);
                  setItemToDelete(null);
                }}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition shadow-md shadow-rose-200 cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
