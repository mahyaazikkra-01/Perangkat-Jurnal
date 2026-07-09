const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(
  "                submissions={submissions}",
  "                submissions={submissions}\n                cheatLogs={cheatLogs}"
);
fs.writeFileSync('src/App.tsx', content);
