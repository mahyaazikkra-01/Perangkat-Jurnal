const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const oldNav = `<div className="space-y-6 max-w-7xl mx-auto" id="admin-panel-container">
      {/* Navigation Sub-Header */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 bg-white px-6 py-2 rounded-2xl shadow-xs">`;

const newNav = `<div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto" id="admin-panel-container">
      {/* Navigation Sidebar */}
      <div className="w-full lg:w-64 shrink-0">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sticky top-6 flex flex-col gap-1.5 overflow-y-auto max-h-[90vh] custom-scrollbar">
          <div className="px-3 pb-3 mb-2 border-b border-slate-100">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Menu Admin</h3>
          </div>`;

content = content.replace(oldNav, newNav);

const navButtonsOldStr = `
        <button
          onClick={() => setActiveTab('dashboard')}
          className={\`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer \${
            activeTab === 'dashboard'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-600 hover:bg-slate-50'
          }\`}
        >
          📊 Ringkasan Dasbor
        </button>
        <button
          onClick={() => setActiveTab('registrations')}
          className={\`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 \${
            activeTab === 'registrations'
              ? 'bg-emerald-50 text-emerald-700'
              : 'text-slate-600 hover:bg-slate-50'
          }\`}
        >
          📋 Persetujuan Akun
          {pendingCount > 0 && (
            <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('teachers')}
          className={\`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer \${
            activeTab === 'teachers'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-600 hover:bg-slate-50'
          }\`}
        >
          🧑‍🏫 Data Guru Pengajar
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={\`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer \${
            activeTab === 'students'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-600 hover:bg-slate-50'
          }\`}
        >
          🎓 Data Siswa Terdaftar
        </button>
        <button
          onClick={() => setActiveTab('archived_students')}
          className={\`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer \${
            activeTab === 'archived_students'
              ? 'bg-slate-100 text-slate-800'
              : 'text-slate-600 hover:bg-slate-50'
          }\`}
        >
          📁 Data Alumni / Keluar
        </button>
        <button
          onClick={() => setActiveTab('journals')}
          className={\`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer \${
            activeTab === 'journals'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-600 hover:bg-slate-50'
          }\`}
        >
          📝 Riwayat Jurnal Mengajar
        </button>
        <button
          onClick={() => setActiveTab('classes')}
          className={\`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer \${
            activeTab === 'classes'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-600 hover:bg-slate-50'
          }\`}
        >
          🏫 Manajemen Kelas & Mapel
        </button>
        <button
          onClick={() => setActiveTab('cheatlogs')}
          className={\`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 \${
            activeTab === 'cheatlogs'
              ? 'bg-red-50 text-red-700'
              : 'text-slate-600 hover:bg-slate-50'
          }\`}
        >
          🛡️ Deteksi Anti-Contek
          {cheatLogs.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
              {cheatLogs.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={\`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 \${
            activeTab === 'config'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-600 hover:bg-slate-50'
          }\`}
        >
          <MonitorSmartphone className="w-4 h-4" />
          Pengaturan Tampilan
        </button>
      </div>`;

const navButtonsNewStr = `
        <button
          onClick={() => setActiveTab('dashboard')}
          className={\`w-full text-left px-4 py-3 text-sm font-bold rounded-xl transition-all flex items-center gap-3 cursor-pointer \${
            activeTab === 'dashboard'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
          }\`}
        >
          <span className="text-lg">📊</span> Ringkasan Dasbor
        </button>
        <button
          onClick={() => setActiveTab('registrations')}
          className={\`w-full text-left px-4 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-between cursor-pointer \${
            activeTab === 'registrations'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
          }\`}
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">📋</span> Persetujuan Akun
          </div>
          {pendingCount > 0 && (
            <span className={\`text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse \${activeTab === 'registrations' ? 'bg-white text-indigo-600' : 'bg-emerald-500 text-white'}\`}>
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('teachers')}
          className={\`w-full text-left px-4 py-3 text-sm font-bold rounded-xl transition-all flex items-center gap-3 cursor-pointer \${
            activeTab === 'teachers'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
          }\`}
        >
          <span className="text-lg">🧑‍🏫</span> Data Guru Pengajar
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={\`w-full text-left px-4 py-3 text-sm font-bold rounded-xl transition-all flex items-center gap-3 cursor-pointer \${
            activeTab === 'students'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
          }\`}
        >
          <span className="text-lg">🎓</span> Data Siswa Terdaftar
        </button>
        <button
          onClick={() => setActiveTab('archived_students')}
          className={\`w-full text-left px-4 py-3 text-sm font-bold rounded-xl transition-all flex items-center gap-3 cursor-pointer \${
            activeTab === 'archived_students'
              ? 'bg-slate-800 text-white shadow-md shadow-slate-300'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }\`}
        >
          <span className="text-lg">📁</span> Data Alumni / Keluar
        </button>
        <button
          onClick={() => setActiveTab('journals')}
          className={\`w-full text-left px-4 py-3 text-sm font-bold rounded-xl transition-all flex items-center gap-3 cursor-pointer \${
            activeTab === 'journals'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
          }\`}
        >
          <span className="text-lg">📝</span> Riwayat Jurnal Mengajar
        </button>
        <button
          onClick={() => setActiveTab('classes')}
          className={\`w-full text-left px-4 py-3 text-sm font-bold rounded-xl transition-all flex items-center gap-3 cursor-pointer \${
            activeTab === 'classes'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
          }\`}
        >
          <span className="text-lg">🏫</span> Manajemen Kelas & Mapel
        </button>
        <button
          onClick={() => setActiveTab('cheatlogs')}
          className={\`w-full text-left px-4 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-between cursor-pointer \${
            activeTab === 'cheatlogs'
              ? 'bg-red-600 text-white shadow-md shadow-red-200'
              : 'text-slate-600 hover:bg-red-50 hover:text-red-600'
          }\`}
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">🛡️</span> Deteksi Anti-Contek
          </div>
          {cheatLogs.length > 0 && (
            <span className={\`text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse \${activeTab === 'cheatlogs' ? 'bg-white text-red-600' : 'bg-red-500 text-white'}\`}>
              {cheatLogs.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={\`w-full text-left px-4 py-3 text-sm font-bold rounded-xl transition-all flex items-center gap-3 cursor-pointer \${
            activeTab === 'config'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
          }\`}
        >
          <span className="text-lg flex items-center justify-center w-[20px]"><MonitorSmartphone className="w-5 h-5" /></span> Pengaturan Tampilan
        </button>
        </div>
      </div>
      
      <div className="flex-1 min-w-0">`;

content = content.replace(navButtonsOldStr, navButtonsNewStr);

const endingStr = `    </div>
  );
}`;

const newEndingStr = `      </div>
    </div>
  );
}`;
content = content.replace(endingStr, newEndingStr);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
