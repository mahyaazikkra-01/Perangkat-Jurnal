const fs = require('fs');
let content = fs.readFileSync('src/components/TeacherPanel.tsx', 'utf8');

const targetStr = `if (window.confirm('Reset token ujian ini?')) {
                              onUpdateExam({ ...exam, token: Math.random().toString(36).substring(2, 8).toUpperCase() });
                            }`;
const replaceStr = `onUpdateExam({ ...exam, token: Math.random().toString(36).substring(2, 8).toUpperCase() });`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync('src/components/TeacherPanel.tsx', content);
