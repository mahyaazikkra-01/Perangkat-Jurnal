import React, { useState, useRef } from 'react';
import { 
  Teacher, Student, ClassItem, SubjectItem, JournalEntry, CheatLog, ExamSubmission, RegistrationRequest, SchoolConfig 
} from '../types';
import { 
  Users, BookOpen, GraduationCap, Calendar, Plus, Trash2, Search, Upload, ShieldAlert, Award, ArrowUpRight, UserCheck, Clock, CheckCircle, XCircle, Edit, Settings, FileSpreadsheet, Download, ArrowRight, KeyRound, MonitorSmartphone, BarChart, TrendingUp
} from 'lucide-react';

interface AdminPanelProps {
  teachers: Teacher[];
  students: Student[];
  classes: ClassItem[];
  subjects: SubjectItem[];
  journals: JournalEntry[];
  cheatLogs: CheatLog[];
  submissions: ExamSubmission[];
  registrations?: RegistrationRequest[];
  schoolConfig?: SchoolConfig;
  onUpdateSchoolConfig?: (config: SchoolConfig) => void;
  onAddTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  onDeleteTeacher: (id: string) => void;
  onAddSubject?: (subjectName: string) => void;
  onDeleteSubject?: (id: string) => void;
  onUpdateSubject?: (subject: SubjectItem) => void;
  onAddClass?: (className: string) => void;
  onDeleteClass?: (id: string) => void;
  onUpdateClass?: (cls: ClassItem) => void;
  onAddStudent?: (student: Omit<Student, 'id'>) => void;
  onDeleteStudent?: (id: string) => void;
  onUpdateTeacher?: (teacher: Teacher) => void;
  onUpdateStudent?: (student: Student) => void;
  onBulkAddStudents?: (students: Omit<Student, 'id'>[]) => void;
  onApproveRegistration?: (id: string) => void;
  onRejectRegistration?: (id: string) => void;
}

