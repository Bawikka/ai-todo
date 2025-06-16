// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // ✅ 新增這行

const firebaseConfig = {
  apiKey: "AIzaSyAuQIUU4J7zzhUeZx5MWhXySJT-hgPaquo",
  authDomain: "smhuaaa-a3b4b.firebaseapp.com",
  projectId: "smhuaaa-a3b4b",
  storageBucket: "smhuaaa-a3b4b.firebasestorage.app",
  messagingSenderId: "992474650305",
  appId: "1:992474650305:web:12ebf3e613f691cd436640"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // ✅ 新增這行

export { db, auth }; // ✅ 同時匯出 auth
