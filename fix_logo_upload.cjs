const fs = require('fs');

let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const targetStr = `                     onChange={(e) => {
                       const file = e.target.files?.[0];
                       if (file) {
                         const reader = new FileReader();
                         reader.onloadend = () => {
                           setLocalConfig({...localConfig, logoUrl: reader.result as string});
                         };
                         reader.readAsDataURL(file);
                       }
                     }}`;

const replacement = `                     onChange={(e) => {
                       const file = e.target.files?.[0];
                       if (file) {
                         const reader = new FileReader();
                         reader.onloadend = () => {
                           const img = new Image();
                           img.onload = () => {
                             const canvas = document.createElement('canvas');
                             const MAX_WIDTH = 256;
                             const MAX_HEIGHT = 256;
                             let width = img.width;
                             let height = img.height;

                             if (width > height) {
                               if (width > MAX_WIDTH) {
                                 height = Math.round((height *= MAX_WIDTH / width));
                                 width = MAX_WIDTH;
                               }
                             } else {
                               if (height > MAX_HEIGHT) {
                                 width = Math.round((width *= MAX_HEIGHT / height));
                                 height = MAX_HEIGHT;
                               }
                             }

                             canvas.width = width;
                             canvas.height = height;
                             const ctx = canvas.getContext('2d');
                             ctx?.drawImage(img, 0, 0, width, height);
                             const dataUrl = canvas.toDataURL('image/webp', 0.8);
                             setLocalConfig({...localConfig, logoUrl: dataUrl});
                           };
                           img.src = reader.result as string;
                         };
                         reader.readAsDataURL(file);
                       }
                     }}`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('src/components/AdminPanel.tsx', content);
