const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

content = content.replace(/entry\.attendance\.filter/g, "(entry.attendance || []).filter");
content = content.replace(/registrations\.filter/g, "(registrations || []).filter");
content = content.replace(/registrations\.map/g, "(registrations || []).map");

fs.writeFileSync('src/components/AdminPanel.tsx', content);
