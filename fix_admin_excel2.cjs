const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const importXLSX = "import * as XLSX from 'xlsx';\n";
if (!content.includes('import * as XLSX')) {
  content = importXLSX + content;
}

fs.writeFileSync('src/components/AdminPanel.tsx', content);
