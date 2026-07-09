const fs = require('fs');
let content = fs.readFileSync('src/components/TeacherPanel.tsx', 'utf8');

content = content.replace(
  "  const teacherSubmissions = submissions.filter(s => teacherExams.some(e => e.id === s.examId));",
  "  const teacherSubmissions = submissions.filter(s => teacherExams.some(e => e.id === s.examId));\n  const teacherExamTitles = teacherExams.map(e => e.title);\n  const teacherCheatLogs = cheatLogs.filter(log => teacherExamTitles.includes(log.examTitle));"
);

fs.writeFileSync('src/components/TeacherPanel.tsx', content);
