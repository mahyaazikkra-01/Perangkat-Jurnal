const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// Replace all instances of .subject.split with .(subject || '').split
content = content.replace(/t\.subject\.split/g, "(t.subject || '').split");
content = content.replace(/teacher\.subject\.split/g, "(teacher.subject || '').split");
content = content.replace(/s\.subject\.split/g, "(s.subject || '').split");
content = content.replace(/newTeacher\.subject \? newTeacher\.subject\.split/g, "newTeacher.subject ? (newTeacher.subject || '').split");
content = content.replace(/editingTeacher\.subject \? editingTeacher\.subject\.split/g, "editingTeacher.subject ? (editingTeacher.subject || '').split");

fs.writeFileSync('src/components/AdminPanel.tsx', content);
