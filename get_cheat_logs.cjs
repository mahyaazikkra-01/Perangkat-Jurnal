const fs = require('fs');
let content = fs.readFileSync('src/components/TeacherPanel.tsx', 'utf8');

// Find teacherExams
const teacherExamsMatch = content.match(/const teacherExams = exams.filter\(e => e.teacherId === currentTeacher.id\);/);
if (teacherExamsMatch) {
  content = content.replace(
    "const teacherExams = exams.filter(e => e.teacherId === currentTeacher.id);",
    "const teacherExams = exams.filter(e => e.teacherId === currentTeacher.id);\n  const teacherExamTitles = teacherExams.map(e => e.title);\n  const teacherCheatLogs = cheatLogs.filter(log => teacherExamTitles.includes(log.examTitle));"
  );
}
fs.writeFileSync('src/components/TeacherPanel.tsx', content);
