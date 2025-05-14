// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCgSpS2hybXVq4PWJEJiQIzTarfGFo1BJI",
  authDomain: "qonverse-b4469.firebaseapp.com",
  projectId: "qonverse-b4469",
  storageBucket: "qonverse-b4469.firebasestorage.app",
  messagingSenderId: "568022357692",
  appId: "1:568022357692:web:bd2285b7954ab8fd1822b9",
  measurementId: "G-LGRNH4CX8C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


export const firestore = getFirestore(app);