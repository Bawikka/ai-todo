// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ⚠️ 請將下方這組設定，換成你自己 Firebase 專案中的設定
const firebaseConfig = {
    apiKey: "AIzaSyAuQIUU4J7zzhUeZx5MWhXySJT-hgPaquo",
    authDomain: "smhuaaa-a3b4b.firebaseapp.com",
    projectId: "smhuaaa-a3b4b",
    storageBucket: "smhuaaa-a3b4b.firebasestorage.app",
    messagingSenderId: "992474650305",
    appId: "1:992474650305:web:12ebf3e613f691cd436640"
  };

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 取得 Firestore 實例
const db = getFirestore(app);

export { db };