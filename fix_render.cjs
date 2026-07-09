const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  '  return (\n    <div className="min-h-screen bg-[#fafafa] flex flex-col text-slate-800 antialiased font-sans">',
  '  return (\n    <>\n      <Toaster position="top-center" />\n      <div className="min-h-screen bg-[#fafafa] flex flex-col text-slate-800 antialiased font-sans">'
);

fs.writeFileSync('src/App.tsx', content);
