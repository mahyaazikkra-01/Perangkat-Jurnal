const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const stateExpanded = "  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({});";
const newStates = `  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({});
  const [expandedGrades, setExpandedGrades] = useState<Record<string, boolean>>({});

  const toggleGrade = (gradeId: string) => {
    setExpandedGrades(prev => ({ ...prev, [gradeId]: !prev[gradeId] }));
  };`;
content = content.replace(stateExpanded, newStates);

const tableStart = "          {/* Table list grouped by class */}";
const tableEndStr = "            {(groupedStudents['unassigned']?.length > 0) && (";
const endIdx = content.indexOf(tableEndStr);

if (content.includes(tableStart) && endIdx !== -1) {
  const tableEnd = content.substring(endIdx);
  const oldTable = content.substring(content.indexOf(tableStart), endIdx);

  const newTable = `          {/* Table list grouped by grade */}
          <div className="space-y-4">
            {[
              { id: 'VII', title: 'Blok Kelas VII', match: (name) => name.toUpperCase().startsWith('VII') && !name.toUpperCase().startsWith('VIII') },
              { id: 'VIII', title: 'Blok Kelas VIII', match: (name) => name.toUpperCase().startsWith('VIII') },
              { id: 'IX', title: 'Blok Kelas IX', match: (name) => name.toUpperCase().startsWith('IX') },
              { id: 'Lainnya', title: 'Kelas Lainnya', match: (name) => {
                  const n = name.toUpperCase();
                  return !n.startsWith('VII') && !n.startsWith('VIII') && !n.startsWith('IX');
              }}
            ].map(grade => {
              const gradeClasses = classes.filter(c => grade.match(c.name));
              if (gradeClasses.length === 0) return null;

              // Calculate total students in this grade
              let totalStudentsInGrade = 0;
              let matchSearch = false;
              gradeClasses.forEach(cls => {
                const classStudents = groupedStudents[cls.id] || [];
                totalStudentsInGrade += classStudents.length;
                if (classStudents.length > 0) matchSearch = true; // If search yields students in this class
              });

              if (totalStudentsInGrade === 0 && searchStudent !== '') return null;
              if (totalStudentsInGrade === 0 && searchStudent === '' && grade.id === 'Lainnya') return null; // Hide empty "Lainnya" if not searching

              const isGradeExpanded = expandedGrades[grade.id] || searchStudent !== '';

              return (
                <div key={grade.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                  {/* Grade Header */}
                  <div 
                    onClick={() => toggleGrade(grade.id)}
                    className="bg-indigo-50/50 hover:bg-indigo-50 px-6 py-5 flex items-center justify-between cursor-pointer transition border-b border-slate-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-xs">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-extrabold text-slate-800 text-base">{grade.title}</h3>
                        <p className="text-xs text-indigo-600 font-bold mt-0.5">{gradeClasses.length} Kelas • {totalStudentsInGrade} Siswa</p>
                      </div>
                    </div>
                    <div className="text-indigo-400 bg-white p-1.5 rounded-full shadow-xs border border-indigo-100">
                      {isGradeExpanded ? <XCircle className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                  </div>

                  {/* Classes in Grade */}
                  {isGradeExpanded && (
                    <div className="p-4 sm:p-6 bg-slate-50/50 space-y-4">
                      {gradeClasses.map(cls => {
                        const classStudents = groupedStudents[cls.id] || [];
                        if (classStudents.length === 0 && searchStudent !== '') return null;

                        const isExpanded = expandedClasses[cls.id] || searchStudent !== '';

                        return (
                          <div key={cls.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs transition-all hover:border-indigo-200">
                            <div 
                              onClick={() => toggleClass(cls.id)}
                              className="px-5 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition"
                            >
                              <div className="flex items-center gap-3">
                                <div className="bg-indigo-50 text-indigo-600 p-1.5 rounded-lg">
                                  <Users className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                  <h4 className="font-bold text-slate-800 text-sm">Kelas {cls.name}</h4>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                                  {classStudents.length} Siswa
                                </span>
                                <div className="text-slate-400">
                                  {isExpanded ? <XCircle className="w-4 h-4 text-indigo-500" /> : <ArrowUpRight className="w-4 h-4" />}
                                </div>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="border-t border-slate-100">
                                {classStudents.length > 0 ? (
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-100 text-xs text-left">
                                      <thead className="bg-slate-50/80">
                                        <tr>
                                          <th className="px-5 py-2.5 font-semibold text-slate-500 text-center w-16">No</th>
                                          <th className="px-5 py-2.5 font-semibold text-slate-500">Nama Lengkap</th>
                                          <th className="px-5 py-2.5 font-semibold text-slate-500">NIS (Pass)</th>
                                          <th className="px-5 py-2.5 font-semibold text-slate-500">Email</th>
                                          <th className="px-5 py-2.5 font-semibold text-slate-500 text-right">Aksi</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-50 bg-white">
                                        {classStudents.map((siswa) => (
                                          <tr key={siswa.id} className="hover:bg-slate-50/80 transition">
                                            <td className="px-5 py-2.5 font-bold text-slate-700 text-center">{siswa.noAbsen || '-'}</td>
                                            <td className="px-5 py-2.5 font-bold text-slate-900">{siswa.name}</td>
                                            <td className="px-5 py-2.5 font-mono font-medium text-slate-500">{siswa.nis}</td>
                                            <td className="px-5 py-2.5 text-slate-500 truncate max-w-[150px]">{siswa.email}</td>
                                            <td className="px-5 py-2.5 text-right">
                                              <div className="flex items-center justify-end gap-1">
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
                                                  className="text-amber-600 hover:text-amber-800 p-1.5 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                                                  title="Reset Password"
                                                >
                                                  <KeyRound className="w-4 h-4" />
                                                </button>
                                                <button
                                                  onClick={() => {
                                                    setEditingStudent(siswa);
                                                    setShowEditStudentModal(true);
                                                  }}
                                                  className="text-indigo-600 hover:text-indigo-800 p-1.5 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                                                  title="Edit Data Siswa"
                                                >
                                                  <Edit className="w-4 h-4" />
                                                </button>
                                                {onDeleteStudent && (
                                                  <button
                                                    onClick={() => {
                                                      if(window.confirm('Yakin ingin menghapus siswa ini?')) {
                                                        onDeleteStudent(siswa.id);
                                                      }
                                                    }}
                                                    className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                                    title="Hapus Siswa"
                                                  >
                                                    <Trash2 className="w-4 h-4" />
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
                                  <div className="p-6 text-center text-slate-400 text-xs font-medium bg-white">
                                    Belum ada siswa di kelas ini.
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

`;
  content = content.replace(oldTable, newTable);
  fs.writeFileSync('src/components/AdminPanel.tsx', content);
}
