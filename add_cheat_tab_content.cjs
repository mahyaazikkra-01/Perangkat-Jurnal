const fs = require('fs');
let content = fs.readFileSync('src/components/TeacherPanel.tsx', 'utf8');

const targetStr = `      {/* 4. TAB PROFIL GURU & JADWAL MENGAJAR PRIBADI */}`;
const replaceStr = `      {/* TAB CHEATLOGS */}
      {activeTab === 'cheatlogs' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Log Pelanggaran Siswa</h2>
              <p className="text-sm text-slate-500">
                Catatan otomatis siswa yang keluar dari aplikasi/tab saat ujian berlangsung.
              </p>
            </div>
          </div>

          {teacherCheatLogs.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-3xl bg-white shadow-sm">
              <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Belum ada pelanggaran yang tercatat pada ujian Anda.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="p-4 font-bold border-b border-slate-200">Waktu</th>
                      <th className="p-4 font-bold border-b border-slate-200">Siswa</th>
                      <th className="p-4 font-bold border-b border-slate-200">Kelas</th>
                      <th className="p-4 font-bold border-b border-slate-200">Ujian</th>
                      <th className="p-4 font-bold border-b border-slate-200">Pelanggaran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {teacherCheatLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition">
                        <td className="p-4 text-slate-600 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString('id-ID')}
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-slate-900">{log.studentName}</p>
                          <p className="text-xs text-slate-500">{log.studentNis}</p>
                        </td>
                        <td className="p-4 text-slate-700 font-medium">{log.className}</td>
                        <td className="p-4 text-slate-700 font-medium">{log.examTitle}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-700">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {log.violationType}
                          </span>
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

      {/* 4. TAB PROFIL GURU & JADWAL MENGAJAR PRIBADI */}`;
      
content = content.replace(targetStr, replaceStr);
// Add import ShieldAlert if missing
if (!content.includes('ShieldAlert')) {
  content = content.replace(
    "AlertCircle, Clipboard, Download, Info, Printer, Filter, BarChart3, X, Settings, Building, UserCheck,",
    "AlertCircle, Clipboard, Download, Info, Printer, Filter, BarChart3, X, Settings, Building, UserCheck, ShieldAlert,"
  );
}

fs.writeFileSync('src/components/TeacherPanel.tsx', content);
