const fs = require('fs');
let content = fs.readFileSync('src/components/StudentPanel.tsx', 'utf8');

const filterTarget = `  // Filter Teacher Announcements for this student
  const studentAnnouncements = announcements.filter(a => {
    if (!a.isActive) return false;
    if (a.targetType === 'all') return true;
    if (a.targetType === 'class') {
      return a.targetClassName === currentStudent.className || a.targetClassId === currentStudent.classId;
    }
    return true;
  });`;

const filterReplacement = `  // Filter Teacher Announcements for this student
  const studentAnnouncements = announcements.filter(a => {
    if (!a.isActive) return false;
    
    // Auto-expiry: Sembunyikan informasi yang usianya lebih dari 7 hari (Otomatis Bersih)
    if (a.createdAt) {
      const createdAt = new Date(a.createdAt).getTime();
      const now = new Date().getTime();
      const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
      if (now - createdAt > SEVEN_DAYS) return false;
    }

    if (a.targetType === 'all') return true;
    if (a.targetType === 'class') {
      return a.targetClassName === currentStudent.className || a.targetClassId === currentStudent.classId;
    }
    return true;
  });`;

content = content.replace(filterTarget, filterReplacement);

const popupTarget = `  useEffect(() => {
    const unread = studentAnnouncements.filter(a => !readAnnouncements.includes(a.id));
    if (unread.length > 0 && !examStarted) {
      setShowPopNotification(true);
    }
  }, [studentAnnouncements.length, currentStudent.id]);`;

const popupReplacement = `  useEffect(() => {
    // Pop-up hanya muncul untuk informasi yang Penting atau Mendesak
    const unreadUrgent = studentAnnouncements.filter(a => 
      !readAnnouncements.includes(a.id) && 
      (a.priority === 'mendesak' || a.priority === 'penting')
    );
    if (unreadUrgent.length > 0 && !examStarted) {
      setShowPopNotification(true);
    }
  }, [studentAnnouncements.length, currentStudent.id]);`;

content = content.replace(popupTarget, popupReplacement);

// Also we should make sure the pop-up notification UI only shows urgent ones? No, the UI code uses `studentAnnouncements.filter`. Wait, let's look at how the popup renders it.
fs.writeFileSync('src/components/StudentPanel.tsx', content);
