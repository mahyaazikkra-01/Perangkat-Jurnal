const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(
  /logoUrl: '',/,
  "logoUrl: 'https://smpn1beji.sch.id/wp-content/uploads/2025/05/logo_web_trans-1.png',"
);

fs.writeFileSync('src/App.tsx', content);

// Also try to update it in firebase if it exists. We can just add a quick script to patch it if run in node
