const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add Firebase Auth imports
if (!content.includes("signInWithEmailAndPassword")) {
  content = content.replace("import { db } from './firebase';", "import { db, auth } from './firebase';\nimport { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';");
}

// Update handleLogout
content = content.replace(/const handleLogout = \(\) => {[\s\S]*?};/, `const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
    setCurrentRole('Guest');
    setActiveUser(null);
    setUsernameInput('');
    setPasswordInput('');
  };`);

// Update handleManualLogin
const oldHandleManualLogin = `const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const user = usernameInput.trim();
    const pass = passwordInput.trim();

    const expectedAdminPass = schoolConfig?.adminPassword || 'admin123';
    if (user === 'admin' && pass === expectedAdminPass) {
      setCurrentRole('Admin');
      setActiveUser({ name: 'Administrator Utama', username: 'admin' });
      return;
    }

    // Try Teacher check NIP
    const matchedTeacher = teachers.find(t => t.nip === user);
    const expectedTeacherPass = matchedTeacher?.password || 'guru123';
    if (matchedTeacher && pass === expectedTeacherPass) {
      setCurrentRole('Teacher');
      setActiveUser(matchedTeacher);
      return;
    }

    // Try Student check NIS
    const matchedStudent = students.find(s => s.nis === user);
    const expectedStudentPass = matchedStudent?.password || matchedStudent?.email || matchedStudent?.nis;
    if (matchedStudent && pass === expectedStudentPass) {
      setCurrentRole('Student');
      const className = SEED_CLASSES.find(c => c.id === matchedStudent.classId)?.name || 'N/A';
      setActiveUser({ ...matchedStudent, className });
      return;
    }

    setLoginError('Kredensial tidak valid. Silakan periksa kembali Username / NIP / NIS dan Password Anda.');
  };`;

const newHandleManualLogin = `const handleManualLogin = async (e: React.FormEvent) => {
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
      }

      const matchedTeacher = teachers.find(t => t.email === email || t.nip === email);
      if (matchedTeacher) {
        setCurrentRole('Teacher');
        setActiveUser(matchedTeacher);
        return;
      }

      const matchedStudent = students.find(s => s.email === email || s.nis === email);
      if (matchedStudent) {
        setCurrentRole('Student');
        const className = SEED_CLASSES.find(c => c.id === matchedStudent.classId)?.name || 'N/A';
        setActiveUser({ ...matchedStudent, className });
        return;
      }

      // If registered via Firebase but not in DB yet
      setLoginError('Akun belum terdaftar di database sekolah atau belum disetujui Admin.');
      await signOut(auth);

    } catch (error: any) {
      setLoginError('Login gagal. Periksa kembali Email dan Password. Pastikan Anda sudah terdaftar.');
      console.error(error);
    }
  };`;

content = content.replace(oldHandleManualLogin, newHandleManualLogin);

// Also we need to fix the UI inputs to mention Email instead of Username
content = content.replace(/Username \/ NIP \/ NIS/g, "Email / Username / NIP");
content = content.replace(/Misal: admin, atau NIP guru, atau NIS siswa/g, "Misal: email@guru.com atau email@siswa.com");

fs.writeFileSync('src/App.tsx', content);
