const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldHandleRegister = `const handleRegisterAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regIdentifier.trim() || !regPassword.trim()) return;

    // Check existing
    if (regRole === 'Teacher' && teachers.some(t => t.nip === regIdentifier.trim())) {
      toast('NIP sudah terdaftar di sistem!');
      return;
    }
    if (regRole === 'Student' && students.some(s => s.nis === regIdentifier.trim())) {
      toast('NIS sudah terdaftar di sistem!');
      return;
    }

    const newReg: RegistrationRequest = {
      id: \`reg_\${Math.random().toString(36).substring(7)}\`,
      role: regRole,
      name: regName.trim(),
      identifier: regIdentifier.trim(),
      passwordOrEmail: regPassword.trim(),
      subjectOrClass: regSubjectOrClass,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    addDocument('registrations', newReg);
    toast('Permohonan pendaftaran akun Anda berhasil dikirim! Silakan menunggu persetujuan Admin Sekolah sebelum dapat masuk ke portal.');
    
    // Reset Form
    setRegName('');
    setRegIdentifier('');
    setRegPassword('');
    setRegSubjectOrClass('');
  };`;

const newHandleRegister = `const handleRegisterAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regIdentifier.trim() || !regPassword.trim()) return;

    try {
      // Ensure we use the provided passwordOrEmail as an email if possible, else create a dummy one
      const email = regPassword.includes('@') ? regPassword.trim() : \`\${regIdentifier.trim()}@sekolah.id\`;
      const finalPassword = regPassword.trim().length >= 6 ? regPassword.trim() : regPassword.trim() + '1234'; // Ensure min 6 chars

      await createUserWithEmailAndPassword(auth, email, finalPassword);
      await signOut(auth); // Sign out immediately

      const newReg: RegistrationRequest = {
        id: \`reg_\${Math.random().toString(36).substring(7)}\`,
        role: regRole,
        name: regName.trim(),
        identifier: regIdentifier.trim(),
        passwordOrEmail: email, // Store email instead of plain password for reference
        subjectOrClass: regSubjectOrClass,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      await addDocument('registrations', newReg);
      toast('Permohonan pendaftaran akun Anda berhasil dikirim! Password Anda telah dienkripsi.');
      
      // Reset Form
      setRegName('');
      setRegIdentifier('');
      setRegPassword('');
      setRegSubjectOrClass('');
      setPortalTab('login');
    } catch (error: any) {
      toast('Gagal mendaftar: ' + error.message);
      console.error(error);
    }
  };`;

content = content.replace(oldHandleRegister, newHandleRegister);

// Also change label "Buat Password Login" to "Email / Password (Min 6 Karakter)"
content = content.replace(/{regRole === 'Teacher' \? 'Buat Password Login' : 'Buat Password \/ Email Login'}/g, "{regRole === 'Teacher' ? 'Email (Atau Password min 6 karakter)' : 'Buat Password / Email Login'}");

fs.writeFileSync('src/App.tsx', content);