export default function AdminPanel({
  teachers,
  students,
  classes,
  subjects,
  journals,
  cheatLogs,
  submissions,
  registrations = [],
  schoolConfig,
  onUpdateSchoolConfig,
  onAddTeacher,
  onDeleteTeacher,
  onAddSubject,
  onDeleteSubject,
  onUpdateSubject,
  onAddClass,
  onDeleteClass,
  onUpdateClass,
  onAddStudent,
  onDeleteStudent,
  onUpdateTeacher,
  onUpdateStudent,
  onBulkAddStudents,
  onApproveRegistration,
  onRejectRegistration
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'teachers' | 'students' | 'journals' | 'cheatlogs' | 'classes' | 'registrations' | 'config' | 'archived_students'>('dashboard');
  const pendingCount = registrations.filter(r => r.status === 'Pending').length;
  
  // State for config editing
  const [localConfig, setLocalConfig] = useState<SchoolConfig>(schoolConfig || {
    logoUrl: '',
    headerAppName: 'E-LEARNING & JURNAL',
    headerSubtitle: 'SMPN 1 BEJI, Kab. Pasuruan',
    landingTopTag: 'Jurnal Mengajar dan E-Learning',
    landingTitle: 'Sistem Manajemen Mengajar & E-Learning SMPN 1 BEJI',
    landingDescription: 'Aplikasi Komprehensif untuk membantu Guru dan Siswa dalam Pembelajaran dan Materi serta Ujian/Tugas & Evaluasi.',
    footerText: '© 2026 E-Learning/E-Jurnal SMPN 1 BEJI, Kab. Pasuruan.'
  });

  // State for adding/editing teacher
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditTeacherModal, setShowEditTeacherModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    nip: '',
    email: '',
    subject: '',
    photoUrl: ''
  });
  const [showSubjectInput, setShowSubjectInput] = useState(false);
  const [customSubject, setCustomSubject] = useState('');
  const [searchTeacher, setSearchTeacher] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for adding/editing student
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState({
    name: '',
    nis: '',
    email: '',
    classId: ''
  });

  // States for student Excel/CSV Import and Bulk Promote
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importPreview, setImportPreview] = useState<Array<{ name: string; nis: string; email: string; classId: string; className: string }>>([]);
  const [showBulkPromoteModal, setShowBulkPromoteModal] = useState(false);
  const [promoteFromClassId, setPromoteFromClassId] = useState('');
  const [promoteToClassId, setPromoteToClassId] = useState('');

  // States for teacher Excel/CSV Import
  const [showTeacherImportModal, setShowTeacherImportModal] = useState(false);
  const [teacherImportText, setTeacherImportText] = useState('');
  const [teacherImportPreview, setTeacherImportPreview] = useState<Array<{ name: string; nip: string; email: string; subject: string }>>([]);

  // States for inline editing Class and Subject
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [editingClassName, setEditingClassName] = useState('');
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);
  const [editingSubjectName, setEditingSubjectName] = useState('');

  // States for Reset Password Modal
  const [showResetPassModal, setShowResetPassModal] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState<{ id: string; name: string; identifier: string; role: 'Teacher' | 'Student'; currentPass: string; rawObject: Teacher | Student } | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Nama Lengkap,NIS,Email,Kelas\nBudi Santoso,10260,budi@smp.sch.id,VII-A\nSiti Aminah,10261,siti@smp.sch.id,VII-B\nDimas Anggara,10262,dimas@smp.sch.id,VIII-A";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "template_import_siswa.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleParseImport = (textToParse: string) => {
    const lines = textToParse.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) {
      setImportPreview([]);
      return;
    }
    const startIndex = lines[0].toLowerCase().includes('nama') || lines[0].toLowerCase().includes('nis') ? 1 : 0;
    const result: Array<{ name: string; nis: string; email: string; classId: string; className: string }> = [];

    for (let i = startIndex; i < lines.length; i++) {
      const parts = lines[i].split(/[,;\t]/).map(p => p.trim());
      if (parts.length >= 2) {
        const name = parts[0] || `Siswa Baru ${i}`;
        const nis = parts[1] || `${Math.floor(10000 + Math.random() * 90000)}`;
        const email = parts[2] || `${nis}@smp.sch.id`;
        const classNameInput = parts[3] || (classes[0]?.name || 'VII-A');

        const matchedClass = classes.find(c => c.name.toLowerCase() === classNameInput.toLowerCase()) || classes[0];
        const classId = matchedClass ? matchedClass.id : 'class-1';
        const className = matchedClass ? matchedClass.name : classNameInput;

        result.push({ name, nis, email, classId, className });
      }
    }
    setImportPreview(result);
  };

  const handleFileUploadImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setImportText(text);
        handleParseImport(text);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadTeacherTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Nama Lengkap,NIP,Email,Mata Pelajaran\nDrs. H. Ahmad Fauzi M.Pd,197501012000121001,ahmad.fauzi@smp.sch.id,\"Matematika, IPA\"\nSiti Nurhaliza S.Pd,198203152008012003,siti.nurhaliza@smp.sch.id,Bahasa Indonesia\nBudi Gunawan M.Kom,198807122015041002,budi.g@smp.sch.id,Informatika";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "template_import_guru.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleParseTeacherImport = (textToParse: string) => {
    const lines = textToParse.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) {
      setTeacherImportPreview([]);
      return;
    }
    const startIndex = lines[0].toLowerCase().includes('nama') || lines[0].toLowerCase().includes('nip') ? 1 : 0;
    const result: Array<{ name: string; nip: string; email: string; subject: string }> = [];

    for (let i = startIndex; i < lines.length; i++) {
      let line = lines[i];
      let parts: string[] = [];
      
      if (line.includes('\t')) {
        parts = line.split('\t').map(p => p.trim().replace(/^"|"$/g, ''));
      } else if (line.includes(';')) {
        parts = line.split(';').map(p => p.trim().replace(/^"|"$/g, ''));
      } else {
        const regex = /(?:^|,)(?:"([^"]*)"|([^",]*))/g;
        let match;
        while ((match = regex.exec(line)) !== null) {
          if (match.index === regex.lastIndex) regex.lastIndex++;
          parts.push((match[1] ?? match[2] ?? '').trim());
        }
      }

      if (parts.length >= 2) {
        const name = parts[0] || `Guru Baru ${i}`;
        const nip = parts[1] || `198${Math.floor(10000000 + Math.random() * 90000000)}`;
        const email = parts[2] || `${nip}@smp.sch.id`;
        const subject = parts[3] || (subjects[0]?.name || 'Matematika');

        result.push({ name, nip, email, subject });
      }
    }
    setTeacherImportPreview(result);
  };

  const handleFileUploadTeacherImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setTeacherImportText(text);
        handleParseTeacherImport(text);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmTeacherImport = () => {
    if (teacherImportPreview.length === 0) return;
    
    teacherImportPreview.forEach(item => {
      if (onAddSubject && item.subject) {
        item.subject.split(',').forEach(s => {
          const trimmed = s.trim();
          if (trimmed && !subjects.some(sub => sub.name.toLowerCase() === trimmed.toLowerCase())) {
            onAddSubject(trimmed);
          }
        });
      }

      onAddTeacher({
        name: item.name,
        nip: item.nip,
        email: item.email || `${item.nip}@smp.sch.id`,
        subject: item.subject || 'Umum',
        photoUrl: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 1000)}-d1d0cf377fde?w=150&auto=format&fit=crop`
      });
    });

    alert(`Berhasil mengimport ${teacherImportPreview.length} data Guru beserta mata pelajarannya!`);
    setShowTeacherImportModal(false);
    setTeacherImportText('');
    setTeacherImportPreview([]);
  };

  // Simulated Google Drive File Upload
  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    // Simulate latency of DriveApp.createFile()
    setTimeout(() => {
      const simulatedDriveUrl = `https://drive.google.com/file/d/simulated_drive_${Math.random().toString(36).substring(7)}/view`;
      setNewTeacher(prev => ({ ...prev, photoUrl: simulatedDriveUrl }));
      setUploading(false);
    }, 1200);
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacher.name || !newTeacher.nip || !newTeacher.subject) return;

    onAddTeacher({
      name: newTeacher.name,
      nip: newTeacher.nip,
      email: newTeacher.email || `${newTeacher.nip}@smp.sch.id`,
      subject: newTeacher.subject,
      photoUrl: newTeacher.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop'
    });

    // Reset Form
    setNewTeacher({
      name: '',
      nip: '',
      email: '',
      subject: '',
      photoUrl: ''
    });
    setCustomSubject('');
    setShowSubjectInput(false);
    setShowAddModal(false);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.nis || !newStudent.classId) return;

    if (onAddStudent) {
      onAddStudent({
        name: newStudent.name,
        nis: newStudent.nis,
        email: newStudent.email || `${newStudent.nis}@smp.sch.id`,
        classId: newStudent.classId
      });
    }

    // Reset Form
    setNewStudent({
      name: '',
      nis: '',
      email: '',
      classId: ''
    });
    setShowAddStudentModal(false);
  };

  // Helper resolvers
  const getClassName = (classId: string) => classes.find(c => c.id === classId)?.name || 'N/A';
  const getSubjectName = (subjectId: string) => subjects.find(s => s.id === subjectId)?.name || 'N/A';
  const getTeacherName = (teacherId: string) => teachers.find(t => t.id === teacherId)?.name || 'N/A';
  const getStudentName = (studentId: string) => students.find(s => s.id === studentId)?.name || studentId;

  // Filters
  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTeacher.toLowerCase()) || 
    t.nip.includes(searchTeacher) ||
    t.subject.toLowerCase().includes(searchTeacher.toLowerCase())
  );

  const activeStudents = students.filter(s => !s.status || s.status === 'Aktif');
  const archivedStudents = students.filter(s => s.status === 'Lulus' || s.status === 'Pindah');

  const filteredStudents = activeStudents.filter(s => 
    s.name.toLowerCase().includes(searchStudent.toLowerCase()) || 
    s.nis.includes(searchStudent) ||
    getClassName(s.classId).toLowerCase().includes(searchStudent.toLowerCase())
  );

  const filteredArchivedStudents = archivedStudents.filter(s => 
    s.name.toLowerCase().includes(searchStudent.toLowerCase()) || 
    s.nis.includes(searchStudent)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto" id="admin-panel-container">
      {/* Navigation Sub-Header */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 bg-white px-6 py-2 rounded-2xl shadow-xs">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          📊 Ringkasan Dasbor
        </button>
        <button
          onClick={() => setActiveTab('registrations')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'registrations'
              ? 'bg-emerald-50 text-emerald-700'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          📋 Persetujuan Akun
          {pendingCount > 0 && (
            <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('teachers')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'teachers'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          🧑‍🏫 Data Guru Pengajar
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'students'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          🎓 Data Siswa Terdaftar
        </button>
        <button
          onClick={() => setActiveTab('archived_students')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'archived_students'
              ? 'bg-slate-100 text-slate-800'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          📁 Data Alumni / Keluar
        </button>
        <button
          onClick={() => setActiveTab('journals')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'journals'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          📝 Riwayat Jurnal Mengajar
        </button>
        <button
          onClick={() => setActiveTab('classes')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'classes'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          🏫 Manajemen Kelas & Mapel
        </button>
        <button
          onClick={() => setActiveTab('cheatlogs')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'cheatlogs'
              ? 'bg-red-50 text-red-700'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          🛡️ Deteksi Anti-Contek
          {cheatLogs.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
              {cheatLogs.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'config'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <MonitorSmartphone className="w-4 h-4" />
          Pengaturan Tampilan
        </button>
      </div>

      {/* CONFIG TAB */}
      {activeTab === 'config' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
              <MonitorSmartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Pengaturan Tampilan Web</h2>
              <p className="text-sm text-slate-500 font-medium mt-0.5">Ubah logo sekolah, judul, dan deskripsi halaman beranda</p>
            </div>
          </div>
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (onUpdateSchoolConfig) {
                onUpdateSchoolConfig(localConfig);
                alert('Berhasil menyimpan pengaturan tampilan halaman depan!');
              }
            }}
            className="space-y-5 max-w-3xl"
          >
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Bagian Header Atas
              </h3>
              
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700">URL Logo Sekolah (opsional)</label>
                <input
                  type="text"
                  placeholder="https://contoh.com/logo.png"
                  value={localConfig.logoUrl}
                  onChange={(e) => setLocalConfig({...localConfig, logoUrl: e.target.value})}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                <p className="text-[10px] text-slate-500 mt-1">Biarkan kosong untuk menggunakan logo inisial huruf default.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Nama Aplikasi Utama</label>
                  <input
                    type="text"
                    required
                    value={localConfig.headerAppName}
                    onChange={(e) => setLocalConfig({...localConfig, headerAppName: e.target.value})}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Sub-judul / Nama Sekolah</label>
                  <input
                    type="text"
                    required
                    value={localConfig.headerSubtitle}
                    onChange={(e) => setLocalConfig({...localConfig, headerSubtitle: e.target.value})}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div> Teks Halaman Beranda (Landing Page)
              </h3>
              
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700">Tagline Top (Kecil)</label>
                <input
                  type="text"
                  required
                  value={localConfig.landingTopTag}
                  onChange={(e) => setLocalConfig({...localConfig, landingTopTag: e.target.value})}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700">Judul Besar Landing Page</label>
                <textarea
                  rows={2}
                  required
                  value={localConfig.landingTitle}
                  onChange={(e) => setLocalConfig({...localConfig, landingTitle: e.target.value})}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-bold"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700">Deskripsi Singkat</label>
                <textarea
                  rows={3}
                  required
                  value={localConfig.landingDescription}
                  onChange={(e) => setLocalConfig({...localConfig, landingDescription: e.target.value})}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Bagian Footer Bawah
              </h3>
              
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700">Teks Copyright Footer</label>
                <input
                  type="text"
                  required
                  value={localConfig.footerText}
                  onChange={(e) => setLocalConfig({...localConfig, footerText: e.target.value})}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-xs hover:bg-indigo-700 transition cursor-pointer flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Simpan Perubahan Tampilan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {pendingCount > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-emerald-950 text-sm">Ada {pendingCount} Permohonan Pendaftaran Akun Baru</h4>
                  <p className="text-emerald-800 text-xs mt-0.5">Guru dan siswa yang baru mendaftar menunggu persetujuan Anda untuk dapat mengakses portal.</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('registrations')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer shadow-xs whitespace-nowrap"
              >
                Tinjau & Setujui Akun ({pendingCount})
              </button>
            </div>
          )}

          {/* STATS BENTO GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Siswa</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{students.length}</h3>
                <span className="text-[10px] text-emerald-600 font-medium mt-1 inline-flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> Terdistribusi di {classes.length} Kelas
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Guru Pengajar</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{teachers.length}</h3>
                <span className="text-[10px] text-emerald-600 font-medium mt-1 inline-flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> Integrasi Drive Aktif
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mata Pelajaran</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{subjects.length}</h3>
                <span className="text-[10px] text-slate-500 font-medium mt-1 inline-flex items-center gap-0.5">
                  Kurikulum Merdeka SMP
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Jurnal Mengajar</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{journals.length}</h3>
                <span className="text-[10px] text-indigo-600 font-medium mt-1 inline-flex items-center gap-0.5">
                  Real-time Spreadsheet Log
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* PANTAUAN AKTIVITAS TERKINI */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-5">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Pantauan Aktivitas Terkini</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Log pendaftaran, ujian, dan jurnal mengajar terbaru</p>
                </div>
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[360px] custom-scrollbar">
                {(() => {
                  const recentActivities = [
                    ...journals.map(j => ({
                      id: `j-${j.id}`,
                      type: 'journal',
                      date: j.date,
                      timestamp: new Date(j.date).getTime() || Date.now(),
                      title: 'Jurnal Mengajar',
                      desc: `${getTeacherName(j.teacherId)} mengajar ${getSubjectName(j.subjectId)} di Kelas ${getClassName(j.classId)}`,
                      icon: <BookOpen className="w-4 h-4 text-emerald-600" />,
                      bg: 'bg-emerald-100',
                      badge: 'Jurnal'
                    })),
                    ...submissions.map(s => ({
                      id: `s-${s.id}`,
                      type: 'exam',
                      date: s.submittedAt,
                      timestamp: new Date(s.submittedAt).getTime() || Date.now(),
                      title: 'Ujian Diselesaikan',
                      desc: `${s.studentName} menyelesaikan ujian dengan nilai ${s.score}`,
                      icon: <Award className="w-4 h-4 text-purple-600" />,
                      bg: 'bg-purple-100',
                      badge: 'Ujian'
                    })),
                    ...registrations.filter(r => r.status === 'Pending').map(r => ({
                      id: `r-${r.id}`,
                      type: 'registration',
                      date: r.createdAt,
                      timestamp: new Date(r.createdAt).getTime() || Date.now(),
                      title: 'Pendaftaran Masuk',
                      desc: `${r.name} mendaftar sebagai ${r.role === 'Teacher' ? 'Pengajar' : 'Siswa'} (Menunggu Persetujuan)`,
                      icon: <UserCheck className="w-4 h-4 text-amber-600" />,
                      bg: 'bg-amber-100',
                      badge: 'Daftar'
                    }))
                  ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

                  if (recentActivities.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center h-full py-10 opacity-60">
                        <Clock className="w-10 h-10 text-slate-300 mb-3" />
                        <p className="text-center text-xs text-slate-400 font-medium">Belum ada aktivitas terekam di sistem.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="relative before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-slate-200">
                      {recentActivities.map((activity, index) => (
                        <div key={activity.id} className="relative pl-8 pb-5 last:pb-0 group">
                          {/* Timeline Dot */}
                          <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-xs z-10 ${activity.bg} group-hover:scale-110 transition-transform`}>
                            {activity.icon}
                          </div>

                          <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl hover:bg-white hover:border-indigo-200 transition-all shadow-xs group-hover:shadow-md">
                            <div className="flex justify-between items-start mb-1.5 gap-2">
                              <h4 className="font-bold text-slate-800 text-sm leading-tight">{activity.title}</h4>
                              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${activity.bg.replace('100', '200')} text-slate-700`}>
                                {activity.badge}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed">{activity.desc}</p>
                            <p className="text-[10px] text-slate-400 mt-2 font-mono flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {activity.date}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* CBT EXAM LOGS & LEADERBOARD */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-1.5 text-slate-900">
                    <Award className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-base">Hasil Ujian Terkini</h3>
                  </div>
                </div>

                {submissions.length === 0 ? (
                  <p className="text-center py-8 text-xs text-slate-400">Belum ada siswa mengumpulkan ujian.</p>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {submissions.map((sub) => (
                      <div key={sub.id} className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition flex items-center justify-between">
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 text-xs truncate">{sub.studentName}</h4>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            {sub.examTitle} ({sub.className})
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <span className={`text-sm font-extrabold px-2.5 py-1 rounded-lg ${
                            sub.score >= 75 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {sub.score}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cheatLogs.length > 0 && (
                <div 
                  onClick={() => setActiveTab('cheatlogs')}
                  className="mt-4 p-3.5 bg-red-50 rounded-xl border border-red-100 cursor-pointer hover:bg-red-100/50 transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 text-red-700">
                    <ShieldAlert className="w-5 h-5 animate-bounce" />
                    <div className="text-left">
                      <p className="text-xs font-bold">Terdeteksi Pelanggaran</p>
                      <p className="text-[10px] text-red-500 font-medium">Ada {cheatLogs.length} siswa terpantau keluar tab ujian!</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-red-600 bg-white shadow-xs px-2 py-0.5 rounded">
                    Lihat
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TEACHERS MANAGEMENT TAB */}
      {activeTab === 'teachers' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Manajemen Guru Pengajar</h3>
              <p className="text-slate-500 text-xs">Kelola berkas biodata, mata pelajaran, dan URL foto profil Google Drive guru.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setTeacherImportText('');
                  setTeacherImportPreview([]);
                  setShowTeacherImportModal(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Import Excel / CSV</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" /> Tambah Guru Baru
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari guru berdasarkan Nama, NIP, atau Mata Pelajaran..."
              value={searchTeacher}
              onChange={(e) => setSearchTeacher(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Teachers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeachers.map((teacher) => (
              <div key={teacher.id} className="border border-slate-100 rounded-2xl p-5 hover:shadow-md hover:border-slate-200 transition bg-slate-50/50 flex flex-col justify-between space-y-4">
                <div className="flex gap-4">
                  <img
                    src={teacher.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop'}
                    alt={teacher.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{teacher.name}</h4>
                    <p className="text-slate-400 text-xs font-mono mt-0.5">NIP: {teacher.nip}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {teacher.subject.split(',').map((subj, sIdx) => (
                        <span key={sIdx} className="inline-block bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-100">
                          {subj.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                  <div className="min-w-0">
                    <p className="text-slate-400">Email Utama</p>
                    <p className="text-slate-600 font-medium truncate mt-0.5">{teacher.email}</p>
                  </div>
                  <div className="flex items-center gap-1.5 ml-2">
                    <button
                      onClick={() => {
                        setResetTargetUser({
                          id: teacher.id,
                          name: teacher.name,
                          identifier: teacher.nip,
                          role: 'Teacher',
                          currentPass: teacher.password || 'guru123',
                          rawObject: teacher
                        });
                        setNewPasswordValue(teacher.password || 'guru123');
                        setShowResetPassModal(true);
                      }}
                      className="text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 text-[11px] font-bold whitespace-nowrap shadow-2xs"
                      title="Reset / Ubah Password Login Guru"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Password</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingTeacher(teacher);
                        setShowEditTeacherModal(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 text-[11px] font-bold whitespace-nowrap shadow-2xs"
                      title="Atur Mapel & Profil Guru"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Atur Mapel</span>
                    </button>
                    <button
                      onClick={() => onDeleteTeacher(teacher.id)}
                      className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      title="Hapus Guru"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredTeachers.length === 0 && (
              <div className="col-span-full text-center py-12 border border-dashed border-slate-200 rounded-2xl">
                <p className="text-slate-400 text-xs">Tidak ada guru pengajar yang cocok dengan pencarian Anda.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STUDENTS TAB */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Data Siswa Terdaftar</h3>
              <p className="text-slate-500 text-xs">Database siswa terintegrasi. NIS digunakan sebagai kredensial login default siswa.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setImportText('');
                  setImportPreview([]);
                  setShowImportModal(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Import Excel / CSV</span>
              </button>
              <button
                onClick={() => {
                  setPromoteFromClassId(classes[0]?.id || '');
                  setPromoteToClassId(classes[1]?.id || 'LULUS');
                  setShowBulkPromoteModal(true);
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Naik Kelas / Lulus Masal</span>
              </button>
              <button
                onClick={() => setShowAddStudentModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Siswa</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari siswa berdasarkan Nama, NIS, atau Kelas..."
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Table list */}
          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 font-semibold text-slate-500">Nama Lengkap</th>
                  <th className="px-6 py-3 font-semibold text-slate-500">NIS (Password)</th>
                  <th className="px-6 py-3 font-semibold text-slate-500">Email</th>
                  <th className="px-6 py-3 font-semibold text-slate-500">Kelas</th>
                  <th className="px-6 py-3 font-semibold text-slate-500 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredStudents.map((siswa) => (
                  <tr key={siswa.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-3 font-bold text-slate-900">{siswa.name}</td>
                    <td className="px-6 py-3 font-mono font-semibold text-slate-600">{siswa.nis}</td>
                    <td className="px-6 py-3 text-slate-500">{siswa.email}</td>
                    <td className="px-6 py-3">
                      <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-0.5 rounded">
                        {getClassName(siswa.classId)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setResetTargetUser({
                              id: siswa.id,
                              name: siswa.name,
                              identifier: siswa.nis,
                              role: 'Student',
                              currentPass: siswa.password || siswa.email || siswa.nis,
                              rawObject: siswa
                            });
                            setNewPasswordValue(siswa.password || siswa.email || siswa.nis);
                            setShowResetPassModal(true);
                          }}
                          className="text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 font-bold text-[11px]"
                          title="Reset / Ubah Password Login Siswa"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Password</span>
                        </button>
                        <button
                          onClick={() => {
                            setEditingStudent(siswa);
                            setShowEditStudentModal(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 font-bold text-[11px]"
                          title="Edit Data Siswa / Naik Kelas"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        {onDeleteStudent && (
                          <button
                            onClick={() => onDeleteStudent(siswa.id)}
                            className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded transition cursor-pointer"
                            title="Hapus Siswa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      Tidak ada siswa yang cocok dengan pencarian Anda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ARCHIVED STUDENTS TAB */}
      {activeTab === 'archived_students' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Data Alumni & Siswa Pindah / Keluar</h3>
              <p className="text-slate-500 text-xs">Arsip backup data siswa yang telah lulus atau pindah. Anda dapat mengunduh data ini (Spreadsheet / CSV) sebagai rekam jejak untuk dicadangkan di Google Drive Anda.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const headers = ['ID', 'Nama Lengkap', 'NIS', 'Email', 'Status', 'Riwayat Kelas Terakhir'];
                  const csvRows = [headers.join(',')];
                  filteredArchivedStudents.forEach(s => {
                    const row = [
                      s.id,
                      `"${s.name}"`,
                      s.nis,
                      s.email || '',
                      s.status || '',
                      `"${getClassName(s.classId)}"`
                    ];
                    csvRows.push(row.join(','));
                  });
                  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'Backup_Siswa_Keluar_Lulus.csv';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Download CSV ke Perangkat Anda. Dapat diimport langsung ke Google Spreadsheet untuk Backup."
              >
                <Download className="w-4 h-4" />
                <span>Export to CSV (Spreadsheet)</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari siswa berdasarkan Nama atau NIS..."
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 font-semibold text-slate-500">Nama Lengkap</th>
                  <th className="px-6 py-3 font-semibold text-slate-500">NIS</th>
                  <th className="px-6 py-3 font-semibold text-slate-500">Riwayat Kelas</th>
                  <th className="px-6 py-3 font-semibold text-slate-500">Status</th>
                  <th className="px-6 py-3 font-semibold text-slate-500 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredArchivedStudents.map((siswa) => (
                  <tr key={siswa.id} className="hover:bg-slate-50 transition opacity-80">
                    <td className="px-6 py-3 font-bold text-slate-900">{siswa.name}</td>
                    <td className="px-6 py-3 font-mono font-semibold text-slate-600">{siswa.nis}</td>
                    <td className="px-6 py-3">
                      <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-0.5 rounded">
                        {getClassName(siswa.classId)}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`font-bold px-2.5 py-0.5 rounded ${siswa.status === 'Lulus' ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'}`}>
                        {siswa.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingStudent(siswa);
                            setShowEditStudentModal(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 font-bold text-[11px]"
                          title="Kembalikan Status Aktif"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        {onDeleteStudent && (
                          <button
                            onClick={() => {
                              onDeleteStudent(siswa.id);
                            }}
                            className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded transition cursor-pointer"
                            title="Hapus Permanen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredArchivedStudents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      Tidak ada riwayat siswa keluar atau lulus yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* JOURNALS TAB */}
      {activeTab === 'journals' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Riwayat Jurnal Mengajar Guru</h3>
            <p className="text-slate-500 text-xs">Arsip log KBM guru pengajar beserta presensi kehadiran siswa yang tersimpan di Google Sheets.</p>
          </div>

          {journals.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl">
              <p className="text-slate-400 text-xs">Belum ada jurnal pengajaran yang tersimpan.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {journals.map((entry) => {
                const presentList = entry.attendance.filter(a => a.status === 'Hadir');
                const sakitList = entry.attendance.filter(a => a.status === 'Sakit');
                const izinList = entry.attendance.filter(a => a.status === 'Izin');
                const alpaList = entry.attendance.filter(a => a.status === 'Alpa');

                return (
                  <div key={entry.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                            Kelas {getClassName(entry.classId)}
                          </span>
                          <span className="bg-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded">
                            {getSubjectName(entry.subjectId)}
                          </span>
                          {entry.startPeriod && entry.endPeriod && (
                            <span className="bg-purple-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow-2xs">
                              Jam Ke {entry.startPeriod} - {entry.endPeriod}
                            </span>
                          )}
                          <span className="text-xs text-slate-400 font-mono">{entry.date}</span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-base">{entry.topic}</h4>
                        <p className="text-xs text-slate-500">
                          Pengajar: <strong className="text-slate-700">{getTeacherName(entry.teacherId)}</strong>
                        </p>
                      </div>

                      <div className="text-left sm:text-right flex-shrink-0">
                        <span className="text-xs text-slate-400 block">Rasio Kehadiran</span>
                        <span className="text-lg font-black text-indigo-700">
                          {presentList.length} <span className="text-xs font-normal text-slate-500">/ {entry.attendance.length} Hadir</span>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-3">
                        {entry.learningObjectives && (
                          <div className="space-y-1">
                            <p className="font-bold text-slate-700">🎯 Tujuan Pembelajaran (TP):</p>
                            <p className="text-indigo-950 font-semibold leading-relaxed bg-indigo-50/40 p-3 rounded-lg border border-indigo-100/40">
                              {entry.learningObjectives}
                            </p>
                          </div>
                        )}
                        <div className="space-y-1">
                          <p className="font-bold text-slate-700">📝 Catatan KBM:</p>
                          <p className="text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-100">
                            {entry.notes || 'Tidak ada catatan khusus.'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="font-bold text-slate-700">Rincian Presensi Kelas:</p>
                        <div className="grid grid-cols-4 gap-2 text-center font-bold">
                          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                            <span className="block text-[10px] text-slate-400 font-medium">Hadir</span>
                            <span className="text-base">{presentList.length}</span>
                          </div>
                          <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                            <span className="block text-[10px] text-slate-400 font-medium">Sakit</span>
                            <span className="text-base">{sakitList.length}</span>
                          </div>
                          <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
                            <span className="block text-[10px] text-slate-400 font-medium">Izin</span>
                            <span className="text-base">{izinList.length}</span>
                          </div>
                          <div className="p-2 bg-red-50 text-red-700 rounded-lg">
                            <span className="block text-[10px] text-slate-400 font-medium">Alpa</span>
                            <span className="text-base">{alpaList.length}</span>
                          </div>
                        </div>

                        {/* Catatan Nama Siswa Tidak Hadir */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5">
                          {sakitList.length === 0 && izinList.length === 0 && alpaList.length === 0 ? (
                            <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg font-bold border border-emerald-200 text-center">
                              ✅ Seluruh siswa hadir dalam sesi ini (100%).
                            </p>
                          ) : (
                            <div className="space-y-1.5 text-xs">
                              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Daftar Siswa Tidak Hadir:</p>
                              {sakitList.length > 0 && (
                                <div className="p-2 bg-blue-50 border border-blue-200 text-blue-950 rounded-lg shadow-2xs leading-relaxed">
                                  <span className="font-extrabold text-blue-700">🤒 Sakit ({sakitList.length}): </span>
                                  <span className="font-semibold">{sakitList.map(a => getStudentName(a.studentId)).join(', ')}</span>
                                </div>
                              )}
                              {izinList.length > 0 && (
                                <div className="p-2 bg-amber-50 border border-amber-200 text-amber-950 rounded-lg shadow-2xs leading-relaxed">
                                  <span className="font-extrabold text-amber-700">📩 Izin ({izinList.length}): </span>
                                  <span className="font-semibold">{izinList.map(a => getStudentName(a.studentId)).join(', ')}</span>
                                </div>
                              )}
                              {alpaList.length > 0 && (
                                <div className="p-2 bg-red-50 border border-red-200 text-red-950 rounded-lg shadow-2xs leading-relaxed">
                                  <span className="font-extrabold text-red-700">❌ Alpa ({alpaList.length}): </span>
                                  <span className="font-semibold">{alpaList.map(a => getStudentName(a.studentId)).join(', ')}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CHEATLOGS TAB */}
      {activeTab === 'cheatlogs' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              Sistem Deteksi Pelanggaran CBT ANBK
            </h3>
            <p className="text-slate-500 text-xs">
              Memonitor secara real-time kejadian siswa keluar tab browser (event window blur) ketika ujian CBT simulator sedang berlangsung.
            </p>
          </div>

          {cheatLogs.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl">
              <p className="text-slate-400 text-xs">Belum terdeteksi adanya pelanggaran tab browser. Siswa berintegritas tinggi!</p>
            </div>
          ) : (
            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                <thead className="bg-red-50/50">
                  <tr>
                    <th className="px-6 py-3 font-bold text-red-900">Nama Siswa</th>
                    <th className="px-6 py-3 font-bold text-red-900">NIS</th>
                    <th className="px-6 py-3 font-bold text-red-900">Kelas</th>
                    <th className="px-6 py-3 font-bold text-red-900">Paket Ujian</th>
                    <th className="px-6 py-3 font-bold text-red-900">Waktu Pelanggaran</th>
                    <th className="px-6 py-3 font-bold text-red-900">Deskripsi Pelanggaran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {cheatLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-red-50/20 transition">
                      <td className="px-6 py-3 font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                        {log.studentName}
                      </td>
                      <td className="px-6 py-3 font-mono text-slate-600">{log.studentNis}</td>
                      <td className="px-6 py-3 font-semibold text-slate-700">{log.className}</td>
                      <td className="px-6 py-3 font-medium text-indigo-700">{log.examTitle}</td>
                      <td className="px-6 py-3 text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString('id-ID')}
                      </td>
                      <td className="px-6 py-3 text-red-600 font-semibold">{log.violationType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CLASSES & SUBJECTS TAB */}
      {activeTab === 'classes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {/* CLASS MANAGEMENT */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                🏫 Manajemen Kelas
              </h3>
              <p className="text-slate-500 text-xs">
                Tambah dan kelola kelas-kelas di sekolah. Kelas baru akan langsung tersedia untuk guru dan siswa.
              </p>
            </div>

            {/* Inline add form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const input = form.elements.namedItem('classNameInput') as HTMLInputElement;
                const val = input.value.trim();
                if (val && onAddClass) {
                  onAddClass(val);
                  input.value = '';
                }
              }}
              className="flex gap-2"
            >
              <input
                name="classNameInput"
                type="text"
                required
                placeholder="Misal: IX-D, VIII-A..."
                className="flex-grow px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Kelas</span>
              </button>
            </form>

            {/* Classes list */}
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {classes.map((cls) => {
                const studentCount = students.filter(s => s.classId === cls.id).length;
                const isEditing = editingClass?.id === cls.id;

                return (
                  <div key={cls.id} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/50 transition">
                    {isEditing ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (editingClassName.trim() && onUpdateClass) {
                            onUpdateClass({ ...cls, name: editingClassName.trim() });
                          }
                          setEditingClass(null);
                        }}
                        className="flex items-center justify-between w-full gap-2"
                      >
                        <input
                          type="text"
                          value={editingClassName}
                          onChange={(e) => setEditingClassName(e.target.value)}
                          className="flex-grow px-3 py-1.5 border border-indigo-300 rounded-lg text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                          autoFocus
                        />
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            title="Simpan Perubahan"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Simpan
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingClass(null)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                            title="Batal"
                          >
                            Batal
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <span className="font-bold text-slate-900">{cls.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="bg-indigo-50 text-indigo-700 font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                            {studentCount} Siswa
                          </span>
                          {onUpdateClass && (
                            <button
                              onClick={() => {
                                setEditingClass(cls);
                                setEditingClassName(cls.name);
                              }}
                              className="text-indigo-600 hover:text-indigo-800 p-1.5 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                              title="Edit Nama Kelas"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {onDeleteClass && (
                            <button
                              onClick={() => onDeleteClass(cls.id)}
                              className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition cursor-pointer"
                              title="Hapus Kelas"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
              {classes.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Belum ada kelas terdaftar.
                </div>
              )}
            </div>
          </div>

          {/* SUBJECTS MANAGEMENT */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                📚 Manajemen Mata Pelajaran
              </h3>
              <p className="text-slate-500 text-xs">
                Tambah dan kelola daftar mata pelajaran utama. Digunakan untuk penjurnalan mengajar dan materi.
              </p>
            </div>

            {/* Inline add form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const input = form.elements.namedItem('subjectNameInput') as HTMLInputElement;
                const val = input.value.trim();
                if (val && onAddSubject) {
                  onAddSubject(val);
                  input.value = '';
                }
              }}
              className="flex gap-2"
            >
              <input
                name="subjectNameInput"
                type="text"
                required
                placeholder="Misal: Seni Musik, PJOK..."
                className="flex-grow px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Mapel</span>
              </button>
            </form>

            {/* Subjects list */}
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {subjects.map((sub) => {
                const teacherCount = teachers.filter(t => t.subject.split(',').map(s => s.trim().toLowerCase()).includes(sub.name.toLowerCase())).length;
                const isEditing = editingSubject?.id === sub.id;

                return (
                  <div key={sub.id} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/50 transition">
                    {isEditing ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (editingSubjectName.trim() && onUpdateSubject) {
                            onUpdateSubject({ ...sub, name: editingSubjectName.trim() });
                          }
                          setEditingSubject(null);
                        }}
                        className="flex items-center justify-between w-full gap-2"
                      >
                        <input
                          type="text"
                          value={editingSubjectName}
                          onChange={(e) => setEditingSubjectName(e.target.value)}
                          className="flex-grow px-3 py-1.5 border border-emerald-300 rounded-lg text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                          autoFocus
                        />
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="submit"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            title="Simpan Perubahan"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Simpan
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingSubject(null)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                            title="Batal"
                          >
                            Batal
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <span className="font-bold text-slate-900">{sub.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-50 text-emerald-700 font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                            {teacherCount} Pengajar
                          </span>
                          {onUpdateSubject && (
                            <button
                              onClick={() => {
                                setEditingSubject(sub);
                                setEditingSubjectName(sub.name);
                              }}
                              className="text-emerald-600 hover:text-emerald-800 p-1.5 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                              title="Edit Mata Pelajaran"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {onDeleteSubject && (
                            <button
                              onClick={() => onDeleteSubject(sub.id)}
                              className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition cursor-pointer"
                              title="Hapus Mata Pelajaran"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
              {subjects.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Belum ada mata pelajaran terdaftar.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REGISTRATIONS TAB */}
      {activeTab === 'registrations' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                Manajemen & Persetujuan Akun Pendaftar
              </h3>
              <p className="text-slate-500 text-xs">
                Daftar permohonan registrasi akun Guru dan Siswa baru yang masuk dari halaman awal portal.
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Total Masuk</span>
              <span className="text-xl font-black text-slate-900 mt-1 block">{registrations.length}</span>
            </div>
            <div className="bg-amber-50/50 border border-amber-100 p-3.5 rounded-xl">
              <span className="text-[10px] font-extrabold uppercase text-amber-600 block">Menunggu Persetujuan</span>
              <span className="text-xl font-black text-amber-900 mt-1 block">
                {registrations.filter(r => r.status === 'Pending').length}
              </span>
            </div>
            <div className="bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-xl">
              <span className="text-[10px] font-extrabold uppercase text-emerald-600 block">Disetujui Aktif</span>
              <span className="text-xl font-black text-emerald-900 mt-1 block">
                {registrations.filter(r => r.status === 'Approved').length}
              </span>
            </div>
            <div className="bg-red-50/50 border border-red-100 p-3.5 rounded-xl">
              <span className="text-[10px] font-extrabold uppercase text-red-600 block">Ditolak</span>
              <span className="text-xl font-black text-red-900 mt-1 block">
                {registrations.filter(r => r.status === 'Rejected').length}
              </span>
            </div>
          </div>

          {registrations.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl">
              <p className="text-slate-400 text-xs font-semibold">Belum ada permohonan pendaftaran akun.</p>
            </div>
          ) : (
            <div className="border border-slate-100 rounded-xl overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 font-bold text-slate-700">Peran</th>
                    <th className="px-5 py-3 font-bold text-slate-700">Nama Lengkap</th>
                    <th className="px-5 py-3 font-bold text-slate-700">NIP / NIS</th>
                    <th className="px-5 py-3 font-bold text-slate-700">Mapel / Kelas</th>
                    <th className="px-5 py-3 font-bold text-slate-700">Password / Email</th>
                    <th className="px-5 py-3 font-bold text-slate-700">Waktu Daftar</th>
                    <th className="px-5 py-3 font-bold text-slate-700">Status</th>
                    <th className="px-5 py-3 font-bold text-slate-700 text-right">Aksi Persetujuan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md font-extrabold text-[10px] uppercase tracking-wider ${
                          reg.role === 'Teacher' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-purple-50 text-purple-700 border border-purple-100'
                        }`}>
                          {reg.role === 'Teacher' ? '👨‍🏫 Guru' : '👨‍🎓 Siswa'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">{reg.name}</td>
                      <td className="px-5 py-3.5 font-mono text-slate-600">{reg.identifier}</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-700">{reg.subjectOrClass}</td>
                      <td className="px-5 py-3.5 font-mono text-slate-500">{reg.passwordOrEmail}</td>
                      <td className="px-5 py-3.5 text-slate-400 font-mono text-[10px]">
                        {new Date(reg.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {reg.status === 'Pending' && (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
                            <Clock className="w-3 h-3 animate-spin" /> Menunggu
                          </span>
                        )}
                        {reg.status === 'Approved' && (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
                            <CheckCircle className="w-3 h-3" /> Disetujui
                          </span>
                        )}
                        {reg.status === 'Rejected' && (
                          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
                            <XCircle className="w-3 h-3" /> Ditolak
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        {reg.status === 'Pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onApproveRegistration?.(reg.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 text-[11px] shadow-2xs"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Setujui
                            </button>
                            <button
                              onClick={() => onRejectRegistration?.(reg.id)}
                              className="bg-red-500 hover:bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 text-[11px] shadow-2xs"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Tolak
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Selesai diverifikasi</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ADD TEACHER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-lg p-6 space-y-4">
            <h3 className="font-extrabold text-slate-950 text-base">Registrasi Guru Pengajar Baru</h3>
            
            <form onSubmit={handleSaveTeacher} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700">Nama Lengkap beserta Gelar *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Siti Rahmawati, S.Pd."
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">NIP Pegawai *</label>
                  <input
                    type="text"
                    required
                    placeholder="Masukkan NIP"
                    value={newTeacher.nip}
                    onChange={(e) => setNewTeacher(prev => ({ ...prev, nip: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Email Utama (Opsional)</label>
                  <input
                    type="email"
                    placeholder="Masukkan Email"
                    value={newTeacher.email}
                    onChange={(e) => setNewTeacher(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* MULTI-SUBJECT SELECTION BLOCK (TAMBAH GURU) */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    📚 Mata Pelajaran yang Diajar (Bisa Pilih &gt; 1 Mapel) *
                  </label>
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                    {newTeacher.subject ? newTeacher.subject.split(',').filter(Boolean).length : 0} Mapel Dipilih
                  </span>
                </div>

                {/* Selected Subjects Badges */}
                <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-white border border-slate-200 rounded-lg items-center">
                  {newTeacher.subject && newTeacher.subject.split(',').map((subj, idx) => {
                    const trimmed = subj.trim();
                    if (!trimmed) return null;
                    return (
                      <span key={idx} className="inline-flex items-center gap-1 bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-2xs">
                        {trimmed}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = newTeacher.subject
                              .split(',')
                              .map(s => s.trim())
                              .filter(s => s && s.toLowerCase() !== trimmed.toLowerCase())
                              .join(', ');
                            setNewTeacher(prev => ({ ...prev, subject: updated }));
                          }}
                          className="hover:bg-indigo-800 rounded-full w-4 h-4 inline-flex items-center justify-center text-[10px] cursor-pointer"
                          title="Hapus mapel ini"
                        >
                          ✕
                        </button>
                      </span>
                    );
                  })}
                  {(!newTeacher.subject || newTeacher.subject.trim() === '') && (
                    <span className="text-xs text-slate-400 italic">Klik tombol mapel di bawah untuk memilih...</span>
                  )}
                </div>

                {/* Quick Select Buttons from Existing Subjects */}
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Klik kotak mapel untuk menambah / mengurangi pilihan:</p>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
                    {subjects.map(s => {
                      const currentList = newTeacher.subject ? newTeacher.subject.split(',').map(item => item.trim().toLowerCase()) : [];
                      const isSelected = currentList.includes(s.name.toLowerCase());
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            const list = newTeacher.subject ? newTeacher.subject.split(',').map(item => item.trim()).filter(Boolean) : [];
                            if (isSelected) {
                              const updated = list.filter(item => item.toLowerCase() !== s.name.toLowerCase()).join(', ');
                              setNewTeacher(prev => ({ ...prev, subject: updated }));
                            } else {
                              list.push(s.name);
                              setNewTeacher(prev => ({ ...prev, subject: list.join(', ') }));
                            }
                          }}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 border ${
                            isSelected 
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs' 
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected ? '✓' : '+'} {s.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Add Custom Subject */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                  <input
                    type="text"
                    placeholder="Atau ketik mapel baru lain..."
                    id="custom_subject_input_add"
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const inputEl = e.currentTarget;
                        const val = inputEl.value.trim();
                        if (val) {
                          if (onAddSubject && !subjects.some(s => s.name.toLowerCase() === val.toLowerCase())) {
                            onAddSubject(val);
                          }
                          const list = newTeacher.subject ? newTeacher.subject.split(',').map(item => item.trim()).filter(Boolean) : [];
                          if (!list.some(item => item.toLowerCase() === val.toLowerCase())) {
                            list.push(val);
                            setNewTeacher(prev => ({ ...prev, subject: list.join(', ') }));
                          }
                          inputEl.value = '';
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const inputEl = document.getElementById('custom_subject_input_add') as HTMLInputElement;
                      if (inputEl && inputEl.value.trim()) {
                        const val = inputEl.value.trim();
                        if (onAddSubject && !subjects.some(s => s.name.toLowerCase() === val.toLowerCase())) {
                          onAddSubject(val);
                        }
                        const list = newTeacher.subject ? newTeacher.subject.split(',').map(item => item.trim()).filter(Boolean) : [];
                        if (!list.some(item => item.toLowerCase() === val.toLowerCase())) {
                          list.push(val);
                          setNewTeacher(prev => ({ ...prev, subject: list.join(', ') }));
                        }
                        inputEl.value = '';
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap"
                  >
                    ➕ Tambah Mapel
                  </button>
                </div>
              </div>

              {/* Drive upload simulator */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700">Foto Profil (Unggah Simultan ke Google Drive)</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-lg transition"
                  >
                    <Upload className="w-3.5 h-3.5" /> Unggah Foto
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleSimulatedFileUpload}
                    className="hidden"
                  />
                  {uploading && (
                    <span className="text-[11px] text-indigo-600 font-semibold animate-pulse">
                      Mengunggah berkas ke Google Drive...
                    </span>
                  )}
                  {newTeacher.photoUrl && !uploading && (
                    <span className="text-[11px] text-emerald-600 font-semibold truncate max-w-[250px]">
                      Terunggah! Tautan Drive tersimpan.
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer"
                >
                  Daftarkan Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD STUDENT MODAL */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-lg p-6 space-y-4">
            <h3 className="font-extrabold text-slate-950 text-base">Registrasi Siswa Baru</h3>
            
            <form onSubmit={handleSaveStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700">Nama Lengkap Siswa *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Rafli"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">NIS (Nomor Induk Siswa) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Masukkan NIS"
                    value={newStudent.nis}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, nis: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Kelas *</label>
                  <select
                    required
                    value={newStudent.classId}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, classId: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="">Pilih Kelas</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700">Email Utama (Opsional)</label>
                <input
                  type="email"
                  placeholder="Masukkan Email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer"
                >
                  Daftarkan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TEACHER MODAL (PENGATURAN MAPEL & PROFIL) */}
      {showEditTeacherModal && editingTeacher && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Atur Mapel & Profil Guru</h3>
              </div>
              <button 
                onClick={() => setShowEditTeacherModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (onUpdateTeacher && editingTeacher) {
                onUpdateTeacher(editingTeacher);
                alert(`Pengaturan guru ${editingTeacher.name} berhasil diperbarui!`);
                setShowEditTeacherModal(false);
              }
            }} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700">Nama Lengkap beserta Gelar *</label>
                <input
                  type="text"
                  required
                  value={editingTeacher.name}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">NIP / NUPTK *</label>
                  <input
                    type="text"
                    required
                    value={editingTeacher.nip}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, nip: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Email Utama</label>
                  <input
                    type="email"
                    value={editingTeacher.email}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700">Password Login (Bisa Diubah/Reset) *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={editingTeacher.password || 'guru123'}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, password: e.target.value })}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono font-bold text-slate-800 bg-slate-50"
                  />
                  <button
                    type="button"
                    onClick={() => setEditingTeacher({ ...editingTeacher, password: 'guru123' })}
                    className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold px-3 py-2 rounded-lg transition cursor-pointer whitespace-nowrap"
                  >
                    Reset (guru123)
                  </button>
                </div>
              </div>

              {/* MULTI-SUBJECT SELECTION BLOCK */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    📚 Mata Pelajaran yang Diajar (Bisa Pilih &gt; 1 Mapel) *
                  </label>
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                    {editingTeacher.subject ? editingTeacher.subject.split(',').filter(Boolean).length : 0} Mapel Dipilih
                  </span>
                </div>

                {/* Selected Subjects Badges */}
                <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-white border border-slate-200 rounded-lg items-center">
                  {editingTeacher.subject && editingTeacher.subject.split(',').map((subj, idx) => {
                    const trimmed = subj.trim();
                    if (!trimmed) return null;
                    return (
                      <span key={idx} className="inline-flex items-center gap-1 bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-2xs">
                        {trimmed}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = editingTeacher.subject
                              .split(',')
                              .map(s => s.trim())
                              .filter(s => s && s.toLowerCase() !== trimmed.toLowerCase())
                              .join(', ');
                            setEditingTeacher({ ...editingTeacher, subject: updated || 'Umum' });
                          }}
                          className="hover:bg-indigo-800 rounded-full w-4 h-4 inline-flex items-center justify-center text-[10px] cursor-pointer"
                          title="Hapus mapel ini"
                        >
                          ✕
                        </button>
                      </span>
                    );
                  })}
                  {(!editingTeacher.subject || editingTeacher.subject.trim() === '') && (
                    <span className="text-xs text-slate-400 italic">Belum ada mapel dipilih... Klik di bawah</span>
                  )}
                </div>

                {/* Quick Select Buttons from Existing Subjects */}
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Klik kotak mapel di bawah untuk menambah / mengurangi pilihan:</p>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
                    {subjects.map(s => {
                      const currentList = editingTeacher.subject ? editingTeacher.subject.split(',').map(item => item.trim().toLowerCase()) : [];
                      const isSelected = currentList.includes(s.name.toLowerCase());
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            const list = editingTeacher.subject ? editingTeacher.subject.split(',').map(item => item.trim()).filter(Boolean) : [];
                            if (isSelected) {
                              const updated = list.filter(item => item.toLowerCase() !== s.name.toLowerCase()).join(', ');
                              setEditingTeacher({ ...editingTeacher, subject: updated || 'Umum' });
                            } else {
                              if (list.length === 1 && list[0] === 'Umum') {
                                setEditingTeacher({ ...editingTeacher, subject: s.name });
                              } else {
                                list.push(s.name);
                                setEditingTeacher({ ...editingTeacher, subject: list.join(', ') });
                              }
                            }
                          }}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 border ${
                            isSelected 
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs' 
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected ? '✓' : '+'} {s.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Add Custom Subject */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                  <input
                    type="text"
                    placeholder="Atau ketik mapel baru lain..."
                    id="custom_subject_input_edit"
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const inputEl = e.currentTarget;
                        const val = inputEl.value.trim();
                        if (val) {
                          if (onAddSubject && !subjects.some(s => s.name.toLowerCase() === val.toLowerCase())) {
                            onAddSubject(val);
                          }
                          const list = editingTeacher.subject ? editingTeacher.subject.split(',').map(item => item.trim()).filter(Boolean) : [];
                          if (!list.some(item => item.toLowerCase() === val.toLowerCase())) {
                            if (list.length === 1 && list[0] === 'Umum') {
                              setEditingTeacher({ ...editingTeacher, subject: val });
                            } else {
                              list.push(val);
                              setEditingTeacher({ ...editingTeacher, subject: list.join(', ') });
                            }
                          }
                          inputEl.value = '';
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const inputEl = document.getElementById('custom_subject_input_edit') as HTMLInputElement;
                      if (inputEl && inputEl.value.trim()) {
                        const val = inputEl.value.trim();
                        if (onAddSubject && !subjects.some(s => s.name.toLowerCase() === val.toLowerCase())) {
                          onAddSubject(val);
                        }
                        const list = editingTeacher.subject ? editingTeacher.subject.split(',').map(item => item.trim()).filter(Boolean) : [];
                        if (!list.some(item => item.toLowerCase() === val.toLowerCase())) {
                          if (list.length === 1 && list[0] === 'Umum') {
                            setEditingTeacher({ ...editingTeacher, subject: val });
                          } else {
                            list.push(val);
                            setEditingTeacher({ ...editingTeacher, subject: list.join(', ') });
                          }
                        }
                        inputEl.value = '';
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap"
                  >
                    ➕ Tambah Mapel
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700">URL Foto Profil Google Drive</label>
                <input
                  type="url"
                  value={editingTeacher.photoUrl}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, photoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100 text-[11px] text-indigo-900 leading-relaxed font-medium">
                💡 <strong>Info:</strong> Perubahan mata pelajaran akan langsung diperbarui ke database Spreadsheet dan berlaku untuk portal pengajaran guru bersangkutan.
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-end gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setShowEditTeacherModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  Simpan Pengaturan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STUDENT MODAL (EDIT DATA / NAIK KELAS INDIVIDUAL) */}
      {showEditStudentModal && editingStudent && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Edit Data / Naik Kelas Siswa</h3>
              </div>
              <button 
                onClick={() => setShowEditStudentModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (onUpdateStudent && editingStudent) {
                onUpdateStudent(editingStudent);
                alert(`Data siswa ${editingStudent.name} berhasil diperbarui!`);
                setShowEditStudentModal(false);
              }
            }} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">NIS (Kredensial Login) *</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.nis}
                    onChange={(e) => setEditingStudent({ ...editingStudent, nis: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Status Siswa *</label>
                  <select
                    required
                    value={editingStudent.status || 'Aktif'}
                    onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-bold"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Lulus">Lulus</option>
                    <option value="Pindah">Pindah / Keluar</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Penempatan Kelas *</label>
                  <select
                    required
                    value={editingStudent.classId}
                    onChange={(e) => setEditingStudent({ ...editingStudent, classId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-bold text-indigo-700"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700">Email Utama</label>
                <input
                  type="email"
                  value={editingStudent.email}
                  onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700">Password Login (Bisa Diubah/Reset) *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={editingStudent.password || editingStudent.email || editingStudent.nis}
                    onChange={(e) => setEditingStudent({ ...editingStudent, password: e.target.value })}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono font-bold text-slate-800 bg-slate-50"
                  />
                  <button
                    type="button"
                    onClick={() => setEditingStudent({ ...editingStudent, password: editingStudent.nis })}
                    className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold px-3 py-2 rounded-lg transition cursor-pointer whitespace-nowrap"
                  >
                    Reset ke NIS
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-end gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setShowEditStudentModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL FOR TEACHER & STUDENT */}
      {showResetPassModal && resetTargetUser && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Reset Password Akun {resetTargetUser.role === 'Teacher' ? 'Pengajar' : 'Siswa'}</h3>
                  <p className="text-xs text-slate-400">Atur ulang kata sandi login pengguna</p>
                </div>
              </div>
              <button 
                onClick={() => setShowResetPassModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Nama Pengguna:</span>
                <span className="font-bold text-slate-800">{resetTargetUser.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">{resetTargetUser.role === 'Teacher' ? 'NIP Pengajar:' : 'NIS Siswa:'}</span>
                <span className="font-mono font-bold text-indigo-600">{resetTargetUser.identifier}</span>
              </div>
              <div className="flex justify-between text-xs items-center">
                <span className="text-slate-400">Password Saat Ini:</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-bold text-[11px]">{resetTargetUser.currentPass}</span>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newPasswordValue.trim()) return;
                const finalPass = newPasswordValue.trim();
                if (resetTargetUser.role === 'Teacher' && onUpdateTeacher) {
                  onUpdateTeacher({ ...(resetTargetUser.rawObject as Teacher), password: finalPass });
                } else if (resetTargetUser.role === 'Student' && onUpdateStudent) {
                  onUpdateStudent({ ...(resetTargetUser.rawObject as Student), password: finalPass });
                }
                alert(`Password untuk ${resetTargetUser.name} berhasil diubah menjadi: ${finalPass}`);
                setShowResetPassModal(false);
              }}
              className="space-y-4 text-left"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Masukkan Password Baru *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={newPasswordValue}
                    onChange={(e) => setNewPasswordValue(e.target.value)}
                    placeholder="Ketik password baru..."
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const defaultPass = resetTargetUser.role === 'Teacher' ? 'guru123' : resetTargetUser.identifier;
                      setNewPasswordValue(defaultPass);
                    }}
                    className="text-[11px] bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    ⚡ Gunakan Default ({resetTargetUser.role === 'Teacher' ? 'guru123' : `NIS: ${resetTargetUser.identifier}`})
                  </button>
                </div>
              </div>

              <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100 text-[11px] text-amber-900 leading-relaxed">
                ℹ️ <strong>Catatan:</strong> Setelah password diubah, pengguna dapat langsung login menggunakan NIP/NIS mereka dan password baru ini.
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-end gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setShowResetPassModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle className="w-4 h-4" />
                  Simpan Password Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMPORT EXCEL / CSV MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Import Data Siswa (.XLS / .CSV)</h3>
              </div>
              <button 
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-emerald-950 text-xs">Unduh Template Standar Excel / CSV</h4>
                <p className="text-[11px] text-emerald-800 mt-0.5">Isi kolom: <code className="font-mono bg-white px-1 py-0.5 rounded border border-emerald-200">Nama Lengkap, NIS, Email, Kelas</code></p>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-xs whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" /> Unduh Template CSV
              </button>
            </div>

            <div className="space-y-3 text-left">
              <label className="block text-xs font-bold text-slate-700">
                Pilih Berkas CSV / Excel atau Tempel (Paste) Isi Berkas di Bawah:
              </label>
              
              <div className="flex items-center gap-3">
                <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 border border-slate-200">
                  <Upload className="w-4 h-4 text-slate-600" /> Pilih Berkas .CSV / .TXT
                  <input
                    type="file"
                    accept=".csv,.txt,.xls,.xlsx"
                    onChange={handleFileUploadImport}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-slate-400 font-medium">Atau salin langsung dari Excel ke kotak di bawah</span>
              </div>

              <textarea
                rows={5}
                value={importText}
                onChange={(e) => {
                  setImportText(e.target.value);
                  handleParseImport(e.target.value);
                }}
                placeholder={`Contoh format:\nNama Lengkap,NIS,Email,Kelas\nBudi Santoso,10260,budi@smp.sch.id,VII-A\nSiti Aminah,10261,siti@smp.sch.id,VII-B`}
                className="w-full font-mono text-xs p-3 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50"
              />
            </div>

            {/* PREVIEW TABLE */}
            {importPreview.length > 0 && (
              <div className="space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Pratinjau Data Terbaca ({importPreview.length} Siswa):</span>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  <table className="min-w-full divide-y divide-slate-100 text-[11px] text-left">
                    <thead className="bg-slate-50 font-bold text-slate-600">
                      <tr>
                        <th className="px-3 py-2">No</th>
                        <th className="px-3 py-2">Nama Siswa</th>
                        <th className="px-3 py-2">NIS</th>
                        <th className="px-3 py-2">Email</th>
                        <th className="px-3 py-2">Terdeteksi Kelas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {importPreview.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-3 py-1.5 font-bold text-slate-400">{idx + 1}</td>
                          <td className="px-3 py-1.5 font-bold text-slate-800">{item.name}</td>
                          <td className="px-3 py-1.5 font-mono text-slate-600">{item.nis}</td>
                          <td className="px-3 py-1.5 text-slate-500">{item.email}</td>
                          <td className="px-3 py-1.5 font-bold text-emerald-700">{item.className}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="border-t border-slate-100 pt-3 flex justify-end gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={importPreview.length === 0}
                onClick={() => {
                  if (onBulkAddStudents && importPreview.length > 0) {
                    onBulkAddStudents(importPreview);
                    alert(`Berhasil mengimpor ${importPreview.length} data siswa ke dalam database!`);
                    setShowImportModal(false);
                  }
                }}
                className={`px-5 py-2.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-xs text-white ${
                  importPreview.length === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Simpan & Import {importPreview.length} Siswa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT EXCEL / CSV MODAL GURU */}
      {showTeacherImportModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Import Data Guru (.XLS / .CSV)</h3>
              </div>
              <button 
                onClick={() => setShowTeacherImportModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-emerald-950 text-xs">Unduh Template Standar Excel / CSV Guru</h4>
                <p className="text-[11px] text-emerald-800 mt-0.5">Isi kolom: <code className="font-mono bg-white px-1 py-0.5 rounded border border-emerald-200">Nama Lengkap, NIP, Email, Mata Pelajaran</code></p>
                <p className="text-[10px] text-emerald-700 italic mt-0.5">*Catatan: Untuk &gt;1 mapel, pisahkan dengan koma (misal: Matematika, IPA)</p>
              </div>
              <button
                type="button"
                onClick={handleDownloadTeacherTemplate}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-xs whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" /> Unduh Template CSV
              </button>
            </div>

            <div className="space-y-3 text-left">
              <label className="block text-xs font-bold text-slate-700">
                Pilih Berkas CSV / Excel atau Tempel (Paste) Isi Berkas di Bawah:
              </label>
              
              <div className="flex items-center gap-3">
                <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 border border-slate-200">
                  <Upload className="w-4 h-4 text-slate-600" /> Pilih Berkas .CSV / .TXT
                  <input
                    type="file"
                    accept=".csv,.txt,.xls,.xlsx"
                    onChange={handleFileUploadTeacherImport}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-slate-400 font-medium">Atau salin langsung dari Excel ke kotak di bawah</span>
              </div>

              <textarea
                rows={5}
                value={teacherImportText}
                onChange={(e) => {
                  setTeacherImportText(e.target.value);
                  handleParseTeacherImport(e.target.value);
                }}
                placeholder={`Contoh format:\nNama Lengkap,NIP,Email,Mata Pelajaran\nDrs. H. Ahmad Fauzi M.Pd,197501012000121001,ahmad.fauzi@smp.sch.id,"Matematika, IPA"\nSiti Nurhaliza S.Pd,198203152008012003,siti.nurhaliza@smp.sch.id,Bahasa Indonesia`}
                className="w-full font-mono text-xs p-3 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50"
              />
            </div>

            {/* PREVIEW TABLE */}
            {teacherImportPreview.length > 0 && (
              <div className="space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Pratinjau Data Guru Terbaca ({teacherImportPreview.length} Guru):</span>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  <table className="min-w-full divide-y divide-slate-100 text-[11px] text-left">
                    <thead className="bg-slate-50 font-bold text-slate-600">
                      <tr>
                        <th className="px-3 py-2">No</th>
                        <th className="px-3 py-2">Nama Guru</th>
                        <th className="px-3 py-2">NIP</th>
                        <th className="px-3 py-2">Email</th>
                        <th className="px-3 py-2">Mata Pelajaran</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {teacherImportPreview.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-3 py-1.5 font-bold text-slate-400">{idx + 1}</td>
                          <td className="px-3 py-1.5 font-bold text-slate-800">{item.name}</td>
                          <td className="px-3 py-1.5 font-mono text-slate-600">{item.nip}</td>
                          <td className="px-3 py-1.5 text-slate-500">{item.email}</td>
                          <td className="px-3 py-1.5 font-bold text-indigo-700">
                            <div className="flex flex-wrap gap-1">
                              {item.subject.split(',').map((s, sIdx) => (
                                <span key={sIdx} className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[10px]">
                                  {s.trim()}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="border-t border-slate-100 pt-3 flex justify-end gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setShowTeacherImportModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={teacherImportPreview.length === 0}
                onClick={handleConfirmTeacherImport}
                className={`px-5 py-2.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-xs text-white ${
                  teacherImportPreview.length === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Simpan & Import {teacherImportPreview.length} Guru
              </button>
            </div>
          </div>
        </div>
      )}
      {showBulkPromoteModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">Naik Kelas / Lulus Masal</h3>
              </div>
              <button 
                onClick={() => setShowBulkPromoteModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed text-left font-medium">
              Fitur ini memungkinkan Admin untuk memindahkan seluruh siswa dari satu kelas ke kelas tingkat berikutnya secara serentak pada akhir tahun ajaran, atau meluluskan siswa tingkat akhir.
            </p>

            <div className="space-y-4 text-left bg-amber-50/50 p-4 rounded-xl border border-amber-100">
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">Dari Kelas Asal:</label>
                <select
                  value={promoteFromClassId}
                  onChange={(e) => setPromoteFromClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 bg-white"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">Pindahkan / Naik Ke Kelas:</label>
                <select
                  value={promoteToClassId}
                  onChange={(e) => setPromoteToClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-indigo-700 bg-white"
                >
                  {classes.filter(c => c.id !== promoteFromClassId).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                  <option value="LULUS" className="font-extrabold text-amber-700">🎓 Lulus / Alumni (Keluarkan dari Kelas Aktif)</option>
                </select>
              </div>
            </div>

            {promoteFromClassId && (
              <div className="text-left text-xs text-slate-600 font-medium">
                Jumlah siswa yang akan diproses: <strong className="text-slate-900">{activeStudents.filter(s => s.classId === promoteFromClassId).length} Siswa</strong>
              </div>
            )}

            <div className="border-t border-slate-100 pt-3 flex justify-end gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setShowBulkPromoteModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={activeStudents.filter(s => s.classId === promoteFromClassId).length === 0}
                onClick={() => {
                  const targetStudents = activeStudents.filter(s => s.classId === promoteFromClassId);
                  if (targetStudents.length === 0) return;

                  if (promoteToClassId === 'LULUS') {
                    if (onUpdateStudent) {
                      targetStudents.forEach(s => onUpdateStudent({...s, status: 'Lulus'}));
                    }
                    alert(`Berhasil meluluskan / mengalihkan ${targetStudents.length} siswa ke status Alumni.`);
                    setShowBulkPromoteModal(false);
                  } else {
                    const targetClassObj = classes.find(c => c.id === promoteToClassId);
                    if (onUpdateStudent) {
                      targetStudents.forEach(s => {
                        onUpdateStudent({ ...s, classId: promoteToClassId });
                      });
                    }
                    alert(`Berhasil menaikkan kelas ${targetStudents.length} siswa ke ${targetClassObj?.name}!`);
                    setShowBulkPromoteModal(false);
                  }
                }}
                className={`px-4 py-2 rounded-lg transition cursor-pointer text-white shadow-xs ${
                  activeStudents.filter(s => s.classId === promoteFromClassId).length === 0
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                Proses Perpindahan Masal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
