const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const targetStr = `      {/* CONFIG TAB */}
      {activeTab === 'announcements' && (`;

const replacementStr = `      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="bg-indigo-100 text-indigo-700 p-4 rounded-xl">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-bold">Total Siswa</p>
                <h4 className="text-2xl font-black text-slate-800">{students.length}</h4>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="bg-emerald-100 text-emerald-700 p-4 rounded-xl">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-bold">Total Guru</p>
                <h4 className="text-2xl font-black text-slate-800">{teachers.length}</h4>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="bg-amber-100 text-amber-700 p-4 rounded-xl">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-bold">Total Kelas</p>
                <h4 className="text-2xl font-black text-slate-800">{classes.length}</h4>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="bg-blue-100 text-blue-700 p-4 rounded-xl">
                <BookMarked className="w-8 h-8" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-bold">Total Mapel</p>
                <h4 className="text-2xl font-black text-slate-800">{subjects.length}</h4>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TEACHERS TAB */}
      {activeTab === 'teachers' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Data Guru Pengajar</h2>
              <p className="text-sm text-slate-500">Kelola daftar guru dan mata pelajaran yang diampu.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowImportTeacherModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition text-sm font-bold shadow-xs cursor-pointer"
              >
                <Upload className="w-4 h-4" /> Import Excel
              </button>
              <button
                onClick={() => {
                  setEditingTeacher(null);
                  setShowAddTeacherModal(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition text-sm font-bold shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Tambah Guru
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari nama guru atau NIP..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition"
                  value={searchTeacher}
                  onChange={(e) => setSearchTeacher(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 font-bold text-slate-600">Nama Guru</th>
                    <th className="px-6 py-4 font-bold text-slate-600">NIP / Username</th>
                    <th className="px-6 py-4 font-bold text-slate-600">Email</th>
                    <th className="px-6 py-4 font-bold text-slate-600">Mata Pelajaran</th>
                    <th className="px-6 py-4 font-bold text-slate-600 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredTeachers.map(teacher => (
                    <tr key={teacher.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-bold text-slate-900">{teacher.name}</td>
                      <td className="px-6 py-4 font-mono text-slate-600">{teacher.nip}</td>
                      <td className="px-6 py-4 text-slate-500">{teacher.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {teacher.subject?.split(',').map((s, i) => (
                            <span key={i} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md text-xs font-semibold">
                              {s.trim()}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setResetTargetUser({
                                id: teacher.id,
                                name: teacher.name,
                                identifier: teacher.nip,
                                role: 'Teacher',
                                currentPass: teacher.password || teacher.email || teacher.nip,
                                rawObject: teacher
                              });
                              setNewPasswordValue(teacher.password || teacher.email || teacher.nip);
                              setShowResetPassModal(true);
                            }}
                            className="text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 p-2 rounded-lg transition"
                            title="Reset Password"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingTeacher(teacher);
                              setShowAddTeacherModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {onDeleteTeacher && (
                            <button
                              onClick={() => {
                                if (window.confirm('Yakin ingin menghapus guru ini?')) {
                                  onDeleteTeacher(teacher.id);
                                }
                              }}
                              className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredTeachers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        Tidak ada data guru ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CONFIG TAB */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Pengaturan Tampilan Aplikasi</h2>
            <div className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nama Sekolah / Institusi</label>
                <input
                  type="text"
                  value={localConfig.schoolName || ''}
                  onChange={e => setLocalConfig({ ...localConfig, schoolName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Misal: SMP Negeri 1 Jakarta"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Deskripsi Landing Page</label>
                <textarea
                  value={localConfig.landingDescription || ''}
                  onChange={e => setLocalConfig({ ...localConfig, landingDescription: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                  placeholder="Deskripsi singkat untuk halaman utama..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">URL Logo Sekolah (Opsional)</label>
                <input
                  type="text"
                  value={localConfig.logoUrl || ''}
                  onChange={e => setLocalConfig({ ...localConfig, logoUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Warna Utama (Primary Color)</label>
                <div className="flex gap-4 items-center">
                  <input
                    type="color"
                    value={localConfig.primaryColor || '#4f46e5'}
                    onChange={e => setLocalConfig({ ...localConfig, primaryColor: e.target.value })}
                    className="h-10 w-20 rounded border border-slate-300 cursor-pointer"
                  />
                  <span className="text-sm text-slate-500 font-mono">{localConfig.primaryColor || '#4f46e5'}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    if (onUpdateSchoolConfig) {
                      onUpdateSchoolConfig(localConfig);
                      toast('Pengaturan berhasil disimpan!');
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition flex items-center gap-2"
                >
                  <Save className="w-5 h-5" /> Simpan Pengaturan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ANNOUNCEMENTS TAB */}
      {activeTab === 'announcements' && (`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/AdminPanel.tsx', content);
