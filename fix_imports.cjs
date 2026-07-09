const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace(
  "ShareRequest",
  "ShareRequest, GlobalAnnouncement"
);
fs.writeFileSync('src/App.tsx', appContent);

let adminContent = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');
adminContent = adminContent.replace(
  "SchoolConfig",
  "SchoolConfig, GlobalAnnouncement"
);
fs.writeFileSync('src/components/AdminPanel.tsx', adminContent);

let teacherContent = fs.readFileSync('src/components/TeacherPanel.tsx', 'utf8');
teacherContent = teacherContent.replace(
  "Settings, Building, UserCheck,",
  "Settings, Building, UserCheck, ShieldAlert,"
);
fs.writeFileSync('src/components/TeacherPanel.tsx', teacherContent);
