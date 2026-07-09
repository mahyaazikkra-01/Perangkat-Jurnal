export interface SchoolConfig {
  logoUrl: string;
  headerAppName: string;
  headerSubtitle: string;
  landingTopTag: string;
  landingTitle: string;
  landingDescription: string;
  footerText: string;
  adminPassword?: string;
}

export interface Teacher {
  id: string;
  name: string;
  nip: string;
  email: string;
  subject: string;
  photoUrl: string;
  password?: string;
}

export interface ClassItem {
  id: string;
  name: string;
}

export interface SubjectItem {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  nis: string;
  name: string;
  email: string;
  classId: string;
  className?: string;
  password?: string;
  status?: 'Aktif' | 'Lulus' | 'Pindah';
  archivedAt?: string;
}

export interface Material {
  id: string;
  title: string;
  classId: string | string[];
  subjectId: string;
  fileType: 'PDF' | 'Video' | 'Link' | 'Article';
  fileUrl: string;
  content?: string; // Rich text content if fileType is Article
  status: 'Aktif' | 'Draft';
  teacherId: string;
  createdAt: string;
}

export interface AttendanceStatus {
  studentId: string;
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';
}

export interface JournalEntry {
  id: string;
  date: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  topic: string;
  learningObjectives?: string;
  notes: string;
  startPeriod?: number;
  endPeriod?: number;
  attendance: AttendanceStatus[];
}

export type QuestionType = 
  | 'PilihanGanda' 
  | 'PilihanGandaKompleks' 
  | 'PilihanAsosiatif' 
  | 'SebabAkibat';

export interface BaseQuestion {
  id: string;
  questionText: string;
  type: QuestionType;
  mediaUrl?: string;
  mediaType?: 'Image' | 'Video' | 'Audio' | 'None';
  score?: number;
  fontPreset?: 'Sans' | 'Serif' | 'Grotesk' | 'Mono';
}

export interface PilihanGandaQuestion extends BaseQuestion {
  type: 'PilihanGanda';
  options: string[]; // ['A', 'B', 'C', 'D']
  correctAnswer: string; // 'A'
}

export interface PilihanGandaKompleksQuestion extends BaseQuestion {
  type: 'PilihanGandaKompleks';
  options: string[]; // ['Opsi A', 'Opsi B', 'Opsi C']
  correctAnswers: string[]; // ['Opsi A', 'Opsi C']
}

export interface PilihanAsosiatifQuestion extends BaseQuestion {
  type: 'PilihanAsosiatif';
  statements: string[]; // ['(1) Pernyataan 1', '(2) Pernyataan 2', '(3) Pernyataan 3', '(4) Pernyataan 4']
  correctCombination: number[]; // [1, 3] or [1, 2, 3] or [4]
  // GAS evaluation logic:
  // 1, 2, 3 benar -> A
  // 1, 3 benar -> B
  // 2, 4 benar -> C
  // Hanya 4 benar -> D
  // Semua benar -> E
}

export interface SebabAkibatQuestion extends BaseQuestion {
  type: 'SebabAkibat';
  statement: string; // Pernyataan pertama
  reason: string; // Pernyataan kedua (Sebab)
  correctStatementTrue: boolean; // Apakah pernyataan benar?
  correctReasonTrue: boolean; // Apakah alasan benar?
  correctCausality: boolean; // Apakah ada hubungan sebab-akibat?
}

export type ExamQuestion = 
  | PilihanGandaQuestion 
  | PilihanGandaKompleksQuestion 
  | PilihanAsosiatifQuestion 
  | SebabAkibatQuestion;

export interface QuestionBank {
  id: string;
  title: string;
  subjectId: string;
  teacherId: string;
  questions: ExamQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface Exam {
  id: string;
  title: string;
  classId: string;
  subjectId: string;
  token: string;
  durationMinutes: number;
  questions: ExamQuestion[];
  createdAt: string;
  teacherId?: string;
}

export interface CheatLog {
  id: string;
  studentName: string;
  studentNis: string;
  className: string;
  examTitle: string;
  timestamp: string;
  violationType: string;
}

export interface ExamSubmission {
  id: string;
  examId: string;
  examTitle: string;
  studentName: string;
  studentNis: string;
  className: string;
  score: number;
  submittedAt: string;
  answers: {
    questionId: string;
    studentAnswer: any; // Format varies by type
    isCorrect: boolean;
    pointsEarned: number;
  }[];
  cheatingAttempts: number;
}

export interface TeacherScheduleNote {
  id: string;
  teacherId: string;
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jum\'at' | 'Sabtu';
  jamKe: string;
  classId: string;
  className: string;
  room?: string;
  note: string;
}

export interface TeacherAnnouncement {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherSubject: string;
  targetType: 'all' | 'class';
  targetClassId?: string;
  targetClassName?: string;
  title: string;
  content: string;
  priority: 'normal' | 'penting' | 'mendesak';
  createdAt: string;
  isActive: boolean;
}

export interface RegistrationRequest {
  id: string;
  role: 'Teacher' | 'Student';
  name: string;
  identifier: string; // NIP for Teacher, NIS for Student
  passwordOrEmail: string; // password/email
  subjectOrClass: string; // Mata Pelajaran or Kelas
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

export interface ShareRequest {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  itemId: string; // Material ID or QuestionBank ID
  itemType: 'Material' | 'QuestionBank';
  itemTitle: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  createdAt: string;
}



export interface GlobalAnnouncement {
  id: string;
  title: string;
  content: string;
  targetRole: 'All' | 'Teacher' | 'Student';
  createdAt: string;
}

export interface GlobalAnnouncement {
  id: string;
  title: string;
  content: string;
  targetRole: 'Teacher' | 'Student' | 'All';
  priority: 'info' | 'penting' | 'mendesak';
  createdAt: string;
}
