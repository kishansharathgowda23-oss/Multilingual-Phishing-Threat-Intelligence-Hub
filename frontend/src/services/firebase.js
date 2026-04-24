import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, RecaptchaVerifier, signInWithPopup, PhoneAuthProvider, linkWithCredential } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 🔥 PASTE YOUR FIREBASE CONFIG HERE
const firebaseConfig = {
  apiKey: "AIzaSyCQx0yJ3CzABQe-b4mio8DfBMaMV_01jE0",
  authDomain: "shieldx-d9881.firebaseapp.com",
  projectId: "shieldx-d9881",
  storageBucket: "shieldx-d9881.firebasestorage.app",
  messagingSenderId: "151467793516",
  appId: "1:151467793516:web:059d980453680284f5cc49",
  measurementId: "G-M3E04303J5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export auth helpers
export {
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPopup,
  PhoneAuthProvider,
  linkWithCredential
};

export default app;