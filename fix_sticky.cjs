const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

content = content.replace(
  'className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sticky top-6 flex flex-col gap-1.5 overflow-y-auto max-h-[90vh] custom-scrollbar"',
  'className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-4 lg:sticky lg:top-6 flex flex-col gap-1.5 overflow-y-auto max-h-[90vh] custom-scrollbar z-10"'
);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
console.log('Fixed sticky on mobile');
