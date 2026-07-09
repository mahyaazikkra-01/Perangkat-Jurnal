const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldLogin = `const handleManualLogin = (e: React.FormEvent) => {
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

    setLoginError('Kredensial tidak valid! Periksa panduan akun default di bawah.');
  };`;

const newLogin = `const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const identifier = usernameInput.trim();
    const pass = passwordInput.trim();

    // 1. Admin Bypass (Local check, no Firebase Auth required)
    const expectedAdminPass = schoolConfig?.adminPassword || 'admin123';
    if (identifier === 'admin' && pass === expectedAdminPass) {
      setCurrentRole('Admin');
      setActiveUser({ name: 'Administrator Utama', username: 'admin' });
      return;
    }

    try {
      // 2. Firebase Auth Check (Requires Email Format)
      // Map NIP/NIS to email if it's not an email
      const email = identifier.includes('@') ? identifier : \`\${identifier}@sekolah.id\`;
      
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const fbUser = userCredential.user;

      // 3. Match with Firestore records after successful Auth
      if (email === 'admin@sekolah.id') {
        setCurrentRole('Admin');
        setActiveUser({ name: 'Administrator Utama', username: 'admin', email: fbUser.email });
        return;
      }

      const matchedTeacher = teachers.find(t => t.nip === identifier || t.email === email);
      if (matchedTeacher) {
        setCurrentRole('Teacher');
        setActiveUser(matchedTeacher);
        return;
      }

      const matchedStudent = students.find(s => s.nis === identifier || s.email === email);
      if (matchedStudent) {
        setCurrentRole('Student');
        const className = SEED_CLASSES.find(c => c.id === matchedStudent.classId)?.name || 'N/A';
        setActiveUser({ ...matchedStudent, className });
        return;
      }

      setLoginError('Akun belum terdaftar di database sekolah atau belum disetujui Admin.');
      await signOut(auth);
    } catch (error: any) {
      // Fallback check local dummy data for easier testing during setup
      const matchedTeacher = teachers.find(t => t.nip === identifier);
      const expectedTeacherPass = matchedTeacher?.password || 'guru123';
      if (matchedTeacher && pass === expectedTeacherPass) {
        setCurrentRole('Teacher');
        setActiveUser(matchedTeacher);
        return;
      }
  
      const matchedStudent = students.find(s => s.nis === identifier);
      const expectedStudentPass = matchedStudent?.password || matchedStudent?.email || matchedStudent?.nis;
      if (matchedStudent && pass === expectedStudentPass) {
        setCurrentRole('Student');
        const className = SEED_CLASSES.find(c => c.id === matchedStudent.classId)?.name || 'N/A';
        setActiveUser({ ...matchedStudent, className });
        return;
      }

      setLoginError('Login gagal. Periksa Username/NIP/NIS dan Password Anda (atau belum daftar di Firebase).');
      console.error(error);
    }
  };`;

content = content.replace(oldLogin, newLogin);
fs.writeFileSync('src/App.tsx', content);
