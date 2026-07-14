const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const oldEditPart = `            <form onSubmit={(e) => {
              e.preventDefault();
              if (onUpdateStudent && editingStudent) {
                onUpdateStudent(editingStudent);
                toast(\`Data siswa \${editingStudent.name} berhasil diperbarui!\`);
                setShowEditStudentModal(false);
              }
            }} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">`;

const newEditPart = `            <form onSubmit={(e) => {
              e.preventDefault();
              if (onUpdateStudent && editingStudent) {
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
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">`;

content = content.replace(oldEditPart, newEditPart);
fs.writeFileSync('src/components/AdminPanel.tsx', content);
