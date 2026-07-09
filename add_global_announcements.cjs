const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `  const [shareRequests, setShareRequests] = useState<ShareRequest[]>([]);`;
const replace1 = `  const [shareRequests, setShareRequests] = useState<ShareRequest[]>([]);
  const [globalAnnouncements, setGlobalAnnouncements] = useState<GlobalAnnouncement[]>([]);`;

content = content.replace(target1, replace1);

const target2 = `    const unsubShareRequests = syncCollection('shareRequests', setShareRequests, []);`;
const replace2 = `    const unsubShareRequests = syncCollection('shareRequests', setShareRequests, []);
    const unsubGlobalAnnouncements = syncCollection('globalAnnouncements', setGlobalAnnouncements, []);`;

content = content.replace(target2, replace2);

const target3 = `      unsubShareRequests();
      unsubSchoolConfig();`;
const replace3 = `      unsubShareRequests();
      unsubGlobalAnnouncements();
      unsubSchoolConfig();`;

content = content.replace(target3, replace3);

const target4 = `import { Teacher, Student, ClassItem, SubjectItem, Material, JournalEntry, QuestionBank, Exam, ExamSubmission, CheatLog, TeacherAnnouncement, ShareRequest, RegistrationRequest, SchoolConfig } from './types';`;
const replace4 = `import { Teacher, Student, ClassItem, SubjectItem, Material, JournalEntry, QuestionBank, Exam, ExamSubmission, CheatLog, TeacherAnnouncement, ShareRequest, RegistrationRequest, SchoolConfig, GlobalAnnouncement } from './types';`;

content = content.replace(target4, replace4);

fs.writeFileSync('src/App.tsx', content);
