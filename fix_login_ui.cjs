const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `            {/* GUEST LANDING & LOGIN */}
            {currentRole === 'Guest' && (
              <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Visual Intro */}
                <div className="lg:col-span-7 space-y-6 lg:py-6">
                  {/* Large Logo on Landing Page */}
                  <div className="mb-4">
                    {schoolConfig.logoUrl && schoolConfig.logoUrl !== 'https://smpn1beji.sch.id/wp-content/uploads/2025/05/logo_web_trans-1.png' ? (
                      <img src={schoolConfig.logoUrl} alt="Logo Sekolah" className="w-24 h-24 sm:w-32 sm:h-32 object-contain" />
                    ) : (
                      <img src="https://smpn1beji.sch.id/wp-content/uploads/2025/05/favico.png" alt="Logo Sekolah" className="w-24 h-24 sm:w-32 sm:h-32 object-contain" />
                    )}
                  </div>
                  <span className="bg-indigo-50 text-indigo-700 font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-widest border border-indigo-100">
                    {schoolConfig.landingTopTag}
                  </span>
                  
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                    {schoolConfig.landingTitle}
                  </h2>
                  
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">
                    {schoolConfig.landingDescription}
                  </p>

                  {/* Feature lists */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                      <div>
                        <strong className="text-slate-950 font-bold">Jurnal Digital Guru</strong>
                        <p className="text-slate-400 mt-0.5">Catat kehadiran, topik KBM, dan kendala kelas dengan penyimpanan appendRow.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                      <div>
                        <strong className="text-slate-950 font-bold">Materi Terintegrasi Drive</strong>
                        <p className="text-slate-400 mt-0.5">Guru unggah PDF/materi ke Drive folder. Link terintegrasi asinkronus.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                      <div>
                        <strong className="text-slate-950 font-bold">Ujian / Tugas & Evaluasi</strong>
                        <p className="text-slate-400 mt-0.5">LMS Interaktif dengan 4 jenis soal evaluasi: Pilihan Ganda, Kompleks, Asosiatif, Sebab-Akibat.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                      <div>
                        <strong className="text-slate-950 font-bold">Sistem Anti-Contek Native</strong>
                        <p className="text-slate-400 mt-0.5">Deteksi blur window siswa otomatis mengirim log pelanggaran ke Spreadsheet.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secure Login & Register Form */}
                <div className="lg:col-span-5 bg-white border border-slate-200 shadow-lg rounded-3xl p-6 space-y-6">`;

const replaceStr = `            {/* GUEST LANDING & LOGIN */}
            {currentRole === 'Guest' && (
              <div className="max-w-6xl mx-auto w-full">
                <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-indigo-900/10 overflow-hidden flex flex-col lg:flex-row border border-slate-100">
                  
                  {/* Visual Intro (Left Side) */}
                  <div className="lg:w-3/5 p-8 lg:p-14 bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-900 text-white relative overflow-hidden flex flex-col justify-center">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-white/10 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-400/20 blur-3xl"></div>
                    
                    <div className="relative z-10 space-y-8">
                      {/* Logo & Tag */}
                      <div className="flex items-center gap-4 bg-white/10 w-fit px-4 py-2.5 rounded-2xl backdrop-blur-sm border border-white/20 shadow-lg">
                        {schoolConfig.logoUrl && schoolConfig.logoUrl !== 'https://smpn1beji.sch.id/wp-content/uploads/2025/05/logo_web_trans-1.png' ? (
                          <img src={schoolConfig.logoUrl} alt="Logo Sekolah" className="w-10 h-10 object-contain drop-shadow-md" />
                        ) : (
                          <img src="https://smpn1beji.sch.id/wp-content/uploads/2025/05/favico.png" alt="Logo Sekolah" className="w-10 h-10 object-contain drop-shadow-md" />
                        )}
                        <span className="font-extrabold tracking-widest text-[10px] sm:text-xs uppercase text-indigo-50">
                          {schoolConfig.landingTopTag}
                        </span>
                      </div>
                      
                      {/* Headlines */}
                      <div className="space-y-4">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
                          {schoolConfig.landingTitle}
                        </h2>
                        <p className="text-indigo-100 text-sm lg:text-base leading-relaxed max-w-lg font-medium">
                          {schoolConfig.landingDescription}
                        </p>
                      </div>

                      {/* Feature lists */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-8 border-t border-indigo-400/30">
                        <div className="flex items-start gap-3">
                          <div className="bg-white/20 p-1.5 rounded-lg shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <strong className="text-white font-bold text-sm block mb-0.5">Jurnal Digital Guru</strong>
                            <p className="text-indigo-200 text-xs">Catat kehadiran dan topik KBM secara real-time.</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="bg-white/20 p-1.5 rounded-lg shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <strong className="text-white font-bold text-sm block mb-0.5">Materi Cloud</strong>
                            <p className="text-indigo-200 text-xs">Akses bahan ajar dan PDF kapan saja, di mana saja.</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="bg-white/20 p-1.5 rounded-lg shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <strong className="text-white font-bold text-sm block mb-0.5">Ujian & Evaluasi CBT</strong>
                            <p className="text-indigo-200 text-xs">LMS interaktif dengan 4 format soal komprehensif.</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="bg-white/20 p-1.5 rounded-lg shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <strong className="text-white font-bold text-sm block mb-0.5">Sistem Anti-Contek</strong>
                            <p className="text-indigo-200 text-xs">Pemantauan fokus layar ujian secara native.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Secure Login & Register Form (Right Side) */}
                  <div className="lg:w-2/5 p-8 lg:p-12 bg-white flex flex-col justify-center space-y-6">`;

const idx = content.indexOf(targetStr);
if (idx !== -1) {
  content = content.replace(targetStr, replaceStr);
} else {
  console.log("Could not find the target string!");
}

const closingTarget = `                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            )}`;

const closingReplace = `                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </div>
            )}`;

content = content.replace(closingTarget, closingReplace);

fs.writeFileSync('src/App.tsx', content);
