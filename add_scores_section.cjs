const fs = require('fs');
let content = fs.readFileSync('src/components/StudentPanel.tsx', 'utf8');

const targetStr = `      {/* POPUP MODAL NOTIFIKASI UPON LOGIN (IF UNREAD EXISTS) */}`;

const scoresSection = `      {/* SCORES HISTORY */}
      {activeTab === 'scores' && !examStarted && !scoreResult && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Riwayat Nilai & Evaluasi</h3>
            <p className="text-slate-500 text-xs mt-0.5">Daftar nilai ujian dan tugas yang telah Anda kerjakan</p>
          </div>

          {(() => {
            const mySubmissions = submissions.filter(sub => sub.studentNis === currentStudent.nis);
            
            if (mySubmissions.length === 0) {
              return (
                <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl">
                  <p className="text-slate-400 text-xs">Anda belum memiliki riwayat nilai.</p>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {mySubmissions.map((sub) => {
                  const subjectName = subjects.find(s => s.id === exams.find(e => e.id === sub.examId)?.subjectId)?.name || 'Mata Pelajaran';
                  
                  return (
                    <div key={sub.id} className="border border-slate-100 rounded-2xl p-5 hover:border-slate-200 transition bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded">
                            {subjectName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(sub.submittedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{sub.examTitle}</h4>
                      </div>
                      <div className="bg-white px-5 py-3 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center min-w-[100px]">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Nilai Akhir</span>
                        <span className={\`text-2xl font-black \${sub.score >= 75 ? 'text-green-600' : 'text-rose-600'}\`}>
                          {sub.score}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* POPUP MODAL NOTIFIKASI UPON LOGIN (IF UNREAD EXISTS) */}`;

content = content.replace(targetStr, scoresSection);

fs.writeFileSync('src/components/StudentPanel.tsx', content);
