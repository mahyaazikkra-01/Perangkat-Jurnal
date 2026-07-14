const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// Add states
const statePromote = "  const [showBulkPromoteModal, setShowBulkPromoteModal] = useState(false);\n  const [promoteFromClassId, setPromoteFromClassId] = useState('');\n  const [promoteToClassId, setPromoteToClassId] = useState('');";
const stateDelete = statePromote + "\n  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);\n  const [deleteClassId, setDeleteClassId] = useState('');";
content = content.replace(statePromote, stateDelete);

// Add button next to Naik Kelas
const promoteBtn = `              <button
                onClick={() => {
                  setPromoteFromClassId(classes[0]?.id || '');
                  setPromoteToClassId(classes[1]?.id || 'LULUS');
                  setShowBulkPromoteModal(true);
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Naik Kelas / Lulus Masal</span>
              </button>`;
const deleteBtn = promoteBtn + `
              <button
                onClick={() => {
                  setDeleteClassId(classes[0]?.id || '');
                  setShowBulkDeleteModal(true);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Per Kelas</span>
              </button>`;
content = content.replace(promoteBtn, deleteBtn);

// Add modal before the closing div
const promoteModalEnd = `      )}
    </div>
  );
}`;
const deleteModal = `      )}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-slate-900 text-base">Hapus Siswa Per Kelas</h3>
              </div>
              <button 
                onClick={() => setShowBulkDeleteModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed text-left font-medium">
              Fitur ini memungkinkan Admin untuk menghapus seluruh data siswa di kelas yang dipilih. 
              <strong>Peringatan:</strong> Aksi ini tidak dapat dibatalkan.
            </p>

            <div className="space-y-4 text-left bg-red-50/50 p-4 rounded-xl border border-red-100">
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">Pilih Kelas yang Akan Dihapus:</label>
                <select
                  value={deleteClassId}
                  onChange={(e) => setDeleteClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 bg-white"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {activeStudents.filter(s => s.classId === deleteClassId).length > 0 && (
              <div className="bg-red-50 text-red-800 p-3 rounded-xl border border-red-100 text-xs text-left">
                Terdapat <strong>{activeStudents.filter(s => s.classId === deleteClassId).length} siswa</strong> di kelas ini yang akan terhapus.
              </div>
            )}

            <div className="border-t border-slate-100 pt-3 flex justify-end gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={activeStudents.filter(s => s.classId === deleteClassId).length === 0}
                onClick={() => {
                  const targetStudents = activeStudents.filter(s => s.classId === deleteClassId);
                  if (targetStudents.length === 0) return;
                  
                  if (window.confirm(\`Anda yakin ingin menghapus \${targetStudents.length} siswa dari kelas ini?\`)) {
                    if (onDeleteStudent) {
                      targetStudents.forEach(s => onDeleteStudent(s.id));
                    }
                    toast(\`Berhasil menghapus \${targetStudents.length} siswa.\`);
                    setShowBulkDeleteModal(false);
                  }
                }}
                className={\`px-4 py-2 rounded-lg transition cursor-pointer text-white shadow-xs \${
                  activeStudents.filter(s => s.classId === deleteClassId).length === 0
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }\`}
              >
                Hapus Siswa Masal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;
content = content.replace(promoteModalEnd, deleteModal);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
