const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldHeader = `            {/* User status badge */}
            {currentRole !== 'Guest' && (
              <div className="flex items-center gap-3 bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700/60">
                <div className="text-right">
                  <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider block leading-none">
                    {currentRole === 'Teacher' ? 'Pengajar' : currentRole}
                  </span>
                  <span className="text-xs font-bold text-slate-200 block mt-0.5 max-w-[120px] truncate">
                    {activeUser?.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-lg transition cursor-pointer"
                >
                  Keluar
                </button>
              </div>
            )}`;

const newHeader = `            {/* User status badge */}
            {currentRole !== 'Guest' && (
              <div className="flex items-center gap-3 bg-slate-800/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700/50 shadow-lg mt-2 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                    {activeUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest block leading-none">
                      {currentRole === 'Teacher' ? 'Pengajar' : currentRole === 'Student' ? 'Siswa' : 'Admin Utama'}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-100 block mt-0.5 max-w-[150px] truncate">
                      {activeUser?.name}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 hover:border-rose-500 font-extrabold text-[10px] sm:text-xs px-4 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  Keluar
                </button>
              </div>
            )}`;

content = content.replace(oldHeader, newHeader);

fs.writeFileSync('src/App.tsx', content);
console.log('Header updated for mobile');
