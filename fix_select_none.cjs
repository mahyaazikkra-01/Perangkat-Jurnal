const fs = require('fs');
let content = fs.readFileSync('src/components/StudentPanel.tsx', 'utf8');

const target = `      {/* CORE CBT EXAM RUNNING VIEW */}
      {examStarted && activeExam && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT SIDE - QUESTIONS & INPUTS */}
          <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">`;
const replace = `      {/* CORE CBT EXAM RUNNING VIEW */}
      {examStarted && activeExam && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start select-none">
          {/* LEFT SIDE - QUESTIONS & INPUTS */}
          <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">`;

content = content.replace(target, replace);
fs.writeFileSync('src/components/StudentPanel.tsx', content);
