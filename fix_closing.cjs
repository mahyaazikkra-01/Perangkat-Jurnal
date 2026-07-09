const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const closingCode = `                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 font-medium">
                        ℹ️ <strong>Catatan:</strong> Setelah Anda mendaftar, Admin Sekolah dapat memverifikasi dan menyetujui akun Anda melalui menu persetujuan di halaman Admin.
                      </div>
                    </>
                  )}
                </div>

              </div>
            )}`;

const properClosingCode = `                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 font-medium">
                        ℹ️ <strong>Catatan:</strong> Setelah Anda mendaftar, Admin Sekolah dapat memverifikasi dan menyetujui akun Anda melalui menu persetujuan di halaman Admin.
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            )}`;

content = content.replace(closingCode, properClosingCode);
fs.writeFileSync('src/App.tsx', content);
