const fs = require('fs');
let content = fs.readFileSync('src/components/TeacherPanel.tsx', 'utf8');

const oldClassStudents = `  const classStudents = students.filter(s => s.classId === journalClass);`;
const newClassStudents = `  const classStudents = students.filter(s => s.classId === journalClass).sort((a, b) => {
    if (a.noAbsen != null && b.noAbsen != null) return a.noAbsen - b.noAbsen;
    if (a.noAbsen != null) return -1;
    if (b.noAbsen != null) return 1;
    return (a.name || '').localeCompare(b.name || '');
  });`;

content = content.replace(oldClassStudents, newClassStudents);

fs.writeFileSync('src/components/TeacherPanel.tsx', content);
