const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const oldStudentUpload = `  const handleFileUploadImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setImportText(text);
        handleParseImport(text);
      }
    };
    reader.readAsText(file);
  };`;

const oldTeacherUpload = `  const handleFileUploadTeacherImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setTeacherImportText(text);
        handleParseTeacherImport(text);
      }
    };
    reader.readAsText(file);
  };`;

const newUploadLogic = `  const processExcelOrCsv = (file: File, setText: (text: string) => void, parse: (text: string) => void) => {
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[firstSheetName]);
        setText(csv);
        parse(csv);
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setText(text);
          parse(text);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileUploadImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processExcelOrCsv(file, setImportText, handleParseImport);
  };`;

const newTeacherUpload = `  const handleFileUploadTeacherImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processExcelOrCsv(file, setTeacherImportText, handleParseTeacherImport);
  };`;

content = content.replace(oldStudentUpload, newUploadLogic);
content = content.replace(oldTeacherUpload, newTeacherUpload);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
