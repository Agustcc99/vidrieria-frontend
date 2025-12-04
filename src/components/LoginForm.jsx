
import { useState } from "react";
import { apiFetch } from "../hooks/useApi";

export function LoginForm({ onLoginSuccess }) {
  // Campos controlados del formulario
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  // ---------------------------------------------------------
  // Enviar credenciales al backend
  // ---------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // POST /auth/login → apiFetch setea cookie httpOnly automáticamente
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password })
      });
      // Si la API responde ok, enviamos el usuario al padre (App)
      onLoginSuccess(data.user);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="mb-3 text-center">Ingreso administrador</h2>
      {/* Alerta de error */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Campo usuario */}
      <div className="mb-3">
        <label className="form-label">Usuario</label>
        <input
          type="text"
          className="form-control"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      {/* Campo contraseña */}
      <div className="mb-3">
        <label className="form-label">Contraseña</label>
        <input
          type="password"
          className="form-control"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {/* Botón ingresar */}
      <button type="submit" className="btn btn-primary w-100" disabled={loading}>
        {loading ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
