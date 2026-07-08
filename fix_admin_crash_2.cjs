const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

content = content.replace(/t\.subject\.toLowerCase/g, "(t.subject || '').toLowerCase");
content = content.replace(/newTeacher\.subject\.split/g, "(newTeacher.subject || '').split");
content = content.replace(/editingTeacher\.subject\.split/g, "(editingTeacher.subject || '').split");
content = content.replace(/item\.subject\.split/g, "(item.subject || '').split");

fs.writeFileSync('src/components/AdminPanel.tsx', content);
