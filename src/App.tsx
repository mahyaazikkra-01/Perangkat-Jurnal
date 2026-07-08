import React, { useState, useEffect } from 'react';
import { 
  Teacher, Student, ClassItem, SubjectItem, Material, JournalEntry, Exam, CheatLog, ExamSubmission, TeacherAnnouncement, RegistrationRequest, SchoolConfig, QuestionBank 
} from './types';
import AdminPanel from './components/AdminPanel';
import TeacherPanel from './components/TeacherPanel';
import StudentPanel from './components/StudentPanel';
import GasScriptHub from './components/GasScriptHub';
import { syncCollection, addDocument, deleteDocument, updateDocument, syncConfig, saveConfig } from './firebaseSync';
import { 
  Database, UserCheck, BookOpen, GraduationCap, ShieldAlert, Award, FileCode, CheckCircle2, ChevronRight, LogIn, UserPlus, Clock, CheckCircle, XCircle
} from 'lucide-react';

const DEFAULT_SCHOOL_CONFIG: SchoolConfig = {
  logoUrl: '',
  headerAppName: 'E-LEARNING & JURNAL',
  headerSubtitle: 'SMPN 1 BEJI, Kab. Pasuruan',
  landingTopTag: 'Jurnal Mengajar dan E-Learning',
  landingTitle: 'Sistem Manajemen Mengajar & E-Learning SMPN 1 BEJI',
  landingDescription: 'Aplikasi Komprehensif untuk membantu Guru dan Siswa dalam Pembelajaran dan Materi serta Ujian/Tugas & Evaluasi.',
  footerText: '© 2026 E-Learning/E-Jurnal SMPN 1 BEJI, Kab. Pasuruan.'
};

// === INITIAL SEED DATA ===
const SEED_CLASSES: ClassItem[] = [
  { id: 'class-1', name: 'VII-A' },
  { id: 'class-2', name: 'VIII-B' },
  { id: 'class-3', name: 'IX-C' }
];

const SEED_SUBJECTS: SubjectItem[] = [
  { id: 'subj-1', name: 'Matematika' },
  { id: 'subj-2', name: 'IPA (Sains)' },
  { id: 'subj-3', name: 'Bahasa Indonesia' },
  { id: 'subj-4', name: 'Bahasa Inggris' }
];

const SEED_TEACHERS: Teacher[] = [
  { 
    id: 't-1', 
    name: 'Drs. Bambang Wijaya, M.Pd.', 
    nip: '198503122011011002', 
    email: 'bambang.wijaya@smp.sch.id', 
    subject: 'Matematika', 
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop' 
  },
  { 
    id: 't-2', 
    name: 'Siti Rahmawati, S.Pd.', 
    nip: '199108152018022003', 
    email: 'siti.rahma@smp.sch.id', 
    subject: 'IPA (Sains)', 
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop' 
  },
  { 
    id: 't-3', 
    name: 'Eko Prasetyo, S.Hum.', 
    nip: '198801242015031001', 
    email: 'eko.prasetyo@smp.sch.id', 
    subject: 'Bahasa Indonesia', 
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop' 
  }
];

const SEED_STUDENTS: Student[] = [
  { id: 's-1', nis: '10241', name: 'Aditya Pratama', email: 'aditya@smp.sch.id', classId: 'class-1' },
  { id: 's-2', nis: '10242', name: 'Budi Santoso', email: 'budi@smp.sch.id', classId: 'class-1' },
  { id: 's-3', nis: '10243', name: 'Citra Lestari', email: 'citra@smp.sch.id', classId: 'class-1' },
  { id: 's-4', nis: '20241', name: 'Dewi Safitri', email: 'dewi@smp.sch.id', classId: 'class-2' },
  { id: 's-5', nis: '20242', name: 'Fajar Nugraha', email: 'fajar@smp.sch.id', classId: 'class-2' },
  { id: 's-6', nis: '20243', name: 'Gita Amanda', email: 'gita@smp.sch.id', classId: 'class-2' },
  { id: 's-7', nis: '30241', name: 'Hendra Wijaya', email: 'hendra@smp.sch.id', classId: 'class-3' },
  { id: 's-8', nis: '30242', name: 'Indah Permata', email: 'indah@smp.sch.id', classId: 'class-3' },
  { id: 's-9', nis: '30243', name: 'Kevin Sanjaya', email: 'kevin@smp.sch.id', classId: 'class-3' }
];

