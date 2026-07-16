import toast from 'react-hot-toast';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Student, Material, Exam, ExamQuestion, ExamSubmission, CheatLog, Teacher, SubjectItem, TeacherAnnouncement
} from '../types';
import { 
  BookOpen, FileText, Key, Clock, AlertTriangle, CheckCircle, ShieldAlert, Sparkles, Send, User, GraduationCap,
  Bell, Megaphone, CheckCircle2, Info, X
} from 'lucide-react';

interface StudentPanelProps {
  currentStudent: Student;
  materials: Material[];
  exams: Exam[];
  submissions?: ExamSubmission[];
  teachers: Teacher[];
  subjects: SubjectItem[];
  announcements?: TeacherAnnouncement[];
  onAddCheatLog: (log: Omit<CheatLog, 'id' | 'timestamp'>) => void;
  onSubmitExam: (submission: Omit<ExamSubmission, 'id' | 'submittedAt'>) => void;
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

export default function StudentPanel({
  currentStudent,
  materials,
  exams,
  submissions = [],
  teachers,
  subjects,
  announcements = [],
  onAddCheatLog,
  onSubmitExam
}: StudentPanelProps) {
  const [activeTab, setActiveTab] = useState<'beranda' | 'materials' | 'exams' | 'scores'>('beranda');

  // Materials Viewer State
  const [activeMaterial, setActiveMaterial] = useState<Material | null>(null);

  // CBT Exam State
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [examStarted, setExamStarted] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [cheatingAttempts, setCheatingAttempts] = useState(0);
  const [showCheatModal, setShowCheatModal] = useState(false);
  const [studentAnswers, setStudentAnswers] = useState<{ [qId: string]: any }>({});
  
  // Submit exam state
  const [scoreResult, setScoreResult] = useState<{
    score: number;
    totalPoints: number;
    maxPoints: number;
    answers: any[];
  } | null>(null);

  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Filter Materials & Exams to match Student's specific class
  const classMaterials = materials.filter(m => {
    if (m.status !== 'Aktif') return false;
    return Array.isArray(m.classId) ? m.classId.includes(currentStudent.classId) : m.classId === currentStudent.classId;
  });
  const classExams = exams.filter(e => e.classId === currentStudent.classId);

  // Filter Teacher Announcements for this student
  const studentAnnouncements = announcements.filter(a => {
    if (!a.isActive) return false;
    
    // Auto-expiry: Sembunyikan informasi yang usianya lebih dari 7 hari (Otomatis Bersih)
    if (a.createdAt) {
      const createdAt = new Date(a.createdAt).getTime();
      const now = new Date().getTime();
      const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
      if (now - createdAt > SEVEN_DAYS) return false;
    }

    if (a.targetType === 'all') return true;
    if (a.targetType === 'class') {
      return a.targetClassName === currentStudent.className || a.targetClassId === currentStudent.classId;
    }
    return true;
  });

  const [readAnnouncements, setReadAnnouncements] = useState<string[]>(() => {
    const saved = localStorage.getItem(`gas_read_ann_${currentStudent.id}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [showPopNotification, setShowPopNotification] = useState(false);

  useEffect(() => {
    // Pop-up hanya muncul untuk informasi yang Penting atau Mendesak
    const unreadUrgent = studentAnnouncements.filter(a => 
      !readAnnouncements.includes(a.id) && 
      (a.priority === 'mendesak' || a.priority === 'penting')
    );
    if (unreadUrgent.length > 0 && !examStarted) {
      setShowPopNotification(true);
    }
  }, [studentAnnouncements.length, currentStudent.id]);

  const handleMarkAsRead = (id: string) => {
    const next = [...readAnnouncements, id];
    setReadAnnouncements(next);
    localStorage.setItem(`gas_read_ann_${currentStudent.id}`, JSON.stringify(next));
  };

  const unreadCount = studentAnnouncements.filter(a => !readAnnouncements.includes(a.id)).length;

  // 🛡️ ANTI-CONTEK DETECTION LOGIC (Using window blur / page visibility)
  useEffect(() => {
    if (!examStarted || !activeExam) return;

    const recordCheat = (type: string) => {
      setCheatingAttempts(prev => {
        const next = prev + 1;
        onAddCheatLog({
          studentName: currentStudent.name,
          studentNis: currentStudent.nis,
          className: currentStudent.className || 'Kelas',
          examTitle: activeExam.title,
          violationType: `${type} (${next}x)`
        });
        return next;
      });
      setShowCheatModal(true);
    };

    const handleWindowBlur = () => {
      recordCheat('Keluar dari layar/tab aplikasi');
    };

    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        recordCheat('Aplikasi masuk ke background/ditutup');
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      // Optional: recordCheat('Mencoba klik kanan');
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      // Optional: recordCheat('Mencoba menyalin/menempel teks');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Mencegah Print Screen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        recordCheat('Mencoba mengambil screenshot');
      }
      // Mencegah Ctrl+C, Ctrl+V, Ctrl+X, dll
      if (e.ctrlKey || e.metaKey) {
        if (['c', 'v', 'x', 'a', 'p'].includes(e.key.toLowerCase())) {
          e.preventDefault();
        }
      }
    };

    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [examStarted, activeExam, currentStudent, onAddCheatLog]);

  // Exam Countdown Timer
  useEffect(() => {
    if (examStarted && timerSeconds > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current!);
            handleAutoSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [examStarted, timerSeconds]);

  const handleStartExam = (exam: Exam) => {
    if (tokenInput.toUpperCase() !== exam.token) {
      setTokenError('Token yang Anda masukkan salah!');
      return;
    }

    setTokenError('');
    setActiveExam(exam);
    setTimerSeconds(exam.durationMinutes * 60);
    setExamStarted(true);
    setCheatingAttempts(0);
    setStudentAnswers({});
    setScoreResult(null);
  };

  const handleSelectAnswer = (qId: string, answer: any) => {
    setStudentAnswers(prev => ({ ...prev, [qId]: answer }));
  };

  const handleSelectMultipleAnswer = (qId: string, option: string, checked: boolean) => {
    const current = (studentAnswers[qId] as string[]) || [];
    let next: string[];
    if (checked) {
      next = [...current, option];
    } else {
      next = current.filter(o => o !== option);
    }
    setStudentAnswers(prev => ({ ...prev, [qId]: next }));
  };

  // Evaluate final scoring strictly following our UjianController scoring system
  const handleEvaluateExam = () => {
    if (!activeExam) return;

    let totalPoints = 0;
    const maxPoints = activeExam.questions.length;
    const evaluatedAnswers: any[] = [];

    activeExam.questions.forEach(q => {
      const studentAns = studentAnswers[q.id];
      let isCorrect = false;
      let pointsEarned = 0;

      switch (q.type) {
        case 'PilihanGanda':
          if (studentAns && String(studentAns).trim().toUpperCase() === String(q.correctAnswer).trim().toUpperCase()) {
            isCorrect = true;
            pointsEarned = 1;
          }
          break;

        case 'PilihanGandaKompleks':
          if (Array.isArray(studentAns) && Array.isArray(q.correctAnswers)) {
            const sortedStudent = [...studentAns].sort();
            const sortedCorrect = [...q.correctAnswers].sort();
            if (JSON.stringify(sortedStudent) === JSON.stringify(sortedCorrect)) {
              isCorrect = true;
              pointsEarned = 1;
            }
          }
          break;

        case 'PilihanAsosiatif':
          if (studentAns) {
            const correctCombination = q.correctCombination || [];
            let computedKey = '';
            
            const has1 = correctCombination.includes(1);
            const has2 = correctCombination.includes(2);
            const has3 = correctCombination.includes(3);
            const has4 = correctCombination.includes(4);
            const count = correctCombination.length;

            if (has1 && has2 && has3 && count === 3) computedKey = 'A';
            else if (has1 && has3 && count === 2) computedKey = 'B';
            else if (has2 && has4 && count === 2) computedKey = 'C';
            else if (has4 && count === 1) computedKey = 'D';
            else if (has1 && has2 && has3 && has4 && count === 4) computedKey = 'E';

            if (String(studentAns).trim().toUpperCase() === computedKey) {
              isCorrect = true;
              pointsEarned = 1;
            }
          }
          break;

        case 'SebabAkibat':
          if (studentAns) {
            let computedKey = '';
            const pBenar = q.correctStatementTrue;
            const aBenar = q.correctReasonTrue;
            const hubSebab = q.correctCausality;

            if (pBenar && aBenar && hubSebab) computedKey = 'A';
            else if (pBenar && aBenar && !hubSebab) computedKey = 'B';
            else if (pBenar && !aBenar) computedKey = 'C';
            else if (!pBenar && aBenar) computedKey = 'D';
            else if (!pBenar && !aBenar) computedKey = 'E';

            if (String(studentAns).trim().toUpperCase() === computedKey) {
              isCorrect = true;
              pointsEarned = 1;
            }
          }
          break;

        case 'Uraian':
          if (studentAns && String(studentAns).trim() !== '') {
            isCorrect = true; // For now, assume filled means "answered" (grading can be manual later)
            pointsEarned = 1; // Or partial score
          }
          break;
      }

      if (isCorrect) {
        totalPoints += pointsEarned;
      }

      evaluatedAnswers.push({
        questionId: q.id,
        studentAnswer: studentAns,
        isCorrect: isCorrect,
        pointsEarned: pointsEarned
      });
    });

    const finalScore = Math.round((totalPoints / maxPoints) * 100) || 0;

    // Send to main app spreadsheet storage
    onSubmitExam({
      examId: activeExam.id,
      examTitle: activeExam.title,
      studentName: currentStudent.name,
      studentNis: currentStudent.nis,
      className: currentStudent.className || 'Kelas VII-A',
      score: finalScore,
      answers: evaluatedAnswers,
      cheatingAttempts: cheatingAttempts
    });

    setScoreResult({
      score: finalScore,
      totalPoints,
      maxPoints,
      answers: evaluatedAnswers
    });

    setExamStarted(false);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  const handleAutoSubmitExam = () => {
    toast('Waktu ujian telah habis! Jawaban Anda otomatis terkirim.');
    handleEvaluateExam();
  };

  // Timer formatter
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in" id="student-panel-container">
      {/* Student Welcome Header */}
      {!examStarted && (
        <div className="bg-white border border-slate-100 shadow-xs rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Pembelajaran Interaktif Digital
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1.5">Halo, {currentStudent.name}</h2>
            <p className="text-xs text-slate-500">
              NIS: <strong>{currentStudent.nis}</strong> • Kelas : <strong className="text-indigo-600">{currentStudent.className || 'VII-A'}</strong>
            </p>
          </div>

          <div className="flex flex-row sm:flex-nowrap gap-2 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab('beranda')}
              className={`flex-1 sm:flex-none text-center whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'beranda'
                  ? 'bg-amber-100 text-amber-900 shadow-xs border border-amber-300 font-extrabold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Bell className={`w-3.5 h-3.5 ${unreadCount > 0 ? 'text-amber-600 animate-bounce' : 'text-slate-400'}`} />
              <span>Beranda & Notifikasi</span>
              {unreadCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('materials')}
              className={`flex-1 sm:flex-none text-center whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'materials'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              📚 Bahan Ajar & Materi
            </button>
            <button
              onClick={() => setActiveTab('exams')}
              className={`flex-1 sm:flex-none text-center whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'exams'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              ✍️ Ujian/Soal Evaluasi
            </button>
            <button
              onClick={() => setActiveTab('scores')}
              className={`flex-1 sm:flex-none text-center whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'scores'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              📊 Riwayat Nilai
            </button>
          </div>
        </div>
      )}

      {/* BERANDA & NOTIFIKASI GURU SECTION */}
      {activeTab === 'beranda' && !examStarted && (
        <div className="space-y-6 animate-fade-in">
          {/* Quick Stats Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-slate-950 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-amber-950/70 block">Notifikasi Guru</span>
                <h3 className="text-2xl font-black mt-0.5">{studentAnnouncements.length} Catatan</h3>
                <p className="text-xs text-amber-950/80 font-semibold mt-1">{unreadCount} belum dibaca</p>
              </div>
              <Megaphone className="w-10 h-10 text-amber-950/30" />
            </div>

            <div
              onClick={() => setActiveTab('materials')}
              className="bg-white hover:bg-slate-50 rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center justify-between cursor-pointer transition"
            >
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Materi Pembelajaran</span>
                <h3 className="text-2xl font-black text-slate-900 mt-0.5">{classMaterials.length} File E-Book</h3>
                <p className="text-xs text-indigo-600 font-bold mt-1">Buka e-learning kelas →</p>
              </div>
              <BookOpen className="w-10 h-10 text-indigo-100" />
            </div>

            <div
              onClick={() => setActiveTab('exams')}
              className="bg-white hover:bg-slate-50 rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center justify-between cursor-pointer transition"
            >
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Jadwal Tes & Ujian CBT</span>
                <h3 className="text-2xl font-black text-slate-900 mt-0.5">{classExams.length} Tes Tersedia</h3>
                <p className="text-xs text-indigo-600 font-bold mt-1">Siapkan token ujian →</p>
              </div>
              <Clock className="w-10 h-10 text-indigo-100" />
            </div>
          </div>

          {/* Main Notification Feed */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-500 animate-pulse" />
                  Papan Informasi & Catatan Guru Mapel
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Catatan penting, arahan tugas, dan jadwal pembelajaran yang diinformasikan langsung oleh guru kepada kelas Anda.
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={() => studentAnnouncements.forEach(a => handleMarkAsRead(a.id))}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl transition self-start sm:self-auto cursor-pointer"
                >
                  ✓ Tandai Semua Dibaca
                </button>
              )}
            </div>

            {studentAnnouncements.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <Info className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 font-semibold text-xs">Belum ada catatan atau pengumuman dari guru mapel untuk kelas {currentStudent.className}.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {studentAnnouncements.map((ann) => {
                  const isRead = readAnnouncements.includes(ann.id);

                  return (
                    <div
                      key={ann.id}
                      className={`p-5 rounded-2xl border transition flex flex-col justify-between space-y-4 ${
                        !isRead
                          ? 'bg-gradient-to-r from-amber-50 via-amber-50/30 to-white border-amber-300 shadow-sm'
                          : 'bg-white border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            {!isRead && (
                              <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                                Baru
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider ${
                              ann.priority === 'mendesak' ? 'bg-rose-100 text-rose-800 border border-rose-200 font-black' :
                              ann.priority === 'penting' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                              'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}>
                              {ann.priority === 'mendesak' ? '🚨 Perhatian Mendesak' : ann.priority === 'penting' ? '⭐ Penting' : 'ℹ️ Info Mapel'}
                            </span>
                            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                              👨‍🏫 {ann.teacherName} ({ann.teacherSubject})
                            </span>
                          </div>

                          {!isRead ? (
                            <button
                              onClick={() => handleMarkAsRead(ann.id)}
                              className="bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-extrabold px-3 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer shadow-2xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Mengerti & Sudah Dibaca
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Sudah Anda baca
                            </span>
                          )}
                        </div>

                        <h4 className="font-extrabold text-slate-950 text-base">{ann.title}</h4>
                        <div className="text-xs text-slate-700 bg-slate-50/80 p-4 rounded-xl border border-slate-200/60 leading-relaxed font-medium">
                          {renderFormattedText(ann.content)}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Ditujukan untuk: <strong className="text-slate-600">{ann.targetType === 'all' ? 'Seluruh Siswa SMPN 1 Beji' : `Kelas ${ann.targetClassName}`}</strong></span>
                        <span>Diterbitkan: {new Date(ann.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MATERIALS BROWSER */}
      {activeTab === 'materials' && !examStarted && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Materi Pelajaran Aktif</h3>
            <p className="text-slate-500 text-xs mt-0.5">Daftar buku pegangan, PDF ringkasan, dan materi video pembelajaran resmi untuk kelas Anda.</p>
          </div>

          {classMaterials.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl">
              <p className="text-slate-400 text-xs">Belum ada materi pembelajaran aktif untuk kelas Anda saat ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classMaterials.map((mat) => {
                const subjectName = subjects.find(s => s.id === mat.subjectId)?.name || 'Mata Pelajaran';
                const teacherName = mat.teacherId
                  ? teachers.find(t => t.id === mat.teacherId)?.name
                  : teachers.find(t => (t.subject || '').split(',').map(s => s.trim().toLowerCase()).includes(subjectName.toLowerCase()))?.name || 'Guru Mapel';

                return (
                  <div key={mat.id} className="border border-slate-100 rounded-2xl p-5 hover:shadow-md transition bg-slate-50/50 flex flex-col justify-between space-y-4 animate-fade-in">
                    <div className="space-y-2">
                      <span className={`px-2 py-0.5 rounded font-bold text-[9px] ${
                        mat.fileType === 'PDF' ? 'bg-red-50 text-red-700 border border-red-100' :
                        mat.fileType === 'Video' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      }`}>
                        {mat.fileType}
                      </span>
                      <h4 className="font-bold text-slate-950 text-sm leading-snug">{mat.title}</h4>

                      {/* INFO MAPEL & GURU */}
                      <div className="pt-2.5 space-y-1.5 text-slate-600 text-[11px] border-t border-slate-150/50 mt-2.5">
                        <div className="flex items-center gap-1.5 font-medium">
                          <GraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>Mapel: <strong className="text-slate-800">{subjectName}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Guru: <span className="font-semibold text-slate-700">{teacherName}</span></span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-200/60 pt-3 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 block">Siswa {currentStudent.className}</span>
                      {mat.fileType === 'Article' ? (
                        <button
                          onClick={() => setActiveMaterial(mat)}
                          className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" /> Baca Artikel
                        </button>
                      ) : (
                        <a
                          href={mat.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" /> Buka Materi
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ARTICLE VIEWER MODAL */}
      {activeMaterial && activeMaterial.fileType === 'Article' && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 z-[100] animate-fade-in">
          <div className="bg-white w-full max-w-4xl h-full max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 rounded-xl">
                  <FileText className="w-5 h-5 text-indigo-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 leading-tight">{activeMaterial.title}</h3>
                  <p className="text-xs font-semibold text-slate-500">Materi Artikel</p>
                </div>
              </div>
              <button
                onClick={() => setActiveMaterial(null)}
                className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-50">
              <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-xs border border-slate-100">
                <div className="prose prose-slate prose-sm sm:prose-base prose-indigo max-w-none">
                  <div 
                    dangerouslySetInnerHTML={{ __html: activeMaterial.content || '' }} 
                    className="quill-content"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EXAMS CBT SELECTOR */}
      {activeTab === 'exams' && !examStarted && !scoreResult && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Daftar Soal Evaluasi & Ujian CBT</h3>
            <p className="text-slate-500 text-xs mt-0.5">Selesaikan Soal Ujian / Soal Evaluasi</p>
          </div>

          {classExams.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl">
              <p className="text-slate-400 text-xs">Belum ada paket ujian CBT yang dirilis untuk kelas Anda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {classExams.map((exam) => {
                const subjectName = subjects.find(s => s.id === exam.subjectId)?.name || 'Mata Pelajaran';
                const teacherName = exam.teacherId
                  ? teachers.find(t => t.id === exam.teacherId)?.name
                  : teachers.find(t => (t.subject || '').split(',').map(s => s.trim().toLowerCase()).includes(subjectName.toLowerCase()))?.name || 'Guru Mapel';

                return (
                  <div key={exam.id} className="border border-slate-100 rounded-2xl p-5 hover:border-slate-200 transition bg-slate-50/50 flex flex-col justify-between space-y-4 animate-fade-in">
                    <div className="space-y-1">
                      <span className="bg-indigo-50 text-indigo-700 text-[9px] font-bold px-2 py-0.5 rounded border border-indigo-100">
                        CBT Simulator
                      </span>
                      <h4 className="font-extrabold text-slate-950 text-base mt-2 leading-snug">{exam.title}</h4>

                      {/* INFO MAPEL & GURU CBT */}
                      <div className="pt-2.5 space-y-1.5 text-slate-600 text-[11px] border-t border-slate-150/50 mt-2.5">
                        <div className="flex items-center gap-1.5 font-medium">
                          <GraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>Mapel: <strong className="text-slate-800">{subjectName}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Guru: <span className="font-semibold text-slate-700">{teacherName}</span></span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-y border-slate-200/50 py-3 text-xs">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                        <div>
                          <span className="text-slate-400 text-[10px] block">Waktu</span>
                          <strong className="text-slate-800">{exam.durationMinutes} Menit</strong>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                        <div>
                          <span className="text-slate-400 text-[10px] block">Soal</span>
                          <strong className="text-slate-800">{exam.questions.length} Butir Soal</strong>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Masukkan Token Kunci Ujian *</label>
                        <input
                          type="text"
                          placeholder="Contoh: MTK7"
                          value={tokenInput}
                          onChange={(e) => setTokenInput(e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs uppercase font-mono font-bold"
                        />
                      </div>

                      {tokenError && (
                        <p className="text-[11px] text-red-600 font-bold">{tokenError}</p>
                      )}

                      <button
                        onClick={() => handleStartExam(exam)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                      >
                        <Key className="w-3.5 h-3.5" /> Kerjakan Ujian Sekarang
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CORE CBT EXAM RUNNING VIEW */}
      {examStarted && activeExam && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start select-none">
          {/* LEFT SIDE - QUESTIONS & INPUTS */}
          <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="font-extrabold text-slate-900 text-base">{activeExam.title}</h3>
              <span className="text-xs bg-red-50 text-red-700 font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-red-100 animate-pulse">
                <ShieldAlert className="w-4 h-4 text-red-600" /> Anti-Contek Aktif
              </span>
            </div>

            {/* Questions loop */}
            <div className="space-y-8">
              {activeExam.questions.map((q, idx) => {
                return (
                  <div key={q.id} className="space-y-4 border-b border-slate-100 pb-6 last:border-b-0">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-extrabold text-xs flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] bg-slate-100 font-bold px-2 py-0.5 rounded text-slate-600">
                            {q.type === 'PilihanGanda' ? 'Pilihan Ganda Standar' :
                             q.type === 'PilihanGandaKompleks' ? 'Pilihan Ganda Kompleks (Multi)' :
                             q.type === 'PilihanAsosiatif' ? 'Pilihan Asosiatif (1,2,3,4)' :
                             'Pilihan Sebab-Akibat'}
                          </span>
                          {q.score !== undefined && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-100">
                              Bobot Skor: {q.score}
                            </span>
                          )}
                        </div>
                        <div className="text-slate-900 text-sm mt-1.5">
                          {renderFormattedText(q.questionText, q.fontPreset)}
                        </div>
                        
                        {/* RENDERING EMBEDDED MEDIA (Gambar, Video, Suara) */}
                        {q.mediaType && q.mediaType !== 'None' && q.mediaUrl && (
                          <div className="mt-3 max-w-full sm:max-w-md bg-slate-50 border border-slate-200/50 p-2 rounded-2xl">
                            {q.mediaType === 'Image' && (
                              <img 
                                src={q.mediaUrl} 
                                alt="Stimulus Soal" 
                                className="rounded-xl max-h-64 object-contain mx-auto border bg-white"
                                referrerPolicy="no-referrer"
                              />
                            )}
                            {q.mediaType === 'Video' && (
                              <div className="aspect-video w-full rounded-xl overflow-hidden border bg-black">
                                <iframe
                                  src={q.mediaUrl.includes('youtube.com/watch') 
                                    ? q.mediaUrl.replace('watch?v=', 'embed/') 
                                    : q.mediaUrl}
                                  title="Video Stimulus Soal"
                                  className="w-full h-full border-0"
                                  allowFullScreen
                                />
                              </div>
                            )}
                            {q.mediaType === 'Audio' && (
                              <div className="p-2 bg-white rounded-xl border">
                                <audio 
                                  src={q.mediaUrl} 
                                  controls 
                                  className="w-full"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* RENDERING OPTION SELECTION BY TYPE */}
                    {q.type === 'PilihanGanda' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-8 text-xs font-semibold">
                        {q.options.map((opt, oIdx) => {
                          const optionLetter = String.fromCharCode(65 + oIdx);
                          const isSelected = studentAnswers[q.id] === optionLetter;
                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleSelectAnswer(q.id, optionLetter)}
                              className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-3 ${
                                isSelected 
                                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold' 
                                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border font-bold flex-shrink-0 ${
                                isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-500 border-slate-200'
                              }`}>
                                {optionLetter}
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {q.type === 'PilihanGandaKompleks' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-8 text-xs font-semibold">
                        {q.options.map((opt, oIdx) => {
                          const currentSelection = (studentAnswers[q.id] as string[]) || [];
                          const isSelected = currentSelection.includes(opt);
                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleSelectMultipleAnswer(q.id, opt, !isSelected)}
                              className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-3 ${
                                isSelected 
                                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold' 
                                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] border font-bold flex-shrink-0 ${
                                isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-500 border-slate-200'
                              }`}>
                                {isSelected ? '✓' : ''}
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {q.type === 'PilihanAsosiatif' && (
                      <div className="space-y-3 pl-8">
                        {/* Interactive checkbox helper preview */}
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
                          <p className="font-bold text-slate-700 mb-1">Simulasikan Pilihan Kombinasi Anda:</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-semibold">
                            {q.statements.map((st, sIdx) => {
                              const currentSelectedCombination = (studentAnswers[`aso_helper_${q.id}`] as number[]) || [];
                              const isChecked = currentSelectedCombination.includes(sIdx + 1);

                              const toggleVal = () => {
                                let nextCombination: number[];
                                if (isChecked) {
                                  nextCombination = currentSelectedCombination.filter(v => v !== sIdx + 1);
                                } else {
                                  nextCombination = [...currentSelectedCombination, sIdx + 1].sort();
                                }
                                handleSelectAnswer(`aso_helper_${q.id}`, nextCombination);
                                
                                // Automatically compute matching choice (A, B, C, D, E) for the student
                                const has1 = nextCombination.includes(1);
                                const has2 = nextCombination.includes(2);
                                const has3 = nextCombination.includes(3);
                                const has4 = nextCombination.includes(4);
                                const len = nextCombination.length;

                                let computedKey = '';
                                if (has1 && has2 && has3 && len === 3) computedKey = 'A';
                                else if (has1 && has3 && len === 2) computedKey = 'B';
                                else if (has2 && has4 && len === 2) computedKey = 'C';
                                else if (has4 && len === 1) computedKey = 'D';
                                else if (has1 && has2 && has3 && has4 && len === 4) computedKey = 'E';

                                handleSelectAnswer(q.id, computedKey);
                              };

                              return (
                                <button
                                  type="button"
                                  key={sIdx}
                                  onClick={toggleVal}
                                  className={`p-2 rounded-lg border text-[10px] text-center transition cursor-pointer ${
                                    isChecked ? 'bg-indigo-600 text-white border-indigo-600 font-bold' : 'bg-white border-slate-200'
                                  }`}
                                >
                                  Pernyataan ({sIdx + 1}) {isChecked ? '✓' : ''}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* ANBK evaluation choices */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-semibold">
                          {['A', 'B', 'C', 'D', 'E'].map(choice => {
                            const isSelected = studentAnswers[q.id] === choice;
                            return (
                              <button
                                key={choice}
                                onClick={() => handleSelectAnswer(q.id, choice)}
                                className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-3 ${
                                  isSelected 
                                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold' 
                                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border font-bold flex-shrink-0 ${
                                  isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-500 border-slate-200'
                                }`}>
                                  {choice}
                                </span>
                                <span className="text-[10px] text-slate-600 leading-snug">
                                  {choice === 'A' && 'A: jika (1), (2), dan (3) benar'}
                                  {choice === 'B' && 'B: jika (1) dan (3) benar'}
                                  {choice === 'C' && 'C: jika (2) dan (4) benar'}
                                  {choice === 'D' && 'D: jika hanya (4) yang benar'}
                                  {choice === 'E' && 'E: jika semuanya (1,2,3,4) benar'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {q.type === 'Uraian' && (
                      <div className="space-y-3 pl-8">
                        <textarea
                          placeholder="Ketikkan jawaban Anda di sini..."
                          value={studentAnswers[q.id] || ''}
                          onChange={(e) => handleSelectAnswer(q.id, e.target.value)}
                          className="w-full h-32 px-4 py-3 border border-indigo-200 rounded-xl text-sm font-medium text-slate-800 bg-indigo-50/20 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-y"
                        />
                      </div>
                    )}

                    {q.type === 'SebabAkibat' && (
                      <div className="space-y-3 pl-8">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1 text-slate-600">
                          <p><strong>Pernyataan:</strong> "{q.statement}"</p>
                          <p><strong>Alasan:</strong> "{q.reason}"</p>
                        </div>

                        <div className="grid grid-cols-1 gap-2.5 text-xs font-semibold">
                          {['A', 'B', 'C', 'D', 'E'].map(choice => {
                            const isSelected = studentAnswers[q.id] === choice;
                            return (
                              <button
                                key={choice}
                                onClick={() => handleSelectAnswer(q.id, choice)}
                                className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-3 ${
                                  isSelected 
                                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold' 
                                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border font-bold flex-shrink-0 ${
                                  isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-500 border-slate-200'
                                }`}>
                                  {choice}
                                </span>
                                <span className="text-[10px] text-slate-600 leading-snug">
                                  {choice === 'A' && 'A: Pernyataan BENAR, Alasan BENAR, keduanya ada Hubungan Sebab-Akibat.'}
                                  {choice === 'B' && 'B: Pernyataan BENAR, Alasan BENAR, keduanya TIDAK ada Hubungan Sebab-Akibat.'}
                                  {choice === 'C' && 'C: Pernyataan BENAR, Alasan SALAH.'}
                                  {choice === 'D' && 'D: Pernyataan SALAH, Alasan BENAR.'}
                                  {choice === 'E' && 'E: Pernyataan dan Alasan keduanya SALAH.'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submission button */}
            <button
              onClick={handleEvaluateExam}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-2xl transition cursor-pointer text-sm shadow-md flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Selesaikan & Kirim Ujian ke Server
            </button>
          </div>

          {/* RIGHT SIDE - TIMERS & STATS */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-center space-y-4 lg:sticky lg:top-24">
              <span className="text-slate-400 font-bold text-xs uppercase tracking-wider block">Sisa Waktu Ujian</span>
              <span className="text-4xl font-mono font-black text-slate-900 tracking-tight block">
                {formatTime(timerSeconds)}
              </span>

              <div className="border-t border-slate-200/60 pt-4 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-500">
                  <span>Nama Peserta</span>
                  <span className="font-bold text-slate-800">{currentStudent.name}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>NIS Siswa</span>
                  <span className="font-mono font-bold text-slate-800">{currentStudent.nis}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Kelas Ujian</span>
                  <span className="font-bold text-slate-800">{currentStudent.className}</span>
                </div>
              </div>

              {cheatingAttempts > 0 && (
                <div className="p-3 bg-red-50 text-red-800 text-[11px] font-bold rounded-xl border border-red-100 space-y-1">
                  <p className="flex items-center gap-1 justify-center">
                    <ShieldAlert className="w-4 h-4 text-red-600 animate-bounce" />
                    PERINGATAN DETEKSI
                  </p>
                  <p className="font-medium text-red-600">Anda tercatat keluar dari tab ujian sebanyak {cheatingAttempts}x!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SCORE RESULTS DISPLAY */}
      {scoreResult && activeExam && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 max-w-2xl mx-auto space-y-6 text-center animate-fade-in">
          <div className="space-y-2">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
            <h3 className="text-2xl font-black text-slate-950">Ujian Berhasil Dikirim ke Google Sheets!</h3>
            <p className="text-slate-500 text-sm">Evaluasi pengerjaan Anda telah selesai dinilai secara otomatis di server.</p>
          </div>

          <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-100 max-w-sm mx-auto space-y-4">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Nilai Hasil Belajar</span>
            <span className="text-6xl font-black text-indigo-700 block">{scoreResult.score}</span>
            <p className="text-xs text-slate-500">
              Menjawab benar <strong>{scoreResult.totalPoints}</strong> dari total <strong>{scoreResult.maxPoints}</strong> butir soal.
            </p>
          </div>

          {cheatingAttempts > 0 ? (
            <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-200 inline-block font-semibold">
              Log Ujian mencatat {cheatingAttempts} kali pemindahan fokus tab browser. Tetaplah jujur di ujian berikutnya!
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 inline-block font-semibold flex items-center gap-1.5 justify-center">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Sangat Bagus! Anda mengerjakan dengan integritas tinggi (0 pelanggaran tab).
            </div>
          )}

          <button
            onClick={() => {
              setScoreResult(null);
              setActiveExam(null);
              setTokenInput('');
              setActiveTab('exams');
            }}
            className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold text-sm py-3 rounded-xl transition cursor-pointer"
          >
            Kembali ke Dashboard Siswa
          </button>
        </div>
      )}

      {/* CHEATING ALERT MODAL */}
      {showCheatModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 w-full max-w-md p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-slate-950 text-base">Terdeteksi Berpindah Tab!</h3>
              <p className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded border border-red-100">
                Peringatan: {cheatingAttempts}x Pelanggaran Terpantau
              </p>
              <p className="text-slate-500 text-xs leading-relaxed mt-2">
                Sistem CBT ANBK melacak aktivitas tab browser. Kejadian keluar jendela atau membuka tab lain otomatis dicatat di database Spreadsheet pengawas.
              </p>
            </div>

            <button
              onClick={() => setShowCheatModal(false)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
            >
              Saya Mengerti & Kembali Mengerjakan
            </button>
          </div>
        </div>
      )}

      {/* SCORES HISTORY */}
      {activeTab === 'scores' && !examStarted && !scoreResult && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Riwayat Nilai & Evaluasi</h3>
            <p className="text-slate-500 text-xs mt-0.5">Daftar nilai ujian dan tugas yang telah Anda kerjakan</p>
          </div>

          {(() => {
            const mySubmissions = submissions.filter(sub => sub.studentNis === currentStudent.nis);
            
            if (mySubmissions.length === 0) {
              return (
                <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl">
                  <p className="text-slate-400 text-xs">Anda belum memiliki riwayat nilai.</p>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {mySubmissions.map((sub) => {
                  const subjectName = subjects.find(s => s.id === exams.find(e => e.id === sub.examId)?.subjectId)?.name || 'Mata Pelajaran';
                  
                  return (
                    <div key={sub.id} className="border border-slate-100 rounded-2xl p-5 hover:border-slate-200 transition bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded">
                            {subjectName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(sub.submittedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{sub.examTitle}</h4>
                      </div>
                      <div className="bg-white px-5 py-3 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center min-w-[100px]">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Nilai Akhir</span>
                        <span className={`text-2xl font-black ${sub.score >= 75 ? 'text-green-600' : 'text-rose-600'}`}>
                          {sub.score}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* POPUP MODAL NOTIFIKASI UPON LOGIN (IF UNREAD EXISTS) */}
      {showPopNotification && !examStarted && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-amber-300 w-full max-w-lg p-6 space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <Bell className="w-6 h-6 text-amber-600 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-950 text-base">Notifikasi Catatan Guru Mapel</h3>
                  <p className="text-[11px] text-amber-800 font-semibold">Ada {unreadCount} pesan baru yang perlu Anda perhatikan hari ini</p>
                </div>
              </div>
              <button
                onClick={() => setShowPopNotification(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {studentAnnouncements
                .filter(a => !readAnnouncements.includes(a.id))
                .slice(0, 3)
                .map(ann => (
                  <div key={ann.id} className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-indigo-700 text-xs">👨‍🏫 {ann.teacherName} ({ann.teacherSubject})</span>
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                        {ann.priority === 'mendesak' ? '🚨 Mendesak' : '⭐ Info Baru'}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{ann.title}</h4>
                    <p className="text-xs text-slate-700 bg-white/90 p-2.5 rounded-lg border border-amber-100 leading-relaxed">
                      {ann.content}
                    </p>
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleMarkAsRead(ann.id)}
                        className="text-[11px] font-extrabold text-amber-800 bg-amber-200/60 hover:bg-amber-300 px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mengerti & Sudah Dibaca
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Semua catatan juga tersimpan di tab Beranda</span>
              <button
                onClick={() => {
                  studentAnnouncements.forEach(a => handleMarkAsRead(a.id));
                  setShowPopNotification(false);
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer shadow-md"
              >
                Tutup & Masuk Ke Beranda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
