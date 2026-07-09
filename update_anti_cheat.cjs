const fs = require('fs');
let content = fs.readFileSync('src/components/StudentPanel.tsx', 'utf8');

const targetStr = `  useEffect(() => {
    if (!examStarted || !activeExam) return;

    const handleWindowBlur = () => {
      // Triggered when student navigates away, changes tab, or opens another application
      setCheatingAttempts(prev => {
        const next = prev + 1;
        
        // Save to parent real-time cheat telemetry
        onAddCheatLog({
          studentName: currentStudent.name,
          studentNis: currentStudent.nis,
          className: currentStudent.className || 'Kelas',
          examTitle: activeExam.title,
          violationType: \`Keluar tab browser (\${next}x)\`
        });

        return next;
      });
      setShowCheatModal(true);
    };

    window.addEventListener('blur', handleWindowBlur);
    return () => {
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [examStarted, activeExam, currentStudent, onAddCheatLog]);`;

const replaceStr = `  useEffect(() => {
    if (!examStarted || !activeExam) return;

    const recordCheat = (type: string) => {
      setCheatingAttempts(prev => {
        const next = prev + 1;
        onAddCheatLog({
          studentName: currentStudent.name,
          studentNis: currentStudent.nis,
          className: currentStudent.className || 'Kelas',
          examTitle: activeExam.title,
          violationType: \`\${type} (\${next}x)\`
        });
        return next;
      });
      setShowCheatModal(true);
    };

    const handleWindowBlur = () => {
      recordCheat('Keluar dari layar/tab aplikasi');
    };

    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        recordCheat('Aplikasi masuk ke background/ditutup');
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      // Optional: recordCheat('Mencoba klik kanan');
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      // Optional: recordCheat('Mencoba menyalin/menempel teks');
    };

    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);

    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
    };
  }, [examStarted, activeExam, currentStudent, onAddCheatLog]);`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync('src/components/StudentPanel.tsx', content);
