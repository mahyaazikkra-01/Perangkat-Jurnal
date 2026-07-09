const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const buttonTarget = `          <button
            onClick={() => setActiveTab('config')}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium \${
              activeTab === 'config'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }\`}
          >
            <Settings className="w-5 h-5" />
            Konfigurasi Portal
          </button>
        </nav>`;
const buttonReplace = `          <button
            onClick={() => setActiveTab('announcements')}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium \${
              activeTab === 'announcements'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }\`}
          >
            <ShieldAlert className="w-5 h-5" />
            Pengumuman Global
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium \${
              activeTab === 'config'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }\`}
          >
            <Settings className="w-5 h-5" />
            Konfigurasi Portal
          </button>
        </nav>`;

content = content.replace(buttonTarget, buttonReplace);

const sectionTarget = `      {activeTab === 'config' && (`;
const sectionReplace = `      {activeTab === 'announcements' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Pengumuman Global</h2>
              <p className="text-sm text-slate-500">Kirim pengumuman ke Guru atau Siswa.</p>
            </div>
            <button
              onClick={() => setShowAddAnnModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition text-sm font-bold shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Buat Pengumuman
            </button>
          </div>

          <div className="space-y-4">
            {globalAnnouncements.length === 0 ? (
              <p className="text-sm text-slate-500 italic text-center py-8">Belum ada pengumuman.</p>
            ) : (
              globalAnnouncements.map(ann => (
                <div key={ann.id} className="border border-slate-100 rounded-xl p-4 shadow-xs relative">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-800">{ann.title}</h3>
                    <button
                      onClick={() => onDeleteGlobalAnnouncement?.(ann.id)}
                      className="text-red-500 hover:text-red-700 transition"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{ann.content}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md">
                      Target: {ann.targetRole}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(ann.createdAt).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'config' && (`;

content = content.replace(sectionTarget, sectionReplace);

const modalTarget = `      {/* ADD TEACHER MODAL */}`;
const modalReplace = `      {/* ADD ANNOUNCEMENT MODAL */}
      {showAddAnnModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Buat Pengumuman</h3>
              <button onClick={() => setShowAddAnnModal(false)} className="text-slate-400 hover:text-slate-600 transition cursor-pointer">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              onAddGlobalAnnouncement?.(newAnn);
              setShowAddAnnModal(false);
              setNewAnn({ title: '', content: '', targetRole: 'All' });
            }} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Target Audience</label>
                <select
                  required
                  value={newAnn.targetRole}
                  onChange={(e) => setNewAnn({ ...newAnn, targetRole: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="All">Semua (Guru & Siswa)</option>
                  <option value="Teacher">Hanya Guru</option>
                  <option value="Student">Hanya Siswa</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Judul Pengumuman</label>
                <input
                  type="text"
                  required
                  value={newAnn.title}
                  onChange={(e) => setNewAnn({ ...newAnn, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Isi Pengumuman</label>
                <textarea
                  required
                  rows={4}
                  value={newAnn.content}
                  onChange={(e) => setNewAnn({ ...newAnn, content: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddAnnModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition cursor-pointer"
                >
                  Kirim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TEACHER MODAL */}`;

content = content.replace(modalTarget, modalReplace);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
