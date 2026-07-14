const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const oldTemplate = 'const csvContent = "data:text/csv;charset=utf-8,Nama Lengkap,NIS,Email,Kelas\\nBudi Santoso,10260,budi@smp.sch.id,VII-A\\nSiti Aminah,10261,siti@smp.sch.id,VII-B\\nDimas Anggara,10262,dimas@smp.sch.id,VIII-A";';
const newTemplate = 'const csvContent = "data:text/csv;charset=utf-8,No Absen,Nama Lengkap,NIS,Email,Kelas\\n1,Budi Santoso,10260,budi@smp.sch.id,VII-A\\n2,Siti Aminah,10261,siti@smp.sch.id,VII-A\\n3,Dimas Anggara,10262,dimas@smp.sch.id,VII-A";';

content = content.replace(oldTemplate, newTemplate);
fs.writeFileSync('src/components/AdminPanel.tsx', content);
