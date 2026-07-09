const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');
content = content.replace('<title>My Google AI Studio App</title>', '<title>Rumah Belajar SPENIJI</title>\n    <link rel="icon" href="https://smpn1beji.sch.id/wp-content/uploads/2025/05/favico.png" />');
fs.writeFileSync('index.html', content);
