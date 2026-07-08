const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

content = content.replace(/t\.name\.toLowerCase/g, "(t.name || '').toLowerCase");
content = content.replace(/s\.name\.toLowerCase/g, "(s.name || '').toLowerCase");
content = content.replace(/sub\.name\.toLowerCase/g, "(sub.name || '').toLowerCase");

fs.writeFileSync('src/components/AdminPanel.tsx', content);
