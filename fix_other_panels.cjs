const fs = require('fs');

let studentPanel = fs.readFileSync('src/components/StudentPanel.tsx', 'utf8');
studentPanel = studentPanel.replace(/t\.subject\.split/g, "(t.subject || '').split");
fs.writeFileSync('src/components/StudentPanel.tsx', studentPanel);

let teacherPanel = fs.readFileSync('src/components/TeacherPanel.tsx', 'utf8');
teacherPanel = teacherPanel.replace(/currentTeacher\.subject\.split/g, "(currentTeacher.subject || '').split");
fs.writeFileSync('src/components/TeacherPanel.tsx', teacherPanel);

