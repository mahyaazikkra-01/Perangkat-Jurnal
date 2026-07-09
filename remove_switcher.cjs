const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `            {/* Mode toggler */}
            <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-bold shadow-inner">
              <button
                onClick={() => setActiveMode('app')}
                className={\`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 \${
                  activeMode === 'app'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }\`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Web App Simulator</span>
              </button>
              <button
                onClick={() => setActiveMode('gas')}
                className={\`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 \${
                  activeMode === 'gas'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }\`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Google Apps Script</span>
              </button>
            </div>`;

content = content.replace(targetStr, "");
fs.writeFileSync('src/App.tsx', content);
