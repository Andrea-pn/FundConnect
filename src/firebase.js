// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCwKVNIIvstdJ8lZUEPLZF9N4w6al4gl38",
  authDomain: "fundconnect-4ad7f.firebaseapp.com",
  projectId: "fundconnect-4ad7f",
  storageBucket: "fundconnect-4ad7f.firebasestorage.app",
  messagingSenderId: "140071243033",
  appId: "1:140071243033:web:52facd07886e26f4608988"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db= getFirestore(app);
export default app;