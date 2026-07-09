const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `  const handleRejectRegistration = (id: string) => {
    updateDocument('registrations', { id, status: 'Rejected' } as any);
  };`;

const replaceStr = `  const handleRejectRegistration = (id: string) => {
    updateDocument('registrations', { id, status: 'Rejected' } as any);
  };

  const handleDeleteRegistration = (id: string) => {
    if (window.confirm('Yakin ingin menghapus data pendaftar ini secara permanen?')) {
      deleteDocument('registrations', id);
    }
  };`;

content = content.replace(targetStr, replaceStr);

const targetStr2 = `                onApproveRegistration={handleApproveRegistration}
                onRejectRegistration={handleRejectRegistration}
              />`;

const replaceStr2 = `                onApproveRegistration={handleApproveRegistration}
                onRejectRegistration={handleRejectRegistration}
                onDeleteRegistration={handleDeleteRegistration}
              />`;

content = content.replace(targetStr2, replaceStr2);
fs.writeFileSync('src/App.tsx', content);
