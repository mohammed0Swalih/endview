// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDq55-3iuHFXUqvcrqtyNoc_3O872Czm3I",
  authDomain: "interview-prj.firebaseapp.com",
  projectId: "interview-prj",
  storageBucket: "interview-prj.firebasestorage.app",
  messagingSenderId: "851837167910",
  appId: "1:851837167910:web:910791e16e5b7b12d5f9e7",
  measurementId: "G-68XWRRLFWK"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);