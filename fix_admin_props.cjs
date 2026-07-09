const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const importTarget = `import {
  Teacher, Student, ClassItem, SubjectItem, JournalEntry, CheatLog, ExamSubmission, RegistrationRequest, SchoolConfig
} from '../types';`;
const importReplace = `import {
  Teacher, Student, ClassItem, SubjectItem, JournalEntry, CheatLog, ExamSubmission, RegistrationRequest, SchoolConfig, GlobalAnnouncement
} from '../types';`;
content = content.replace(importTarget, importReplace);

const propsTarget = `  onRejectRegistration?: (id: string) => void;
  onDeleteRegistration?: (id: string) => void;
}`;
const propsReplace = `  onRejectRegistration?: (id: string) => void;
  onDeleteRegistration?: (id: string) => void;
  globalAnnouncements?: GlobalAnnouncement[];
  onAddGlobalAnnouncement?: (ann: Omit<GlobalAnnouncement, 'id' | 'createdAt'>) => void;
  onDeleteGlobalAnnouncement?: (id: string) => void;
}`;
content = content.replace(propsTarget, propsReplace);

const fnTarget = `  onApproveRegistration,
  onRejectRegistration,
  onDeleteRegistration
}: AdminPanelProps) {`;
const fnReplace = `  onApproveRegistration,
  onRejectRegistration,
  onDeleteRegistration,
  globalAnnouncements = [],
  onAddGlobalAnnouncement,
  onDeleteGlobalAnnouncement
}: AdminPanelProps) {`;
content = content.replace(fnTarget, fnReplace);

const stateTarget = `const [activeTab, setActiveTab] = useState<'dashboard' | 'teachers' | 'students' | 'journals' | 'cheatlogs' | 'classes' | 'registrations' | 'config' | 'archived_students'>('dashboard');`;
const stateReplace = `const [activeTab, setActiveTab] = useState<'dashboard' | 'teachers' | 'students' | 'journals' | 'cheatlogs' | 'classes' | 'registrations' | 'config' | 'archived_students' | 'announcements'>('dashboard');
  const [showAddAnnModal, setShowAddAnnModal] = useState(false);
  const [newAnn, setNewAnn] = useState({ title: '', content: '', targetRole: 'All' as 'All' | 'Teacher' | 'Student' });`;
content = content.replace(stateTarget, stateReplace);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
