// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDQTtlEowOBdeDj-StcrlnscogXpmy52x4",
  authDomain: "heiwahousedashboard.firebaseapp.com",
  projectId: "heiwahousedashboard",
  storageBucket: "heiwahousedashboard.firebasestorage.app",
  messagingSenderId: "221240912006",
  appId: "1:221240912006:web:1c7a974b44c5361519c907",
  measurementId: "G-ZBSB3V5M6J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

