const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `  const handleAddSubject = (subjectName: string) => {`;
const replace1 = `  const handleAddGlobalAnnouncement = (ann: Omit<GlobalAnnouncement, 'id' | 'createdAt'>) => {
    addDocument('globalAnnouncements', {
      ...ann,
      id: \`gann_\${Math.random().toString(36).substring(7)}\`,
      createdAt: new Date().toISOString()
    });
  };

  const handleDeleteGlobalAnnouncement = (id: string) => {
    deleteDocument('globalAnnouncements', id);
  };

  const handleAddSubject = (subjectName: string) => {`;

content = content.replace(target1, replace1);

const target2 = `                onDeleteClass={handleDeleteClass}
                onUpdateClass={handleUpdateClass}
                onAddSubject={handleAddSubject}
                onDeleteSubject={handleDeleteSubject}
                onUpdateSubject={handleUpdateSubject}`;
const replace2 = `                onDeleteClass={handleDeleteClass}
                onUpdateClass={handleUpdateClass}
                onAddSubject={handleAddSubject}
                onDeleteSubject={handleDeleteSubject}
                onUpdateSubject={handleUpdateSubject}
                globalAnnouncements={globalAnnouncements}
                onAddGlobalAnnouncement={handleAddGlobalAnnouncement}
                onDeleteGlobalAnnouncement={handleDeleteGlobalAnnouncement}`;

content = content.replace(target2, replace2);

const target3 = `                teacherAnnouncements={announcements.filter(a => a.teacherId === activeUser.id)}`;
const replace3 = `                teacherAnnouncements={announcements.filter(a => a.teacherId === activeUser.id)}
                globalAnnouncements={globalAnnouncements.filter(a => a.targetRole === 'All' || a.targetRole === 'Teacher')}`;

content = content.replace(target3, replace3);

const target4 = `                studentClass={classes.find(c => c.id === activeUser.classId)?.name || 'Unknown Class'}
                announcements={announcements.filter(a => a.targetType === 'all' || a.targetClassId === activeUser.classId)}
                activeExams={exams.filter(e => e.classId === activeUser.classId)}`;
const replace4 = `                studentClass={classes.find(c => c.id === activeUser.classId)?.name || 'Unknown Class'}
                announcements={announcements.filter(a => a.targetType === 'all' || a.targetClassId === activeUser.classId)}
                globalAnnouncements={globalAnnouncements.filter(a => a.targetRole === 'All' || a.targetRole === 'Student')}
                activeExams={exams.filter(e => e.classId === activeUser.classId)}`;

content = content.replace(target4, replace4);

fs.writeFileSync('src/App.tsx', content);
