const fs = require('fs');
let content = fs.readFileSync('src/components/StudentPanel.tsx', 'utf8');

const popupUiTarget = `      {/* POPUP MODAL NOTIFIKASI UPON LOGIN (IF UNREAD EXISTS) */}
      {showPopNotification && !examStarted && unreadCount > 0 && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-amber-300 w-full max-w-lg p-6 space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <Bell className="w-6 h-6 text-amber-600 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-950 text-base">Notifikasi Catatan Guru Mapel</h3>
                  <p className="text-[11px] text-amber-800 font-semibold">Ada {unreadCount} pesan baru yang perlu Anda perhatikan hari ini</p>
                </div>
              </div>
              <button
                onClick={() => setShowPopNotification(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {studentAnnouncements
                .filter(a => !readAnnouncements.includes(a.id))
                .slice(0, 3)
                .map(ann => (
                  <div key={ann.id} className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">`;

const popupUiReplacement = `      {/* POPUP MODAL NOTIFIKASI UPON LOGIN (IF UNREAD EXISTS) */}
      {showPopNotification && !examStarted && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-amber-300 w-full max-w-lg p-6 space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-100 rounded-xl">
                  <Bell className="w-6 h-6 text-red-600 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-950 text-base">Notifikasi Penting</h3>
                  <p className="text-[11px] text-red-800 font-semibold">Ada pesan Mendesak/Penting dari Guru Anda</p>
                </div>
              </div>
              <button
                onClick={() => setShowPopNotification(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {studentAnnouncements
                .filter(a => !readAnnouncements.includes(a.id) && (a.priority === 'mendesak' || a.priority === 'penting'))
                .slice(0, 3)
                .map(ann => (
                  <div key={ann.id} className="p-4 rounded-xl bg-red-50 border border-red-200/80 space-y-2">`;

content = content.replace(popupUiTarget, popupUiReplacement);

// Just to be safe, find if unreadCount was used in condition:
const popupCheckCount = `{showPopNotification && !examStarted && unreadCount > 0 && (`
content = content.replace(popupCheckCount, `{showPopNotification && !examStarted && (`);

fs.writeFileSync('src/components/StudentPanel.tsx', content);
