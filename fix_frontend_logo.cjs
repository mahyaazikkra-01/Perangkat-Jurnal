const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Change the DEFAULT_SCHOOL_CONFIG
content = content.replace(
  /logoUrl: 'https:\/\/smpn1beji\.sch\.id\/wp-content\/uploads\/2025\/05\/logo_web_trans-1\.png',/,
  "logoUrl: 'https://smpn1beji.sch.id/wp-content/uploads/2025/05/favico.png',"
);

content = content.replace(
  /logoUrl: '',/,
  "logoUrl: 'https://smpn1beji.sch.id/wp-content/uploads/2025/05/favico.png',"
);

// Update renderTarget
content = content.replace(
  /<img src="https:\/\/smpn1beji\.sch\.id\/wp-content\/uploads\/2025\/05\/logo_web_trans-1\.png" alt="Logo" className="w-10 h-10 object-contain" \/>/g,
  '<img src="https://smpn1beji.sch.id/wp-content/uploads/2025/05/favico.png" alt="Logo" className="w-10 h-10 object-contain" />'
);

// Add logo to landing page
const landingTarget = `{/* Visual Intro */}
                <div className="lg:col-span-7 space-y-6 lg:py-6">
                  <span className="bg-indigo-50 text-indigo-700 font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-widest border border-indigo-100">
                    {schoolConfig.landingTopTag}
                  </span>`;

const landingReplacement = `{/* Visual Intro */}
                <div className="lg:col-span-7 space-y-6 lg:py-6">
                  {/* Large Logo on Landing Page */}
                  <div className="mb-4">
                    {schoolConfig.logoUrl ? (
                      <img src={schoolConfig.logoUrl} alt="Logo Sekolah" className="w-24 h-24 sm:w-32 sm:h-32 object-contain" />
                    ) : (
                      <img src="https://smpn1beji.sch.id/wp-content/uploads/2025/05/favico.png" alt="Logo Sekolah" className="w-24 h-24 sm:w-32 sm:h-32 object-contain" />
                    )}
                  </div>
                  <span className="bg-indigo-50 text-indigo-700 font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-widest border border-indigo-100">
                    {schoolConfig.landingTopTag}
                  </span>`;

content = content.replace(landingTarget, landingReplacement);

fs.writeFileSync('src/App.tsx', content);
