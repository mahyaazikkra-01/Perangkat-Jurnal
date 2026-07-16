const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldHeader = 'className="flex justify-between items-center h-16 flex-wrap gap-4 py-3 sm:py-0"';
const newHeader = 'className="flex justify-between items-center min-h-[4rem] flex-wrap gap-3 py-3 sm:py-0"';

content = content.replace(oldHeader, newHeader);

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed header');
