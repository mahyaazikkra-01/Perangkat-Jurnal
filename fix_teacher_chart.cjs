const fs = require('fs');
let content = fs.readFileSync('src/components/TeacherPanel.tsx', 'utf8');

const importRechartsTarget = `import {
  Users, BookOpen, Clock, Settings, Plus, FileText, CheckCircle, Search, Edit, Trash2, ArrowRight, Play, Eye, Download, Upload, Share2, Inbox, Bell, BookMarked, Video, Link as LinkIcon
} from 'lucide-react';`;
const importRechartsReplace = `import {
  Users, BookOpen, Clock, Settings, Plus, FileText, CheckCircle, Search, Edit, Trash2, ArrowRight, Play, Eye, Download, Upload, Share2, Inbox, Bell, BookMarked, Video, Link as LinkIcon, BarChart3, TrendingUp
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';`;
content = content.replace(importRechartsTarget, importRechartsReplace);

const tabStateTarget = `const [activeTab, setActiveTab] = useState<'dashboard' | 'jurnal' | 'materi' | 'bank_soal' | 'ujian' | 'koreksi'>('dashboard');`;
const tabStateReplace = `const [activeTab, setActiveTab] = useState<'dashboard' | 'jurnal' | 'materi' | 'bank_soal' | 'ujian' | 'koreksi' | 'analitik'>('dashboard');`;
content = content.replace(tabStateTarget, tabStateReplace);

const sidebarTarget = `          <button
            onClick={() => setActiveTab('koreksi')}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium \${
              activeTab === 'koreksi'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }\`}
          >
            <CheckCircle className="w-5 h-5" />
            <div className="flex flex-col items-start">
              <span>Hasil & Koreksi</span>
              {mySubmissions.length > 0 && (
                <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-full mt-0.5 font-bold">
                  {mySubmissions.length} Data
                </span>
              )}
            </div>
          </button>
        </nav>`;
const sidebarReplace = `          <button
            onClick={() => setActiveTab('koreksi')}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium \${
              activeTab === 'koreksi'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }\`}
          >
            <CheckCircle className="w-5 h-5" />
            <div className="flex flex-col items-start">
              <span>Hasil & Koreksi</span>
              {mySubmissions.length > 0 && (
                <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-full mt-0.5 font-bold">
                  {mySubmissions.length} Data
                </span>
              )}
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('analitik')}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium \${
              activeTab === 'analitik'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }\`}
          >
            <BarChart3 className="w-5 h-5" />
            Analitik & Rekap Nilai
          </button>
        </nav>`;
content = content.replace(sidebarTarget, sidebarReplace);

const analitikTarget = `      {/* PENGAYAAN MATERI TAB */}`;
const analitikReplace = `      {/* ANALITIK TAB */}
      {activeTab === 'analitik' && (() => {
        // Prepare chart data
        const chartData = myExams.map(exam => {
          const examSubs = mySubmissions.filter(sub => sub.examId === exam.id);
          const avgScore = examSubs.length > 0 
            ? examSubs.reduce((acc, sub) => acc + sub.score, 0) / examSubs.length 
            : 0;
          return {
            name: exam.title.length > 15 ? exam.title.substring(0, 15) + '...' : exam.title,
            RataRata: parseFloat(avgScore.toFixed(2)),
            Peserta: examSubs.length
          };
        });

        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-indigo-600" />
                    Analitik & Rekap Rata-Rata Nilai
                  </h2>
                  <p className="text-sm text-slate-500">Pantau perkembangan nilai rata-rata dari setiap ujian yang Anda selenggarakan.</p>
                </div>
              </div>

              {chartData.length > 0 ? (
                <div className="h-[400px] w-full mt-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} angle={-45} textAnchor="end" />
                      <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: '#F1F5F9' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Bar dataKey="RataRata" fill="#4F46E5" radius={[6, 6, 0, 0]} name="Nilai Rata-rata" />
                      <Bar dataKey="Peserta" fill="#38BDF8" radius={[6, 6, 0, 0]} name="Total Peserta" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">Belum ada data ujian untuk dianalisis.</p>
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Statistik Kelas & Ujian</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                  <p className="text-sm font-semibold text-indigo-800">Total Ujian Dibuat</p>
                  <p className="text-3xl font-black text-indigo-600 mt-2">{myExams.length}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <p className="text-sm font-semibold text-emerald-800">Total Pengumpulan Nilai</p>
                  <p className="text-3xl font-black text-emerald-600 mt-2">{mySubmissions.length}</p>
                </div>
                <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                  <p className="text-sm font-semibold text-rose-800">Total Pelanggaran Deteksi Layar</p>
                  <p className="text-3xl font-black text-rose-600 mt-2">{cheatLogs.filter(l => myExams.some(e => e.title === l.examTitle)).length}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* PENGAYAAN MATERI TAB */}`;

content = content.replace(analitikTarget, analitikReplace);

fs.writeFileSync('src/components/TeacherPanel.tsx', content);
