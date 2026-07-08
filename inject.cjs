const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(
  "  const handleUpdateTeacher = (updatedTeacher: Teacher) => {\n    updateDocument('teachers', updatedTeacher);\n  };",
  "  const handleUpdateTeacher = (updatedTeacher: Teacher) => {\n    updateDocument('teachers', updatedTeacher);\n  };\n\n  const handleAddTeacher = (newTeacher: Omit<Teacher, 'id'>) => {\n    const teacherNode: Teacher = {\n      ...newTeacher,\n      id: `t_${Math.random().toString(36).substring(7)}`\n    };\n    addDocument('teachers', teacherNode);\n  };"
);
content = content.replace(
  "  const handleUpdateMaterial = (updatedMat: Material) => {",
  "  const handleSaveMaterial = (newMat: Omit<Material, 'id' | 'createdAt'>) => {\n    const matNode: Material = {\n      ...newMat,\n      id: `m_${Math.random().toString(36).substring(7)}`,\n      createdAt: new Date().toISOString()\n    };\n    addDocument('materials', matNode);\n  };\n\n  const handleUpdateMaterial = (updatedMat: Material) => {"
);
fs.writeFileSync('src/App.tsx', content);
