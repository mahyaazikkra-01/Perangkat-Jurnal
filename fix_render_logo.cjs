const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const renderTarget = `            <div className="flex items-center gap-3">
              {schoolConfig.logoUrl ? (
                <img src={schoolConfig.logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md font-black text-lg">
                  {currentRole === 'Student' ? 'E' : 'J'}
                </div>
              )}`;

const renderReplacement = `            <div className="flex items-center gap-3">
              {schoolConfig.logoUrl ? (
                <img src={schoolConfig.logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
              ) : (
                <img src="https://smpn1beji.sch.id/wp-content/uploads/2025/05/logo_web_trans-1.png" alt="Logo" className="w-10 h-10 object-contain" />
              )}`;

content = content.replace(renderTarget, renderReplacement);
fs.writeFileSync('src/App.tsx', content);
