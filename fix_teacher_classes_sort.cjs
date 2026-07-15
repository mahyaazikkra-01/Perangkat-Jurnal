const fs = require('fs');
let content = fs.readFileSync('src/components/TeacherPanel.tsx', 'utf8');

const insertionPoint = `}: TeacherPanelProps) {
  const [activeTab, setActiveTab] = useState<'journal' | 'materials' | 'exams' | 'bank_soal' | 'daftar_nilai' | 'profile' | 'announcements' | 'cheatlogs'>('journal');`;

const sortedClassesCode = `}: TeacherPanelProps) {
  const sortedClasses = [...classes].sort((a, b) => {
    const aMatch = a.name.match(/^(VII|VIII|IX|7|8|9)(.*)$/i);
    const bMatch = b.name.match(/^(VII|VIII|IX|7|8|9)(.*)$/i);
    
    const getGradeLevel = (match: RegExpMatchArray | null) => {
      if (!match) return 99;
      const gradeStr = match[1].toUpperCase();
      if (gradeStr === 'VII' || gradeStr === '7') return 7;
      if (gradeStr === 'VIII' || gradeStr === '8') return 8;
      if (gradeStr === 'IX' || gradeStr === '9') return 9;
      return 99;
    };
    
    const levelA = getGradeLevel(aMatch);
    const levelB = getGradeLevel(bMatch);
    
    if (levelA !== levelB) return levelA - levelB;
    return a.name.localeCompare(b.name);
  });

  const [activeTab, setActiveTab] = useState<'journal' | 'materials' | 'exams' | 'bank_soal' | 'daftar_nilai' | 'profile' | 'announcements' | 'cheatlogs'>('journal');`;

if (content.includes(insertionPoint)) {
  content = content.replace(insertionPoint, sortedClassesCode);
  fs.writeFileSync('src/components/TeacherPanel.tsx', content);
  console.log("Inserted sortedClasses");
} else {
  console.log("Could not find insertion point");
}
