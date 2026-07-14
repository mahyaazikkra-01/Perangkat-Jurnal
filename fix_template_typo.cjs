const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const oldRows = `    const rows = [
      { "No Absen": 1, "Nama Lengkap": "Budi Santoso", "NIS": "10260", "Email": "budi@smp.sch.id", "Kelas": "VII-A" },
      { "No Absen": 2, "Nama Lengkap": "Siti Aminah", "NIS": "10261", "Email": "siti@smp.sch.id", "Kelas": "VII-A" },
      { "No Absen": 3, "Nama Lengkap": "Dimas Anggara", "NIS": "10262", "Email": "dimas@smp.sch.id", "VII-A": "VII-A" }
    ];`;

const newRows = `    const rows = [
      { "No Absen": 1, "Nama Lengkap": "Budi Santoso", "NIS": "10260", "Email": "budi@smp.sch.id", "Kelas": "VII-A" },
      { "No Absen": 2, "Nama Lengkap": "Siti Aminah", "NIS": "10261", "Email": "siti@smp.sch.id", "Kelas": "VII-A" },
      { "No Absen": 3, "Nama Lengkap": "Dimas Anggara", "NIS": "10262", "Email": "dimas@smp.sch.id", "Kelas": "VII-A" }
    ];`;

content = content.replace(oldRows, newRows);
fs.writeFileSync('src/components/AdminPanel.tsx', content);
