const fs = require('fs');

let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const targetStr = `                {localConfig.logoUrl && (
                  <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-200 inline-block">
                    <img src={localConfig.logoUrl} alt="Preview" className="h-10 object-contain" />
                  </div>
                )}`;

const replacement = `                <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-200 inline-block">
                  <img src={localConfig.logoUrl || "https://smpn1beji.sch.id/wp-content/uploads/2025/05/logo_web_trans-1.png"} alt="Preview" className="h-10 object-contain" />
                </div>`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('src/components/AdminPanel.tsx', content);
