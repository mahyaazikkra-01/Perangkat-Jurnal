const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(
  "                cheatLogs={cheatLogs}\n                submissions={submissions}\n                cheatLogs={cheatLogs}",
  "                submissions={submissions}\n                cheatLogs={cheatLogs}"
);
fs.writeFileSync('src/App.tsx', content);
