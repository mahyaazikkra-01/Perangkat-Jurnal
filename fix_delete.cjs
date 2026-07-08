const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const correctDeleteMat = `  const handleDeleteMaterial = (id: string) => {
    deleteDocument('materials', id);
  };`;

content = content.replace(
  /  const handleDeleteMaterial = \(id: string\) => {[\s\S]*?saveMaterialsState\(updated\);\n  };/,
  correctDeleteMat
);

fs.writeFileSync('src/App.tsx', content);
