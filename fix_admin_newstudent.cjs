const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const oldNewStudent = `  const [newStudent, setNewStudent] = useState({
    name: '',
    nis: '',
    email: '',
    classId: ''
  });`;

const newNewStudent = `  const [newStudent, setNewStudent] = useState<{name: string, nis: string, email: string, classId: string, noAbsen?: number}>({
    name: '',
    nis: '',
    email: '',
    classId: ''
  });`;

content = content.replace(oldNewStudent, newNewStudent);

// In handleSaveStudent
const oldHandleSave = `  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.nis || !newStudent.classId) return;
    
    onAddStudent({
      ...newStudent,
      password: newStudent.email || newStudent.nis, // default password
    });
    setNewStudent({
      name: '',
      nis: '',
      email: '',
      classId: ''
    });
    setShowAddStudentModal(false);
  };`;

const newHandleSave = `  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.nis || !newStudent.classId) return;
    
    onAddStudent({
      ...newStudent,
      password: newStudent.email || newStudent.nis, // default password
    });
    setNewStudent({
      name: '',
      nis: '',
      email: '',
      classId: '',
      noAbsen: undefined
    });
    setShowAddStudentModal(false);
  };`;
content = content.replace(oldHandleSave, newHandleSave);

// Add input field in add modal
const oldAddForm = `            <form onSubmit={handleSaveStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700">Nama Lengkap Siswa *</label>`;

const newAddForm = `            <form onSubmit={handleSaveStudent} className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold mb-1 text-slate-700">No Absen</label>
                  <input
                    type="number"
                    value={newStudent.noAbsen || ''}
                    onChange={(e) => setNewStudent({...newStudent, noAbsen: parseInt(e.target.value) || undefined})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Nama Lengkap Siswa *</label>`;

// find the closing div for Nama Lengkap Siswa
content = content.replace(oldAddForm, newAddForm);
content = content.replace(
  `                  <input\n                    type="text"\n                    required\n                    value={newStudent.name}\n                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}\n                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"\n                  />\n                </div>`,
  `                  <input\n                    type="text"\n                    required\n                    value={newStudent.name}\n                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}\n                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"\n                  />\n                </div>\n              </div>`
);


// In Edit form
const oldEditForm = `            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingStudent) {
                onUpdateStudent(editingStudent);
                toast(\`Data siswa \${editingStudent.name} berhasil diperbarui!\`);
                setShowEditStudentModal(false);
              }
            }} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700">Nama Lengkap *</label>`;

const newEditForm = `            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingStudent) {
                onUpdateStudent(editingStudent);
                toast(\`Data siswa \${editingStudent.name} berhasil diperbarui!\`);
                setShowEditStudentModal(false);
              }
            }} className="space-y-4 text-left">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold mb-1 text-slate-700">No Absen</label>
                  <input
                    type="number"
                    value={editingStudent.noAbsen || ''}
                    onChange={(e) => setEditingStudent({...editingStudent, noAbsen: parseInt(e.target.value) || undefined})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Nama Lengkap *</label>`;

content = content.replace(oldEditForm, newEditForm);
content = content.replace(
  `                  <input\n                    type="text"\n                    required\n                    value={editingStudent.name}\n                    onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})}\n                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"\n                  />\n                </div>`,
  `                  <input\n                    type="text"\n                    required\n                    value={editingStudent.name}\n                    onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})}\n                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"\n                  />\n                </div>\n              </div>`
);


fs.writeFileSync('src/components/AdminPanel.tsx', content);
