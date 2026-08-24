import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

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
const appId = "korean-beautys-dispatch";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { app, db };
