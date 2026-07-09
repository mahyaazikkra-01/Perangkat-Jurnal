const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(
  "const handleAddCheatLog = (log: Omit<CheatLog, 'id' | 'timestamp'>) => {",
  "const handleAddCheatLog = React.useCallback((log: Omit<CheatLog, 'id' | 'timestamp'>) => {"
);
content = content.replace(
  "    addDocument('cheatLogs', logNode);\n  };",
  "    addDocument('cheatLogs', logNode);\n  }, []);"
);
fs.writeFileSync('src/App.tsx', content);
