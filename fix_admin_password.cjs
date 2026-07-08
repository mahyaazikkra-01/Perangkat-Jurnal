const fs = require('fs');

// 1. Update types.ts
let typesContent = fs.readFileSync('src/types.ts', 'utf8');
typesContent = typesContent.replace(
  /footerText: string;\n}/,
  "footerText: string;\n  adminPassword?: string;\n}"
);
fs.writeFileSync('src/types.ts', typesContent);

// 2. Update App.tsx DEFAULT_SCHOOL_CONFIG & login check
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace(
  /footerText: '© 2026 E-Learning\/E-Jurnal SMPN 1 BEJI, Kab. Pasuruan.'\n};/,
  "footerText: '© 2026 E-Learning/E-Jurnal SMPN 1 BEJI, Kab. Pasuruan.',\n  adminPassword: 'admin123'\n};"
);

appContent = appContent.replace(
  /if \(user === 'admin' && pass === 'admin123'\) {/,
  "const expectedAdminPass = schoolConfig?.adminPassword || 'admin123';\n    if (user === 'admin' && pass === expectedAdminPass) {"
);

// Also remove the "placeholder='admin123...'" on login form
appContent = appContent.replace(
  /placeholder="admin123, atau guru123, atau email siswa"/,
  'placeholder="Masukkan password / email"'
);

fs.writeFileSync('src/App.tsx', appContent);
