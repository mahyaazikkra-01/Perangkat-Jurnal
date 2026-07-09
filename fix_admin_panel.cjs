const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const targetStr1 = `  onApproveRegistration?: (id: string) => void;
  onRejectRegistration?: (id: string) => void;
}`;

const replaceStr1 = `  onApproveRegistration?: (id: string) => void;
  onRejectRegistration?: (id: string) => void;
  onDeleteRegistration?: (id: string) => void;
}`;
content = content.replace(targetStr1, replaceStr1);

const targetStr2 = `  onBulkAddStudents,
  onApproveRegistration,
  onRejectRegistration
}: AdminPanelProps) {`;

const replaceStr2 = `  onBulkAddStudents,
  onApproveRegistration,
  onRejectRegistration,
  onDeleteRegistration
}: AdminPanelProps) {`;
content = content.replace(targetStr2, replaceStr2);

const targetStr3 = `                            <button
                              onClick={() => onRejectRegistration?.(reg.id)}
                              className="bg-red-500 hover:bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 text-[11px] shadow-2xs"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Tolak
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Selesai diverifikasi</span>
                        )}
                      </td>`;

const replaceStr3 = `                            <button
                              onClick={() => onRejectRegistration?.(reg.id)}
                              className="bg-red-500 hover:bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 text-[11px] shadow-2xs"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Tolak
                            </button>
                            <button
                              onClick={() => onDeleteRegistration?.(reg.id)}
                              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-2 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 shadow-2xs"
                              title="Hapus Permanen"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-slate-400 text-[11px] italic mr-2">Selesai diverifikasi</span>
                            <button
                              onClick={() => onDeleteRegistration?.(reg.id)}
                              className="bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 font-bold px-2 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 shadow-2xs"
                              title="Hapus Permanen"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>`;
content = content.replace(targetStr3, replaceStr3);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
