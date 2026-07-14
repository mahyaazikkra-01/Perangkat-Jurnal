const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const oldHeader = `                <tr>
                  <th className="px-6 py-3 font-semibold text-slate-500">Nama Lengkap</th>
                  <th className="px-6 py-3 font-semibold text-slate-500">NIS (Password)</th>`;

const newHeader = `                <tr>
                  <th className="px-6 py-3 font-semibold text-slate-500 text-center w-20">No Absen</th>
                  <th className="px-6 py-3 font-semibold text-slate-500">Nama Lengkap</th>
                  <th className="px-6 py-3 font-semibold text-slate-500">NIS (Password)</th>`;

const oldRow = `                {filteredStudents.map((siswa) => (
                  <tr key={siswa.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-3 font-bold text-slate-900">{siswa.name}</td>
                    <td className="px-6 py-3 font-mono font-semibold text-slate-600">{siswa.nis}</td>`;

const newRow = `                {filteredStudents.map((siswa) => (
                  <tr key={siswa.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-3 font-bold text-slate-900 text-center">{siswa.noAbsen || '-'}</td>
                    <td className="px-6 py-3 font-bold text-slate-900">{siswa.name}</td>
                    <td className="px-6 py-3 font-mono font-semibold text-slate-600">{siswa.nis}</td>`;

content = content.replace(oldHeader, newHeader);
content = content.replace(oldRow, newRow);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
