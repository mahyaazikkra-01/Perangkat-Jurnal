const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldLogin = `const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const email = usernameInput.trim();
    const pass = passwordInput.trim();

    try {
      // 1. Firebase Auth Sign In
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;

      // 2. Map Email to Role
      const expectedAdminPass = schoolConfig?.adminPassword || 'admin123';
      if (email === 'admin@sekolah.id' || (email === 'admin' && pass === expectedAdminPass)) {
        setCurrentRole('Admin');
        setActiveUser({ name: 'Administrator Utama', username: 'admin', email: user.email });
        return;
      }`;

const newLogin = `const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const email = usernameInput.trim();
    const pass = passwordInput.trim();

    // Check hardcoded/config admin first (Bypass Firebase Auth format email if username is 'admin')
    const expectedAdminPass = schoolConfig?.adminPassword || 'admin123';
    if (email === 'admin' && pass === expectedAdminPass) {
      setCurrentRole('Admin');
      setActiveUser({ name: 'Administrator Utama', username: 'admin' });
      return;
    }

    try {
      // 1. Firebase Auth Sign In
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;

      // 2. Map Email to Role
      if (email === 'admin@sekolah.id') {
        setCurrentRole('Admin');
        setActiveUser({ name: 'Administrator Utama', username: 'admin', email: user.email });
        return;
      }`;

content = content.replace(oldLogin, newLogin);
fs.writeFileSync('src/App.tsx', content);
