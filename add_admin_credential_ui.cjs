const fs = require('fs');

let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const targetStr = '<div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">\n              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">\n                <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Bagian Header Atas';

const replacement = `<div className="bg-red-50/50 p-4 rounded-xl border border-red-100 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div> Kredensial Akun Admin
              </h3>
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700">Password Admin</label>
                <input
                  type="text"
                  required
                  placeholder="admin123"
                  value={localConfig.adminPassword || ''}
                  onChange={(e) => setLocalConfig({...localConfig, adminPassword: e.target.value})}
                  className="w-full px-3.5 py-2 border border-red-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500 bg-white"
                />
                <p className="text-[10px] text-slate-500 mt-1.5">Username untuk login sebagai admin selalu <strong className="font-mono text-slate-700">admin</strong>.</p>
              </div>
            </div>

            ` + targetStr;

content = content.replace(targetStr, replacement);
fs.writeFileSync('src/components/AdminPanel.tsx', content);
