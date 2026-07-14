const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// Insert logic before filteredArchivedStudents
const logicToInsert = `
  const groupedStudents = useMemo(() => {
    const groups = {};
    classes.forEach(c => { groups[c.id] = []; });
    groups['unassigned'] = [];

    filteredStudents.forEach(s => {
      if (s.classId && groups[s.classId]) {
        groups[s.classId].push(s);
      } else {
        groups['unassigned'].push(s);
      }
    });
    return groups;
  }, [filteredStudents, classes]);

  const [expandedClasses, setExpandedClasses] = useState({});

  const toggleClass = (classId) => {
    setExpandedClasses(prev => ({ ...prev, [classId]: !prev[classId] }));
  };

  const filteredArchivedStudents`;

content = content.replace("  const filteredArchivedStudents", logicToInsert);

// Replace Table
const oldTableStart = "          {/* Table list */}";
const oldTableEnd = "          </div>\n        </div>\n      )}";

const newTable = `          {/* Table list grouped by class */}
          <div className="space-y-4">
            {classes.map(cls => {
              const classStudents = groupedStudents[cls.id] || [];
              if (classStudents.length === 0 && searchStudent !== '') return null;

              const isExpanded = expandedClasses[cls.id] || searchStudent !== '';

              return (
                <div key={cls.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                  <div 
                    onClick={() => toggleClass(cls.id)}
                    className="bg-slate-50 hover:bg-slate-100 px-6 py-4 flex items-center justify-between cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-100 text-indigo-700 p-2 rounded-xl">
                        <Users className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-slate-800 text-sm">Kelas {cls.name}</h3>
                        <p className="text-xs text-slate-500 font-medium">{classStudents.length} Siswa Terdaftar</p>
                      </div>
                    </div>
                    <div className="text-slate-400">
                      {isExpanded ? <XCircle className="w-5 h-5 text-indigo-500" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-100">
                      {classStudents.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                            <thead className="bg-white">
                              <tr>
                                <th className="px-6 py-3 font-semibold text-slate-500 text-center w-20">No Absen</th>
                                <th className="px-6 py-3 font-semibold text-slate-500">Nama Lengkap</th>
                                <th className="px-6 py-3 font-semibold text-slate-500">NIS (Password)</th>
                                <th className="px-6 py-3 font-semibold text-slate-500">Email</th>
                                <th className="px-6 py-3 font-semibold text-slate-500 text-right">Aksi</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                              {classStudents.map((siswa) => (
                                <tr key={siswa.id} className="hover:bg-slate-50 transition">
                                  <td className="px-6 py-3 font-bold text-slate-900 text-center">{siswa.noAbsen || '-'}</td>
                                  <td className="px-6 py-3 font-bold text-slate-900">{siswa.name}</td>
                                  <td className="px-6 py-3 font-mono font-semibold text-slate-600">{siswa.nis}</td>
                                  <td className="px-6 py-3 text-slate-500">{siswa.email}</td>
                                  <td className="px-6 py-3 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        onClick={() => {
                                          setResetTargetUser({
                                            id: siswa.id,
                                            name: siswa.name,
                                            identifier: siswa.nis,
                                            role: 'Student',
                                            currentPass: siswa.password || siswa.email || siswa.nis,
                                            rawObject: siswa
                                          });
                                          setNewPasswordValue(siswa.password || siswa.email || siswa.nis);
                                          setShowResetPassModal(true);
                                        }}
                                        className="text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 font-bold text-[11px]"
                                        title="Reset / Ubah Password Login Siswa"
                                      >
                                        <KeyRound className="w-3.5 h-3.5" />
                                        <span>Password</span>
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingStudent(siswa);
                                          setShowEditStudentModal(true);
                                        }}
                                        className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 font-bold text-[11px]"
                                        title="Edit Data Siswa / Naik Kelas"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                        <span>Edit</span>
                                      </button>
                                      {onDeleteStudent && (
                                        <button
                                          onClick={() => onDeleteStudent(siswa.id)}
                                          className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded transition cursor-pointer"
                                          title="Hapus Siswa"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-8 text-center text-slate-400 text-xs font-medium bg-slate-50/50">
                          Belum ada siswa di kelas ini.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {(groupedStudents['unassigned']?.length > 0) && (
              <div className="border border-red-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <div 
                  onClick={() => toggleClass('unassigned')}
                  className="bg-red-50 hover:bg-red-100 px-6 py-4 flex items-center justify-between cursor-pointer transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 text-red-700 p-2 rounded-xl">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-red-800 text-sm">Tanpa Kelas / Kelas Telah Dihapus</h3>
                      <p className="text-xs text-red-500 font-medium">{groupedStudents['unassigned'].length} Siswa Terdaftar</p>
                    </div>
                  </div>
                  <div className="text-red-400">
                    {(expandedClasses['unassigned'] || searchStudent !== '') ? <XCircle className="w-5 h-5 text-red-500" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                </div>

                {(expandedClasses['unassigned'] || searchStudent !== '') && (
                  <div className="border-t border-red-100">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                        <thead className="bg-white">
                          <tr>
                            <th className="px-6 py-3 font-semibold text-slate-500 text-center w-20">No Absen</th>
                            <th className="px-6 py-3 font-semibold text-slate-500">Nama Lengkap</th>
                            <th className="px-6 py-3 font-semibold text-slate-500">NIS (Password)</th>
                            <th className="px-6 py-3 font-semibold text-slate-500">Email</th>
                            <th className="px-6 py-3 font-semibold text-slate-500 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {groupedStudents['unassigned'].map((siswa) => (
                            <tr key={siswa.id} className="hover:bg-slate-50 transition">
                              <td className="px-6 py-3 font-bold text-slate-900 text-center">{siswa.noAbsen || '-'}</td>
                              <td className="px-6 py-3 font-bold text-slate-900">{siswa.name}</td>
                              <td className="px-6 py-3 font-mono font-semibold text-slate-600">{siswa.nis}</td>
                              <td className="px-6 py-3 text-slate-500">{siswa.email}</td>
                              <td className="px-6 py-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setEditingStudent(siswa);
                                      setShowEditStudentModal(true);
                                    }}
                                    className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 font-bold text-[11px]"
                                    title="Edit Data Siswa / Naik Kelas"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                    <span>Edit</span>
                                  </button>
                                  {onDeleteStudent && (
                                    <button
                                      onClick={() => onDeleteStudent(siswa.id)}
                                      className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded transition cursor-pointer"
                                      title="Hapus Siswa"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {filteredStudents.length === 0 && (
              <div className="border border-slate-100 rounded-xl p-12 text-center text-slate-400 bg-white">
                <Users className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                Tidak ada siswa yang cocok dengan pencarian Anda.
              </div>
            )}
          </div>
        </div>
      )}`;

const oldTableMatch = content.substring(content.indexOf(oldTableStart), content.indexOf(oldTableEnd) + oldTableEnd.length);

if (content.includes(oldTableStart)) {
  content = content.replace(oldTableMatch, newTable);
} else {
  console.log("Could not find table section");
}

fs.writeFileSync('src/components/AdminPanel.tsx', content);
