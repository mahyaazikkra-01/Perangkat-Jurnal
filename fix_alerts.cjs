const fs = require('fs');

function replaceAlerts(file) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('alert(')) {
    if (!content.includes('import toast')) {
      content = "import toast from 'react-hot-toast';\n" + content;
    }
    content = content.replace(/alert\(/g, 'toast(');
    fs.writeFileSync(file, content);
  }
}

replaceAlerts('src/App.tsx');
replaceAlerts('src/components/AdminPanel.tsx');
replaceAlerts('src/components/TeacherPanel.tsx');
replaceAlerts('src/components/StudentPanel.tsx');

let appContent = fs.readFileSync('src/App.tsx', 'utf8');
if (!appContent.includes('<Toaster position="top-center" />')) {
  appContent = appContent.replace(
    'return (',
    'return (\n    <>\n      <Toaster position="top-center" />'
  );
  // find the last closing tag
  const lastDivIndex = appContent.lastIndexOf('</div>');
  appContent = appContent.substring(0, lastDivIndex + 6) + '\n    </>\n' + appContent.substring(lastDivIndex + 6);
  
  if (!appContent.includes('Toaster')) {
     appContent = "import { Toaster } from 'react-hot-toast';\n" + appContent;
  } else if (!appContent.includes('import { Toaster } from \'react-hot-toast\'')) {
     appContent = appContent.replace("import toast from 'react-hot-toast';", "import toast, { Toaster } from 'react-hot-toast';");
  }
  fs.writeFileSync('src/App.tsx', appContent);
}

