const fs = require('fs');
let content = fs.readFileSync('src/components/TeacherPanel.tsx', 'utf8');

const oldHeader = `                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-6 py-3 font-semibold text-slate-500">Nama Siswa</th>`;

const newHeader = `                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-6 py-3 font-semibold text-slate-500 text-center w-20">No Absen</th>
                            <th className="px-6 py-3 font-semibold text-slate-500">Nama Siswa</th>`;

const oldRow = `                        <tbody className="divide-y divide-slate-100 bg-white">
                          {classStudents.map(s => (
                            <tr key={s.id} className="hover:bg-slate-50/50 transition">
                              <td className="px-6 py-3 font-bold text-slate-900">{s.name} <span className="text-[10px] text-slate-400 font-mono">({s.nis})</span></td>`;

const newRow = `                        <tbody className="divide-y divide-slate-100 bg-white">
                          {classStudents.map(s => (
                            <tr key={s.id} className="hover:bg-slate-50/50 transition">
                              <td className="px-6 py-3 font-bold text-slate-900 text-center">{s.noAbsen || '-'}</td>
                              <td className="px-6 py-3 font-bold text-slate-900">{s.name} <span className="text-[10px] text-slate-400 font-mono">({s.nis})</span></td>`;

content = content.replace(oldHeader, newHeader);
content = content.replace(oldRow, newRow);

fs.writeFileSync('src/components/TeacherPanel.tsx', content);
