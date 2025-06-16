// Import the functions you need from the SDKs you need
import { initializeApp ,getApp,getApps} from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB9kbfmn7SE5WHJNxaZaF3qB_j6l_IjedE",
  authDomain: "interview-prep-ai-dbd3b.firebaseapp.com",
  projectId: "interview-prep-ai-dbd3b",
  storageBucket: "interview-prep-ai-dbd3b.firebasestorage.app",
  messagingSenderId: "499390081956",
  appId: "1:499390081956:web:b5642e2471e3d28ef12f31",
  measurementId: "G-C7JFS7N5R9"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);