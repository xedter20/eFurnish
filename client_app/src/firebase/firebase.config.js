import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyARm6p7lyxocvpX6IeNcx3HxSWsZRqJ5so",
  authDomain: "efurnish-b44f7.firebaseapp.com",
  projectId: "efurnish-b44f7",
  storageBucket: "efurnish-b44f7.firebasestorage.app",
  messagingSenderId: "332603753573",
  appId: "1:332603753573:web:ad5dce4ab71c466b79328c",
  measurementId: "G-43NGJQELRD",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { app, db, auth, provider };