const SEED_MATERIALS: Material[] = [
  {
    id: 'm-1',
    title: 'Sistem Aljabar Linier Dua Variabel - Pertemuan 1',
    classId: 'class-1',
    subjectId: 'subj-1',
    fileType: 'PDF',
    fileUrl: 'https://drive.google.com/file/d/simulated_aljabar_pdf/view',
    status: 'Aktif',
    teacherId: 't-1',
    createdAt: new Date().toISOString()
  },
  {
    id: 'm-2',
    title: 'Video Pembelajaran: Proses Fotosintesis & Klorofil',
    classId: 'class-2',
    subjectId: 'subj-2',
    fileType: 'Video',
    fileUrl: 'https://drive.google.com/file/d/simulated_photosynthesis_video/view',
    status: 'Aktif',
    teacherId: 't-2',
    createdAt: new Date().toISOString()
  }
];

const SEED_EXAMS: Exam[] = [
  {
    id: 'ex-1',
    title: 'Ujian Simulasi ANBK - Evaluasi Aljabar VII-A',
    classId: 'class-1',
    subjectId: 'subj-1',
    token: 'ALJB7',
    durationMinutes: 20,
    createdAt: new Date().toISOString(),
    teacherId: 't-1',
    questions: [
      {
        id: 'q-1',
        questionText: 'Jika nilai x + 3 = 10, tentukan nilai dari 2x - 5.',
        type: 'PilihanGanda',
        options: ['5', '7', '9', '12'],
        correctAnswer: 'C' // '9'
      },
      {
        id: 'q-2',
        questionText: 'Manakah dari bangun datar berikut yang memiliki tepat 4 sumbu simetri?',
        type: 'PilihanGandaKompleks',
        options: ['Persegi Panjang', 'Persegi', 'Belah Ketupat', 'Segitiga Sama Sisi'],
        correctAnswers: ['Persegi']
      },
      {
        id: 'q-3',
        questionText: 'Perhatikan pernyataan relasi matematika di bawah ini:\n(1) Hasil dari 2 x 5 adalah 10\n(2) Bilangan 7 adalah bilangan genap\n(3) Sudut siku-siku besarnya 90 derajat\n(4) Ibu kota negara Indonesia adalah Surabaya\n\nManakah pernyataan yang benar?',
        type: 'PilihanAsosiatif',
        statements: [
          '(1) Hasil dari 2 x 5 adalah 10',
          '(2) Bilangan 7 adalah bilangan genap',
          '(3) Sudut siku-siku besarnya 90 derajat',
          '(4) Ibu kota negara Indonesia adalah Surabaya'
        ],
        correctCombination: [1, 3] // -> B (karena 1 dan 3 benar)
      },
      {
        id: 'q-4',
        questionText: 'Matahari terbit di sebelah timur.\nSEBAB\nBumi berotasi mengelilingi porosnya dari arah barat ke timur.',
        type: 'SebabAkibat',
        statement: 'Matahari terbit di sebelah timur.',
        reason: 'Bumi berotasi mengelilingi porosnya dari arah barat ke timur.',
        correctStatementTrue: true,
        correctReasonTrue: true,
        correctCausality: true // -> A (pernyataan benar, alasan benar, dan berhubungan kausalitas)
      }
    ]
  }
];

const SEED_JOURNALS: JournalEntry[] = [
  {
    id: 'j-1',
    date: new Date().toISOString().split('T')[0],
    classId: 'class-1',
    subjectId: 'subj-1',
    teacherId: 't-1',
    topic: 'Aljabar Linier Dasar & Penjumlahan Variabel',
    learningObjectives: 'Siswa dapat memahami konsep penjumlahan variabel aljabar dan mengaplikasikannya dalam penyelesaian persamaan linier sederhana.',
    notes: 'Siswa sangat aktif bertanya. Aditya Pratama perlu bimbingan khusus pada soal pecahan aljabar.',
    startPeriod: 2,
    endPeriod: 4,
    attendance: [
      { studentId: 's-1', status: 'Hadir' },
      { studentId: 's-2', status: 'Hadir' },
      { studentId: 's-3', status: 'Sakit' }
    ]
  },
  {
    id: 'j-2',
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    classId: 'class-1',
    subjectId: 'subj-1',
    teacherId: 't-1',
    topic: 'Pengenalan Sistem Persamaan Linier Dua Variabel (SPLDV)',
    learningObjectives: 'Siswa mampu mengidentifikasi komponen variabel dan konstanta dalam SPLDV.',
    notes: 'Pembelajaran berjalan kondusif dengan metode diskusi kelompok.',
    startPeriod: 5,
    endPeriod: 6,
    attendance: [
      { studentId: 's-1', status: 'Hadir' },
      { studentId: 's-2', status: 'Hadir' },
      { studentId: 's-3', status: 'Hadir' }
    ]
  }
];

