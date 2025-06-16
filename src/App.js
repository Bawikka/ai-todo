// ✅ 子集合版本 App.js
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
  orderBy
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
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (user) fetchTodos();
  }, [user]);

  const fetchTodos = async () => {
    const todosRef = collection(db, `users/${user.uid}/todos`);
    const q = query(todosRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const todoList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTodos(todoList);
  };

  const addTodo = async () => {
    if (newTask.trim() === "" || !user) return;

    const text = newTask.toLowerCase();
    let priority = 1;
    const highKeywords = ["今天", "馬上", "緊急", "立刻", "急件", "現在", "等一下"];
    const midKeywords = ["報告", "開會", "繳交", "繳作業", "明天", "後天", "預習", "提醒"];

    if (highKeywords.some(k => text.includes(k))) priority = 3;
    else if (midKeywords.some(k => text.includes(k))) priority = 2;

    await addDoc(collection(db, "users", user.uid, "todos"), {
      text: newTask,
      priority,
      done: false,
      createdAt: Date.now()
    });


    setNewTask("");
    fetchTodos();
  };

  const deleteTodo = async (id) => {
    await deleteDoc(doc(db, `users/${user.uid}/todos/${id}`));
    fetchTodos();
  };

  const toggleDone = async (todo) => {
    const ref = doc(db, `users/${user.uid}/todos/${todo.id}`);
    await updateDoc(ref, { done: !todo.done });
    fetchTodos();
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const formatTime = (timestamp) => new Date(timestamp).toLocaleString();
  const isExpired = (timestamp) => Date.now() - timestamp > 86400000;
  const getPriorityColor = (priority) => priority === 3 ? "#ff4d4d" : priority === 2 ? "#ffcc00" : "#ccc";

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
        {["all", "undone", "done"].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: filter === type ? "2px solid #4CAF50" : "1px solid #ccc",
              backgroundColor: filter === type ? "#e8f5e9" : "#fff",
              cursor: "pointer"
            }}
          >
            {type === "all" ? "全部" : type === "undone" ? "未完成" : "已完成"}
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
