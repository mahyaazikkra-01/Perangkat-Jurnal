const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const targetStr = `              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700">URL Logo Sekolah (opsional)</label>
                <input
                  type="text"
                  placeholder="https://contoh.com/logo.png"
                  value={localConfig.logoUrl}
                  onChange={(e) => setLocalConfig({...localConfig, logoUrl: e.target.value})}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                <p className="text-[10px] text-slate-500 mt-1">Biarkan kosong untuk menggunakan logo inisial huruf default.</p>
              </div>`;

const replacement = `              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700">Logo Sekolah (Upload File / URL)</label>
                <div className="flex gap-2 mb-2">
                   <input
                     type="file"
                     accept="image/*"
                     className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                     onChange={(e) => {
                       const file = e.target.files?.[0];
                       if (file) {
                         const reader = new FileReader();
                         reader.onloadend = () => {
                           setLocalConfig({...localConfig, logoUrl: reader.result as string});
                         };
                         reader.readAsDataURL(file);
                       }
                     }}
                   />
                </div>
                <input
                  type="text"
                  placeholder="Atau masukkan URL gambar (https://...)"
                  value={localConfig.logoUrl || ''}
                  onChange={(e) => setLocalConfig({...localConfig, logoUrl: e.target.value})}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                <p className="text-[10px] text-slate-500 mt-1">Logo akan disimpan dan ditampilkan di header utama aplikasi.</p>
                {localConfig.logoUrl && (
                  <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-200 inline-block">
                    <img src={localConfig.logoUrl} alt="Preview" className="h-10 object-contain" />
                  </div>
                )}
              </div>`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('src/components/AdminPanel.tsx', content);
