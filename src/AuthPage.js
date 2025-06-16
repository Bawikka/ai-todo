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

  const inputStyle = {
    padding: "10px",
    marginBottom: "12px",
    width: "100%",
    height: "42px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    boxSizing: "border-box"
  };

  const buttonStyle = {
    width: "100%",
    height: "42px",
    fontSize: "16px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  };

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
        <button onClick={handleLogout} style={buttonStyle}>登出</button>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: "320px",
      margin: "100px auto",
      textAlign: "center",
      fontFamily: "sans-serif"
    }}>
      <h1 style={{ marginBottom: "10px" }}>🌥️ 雲端待辦清單📄</h1>
      <h2>{mode === "login" ? "登入" : "註冊新帳號"}</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={inputStyle}
      />
      <input
        type="password"
        placeholder="密碼"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
      />
      <button onClick={handleAuth} style={buttonStyle}>
        {mode === "login" ? "登入" : "註冊"}
      </button>
      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      <p style={{ marginTop: "14px" }}>
        {mode === "login" ? "還沒有帳號？" : "已有帳號？"}{" "}
        <span
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          style={{ color: "blue", cursor: "pointer", fontWeight: "bold" }}
        >
          {mode === "login" ? "註冊" : "登入"}
        </span>
      </p>
    </div>
  );
}
