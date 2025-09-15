import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [apiUrl, setApiUrl] = useState("http://localhost:8081"); // QA por defecto

  useEffect(() => {
    fetch(`${apiUrl}/users`)
      .then(res => res.json())
      .then(setUsers)
      .catch(() => setMsg("No se pudo cargar usuarios"));
  }, [apiUrl]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${apiUrl}/users`, {
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

  const togglePasswords = () => {
    setShowPasswords(prev => !prev);
  };

  const handleApiChange = (env) => {
    setApiUrl(env === "qa" ? "http://localhost:8081" : "http://localhost:8082");
    setMsg("");
    setUsers([]);
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <div style={{ marginBottom: "1rem" }}>
  <span style={{ marginLeft: "1rem" }}>Puerto actual: {apiUrl}</span>
  <br />
  <button
    onClick={() => handleApiChange("qa")}
    disabled={apiUrl === "http://localhost:8081"}
  >
    QA
  </button>
  <button
    onClick={() => handleApiChange("prod")}
    style={{ marginLeft: "1rem" }}
    disabled={apiUrl === "http://localhost:8082"}
  >
    PROD
  </button>
</div>
      <h2>Usuarios</h2>
      <ul>
        {users.map(u => (
          <li key={u.id}>
            <strong>ID:</strong> {u.id} <strong>Usuario:</strong> {u.username}
            {showPasswords && (
              <span style={{ marginLeft: 8 }}><strong>Contraseña:</strong> {u.password}</span>
            )}
          </li>
        ))}
      </ul>
      <button onClick={togglePasswords} style={{ margin: "1rem 0" }}>
        {showPasswords ? "Ocultar todas las contraseñas" : "Mostrar todas las contraseñas"}
      </button>
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