const SEED_ANNOUNCEMENTS: TeacherAnnouncement[] = [
  {
    id: 'ann-1',
    teacherId: 't-1',
    teacherName: 'Drs. Bambang Wijaya, M.Pd.',
    teacherSubject: 'Matematika',
    targetType: 'all',
    title: '📢 Persiapan Ulangan Harian Aljabar & Persamaan Linier',
    content: 'Selamat datang siswa/i semua! Dimohon kepada seluruh siswa untuk mempelajari kembali latihan soal pada e-book materi Matematika di menu E-Learning. Ulangan harian akan dilaksanakan minggu depan via CBT secara online!',
    priority: 'penting',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'ann-2',
    teacherId: 't-1',
    teacherName: 'Drs. Bambang Wijaya, M.Pd.',
    teacherSubject: 'Matematika',
    targetType: 'class',
    targetClassName: 'VII-A',
    title: '💡 Tugas Kelompok Latihan Soal SPLDV Kelas VII-A',
    content: 'Khusus siswa kelas VII-A, harap mengumpulkan lembar diskusi kelompok sebelum jam pelajaran ke-5 selesai. Bagi yang mengalami kendala dapat bertanya langsung melalui panel kelas.',
    priority: 'normal',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    isActive: true
  },
  {
    id: 'ann-3',
    teacherId: 't-2',
    teacherName: 'Siti Rahmawati, S.Pd.',
    teacherSubject: 'IPA (Sains)',
    targetType: 'all',
    title: '🔬 Praktikum Biologi: Pengamatan Klorofil & Fotosintesis',
    content: 'Diberitahukan kepada seluruh siswa untuk membawa buku catatan praktikum dan jas laboratorium pada pertemuan IPA berikutnya. Jangan lupa menonton video pembelajaran fotosintesis di menu E-Learning!',
    priority: 'penting',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    isActive: true
  }
];

const SEED_REGISTRATIONS: RegistrationRequest[] = [
  {
    id: 'reg-1',
    role: 'Teacher',
    name: 'Rina Wulandari, S.Pd.',
    identifier: '199005142018012001',
    passwordOrEmail: 'guru123',
    subjectOrClass: 'Bahasa Indonesia',
    status: 'Pending',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'reg-2',
    role: 'Student',
    name: 'Bagus Setyawan',
    identifier: '10255',
    passwordOrEmail: 'bagus@smp.sch.id',
    subjectOrClass: 'VII-B',
    status: 'Pending',
    createdAt: new Date(Date.now() - 1800000).toISOString()
  }
];

