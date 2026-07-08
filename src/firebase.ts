import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD2F08kPWRfr_jH-CJO5EsTjByNU25Jiqo",
  authDomain: "global-bonfire-cdw25.firebaseapp.com",
  projectId: "global-bonfire-cdw25",
  storageBucket: "global-bonfire-cdw25.firebasestorage.app",
  messagingSenderId: "664486781666",
  appId: "1:664486781666:web:0d92fe269296c51192f4bb"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-jurnalmengajargu-429b906f-b4d8-43d2-bd51-5cc768b29c81");
