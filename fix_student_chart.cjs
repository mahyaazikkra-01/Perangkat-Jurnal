const fs = require('fs');
let content = fs.readFileSync('src/components/StudentPanel.tsx', 'utf8');

const importRechartsTarget = `import { Student, TeacherAnnouncement, Exam, ExamSubmission, CheatLog, Material, GlobalAnnouncement } from '../types';
import { BookOpen, CheckCircle, Clock, AlertTriangle, FileText, Send, XCircle, Search, Play, FileSpreadsheet, Download, Video, Link as LinkIcon, Bell } from 'lucide-react';`;
const importRechartsReplace = `import { Student, TeacherAnnouncement, Exam, ExamSubmission, CheatLog, Material, GlobalAnnouncement } from '../types';
import { BookOpen, CheckCircle, Clock, AlertTriangle, FileText, Send, XCircle, Search, Play, FileSpreadsheet, Download, Video, Link as LinkIcon, Bell, TrendingUp, BarChart3, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';`;
content = content.replace(importRechartsTarget, importRechartsReplace);

const tabStateTarget = `const [activeTab, setActiveTab] = useState<'dashboard' | 'ujian' | 'materi'>('dashboard');`;
const tabStateReplace = `const [activeTab, setActiveTab] = useState<'dashboard' | 'ujian' | 'materi' | 'rapor'>('dashboard');`;
content = content.replace(tabStateTarget, tabStateReplace);

const sidebarTarget = `          <button
            onClick={() => setActiveTab('materi')}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium \${
              activeTab === 'materi'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }\`}
          >
            <BookOpen className="w-5 h-5" />
            <div className="flex flex-col items-start">
              <span>Materi Belajar</span>
              {materials.length > 0 && (
                <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-full mt-0.5 font-bold">
                  {materials.length} Baru
                </span>
              )}
            </div>
          </button>
        </nav>`;
const sidebarReplace = `          <button
            onClick={() => setActiveTab('materi')}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium \${
              activeTab === 'materi'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }\`}
          >
            <BookOpen className="w-5 h-5" />
            <div className="flex flex-col items-start">
              <span>Materi Belajar</span>
              {materials.length > 0 && (
                <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-full mt-0.5 font-bold">
                  {materials.length} Baru
                </span>
              )}
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('rapor')}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium \${
              activeTab === 'rapor'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }\`}
          >
            <TrendingUp className="w-5 h-5" />
            Rapor & Progres
          </button>
        </nav>`;
content = content.replace(sidebarTarget, sidebarReplace);

const raporTarget = `      {/* MATERI TAB */}`;
const raporReplace = `      {/* RAPOR TAB */}
      {activeTab === 'rapor' && (() => {
        const mySubmissions = submissions.filter(s => s.studentNis === currentStudent.nis);
        const avgScore = mySubmissions.length > 0 
          ? (mySubmissions.reduce((acc, curr) => acc + curr.score, 0) / mySubmissions.length).toFixed(2)
          : '0.00';
          
        const chartData = mySubmissions.map(sub => ({
          name: sub.examTitle.length > 15 ? sub.examTitle.substring(0, 15) + '...' : sub.examTitle,
          Nilai: sub.score
        }));

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-xl font-bold text-slate-800">Grafik Nilai Ujian</h2>
                </div>
                
                {chartData.length > 0 ? (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} angle={-45} textAnchor="end" />
                        <YAxis tick={{ fontSize: 12, fill: '#64748B' }} domain={[0, 100]} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          cursor={{ fill: '#F1F5F9' }}
                        />
                        <Bar dataKey="Nilai" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Belum ada nilai ujian yang terekam.</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl shadow-md p-6 text-white text-center">
                  <Award className="w-12 h-12 text-indigo-200 mx-auto mb-2" />
                  <p className="text-indigo-100 text-sm font-medium">Rata-rata Nilai</p>
                  <p className="text-4xl font-black mt-1">{avgScore}</p>
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-800 mb-4">Riwayat Ujian Selesai</h3>
                  {mySubmissions.length > 0 ? (
                    <div className="space-y-3">
                      {mySubmissions.map(sub => (
                        <div key={sub.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="overflow-hidden">
                            <p className="font-semibold text-sm text-slate-800 truncate">{sub.examTitle}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{new Date(sub.submittedAt).toLocaleDateString('id-ID')}</p>
                          </div>
                          <div className={\`px-3 py-1 rounded-lg font-bold text-sm shrink-0 \${
                            sub.score >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }\`}>
                            {sub.score}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic text-center py-4">Belum ada riwayat ujian.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MATERI TAB */}`;

content = content.replace(raporTarget, raporReplace);

fs.writeFileSync('src/components/StudentPanel.tsx', content);
