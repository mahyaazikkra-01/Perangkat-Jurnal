const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `                <h1 className="text-base font-extrabold tracking-tight uppercase">
                  {schoolConfig.headerAppName}
                </h1>`;

const replacement = `                <h1 className="text-base font-extrabold tracking-tight uppercase">
                  {currentRole === 'Student' ? 'RUMAH BELAJAR SPENIJI' : schoolConfig.headerAppName}
                </h1>`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('src/App.tsx', content);
