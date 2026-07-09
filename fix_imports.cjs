const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetImport = "import { syncCollection, addDocument, deleteDocument, updateDocument, syncConfig, saveConfig } from './firebaseSync';";
const newImports = targetImport + "\nimport { auth } from './firebase';\nimport { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';";

content = content.replace(targetImport, newImports);

fs.writeFileSync('src/App.tsx', content);
