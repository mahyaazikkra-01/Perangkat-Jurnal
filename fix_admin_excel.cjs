const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// Add import
const importXLSX = "import * as XLSX from 'xlsx';";
if (!content.includes(importXLSX)) {
  content = content.replace("import React, { useState, useMemo } from 'react';", "import React, { useState, useMemo } from 'react';\n" + importXLSX);
}

// Fix student download
const oldStudentDownload = `  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,No Absen,Nama Lengkap,NIS,Email,Kelas\\n1,Budi Santoso,10260,budi@smp.sch.id,VII-A\\n2,Siti Aminah,10261,siti@smp.sch.id,VII-A\\n3,Dimas Anggara,10262,dimas@smp.sch.id,VII-A";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "template_import_siswa.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };`;

const newStudentDownload = `  const handleDownloadTemplate = () => {
    const rows = [
      { "No Absen": 1, "Nama Lengkap": "Budi Santoso", "NIS": "10260", "Email": "budi@smp.sch.id", "Kelas": "VII-A" },
      { "No Absen": 2, "Nama Lengkap": "Siti Aminah", "NIS": "10261", "Email": "siti@smp.sch.id", "Kelas": "VII-A" },
      { "No Absen": 3, "Nama Lengkap": "Dimas Anggara", "NIS": "10262", "Email": "dimas@smp.sch.id", "VII-A": "VII-A" }
    ];
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{wch: 10}, {wch: 25}, {wch: 15}, {wch: 25}, {wch: 10}];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Siswa');
    XLSX.writeFile(wb, 'template_import_siswa.xlsx');
  };`;

content = content.replace(oldStudentDownload, newStudentDownload);

// Fix teacher download
const oldTeacherDownload = `  const handleDownloadTeacherTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Nama Lengkap,NIP,Email,Mata Pelajaran\\nDrs. H. Ahmad Fauzi M.Pd,197501012000121001,ahmad.fauzi@smp.sch.id,\\"Matematika, IPA\\"\\nSiti Nurhaliza S.Pd,198203152008012003,siti.nurhaliza@smp.sch.id,Bahasa Indonesia\\nBudi Gunawan M.Kom,198807122015041002,budi.g@smp.sch.id,Informatika";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "template_import_guru.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };`;

const newTeacherDownload = `  const handleDownloadTeacherTemplate = () => {
    const rows = [
      { "Nama Lengkap": "Drs. H. Ahmad Fauzi M.Pd", "NIP": "197501012000121001", "Email": "ahmad.fauzi@smp.sch.id", "Mata Pelajaran": "Matematika, IPA" },
      { "Nama Lengkap": "Siti Nurhaliza S.Pd", "NIP": "198203152008012003", "Email": "siti.nurhaliza@smp.sch.id", "Mata Pelajaran": "Bahasa Indonesia" },
      { "Nama Lengkap": "Budi Gunawan M.Kom", "NIP": "198807122015041002", "Email": "budi.g@smp.sch.id", "Mata Pelajaran": "Informatika" }
    ];
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{wch: 30}, {wch: 25}, {wch: 30}, {wch: 30}];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Guru');
    XLSX.writeFile(wb, 'template_import_guru.xlsx');
  };`;

content = content.replace(oldTeacherDownload, newTeacherDownload);

// Change UI text to mention .xlsx instead of .csv where appropriate
content = content.replace(/Unduh Template CSV/g, "Unduh Template Excel");
content = content.replace(/Unduh Template Standar Excel \/ CSV/g, "Unduh Template Standar Excel");
content = content.replace(/Unduh Template Standar Excel \/ CSV Guru/g, "Unduh Template Standar Excel Guru");

fs.writeFileSync('src/components/AdminPanel.tsx', content);
