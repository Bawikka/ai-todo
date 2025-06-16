// src/AuthPage.js
import { useState } from "react";
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";

export default function AuthPage({ onLogin, user }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login"); // login 或 register
  const [error, setError] = useState("");

  const handleAuth = async () => {
    try {
      if (mode === "login") {
        const res = await signInWithEmailAndPassword(auth, email, password);
        onLogin(res.user);
      } else {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        onLogin(res.user);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    onLogin(null);
  };

  if (user) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        👋 哈囉 {user.email}！
        <br />
        <button onClick={handleLogout}>登出</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "300px", margin: "100px auto", textAlign: "center" }}>
      <h2>{mode === "login" ? "登入" : "註冊新帳號"}</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: "8px", marginBottom: "10px", width: "100%" }}
      />
      <input
        type="password"
        placeholder="密碼"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ padding: "8px", marginBottom: "10px", width: "100%" }}
      />
      <button onClick={handleAuth} style={{ width: "100%", padding: "8px" }}>
        {mode === "login" ? "登入" : "註冊"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>
        {mode === "login" ? "還沒有帳號？" : "已有帳號？"}{" "}
        <span
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          style={{ color: "blue", cursor: "pointer" }}
        >
          {mode === "login" ? "註冊" : "登入"}
        </span>
      </p>
    </div>
  );
}
