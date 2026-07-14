const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const oldParse = `  const handleParseImport = (textToParse: string) => {
    const lines = textToParse.split(/\\r?\\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) {
      setImportPreview([]);
      return;
    }
    const startIndex = lines[0].toLowerCase().includes('nama') || lines[0].toLowerCase().includes('nis') ? 1 : 0;
    const result: Array<{ name: string; nis: string; email: string; classId: string; className: string }> = [];

    for (let i = startIndex; i < lines.length; i++) {
      const parts = lines[i].split(/[,;\\t]/).map(p => p.trim());
      if (parts.length >= 2) {
        const name = parts[0] || \`Siswa Baru \${i}\`;
        const nis = parts[1] || \`\${Math.floor(10000 + Math.random() * 90000)}\`;
        const email = parts[2] || \`\${nis}@smp.sch.id\`;
        const classNameInput = parts[3] || (classes[0]?.name || 'VII-A');

        const matchedClass = classes.find(c => c.name.toLowerCase() === classNameInput.toLowerCase()) || classes[0];
        const classId = matchedClass ? matchedClass.id : 'class-1';
        const className = matchedClass ? matchedClass.name : classNameInput;

        result.push({ name, nis, email, classId, className });
      }
    }
    setImportPreview(result);
  };`;

const newParse = `  const handleParseImport = (textToParse: string) => {
    const lines = textToParse.split(/\\r?\\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) {
      setImportPreview([]);
      return;
    }
    
    // Check headers
    const headerLine = lines[0].toLowerCase();
    const hasHeader = headerLine.includes('nama') || headerLine.includes('nis');
    const startIndex = hasHeader ? 1 : 0;
    
    // Check column format: "No Absen, Nama Lengkap, NIS, Email, Kelas" vs "Nama Lengkap, NIS, Email, Kelas"
    const isNoAbsenFirst = hasHeader && (headerLine.startsWith('no') || headerLine.startsWith('absen'));

    const result: Array<{ name: string; nis: string; email: string; classId: string; className: string; noAbsen?: number }> = [];

    for (let i = startIndex; i < lines.length; i++) {
      let line = lines[i];
      let parts: string[] = [];
      
      if (line.includes('\\t')) {
        parts = line.split('\\t').map(p => p.trim().replace(/^"|"$/g, ''));
      } else if (line.includes(';')) {
        parts = line.split(';').map(p => p.trim().replace(/^"|"$/g, ''));
      } else {
        const regex = /(?:^|,)(?:"([^"]*)"|([^",]*))/g;
        let match;
        while ((match = regex.exec(line)) !== null) {
          if (match.index === regex.lastIndex) regex.lastIndex++;
          parts.push((match[1] ?? match[2] ?? '').trim());
        }
      }

      if (parts.length >= 2) {
        let noAbsen, name, nis, email, classNameInput;

        if (isNoAbsenFirst) {
          noAbsen = parseInt(parts[0]) || undefined;
          name = parts[1] || \`Siswa Baru \${i}\`;
          nis = parts[2] || \`\${Math.floor(10000 + Math.random() * 90000)}\`;
          email = parts[3] || \`\${nis}@smp.sch.id\`;
          classNameInput = parts[4] || (classes[0]?.name || 'VII-A');
        } else {
          name = parts[0] || \`Siswa Baru \${i}\`;
          nis = parts[1] || \`\${Math.floor(10000 + Math.random() * 90000)}\`;
          email = parts[2] || \`\${nis}@smp.sch.id\`;
          classNameInput = parts[3] || (classes[0]?.name || 'VII-A');
          noAbsen = parseInt(parts[4]) || undefined; // If there is a 5th column, use it as noAbsen
        }

        const matchedClass = classes.find(c => c.name.toLowerCase() === classNameInput.toLowerCase()) || classes[0];
        const classId = matchedClass ? matchedClass.id : 'class-1';
        const className = matchedClass ? matchedClass.name : classNameInput;

        result.push({ name, nis, email, classId, className, noAbsen });
      }
    }
    setImportPreview(result);
  };`;

content = content.replace(oldParse, newParse);

// Update Download Template
const oldDownloadTemplate = `  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Nama Lengkap,NIS,Email,Kelas\\nBudi Santoso,10260,budi@smp.sch.id,VII-A\\nSiti Aminah,10261,siti@smp.sch.id,VII-B\\nAndi Wijaya,10262,andi@smp.sch.id,VII-A";`;

const newDownloadTemplate = `  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,No Absen,Nama Lengkap,NIS,Email,Kelas\\n1,Budi Santoso,10260,budi@smp.sch.id,VII-A\\n2,Siti Aminah,10261,siti@smp.sch.id,VII-A\\n3,Andi Wijaya,10262,andi@smp.sch.id,VII-A";`;

content = content.replace(oldDownloadTemplate, newDownloadTemplate);

// Update placeholder in textarea
content = content.replace(
  "Contoh format:\\nNama Lengkap,NIS,Email,Kelas\\nBudi Santoso,10260,budi@smp.sch.id,VII-A\\nSiti Aminah,10261,siti@smp.sch.id,VII-B",
  "Contoh format:\\nNo Absen,Nama Lengkap,NIS,Email,Kelas\\n1,Budi Santoso,10260,budi@smp.sch.id,VII-A\\n2,Siti Aminah,10261,siti@smp.sch.id,VII-A"
);
content = content.replace(
  "Isi kolom: <code className=\"font-mono bg-white px-1 py-0.5 rounded border border-emerald-200\">Nama Lengkap, NIS, Email, Kelas</code>",
  "Isi kolom: <code className=\"font-mono bg-white px-1 py-0.5 rounded border border-emerald-200\">No Absen, Nama Lengkap, NIS, Email, Kelas</code>"
);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
