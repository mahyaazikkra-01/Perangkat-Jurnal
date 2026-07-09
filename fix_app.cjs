const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// The botched replacement was:
// return (
//     <>
//       <Toaster position="top-center" />) => {

// Let's restore the original return () => {
content = content.replace(
  "return (\n    <>\n      <Toaster position=\"top-center\" />) => {",
  "return () => {"
);

// We also need to find the actual render `return (`.
// It's the one that returns `<div ...`
content = content.replace(
  "return (\n    <div className=\"min-h-screen bg-slate-50 flex flex-col font-sans\">",
  "return (\n    <>\n      <Toaster position=\"top-center\" />\n      <div className=\"min-h-screen bg-slate-50 flex flex-col font-sans\">"
);

fs.writeFileSync('src/App.tsx', content);
