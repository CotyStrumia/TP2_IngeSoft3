import React, { useEffect, useState } from "react";

function App() {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  // Cambia la URL según el puerto que expongas (8081 para QA, 8082 para PROD)
  const API_URL = "http://localhost:8081";

  useEffect(() => {
    fetch(`${API_URL}/users`)
      .then(res => res.json())
      .then(setUsers)
      .catch(() => setMsg("No se pudo cargar usuarios"));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) setMsg(data.error);
        else {
          setMsg(data.message);
          setUsers([...users, { id: data.id, username: data.username, password }]);
        }
      })
      .catch(() => setMsg("Error al crear usuario"));
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h2>Usuarios</h2>
      <ul>
        {users.map(u => (
          <li key={u.id}>{u.username} ({u.password})</li>
        ))}
      </ul>
      <h3>Agregar usuario</h3>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        /><br />
        <input
          placeholder="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        /><br />
        <button type="submit">Crear</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
}

export default App;