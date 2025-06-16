// ✅ cloud_todo_app/App.js
import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  where
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import AuthPage from "./AuthPage";

function App() {
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchTodos(currentUser.uid);
      }
    });
    return () => unsub();
  }, []);

  const fetchTodos = async (uid) => {
    const q = query(
      collection(db, "todos"),
      where("uid", "==", uid),
      orderBy("priority", "desc")
    );
    const querySnapshot = await getDocs(q);
    const todoList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setTodos(todoList);
  };

  const addTodo = async () => {
    if (newTask.trim() === "") return;

    const text = newTask.toLowerCase();
    let priority = 1;
    const highKeywords = ["今天", "馬上", "緊急", "立刻", "急件", "現在", "等一下"];
    const midKeywords = ["報告", "開會", "繳交", "繳作業", "明天", "後天", "預習", "提醒"];

    if (highKeywords.some(k => text.includes(k))) {
      priority = 3;
    } else if (midKeywords.some(k => text.includes(k))) {
      priority = 2;
    }

    await addDoc(collection(db, "todos"), {
      uid: user.uid,
      text: newTask,
      priority,
      done: false,
      createdAt: Date.now()
    });

    setNewTask("");
    fetchTodos(user.uid);
  };

  const deleteTodo = async (id) => {
    await deleteDoc(doc(db, "todos", id));
    fetchTodos(user.uid);
  };

  const toggleDone = async (todo) => {
    const ref = doc(db, "todos", todo.id);
    await updateDoc(ref, { done: !todo.done });
    fetchTodos(user.uid);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const isExpired = (timestamp) => {
    const oneDay = 24 * 60 * 60 * 1000;
    return Date.now() - timestamp > oneDay;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 3: return "#ff4d4d";
      case 2: return "#ffcc00";
      default: return "#ccc";
    }
  };

  const filterTodos = (list) => {
    if (filter === "done") return list.filter(todo => todo.done);
    if (filter === "undone") return list.filter(todo => !todo.done);
    return list;
  };

  const isTodayTask = (text) => text.includes("今天");

  if (!user) return <AuthPage onLogin={setUser} user={null} />;

  const filtered = filterTodos(todos);
  const todayTasks = filtered.filter(todo => isTodayTask(todo.text));
  const otherTasks = filtered.filter(todo => !isTodayTask(todo.text));
  const total = todos.length;
  const completed = todos.filter(t => t.done).length;
  const remaining = total - completed;

  const renderTask = (todo) => (
    <li key={todo.id} style={{
      background: todo.done ? "#d9d9d9" : "#f9f9f9",
      padding: "10px",
      marginBottom: "10px",
      borderRadius: "8px",
      border: `3px solid ${todo.done ? "#666" : getPriorityColor(todo.priority)}`,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <div>
        <input
          type="checkbox"
          checked={todo.done}
          onChange={() => toggleDone(todo)}
        />{" "}
        <span style={{
          textDecoration: todo.done ? "line-through" : "none",
          fontWeight: "bold"
        }}>
          {todo.text}
        </span>{" "}
        <small style={{ color: "gray" }}>
          （優先度：{todo.priority}，建立：{formatTime(todo.createdAt)}）
        </small>
        {isExpired(todo.createdAt) && !todo.done && (
          <span style={{ color: "red", marginLeft: "10px" }}>⚠️ 過期</span>
        )}
      </div>
      <button onClick={() => deleteTodo(todo.id)} style={{
        backgroundColor: "transparent",
        border: "none",
        color: "red",
        fontSize: "18px"
      }}>❌</button>
    </li>
  );

  return (
    <div style={{
      padding: "20px",
      fontFamily: "sans-serif",
      maxWidth: "700px",
      margin: "0 auto"
    }}>
      <div style={{ textAlign: "right", marginBottom: "10px" }}>
        <span style={{ marginRight: "10px", fontWeight: "bold" }}>👤 {user.email}</span>
        <button onClick={handleLogout} style={{
          padding: "6px 12px",
          backgroundColor: "#aaaaaa",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}>登出</button>
      </div>

      <h1 style={{ textAlign: "center" }}>🌥️ 雲端待辦清單📄</h1>

      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        📊 總任務：{total}　✅ 完成：{completed}　📌 未完成：{remaining}
      </div>

      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "10px",
        marginBottom: "20px"
      }}>
        {[
          { key: "all", label: "全部" },
          { key: "undone", label: "未完成" },
          { key: "done", label: "已完成" }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: filter === key ? "2px solid #4CAF50" : "1px solid #ccc",
              backgroundColor: filter === key ? "#e8f5e9" : "#fff",
              cursor: "pointer"
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{
        display: "flex",
        justifyContent: "center",
        marginBottom: "20px"
      }}>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="輸入新任務（例如：今天交報告）"
          style={{
            padding: "10px",
            width: "60%",
            borderRadius: "8px",
            border: "1px solid gray"
          }}
        />
        <button onClick={addTodo} style={{
          marginLeft: "10px",
          padding: "10px 20px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "8px"
        }}>
          ➕ 新增
        </button>
      </div>

      {todayTasks.length > 0 && <h3>📅 今天須完成</h3>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {todayTasks.map(renderTask)}
      </ul>

      {otherTasks.length > 0 && <h3>📋 其他任務</h3>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {otherTasks.map(renderTask)}
      </ul>
    </div>
  );
}

export default App;
