const fs = require('fs');
let content = fs.readFileSync('src/components/TeacherPanel.tsx', 'utf8');

const targetStr = `                          onClick={() => {
                            const newToken = Math.random().toString(36).substring(2, 8).toUpperCase();
                            onUpdateExam({
                              ...exam,
                              token: newToken
                            });
                            // using simple custom toast or just logging, avoiding alert in iframe
                          }}`;
const replaceStr = `                          onClick={() => {
                            const newToken = Math.random().toString(36).substring(2, 8).toUpperCase();
                            onUpdateExam({
                              ...exam,
                              token: newToken
                            });
                            alert(\`Token berhasil direset menjadi: \${newToken}\`);
                          }}`;
                          
content = content.replace(targetStr, replaceStr);
fs.writeFileSync('src/components/TeacherPanel.tsx', content);
