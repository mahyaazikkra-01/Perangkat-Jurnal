const fs = require('fs');
let content = fs.readFileSync('src/components/TeacherPanel.tsx', 'utf8');
content = content.replace(
  "Teacher, Student, ClassItem, SubjectItem, Material, JournalEntry, Exam, ExamQuestion, QuestionType, TeacherScheduleNote, TeacherAnnouncement, QuestionBank, ExamSubmission, ShareRequest",
  "Teacher, Student, ClassItem, SubjectItem, Material, JournalEntry, Exam, ExamQuestion, QuestionType, TeacherScheduleNote, TeacherAnnouncement, QuestionBank, ExamSubmission, ShareRequest, CheatLog"
);
content = content.replace(
  "  submissions?: ExamSubmission[];",
  "  submissions?: ExamSubmission[];\n  cheatLogs?: CheatLog[];"
);
content = content.replace(
  "  onRespondShare,\n  onSaveAnnouncement,\n  onDeleteAnnouncement,\n  onToggleAnnouncement\n}: TeacherPanelProps) {",
  "  onRespondShare,\n  onSaveAnnouncement,\n  onDeleteAnnouncement,\n  onToggleAnnouncement,\n  cheatLogs = []\n}: TeacherPanelProps) {"
);
fs.writeFileSync('src/components/TeacherPanel.tsx', content);
