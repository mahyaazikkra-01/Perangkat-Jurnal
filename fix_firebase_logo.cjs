const admin = require('firebase-admin');
const fs = require('fs');

if (fs.existsSync('firebase-applet-config.json')) {
  const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
  admin.initializeApp({
    projectId: config.projectId,
  });

  const db = admin.firestore();
  
  db.collection('config').doc('schoolConfig').get().then(doc => {
    if (doc.exists) {
      db.collection('config').doc('schoolConfig').update({
        logoUrl: "https://smpn1beji.sch.id/wp-content/uploads/2025/05/favico.png"
      }).then(() => {
        console.log("Firebase config updated!");
        process.exit(0);
      });
    } else {
        console.log("Doc does not exist");
        process.exit(0);
    }
  }).catch(e => {
    console.log(e);
    process.exit(1);
  });
}
