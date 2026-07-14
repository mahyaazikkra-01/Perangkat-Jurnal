const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');
content = content.replace(/Pilih Berkas \.CSV \/ \.TXT/g, 'Pilih Berkas Excel / CSV');
fs.writeFileSync('src/components/AdminPanel.tsx', content);
