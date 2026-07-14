const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

content = content.replace("  const [expandedClasses, setExpandedClasses] = useState({});", "  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({});");
content = content.replace("  const toggleClass = (classId) => {", "  const toggleClass = (classId: string) => {");

fs.writeFileSync('src/components/AdminPanel.tsx', content);
