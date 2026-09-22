import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDyZB0B1_GmNk3vPzJeDVdDx14Fx1ejgqk",
  authDomain: "kbs-system-d9192.firebaseapp.com",
  databaseURL: "https://kbs-system-d9192-default-rtdb.firebaseio.com/",
  projectId: "kbs-system-d9192",
  storageBucket: "kbs-system-d9192.firebasestorage.app",
  messagingSenderId: "16174354995",
  appId: "1:16174354995:web:642995541fa5c801a38946",
  measurementId: "G-HE06DY901L"
};

// Initialize Firebase (prevent multiple initializations in Next.js)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getDatabase(app);

export { app, db };
