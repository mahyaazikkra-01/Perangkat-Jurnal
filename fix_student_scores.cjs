const fs = require('fs');
let content = fs.readFileSync('src/components/StudentPanel.tsx', 'utf8');

const propsTarget = `interface StudentPanelProps {
  currentStudent: Student;
  materials: Material[];
  exams: Exam[];
  teachers: Teacher[];
  subjects: SubjectItem[];
  announcements?: TeacherAnnouncement[];
  onAddCheatLog: (log: Omit<CheatLog, 'id' | 'timestamp'>) => void;
  onSubmitExam: (submission: Omit<ExamSubmission, 'id' | 'submittedAt'>) => void;
}`;

const propsReplacement = `interface StudentPanelProps {
  currentStudent: Student;
  materials: Material[];
  exams: Exam[];
  submissions?: ExamSubmission[];
  teachers: Teacher[];
  subjects: SubjectItem[];
  announcements?: TeacherAnnouncement[];
  onAddCheatLog: (log: Omit<CheatLog, 'id' | 'timestamp'>) => void;
  onSubmitExam: (submission: Omit<ExamSubmission, 'id' | 'submittedAt'>) => void;
}`;
content = content.replace(propsTarget, propsReplacement);

const destructureTarget = `export default function StudentPanel({
  currentStudent,
  materials,
  exams,
  teachers,
  subjects,
  announcements = [],
  onAddCheatLog,
  onSubmitExam
}: StudentPanelProps) {`;

const destructureReplacement = `export default function StudentPanel({
  currentStudent,
  materials,
  exams,
  submissions = [],
  teachers,
  subjects,
  announcements = [],
  onAddCheatLog,
  onSubmitExam
}: StudentPanelProps) {`;
content = content.replace(destructureTarget, destructureReplacement);

const tabStateTarget = `const [activeTab, setActiveTab] = useState<'beranda' | 'materials' | 'exams'>('beranda');`;
const tabStateReplacement = `const [activeTab, setActiveTab] = useState<'beranda' | 'materials' | 'exams' | 'scores'>('beranda');`;
content = content.replace(tabStateTarget, tabStateReplacement);

const buttonTarget = `            <button
              onClick={() => setActiveTab('exams')}
              className={\`flex-1 sm:flex-none text-center whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer \${
                activeTab === 'exams'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }\`}
            >
              ✍️ Ujian/Soal Evaluasi
            </button>
          </div>
        </div>
      )}`;

const buttonReplacement = `            <button
              onClick={() => setActiveTab('exams')}
              className={\`flex-1 sm:flex-none text-center whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer \${
                activeTab === 'exams'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }\`}
            >
              ✍️ Ujian/Soal Evaluasi
            </button>
            <button
              onClick={() => setActiveTab('scores')}
              className={\`flex-1 sm:flex-none text-center whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer \${
                activeTab === 'scores'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }\`}
            >
              📊 Riwayat Nilai
            </button>
          </div>
        </div>
      )}`;
content = content.replace(buttonTarget, buttonReplacement);

fs.writeFileSync('src/components/StudentPanel.tsx', content);
