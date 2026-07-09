const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `  const handleDeleteRegistration = (id: string) => {
    if (window.confirm('Yakin ingin menghapus data pendaftar ini secara permanen?')) {
      deleteDocument('registrations', id);
    }
  };`;

const replaceStr = `  const handleDeleteRegistration = (id: string) => {
    deleteDocument('registrations', id);
  };`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync('src/App.tsx', content);
