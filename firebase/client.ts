// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);