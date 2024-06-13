// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
export const auth = getAuth(app);