// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

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

export { auth, db, storage };
