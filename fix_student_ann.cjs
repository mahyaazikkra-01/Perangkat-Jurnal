const fs = require('fs');
let content = fs.readFileSync('src/components/StudentPanel.tsx', 'utf8');

const importTarget = `import { Student, TeacherAnnouncement, Exam, ExamSubmission, CheatLog, Material } from '../types';`;
const importReplace = `import { Student, TeacherAnnouncement, Exam, ExamSubmission, CheatLog, Material, GlobalAnnouncement } from '../types';`;
content = content.replace(importTarget, importReplace);

const propsTarget = `  onSubmitExam?: (submission: Omit<ExamSubmission, 'id' | 'submittedAt'>) => void;
  onLogCheat?: (log: Omit<CheatLog, 'id' | 'timestamp'>) => void;
}`;
const propsReplace = `  onSubmitExam?: (submission: Omit<ExamSubmission, 'id' | 'submittedAt'>) => void;
  onLogCheat?: (log: Omit<CheatLog, 'id' | 'timestamp'>) => void;
  globalAnnouncements?: GlobalAnnouncement[];
}`;
content = content.replace(propsTarget, propsReplace);

const fnTarget = `  onSubmitExam,
  onLogCheat
}: StudentPanelProps) {`;
const fnReplace = `  onSubmitExam,
  onLogCheat,
  globalAnnouncements = []
}: StudentPanelProps) {`;
content = content.replace(fnTarget, fnReplace);

const annTarget = `      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Announcements */}
            <div className="md:col-span-2 space-y-4">`;
const annReplace = `      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          
          {globalAnnouncements.length > 0 && (
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl shadow-md text-white p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                <Bell className="w-6 h-6 text-amber-200" /> Pengumuman Sekolah
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {globalAnnouncements.map(ann => (
                  <div key={ann.id} className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
                    <h3 className="font-bold">{ann.title}</h3>
                    <p className="text-sm text-orange-50 mt-1">{ann.content}</p>
                    <span className="text-[10px] text-orange-200 mt-2 block font-medium">
                      {new Date(ann.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Announcements */}
            <div className="md:col-span-2 space-y-4">`;
content = content.replace(annTarget, annReplace);

fs.writeFileSync('src/components/StudentPanel.tsx', content);
