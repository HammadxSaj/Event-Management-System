// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAIQOmUUgDsAJURLhIbwElGVWJL2k1_48U",
  authDomain: "event-auth-32947.firebaseapp.com",
  projectId: "event-auth-32947",
  storageBucket: "event-auth-32947.appspot.com",
  messagingSenderId: "935158987478",
  appId: "1:935158987478:web:cc80f3ae29ed1b360ba777",
  measurementId: "G-V2Q86NYCXE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);