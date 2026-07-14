const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// Update sorting in filteredStudents
const oldFiltered = `  const filteredStudents = activeStudents.filter(s => 
    (s.name || '').toLowerCase().includes(searchStudent.toLowerCase()) || 
    s.nis.includes(searchStudent) ||
    getClassName(s.classId).toLowerCase().includes(searchStudent.toLowerCase())
  );`;

const newFiltered = `  const filteredStudents = activeStudents.filter(s => 
    (s.name || '').toLowerCase().includes(searchStudent.toLowerCase()) || 
    s.nis.includes(searchStudent) ||
    getClassName(s.classId).toLowerCase().includes(searchStudent.toLowerCase())
  ).sort((a, b) => {
    // Sort by class name first
    const classA = getClassName(a.classId);
    const classB = getClassName(b.classId);
    if (classA !== classB) {
      return classA.localeCompare(classB);
    }
    // Then sort by noAbsen, if available
    if (a.noAbsen != null && b.noAbsen != null) return a.noAbsen - b.noAbsen;
    if (a.noAbsen != null) return -1;
    if (b.noAbsen != null) return 1;
    // Finally, sort by name
    return (a.name || '').localeCompare(b.name || '');
  });`;

content = content.replace(oldFiltered, newFiltered);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
