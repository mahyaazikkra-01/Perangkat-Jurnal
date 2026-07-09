const fs = require('fs');
let content = fs.readFileSync('src/components/TeacherPanel.tsx', 'utf8');

const importTarget = `import { Teacher, ClassItem, SubjectItem, Student, JournalEntry, QuestionBank, Exam, ExamSubmission, CheatLog, TeacherAnnouncement, ShareRequest, Material } from '../types';`;
const importReplace = `import { Teacher, ClassItem, SubjectItem, Student, JournalEntry, QuestionBank, Exam, ExamSubmission, CheatLog, TeacherAnnouncement, ShareRequest, Material, GlobalAnnouncement } from '../types';`;
content = content.replace(importTarget, importReplace);

const propsTarget = `  onAcceptShare?: (req: ShareRequest) => void;
  onRejectShare?: (req: ShareRequest) => void;
}`;
const propsReplace = `  onAcceptShare?: (req: ShareRequest) => void;
  onRejectShare?: (req: ShareRequest) => void;
  globalAnnouncements?: GlobalAnnouncement[];
}`;
content = content.replace(propsTarget, propsReplace);

const fnTarget = `  onAcceptShare,
  onRejectShare
}: TeacherPanelProps) {`;
const fnReplace = `  onAcceptShare,
  onRejectShare,
  globalAnnouncements = []
}: TeacherPanelProps) {`;
content = content.replace(fnTarget, fnReplace);

const annTarget = `        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-sm text-white p-6">`;
const annReplace = `        <div className="lg:col-span-1 space-y-6">
          {globalAnnouncements.length > 0 && (
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-sm text-white p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-200" /> Pengumuman Sekolah
              </h3>
              <div className="space-y-3">
                {globalAnnouncements.map(ann => (
                  <div key={ann.id} className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/20">
                    <h4 className="font-bold text-sm">{ann.title}</h4>
                    <p className="text-xs text-orange-50 mt-1 line-clamp-3">{ann.content}</p>
                    <div className="text-[10px] text-orange-200 mt-2 font-medium">
                      {new Date(ann.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-sm text-white p-6">`;
content = content.replace(annTarget, annReplace);

fs.writeFileSync('src/components/TeacherPanel.tsx', content);
