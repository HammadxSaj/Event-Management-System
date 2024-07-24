// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getStorage } from 'firebase/storage';
import { getAuth, GoogleAuthProvider  } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBAxvi2Ir8A7t7TxSJTIa_GPGquPySpuXs",
  authDomain: "eventiti-ec4f0.firebaseapp.com",
  projectId: "eventiti-ec4f0",
  storageBucket: "eventiti-ec4f0.appspot.com",
  messagingSenderId: "524356556966",
  appId: "1:524356556966:web:27444a531f016d2eb43c67",
  measurementId: "G-HXJDLTVM65"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();  

const setAdminRole = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, { role: 'admin' }, { merge: true }); // Merge to avoid overwriting other fields
    console.log(`User ${userId} has been set as admin.`);
  } catch (error) {
    console.error('Error setting admin role:', error);
  }
};

// Hardcode the UID of the user you want to set as admin
// ot3xLJ8IfDZJX1G7NIFYOiLCrpy2
const adminUserId = 'ot3xLJ8IfDZJX1G7NIFYOiLCrpy2';
setAdminRole(adminUserId);

export { auth, db, storage, provider };