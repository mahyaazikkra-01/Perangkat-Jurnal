const fs = require('fs');
let content = fs.readFileSync('src/components/TeacherPanel.tsx', 'utf8');

const targetStr = `          <button
            onClick={() => setActiveTab('daftar_nilai')}
            className={\`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer \${
              activeTab === 'daftar_nilai'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'bg-indigo-800/40 text-indigo-100 hover:bg-indigo-800/60'
            }\`}
          >
            📊 Daftar Nilai
          </button>`;
          
const replaceStr = targetStr + `
          <button
            onClick={() => setActiveTab('cheatlogs')}
            className={\`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer \${
              activeTab === 'cheatlogs'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'bg-indigo-800/40 text-indigo-100 hover:bg-indigo-800/60'
            }\`}
          >
            🚨 Log Anti-Contek
            {teacherCheatLogs && teacherCheatLogs.length > 0 && (
              <span className="ml-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px]">
                {teacherCheatLogs.length}
              </span>
            )}
          </button>`;
          
content = content.replace(targetStr, replaceStr);
fs.writeFileSync('src/components/TeacherPanel.tsx', content);
