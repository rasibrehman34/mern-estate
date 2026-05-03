// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Import Firestore
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-c3edd.firebaseapp.com",
  projectId: "mern-estate-c3edd",
  storageBucket: "mern-estate-c3edd.firebasestorage.app",
  messagingSenderId: "227358350924",
  appId: "1:227358350924:web:50de698577c84ea8c91ee9"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);