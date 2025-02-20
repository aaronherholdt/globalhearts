import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAq11_yF5-ZM-oVjNSHdwQ0IMqZvMlVej0",
  authDomain: "globalheartsel.firebaseapp.com",
  projectId: "globalheartsel",
  storageBucket: "globalheartsel.firebasestorage.app",
  messagingSenderId: "530977291493",
  appId: "1:530977291493:web:3d13ce35062a80d527e80c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db }; 