export default function App() {
  // Navigation State
  const [activeMode, setActiveMode] = useState<'app' | 'gas'>('app');
  
  // Authentication Role State
  const [currentRole, setCurrentRole] = useState<'Guest' | 'Admin' | 'Teacher' | 'Student'>('Guest');
  const [activeUser, setActiveUser] = useState<any>(null);

  // Database States
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [cheatLogs, setCheatLogs] = useState<CheatLog[]>([]);
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  const [announcements, setAnnouncements] = useState<TeacherAnnouncement[]>([]);
  const [shareRequests, setShareRequests] = useState<ShareRequest[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationRequest[]>([]);
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(DEFAULT_SCHOOL_CONFIG);

  // Portal Tab & Registration Form states
  const [portalTab, setPortalTab] = useState<'login' | 'register'>('login');
  const [regRole, setRegRole] = useState<'Teacher' | 'Student'>('Teacher');
  const [regName, setRegName] = useState('');
  const [regIdentifier, setRegIdentifier] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSubjectOrClass, setRegSubjectOrClass] = useState('Matematika');

  // Manual Credentials inputs
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Load and seed DB on mount
  useEffect(() => {
    const unsubTeachers = syncCollection('teachers', setTeachers, SEED_TEACHERS);
    const unsubStudents = syncCollection('students', setStudents, SEED_STUDENTS);
    const unsubClasses = syncCollection('classes', setClasses, SEED_CLASSES);
    const unsubSubjects = syncCollection('subjects', setSubjects, SEED_SUBJECTS);
    const unsubMaterials = syncCollection('materials', setMaterials, SEED_MATERIALS);
    const unsubExams = syncCollection('exams', setExams, SEED_EXAMS);
    const unsubQuestionBanks = syncCollection('questionBanks', setQuestionBanks, []);
    const unsubJournals = syncCollection('journals', setJournals, SEED_JOURNALS);
    const unsubCheatLogs = syncCollection('cheatLogs', setCheatLogs, []);
    const unsubSubmissions = syncCollection('submissions', setSubmissions, []);
    const unsubAnnouncements = syncCollection('announcements', setAnnouncements, SEED_ANNOUNCEMENTS);
    const unsubRegistrations = syncCollection('registrations', setRegistrations, SEED_REGISTRATIONS);
    const unsubShareRequests = syncCollection('shareRequests', setShareRequests, []);
    const unsubSchoolConfig = syncConfig('schoolConfig', setSchoolConfig, DEFAULT_SCHOOL_CONFIG);

    return () => {
      unsubTeachers();
      unsubStudents();
      unsubClasses();
      unsubSubjects();
      unsubMaterials();
      unsubExams();
      unsubQuestionBanks();
      unsubJournals();
      unsubCheatLogs();
      unsubSubmissions();
      unsubAnnouncements();
      unsubRegistrations();
      unsubShareRequests();
      unsubSchoolConfig();
    };
  }, []);

  // --- DB OPERATIONAL PERSISTENCE HELPERS ---
  const saveSchoolConfigState = (updated: SchoolConfig) => {
    saveConfig('schoolConfig', updated);
  };

  const handleRegisterAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regIdentifier.trim() || !regPassword.trim()) return;

    // Check existing
    if (regRole === 'Teacher' && teachers.some(t => t.nip === regIdentifier.trim())) {
      alert('NIP sudah terdaftar di sistem!');
      return;
    }
    if (regRole === 'Student' && students.some(s => s.nis === regIdentifier.trim())) {
      alert('NIS sudah terdaftar di sistem!');
      return;
    }

    const newReg: RegistrationRequest = {
      id: `reg_${Math.random().toString(36).substring(7)}`,
      role: regRole,
      name: regName.trim(),
      identifier: regIdentifier.trim(),
      passwordOrEmail: regPassword.trim(),
      subjectOrClass: regSubjectOrClass,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    addDocument('registrations', newReg);
    alert('Permohonan pendaftaran akun Anda berhasil dikirim! Silakan menunggu persetujuan Admin Sekolah sebelum dapat masuk ke portal.');
    setRegName('');
    setRegIdentifier('');
    setRegPassword('');
    setPortalTab('login');
  };

  const handleApproveRegistration = (id: string) => {
    const reg = registrations.find(r => r.id === id);
    if (!reg) return;
    if (reg.role === 'Teacher') {
      handleAddTeacher({
        name: reg.name,
        nip: reg.identifier,
        email: reg.passwordOrEmail.includes('@') ? reg.passwordOrEmail : `${reg.identifier}@smp.sch.id`,
        password: reg.passwordOrEmail,
        subject: reg.subjectOrClass,
        photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
      });
    } else {
      const classObj = classes.find(c => c.name === reg.subjectOrClass) || classes[0];
      handleAddStudent({
        name: reg.name,
        nis: reg.identifier,
        email: reg.passwordOrEmail.includes('@') ? reg.passwordOrEmail : `${reg.identifier}@siswa.smp.sch.id`,
        password: reg.passwordOrEmail,
        classId: classObj ? classObj.id : 'class-1'
      });
    }
    updateDocument('registrations', { id, status: 'Approved' } as any);
    alert(`Pendaftaran akun ${reg.name} berhasil disetujui! Akun telah aktif dan ditambahkan ke database.`);
  };

  const handleRejectRegistration = (id: string) => {
    updateDocument('registrations', { id, status: 'Rejected' } as any);
  };

  // --- ACTIONS HANDLERS ---
  const handleAddStudent = (newSiswa: Omit<Student, 'id'>) => {
    const studentNode: Student = {
      ...newSiswa,
      id: `std_${Math.random().toString(36).substring(7)}`
    };
    addDocument('students', studentNode);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    updateDocument('students', updatedStudent);
  };

  const handleBulkAddStudents = (newStudentsList: Omit<Student, 'id'>[]) => {
    newStudentsList.forEach(item => {
      addDocument('students', {
        ...item,
        id: `std_${Math.random().toString(36).substring(7)}_${Math.random().toString(36).substring(7)}`
      });
    });
  };

  const handleDeleteStudent = (id: string) => {
    deleteDocument('students', id);
  };

  const handleAddClass = (className: string) => {
    const trimmed = className.trim();
    if (!trimmed) return;
    const exists = classes.some(c => c.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) return;
    const newClassNode: ClassItem = {
      id: `class_${Math.random().toString(36).substring(7)}`,
      name: trimmed
    };
    addDocument('classes', newClassNode);
  };

  const handleDeleteClass = (id: string) => {
    deleteDocument('classes', id);
  };

  const handleUpdateClass = (updatedClass: ClassItem) => {
    updateDocument('classes', updatedClass);
  };

  const handleDeleteSubject = (id: string) => {
    deleteDocument('subjects', id);
  };

  const handleUpdateSubject = (updatedSubject: SubjectItem) => {
    updateDocument('subjects', updatedSubject);
  };

  const handleDeleteTeacher = (id: string) => {
    deleteDocument('teachers', id);
  };

  const handleUpdateTeacher = (updatedTeacher: Teacher) => {
    updateDocument('teachers', updatedTeacher);
  };

  const handleUpdateMaterial = (updatedMat: Material) => {
    updateDocument('materials', updatedMat);
  };

  const handleDeleteMaterial = (id: string) => {
    const updated = materials.filter(m => m.id !== id);
    saveMaterialsState(updated);
  };

  const handleSaveExam = (newExam: Omit<Exam, 'id' | 'createdAt'>) => {
    const examNode: Exam = {
      ...newExam,
      id: `ex_${Math.random().toString(36).substring(7)}`,
      createdAt: new Date().toISOString()
    };
    addDocument('exams', examNode);
  };

  const handleUpdateExam = (updatedExam: Exam) => {
    updateDocument('exams', updatedExam);
  };

  const handleDeleteExam = (examId: string) => {
    deleteDocument('exams', examId);
  };

  const handleSaveQuestionBank = (bank: Omit<QuestionBank, 'id' | 'createdAt' | 'updatedAt'> | QuestionBank) => {
    if ('id' in bank) {
      updateDocument('questionBanks', { ...bank, updatedAt: new Date().toISOString() } as any);
    } else {
      const newNode: QuestionBank = {
        ...bank,
        id: `qb_${Math.random().toString(36).substring(7)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      addDocument('questionBanks', newNode);
    }
  };

  const handleDeleteQuestionBank = (id: string) => {
    deleteDocument('questionBanks', id);
  };

  const handleSaveJournal = (newEntry: Omit<JournalEntry, 'id'>) => {
    const entryNode: JournalEntry = {
      ...newEntry,
      id: `j_${Math.random().toString(36).substring(7)}`
    };
    addDocument('journals', entryNode);
  };

  const handleAddCheatLog = (log: Omit<CheatLog, 'id' | 'timestamp'>) => {
    const logNode: CheatLog = {
      ...log,
      id: `cl_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString()
    };
    addDocument('cheatLogs', logNode);
  };

  const handleSubmitExam = (sub: Omit<ExamSubmission, 'id' | 'submittedAt'>) => {
    const subNode: ExamSubmission = {
      ...sub,
      id: `sub_${Math.random().toString(36).substring(7)}`,
      submittedAt: new Date().toISOString()
    };
    addDocument('submissions', subNode);
  };

  const handleShareToTeacher = (request: Omit<ShareRequest, 'id' | 'createdAt'>) => {
    const newReq: ShareRequest = {
      ...request,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    addDocument('shareRequests', newReq);
  };

  const handleRespondShare = (requestId: string, response: 'Accepted' | 'Rejected') => {
    const req = shareRequests.find(r => r.id === requestId);
    if (req && req.status === 'Pending') {
      if (response === 'Accepted') {
        if (req.itemType === 'Material') {
          const mat = materials.find(m => m.id === req.itemId);
          if (mat) {
            const newMat = { ...mat, teacherId: req.receiverId, classId: [] };
            delete (newMat as any).id;
            delete (newMat as any).createdAt;
            handleSaveMaterial(newMat as any);
          }
        } else if (req.itemType === 'QuestionBank') {
          const qb = questionBanks.find(q => q.id === req.itemId);
          if (qb) {
            const newQb = { ...qb, teacherId: req.receiverId, updatedAt: new Date().toISOString() };
            delete (newQb as any).id;
            delete (newQb as any).createdAt;
            handleSaveQuestionBank(newQb as any);
          }
        }
      }
      updateDocument('shareRequests', { id: requestId, status: response } as any);
    }
  };

  const handleSaveAnnouncement = (newAnn: Omit<TeacherAnnouncement, 'id' | 'createdAt'>) => {
    const annNode: TeacherAnnouncement = {
      ...newAnn,
      id: `ann_${Math.random().toString(36).substring(7)}`,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    addDocument('announcements', annNode);
  };

  const handleDeleteAnnouncement = (id: string) => {
    deleteDocument('announcements', id);
  };

  const handleToggleAnnouncement = (id: string) => {
    const ann = announcements.find(a => a.id === id);
    if (ann) {
      updateDocument('announcements', { id, isActive: !ann.isActive } as any);
    }
  };


  // --- USER AUTHENTICATION HANDLERS ---
  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const user = usernameInput.trim();
    const pass = passwordInput.trim();

    if (user === 'admin' && pass === 'admin123') {
      setCurrentRole('Admin');
      setActiveUser({ name: 'Administrator Utama', username: 'admin' });
      return;
    }

    // Try Teacher check NIP
    const matchedTeacher = teachers.find(t => t.nip === user);
    const expectedTeacherPass = matchedTeacher?.password || 'guru123';
    if (matchedTeacher && pass === expectedTeacherPass) {
      setCurrentRole('Teacher');
      setActiveUser(matchedTeacher);
      return;
    }

    // Try Student check NIS
    const matchedStudent = students.find(s => s.nis === user);
    const expectedStudentPass = matchedStudent?.password || matchedStudent?.email || matchedStudent?.nis;
    if (matchedStudent && pass === expectedStudentPass) {
      setCurrentRole('Student');
      const className = SEED_CLASSES.find(c => c.id === matchedStudent.classId)?.name || 'N/A';
      setActiveUser({ ...matchedStudent, className });
      return;
    }

    setLoginError('Kredensial tidak valid! Periksa panduan akun default di bawah.');
  };

  const handleQuickLogin = (role: 'Admin' | 'Teacher' | 'Student', targetObj?: any) => {
    setLoginError('');
    if (role === 'Admin') {
      setCurrentRole('Admin');
      setActiveUser({ name: 'Administrator Utama', username: 'admin' });
    } else if (role === 'Teacher') {
      setCurrentRole('Teacher');
      setActiveUser(targetObj || teachers[0]);
    } else {
      setCurrentRole('Student');
      const student = targetObj || students[0];
      const className = SEED_CLASSES.find(c => c.id === student.classId)?.name || 'N/A';
      setActiveUser({ ...student, className });
    }
  };

  const handleLogout = () => {
    setCurrentRole('Guest');
    setActiveUser(null);
    setUsernameInput('');
    setPasswordInput('');
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col text-slate-800 antialiased font-sans">
      
      {/* APP HEADER */}
      <header className="bg-slate-900 text-white shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 flex-wrap gap-4 py-3 sm:py-0">
            {/* Title logo */}
            <div className="flex items-center gap-3">
              {schoolConfig.logoUrl ? (
                <img src={schoolConfig.logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md font-black text-lg">
                  {currentRole === 'Student' ? 'E' : 'J'}
                </div>
              )}
              <div>
                <h1 className="text-base font-extrabold tracking-tight uppercase">
                  {schoolConfig.headerAppName}
                </h1>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                  {schoolConfig.headerSubtitle}
                </p>
              </div>
            </div>

            {/* Mode toggler */}
            <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-bold shadow-inner">
              <button
                onClick={() => setActiveMode('app')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeMode === 'app'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Web App Simulator</span>
              </button>
              <button
                onClick={() => setActiveMode('gas')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeMode === 'gas'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Google Apps Script</span>
              </button>
            </div>

            {/* User status badge */}
            {currentRole !== 'Guest' && (
              <div className="flex items-center gap-3 bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700/60">
                <div className="text-right">
                  <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider block leading-none">
                    {currentRole === 'Teacher' ? 'Pengajar' : currentRole}
                  </span>
                  <span className="text-xs font-bold text-slate-200 block mt-0.5 max-w-[120px] truncate">
                    {activeUser?.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-lg transition cursor-pointer"
                >
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CORE WORKSPACE */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* IF GAS SCRIPT TAB IS ACTIVE */}
        {activeMode === 'gas' && <GasScriptHub />}

        {/* IF APP SIMULATOR TAB IS ACTIVE */}
        {activeMode === 'app' && (
          <div className="space-y-8">
            
            {/* GUEST LANDING & LOGIN */}
            {currentRole === 'Guest' && (
              <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Visual Intro */}
                <div className="lg:col-span-7 space-y-6 lg:py-6">
                  <span className="bg-indigo-50 text-indigo-700 font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-widest border border-indigo-100">
                    {schoolConfig.landingTopTag}
                  </span>
                  
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                    {schoolConfig.landingTitle}
                  </h2>
                  
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">
                    {schoolConfig.landingDescription}
                  </p>

                  {/* Feature lists */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                      <div>
                        <strong className="text-slate-950 font-bold">Jurnal Digital Guru</strong>
                        <p className="text-slate-400 mt-0.5">Catat kehadiran, topik KBM, dan kendala kelas dengan penyimpanan appendRow.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                      <div>
                        <strong className="text-slate-950 font-bold">Materi Terintegrasi Drive</strong>
                        <p className="text-slate-400 mt-0.5">Guru unggah PDF/materi ke Drive folder. Link terintegrasi asinkronus.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                      <div>
                        <strong className="text-slate-950 font-bold">Ujian / Tugas & Evaluasi</strong>
                        <p className="text-slate-400 mt-0.5">LMS Interaktif dengan 4 jenis soal evaluasi: Pilihan Ganda, Kompleks, Asosiatif, Sebab-Akibat.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                      <div>
                        <strong className="text-slate-950 font-bold">Sistem Anti-Contek Native</strong>
                        <p className="text-slate-400 mt-0.5">Deteksi blur window siswa otomatis mengirim log pelanggaran ke Spreadsheet.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secure Login & Register Form */}
                <div className="lg:col-span-5 bg-white border border-slate-200 shadow-lg rounded-3xl p-6 space-y-6">
                  {/* Tab Selector */}
                  <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                    <button
                      onClick={() => setPortalTab('login')}
                      className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        portalTab === 'login'
                          ? 'bg-white text-indigo-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <LogIn className="w-4 h-4" /> Masuk (Login)
                    </button>
                    <button
                      onClick={() => setPortalTab('register')}
                      className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        portalTab === 'register'
                          ? 'bg-white text-indigo-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <UserPlus className="w-4 h-4" /> Daftar Akun Baru
                    </button>
                  </div>

                  {portalTab === 'login' ? (
                    <>
                      <div className="space-y-1.5">
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                          <LogIn className="w-5 h-5 text-indigo-600" />
                          Masuk ke Portal Sekolah
                        </h3>
                        <p className="text-slate-400 text-xs">Masukkan kredensial Anda untuk mengakses database sistem.</p>
                      </div>

                      <form onSubmit={handleManualLogin} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-700">Username / NIP / NIS</label>
                          <input
                            type="text"
                            required
                            placeholder="Misal: admin, atau NIP guru, atau NIS siswa"
                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-700">Password / Email</label>
                          <input
                            type="password"
                            required
                            placeholder="admin123, atau guru123, atau email siswa"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        {loginError && (
                          <p className="text-xs text-red-600 font-bold leading-relaxed">{loginError}</p>
                        )}

                        <button
                          type="submit"
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition cursor-pointer text-sm shadow-xs"
                        >
                          Masuk Sistem
                        </button>
                      </form>

                      <div className="border-t border-slate-100 pt-4 space-y-2 text-[10px] text-slate-400">
                        <p className="font-bold text-slate-500 uppercase tracking-wide">Kunci Akun Pengujian Default:</p>
                        <ul className="list-disc pl-4 space-y-1 font-mono">
                          <li><strong>Admin:</strong> admin / admin123</li>
                          <li><strong>Guru (Bambang):</strong> 198503122011011002 / guru123</li>
                          <li><strong>Siswa (Aditya):</strong> 10241 / aditya@smp.sch.id</li>
                        </ul>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                          <UserPlus className="w-5 h-5 text-indigo-600" />
                          Pendaftaran Akun Baru
                        </h3>
                        <p className="text-slate-400 text-xs">Pendaftaran untuk Guru / Siswa yang belum memiliki akun. Akan disetujui oleh Admin Sekolah.</p>
                      </div>

                      <form onSubmit={handleRegisterAccount} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-700">Daftar Sebagai Peran</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => { setRegRole('Teacher'); setRegSubjectOrClass('Matematika'); }}
                              className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                                regRole === 'Teacher' ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'
                              }`}
                            >
                              👨‍🏫 Guru / Pengajar
                            </button>
                            <button
                              type="button"
                              onClick={() => { setRegRole('Student'); setRegSubjectOrClass('VII-A'); }}
                              className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                                regRole === 'Student' ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'
                              }`}
                            >
                              👨‍🎓 Siswa / Peserta Didik
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-700">Nama Lengkap beserta Gelar</label>
                          <input
                            type="text"
                            required
                            placeholder={regRole === 'Teacher' ? 'Contoh: Rina Wulandari, S.Pd.' : 'Contoh: Bagus Setyawan'}
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-700">
                            {regRole === 'Teacher' ? 'Nomor Induk Pegawai (NIP / NUPTK)' : 'Nomor Induk Siswa (NIS / NISN)'}
                          </label>
                          <input
                            type="text"
                            required
                            placeholder={regRole === 'Teacher' ? 'Contoh: 199005142018012001' : 'Contoh: 10255'}
                            value={regIdentifier}
                            onChange={(e) => setRegIdentifier(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-700">
                            {regRole === 'Teacher' ? 'Mata Pelajaran yang Diampu' : 'Pilih Kelas Siswa'}
                          </label>
                          {regRole === 'Teacher' ? (
                            <input
                              type="text"
                              required
                              placeholder="Contoh: Matematika, IPA, Bahasa Indonesia"
                              value={regSubjectOrClass}
                              onChange={(e) => setRegSubjectOrClass(e.target.value)}
                              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                            />
                          ) : (
                            <select
                              value={regSubjectOrClass}
                              onChange={(e) => setRegSubjectOrClass(e.target.value)}
                              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                              {classes.map(c => (
                                <option key={c.id} value={c.name}>{c.name}</option>
                              ))}
                            </select>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-700">
                            {regRole === 'Teacher' ? 'Buat Password Login' : 'Buat Password / Email Login'}
                          </label>
                          <input
                            type="text"
                            required
                            placeholder={regRole === 'Teacher' ? 'Contoh: guru123' : 'Contoh: bagus@smp.sch.id'}
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition cursor-pointer text-sm shadow-xs flex items-center justify-center gap-2"
                        >
                          <UserPlus className="w-4 h-4" /> Kirim Permohonan Pendaftaran
                        </button>
                      </form>

                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 font-medium">
                        ℹ️ <strong>Catatan:</strong> Setelah Anda mendaftar, Admin Sekolah dapat memverifikasi dan menyetujui akun Anda melalui menu persetujuan di halaman Admin.
                      </div>
                    </>
                  )}
                </div>

              </div>
            )}

            {/* ADMIN PANEL MOUNTED */}
            {currentRole === 'Admin' && (
              <AdminPanel
                teachers={teachers}
                students={students}
                classes={classes}
                subjects={subjects}
                journals={journals}
                cheatLogs={cheatLogs}
                submissions={submissions}
                registrations={registrations}
                schoolConfig={schoolConfig}
                onUpdateSchoolConfig={saveSchoolConfigState}
                onAddTeacher={handleAddTeacher}
                onDeleteTeacher={handleDeleteTeacher}
                onAddClass={handleAddClass}
                onDeleteClass={handleDeleteClass}
                onUpdateClass={handleUpdateClass}
                onAddSubject={handleAddSubject}
                onDeleteSubject={handleDeleteSubject}
                onUpdateSubject={handleUpdateSubject}
                onAddStudent={handleAddStudent}
                onDeleteStudent={handleDeleteStudent}
                onUpdateTeacher={handleUpdateTeacher}
                onUpdateStudent={handleUpdateStudent}
                onBulkAddStudents={handleBulkAddStudents}
                onApproveRegistration={handleApproveRegistration}
                onRejectRegistration={handleRejectRegistration}
              />
            )}

            {/* TEACHER PANEL MOUNTED */}
            {currentRole === 'Teacher' && activeUser && (
              <TeacherPanel
                currentTeacher={activeUser}
                classes={classes}
                subjects={subjects}
                students={students}
                materials={materials}
                exams={exams}
                questionBanks={questionBanks}
                journals={journals}
                submissions={submissions}
                announcements={announcements}
                shareRequests={shareRequests}
                teachers={teachers}
                onShareToTeacher={handleShareToTeacher}
                onRespondShare={handleRespondShare}
                onSaveMaterial={handleSaveMaterial}
                onUpdateMaterial={handleUpdateMaterial}
                onToggleMaterial={handleToggleMaterial}
                onDeleteMaterial={handleDeleteMaterial}
                onSaveExam={handleSaveExam}
                onUpdateExam={handleUpdateExam}
                onDeleteExam={handleDeleteExam}
                onSaveQuestionBank={handleSaveQuestionBank}
                onDeleteQuestionBank={handleDeleteQuestionBank}
                onSaveJournal={handleSaveJournal}
                onUpdateTeacher={handleUpdateTeacher}
                onSaveAnnouncement={handleSaveAnnouncement}
                onDeleteAnnouncement={handleDeleteAnnouncement}
                onToggleAnnouncement={handleToggleAnnouncement}
              />
            )}

            {/* STUDENT PANEL MOUNTED */}
            {currentRole === 'Student' && activeUser && (
              <StudentPanel
                currentStudent={activeUser}
                materials={materials}
                exams={exams}
                teachers={teachers}
                subjects={subjects}
                announcements={announcements}
                onAddCheatLog={handleAddCheatLog}
                onSubmitExam={handleSubmitExam}
              />
            )}

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-500 text-xs py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>
            {schoolConfig.footerText}
          </p>
          <div className="flex gap-4">
            <span className="text-indigo-400 font-bold">Vite 6 + React 19 + Tailwind CSS 4</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
