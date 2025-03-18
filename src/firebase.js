
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider } from "firebase/auth";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAgK9g4HEXu1PoH4oyJ_2hp4zD4NmtOCg8",
  authDomain: "fir-login-ba4a3.firebaseapp.com",
  projectId: "fir-login-ba4a3",
  storageBucket: "fir-login-ba4a3.firebasestorage.app",
  messagingSenderId: "831118999642",
  appId: "1:831118999642:web:b7f2dccf5715e4a3229863"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const provider = new GoogleAuthProvider();
const db = getFirestore(app)
export {auth,provider,db}



