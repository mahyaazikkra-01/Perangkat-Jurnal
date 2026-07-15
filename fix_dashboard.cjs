const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const targetStr = `      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
              <div className="bg-indigo-50 text-indigo-600 p-4 rounded-xl">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-semibold mb-1">Total Siswa</p>
                <h4 className="text-3xl font-extrabold text-slate-800">{students.length}</h4>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
              <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-semibold mb-1">Total Guru</p>
                <h4 className="text-3xl font-extrabold text-slate-800">{teachers.length}</h4>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
              <div className="bg-amber-50 text-amber-600 p-4 rounded-xl">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-semibold mb-1">Total Kelas</p>
                <h4 className="text-3xl font-extrabold text-slate-800">{classes.length}</h4>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
              <div className="bg-rose-50 text-rose-600 p-4 rounded-xl">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-semibold mb-1">Total Jurnal</p>
                <h4 className="text-3xl font-extrabold text-slate-800">{journals.length}</h4>
              </div>
            </div>
          </div>
        </div>
      )}`;

const replacementStr = `      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
              <div className="bg-indigo-50 text-indigo-600 p-4 rounded-xl">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-semibold mb-1">Total Siswa</p>
                <h4 className="text-3xl font-extrabold text-slate-800">{students.length}</h4>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
              <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl">
                <UserCheck className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-semibold mb-1">Total Guru</p>
                <h4 className="text-3xl font-extrabold text-slate-800">{teachers.length}</h4>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
              <div className="bg-amber-50 text-amber-600 p-4 rounded-xl">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-semibold mb-1">Total Kelas</p>
                <h4 className="text-3xl font-extrabold text-slate-800">{classes.length}</h4>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
              <div className="bg-blue-50 text-blue-600 p-4 rounded-xl">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-semibold mb-1">Total Mapel</p>
                <h4 className="text-3xl font-extrabold text-slate-800">{subjects.length}</h4>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
              <div className="bg-rose-50 text-rose-600 p-4 rounded-xl">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-semibold mb-1">Total Jurnal</p>
                <h4 className="text-3xl font-extrabold text-slate-800">{journals.length}</h4>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
              <div className="bg-teal-50 text-teal-600 p-4 rounded-xl">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-semibold mb-1">Jurnal Hari Ini</p>
                <h4 className="text-3xl font-extrabold text-slate-800">
                  {journals.filter(j => new Date(j.timestamp).toDateString() === new Date().toDateString()).length}
                </h4>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
              <div className="bg-orange-50 text-orange-600 p-4 rounded-xl">
                <Clock className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-semibold mb-1">Persetujuan Akun</p>
                <h4 className="text-3xl font-extrabold text-slate-800">{pendingCount}</h4>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
              <div className="bg-red-50 text-red-600 p-4 rounded-xl">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-semibold mb-1">Pelanggaran Ujian</p>
                <h4 className="text-3xl font-extrabold text-slate-800">{cheatLogs.length}</h4>
              </div>
            </div>
          </div>
        </div>
      )}`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync('src/components/AdminPanel.tsx', content);
  console.log("Updated DASHBOARD TAB");
} else {
  console.log("Could not find DASHBOARD TAB string");
}
