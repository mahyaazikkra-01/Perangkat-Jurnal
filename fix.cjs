const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const subjectCode = `
  const handleAddSubject = (subjectName: string) => {
    const trimmed = subjectName.trim();
    if (!trimmed) return;
    const exists = subjects.some(s => s.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) return;
    const newSubjectNode: SubjectItem = {
      id: \`subj_\${Math.random().toString(36).substring(7)}\`,
      name: trimmed
    };
    addDocument('subjects', newSubjectNode);
  };
`;

const toggleMaterialCode = `
  const handleToggleMaterial = (id: string, currentStatus: 'Aktif' | 'Draft') => {
    updateDocument('materials', { id, status: currentStatus === 'Aktif' ? 'Draft' : 'Aktif' } as any);
  };
`;

content = content.replace(
  "  const handleDeleteSubject = (id: string) => {",
  subjectCode + "\n  const handleDeleteSubject = (id: string) => {"
);

content = content.replace(
  "  const handleDeleteMaterial = (id: string) => {",
  toggleMaterialCode + "\n  const handleDeleteMaterial = (id: string) => {"
);

fs.writeFileSync('src/App.tsx', content);
