
import { useEffect, useState } from "react";
import { apiFetch } from "../hooks/useApi";

/**
 * Gestión de tipos de vidrio (CRUD básico).
 * * - Lista todos los vidrios
 * - Permite crear, editar y eliminar
 * - Notifica al padre cuando cambia la lista (onGlassTypesChange)
 */
export function GlassTypesManager({ onGlassTypesChange }) {
  // Lista de vidrios traídos del backend
  const [vidrios, setVidrios] = useState([]);
  // Estados del formulario (modo crear/editar)
  const [nombre, setNombre] = useState("");
  const [grosor, setGrosor] = useState("");
  const [precioM2, setPrecioM2] = useState("");
  // Si editId tiene un valor, estamos editando ese vidrio
  const [editId, setEditId] = useState(null);
  // Mensaje de error (para mostrar en alerta)
  const [error, setError] = useState("");
  // Flag de carga (para mostrar "Cargando..." y evitar spam)
  const [loading, setLoading] = useState(false);


  // ---------------------------------------------
  // Carga inicial de vidrios desde el backend
  // ---------------------------------------------
  const cargarVidrios = async () => {
    try {
      setLoading(true);
      setError("");
      // GET /api/vidrios
      const data = await apiFetch("/api/vidrios");
      setVidrios(data);
      // Notificamos al padre (App) para que actualice glassTypes
      onGlassTypesChange?.(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Se carga una sola vez al montar el componente
  useEffect(() => {
    cargarVidrios();
  }, []);

  // Limpia el formulario y sale del modo edición
  const limpiarFormulario = () => {
    setNombre("");
    setGrosor("");
    setPrecioM2("");
    setEditId(null);
  };

  // ---------------------------------------------
  // Crear o editar un vidrio
  // ---------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const body = {
      nombre,
      grosor,
      precioM2: Number(precioM2)// convertimos a number antes de mandar
    };

    try {
      if (editId) {
        // Modo edición: PUT /api/vidrios/:id
        await apiFetch(`/api/vidrios/${editId}`, {
          method: "PUT",
          body: JSON.stringify(body)
        });
      } else {
        // Modo creación: POST /api/vidrios
        await apiFetch("/api/vidrios", {
          method: "POST",
          body: JSON.stringify(body)
        });
      }
      // Reseteamos formulario y recargamos lista
      limpiarFormulario();
      await cargarVidrios();
    } catch (err) {
      setError(err.message);
    }
  };

  // Cargar datos de un vidrio en el formulario para editar
  const handleEdit = (vidrio) => {
    setEditId(vidrio._id);
    setNombre(vidrio.nombre);
    setGrosor(vidrio.grosor || "");
    setPrecioM2(vidrio.precioM2.toString());
  };

  // ---------------------------------------------
  // Eliminar un vidrio
  // ---------------------------------------------
  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este tipo de vidrio?")) return;
    try {
      await apiFetch(`/api/vidrios/${id}`, { method: "DELETE" });
      await cargarVidrios();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
  <div id="glassTypes">
    <div className="card mb-3">
      <div className="card-body">
        <h4 className="card-title mb-3">Tipos de vidrio</h4>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <form className="row g-2 mb-3" onSubmit={handleSubmit}>
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Nombre (ej: Laminado)"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Grosor (opcional)"
              value={grosor}
              onChange={(e) => setGrosor(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <input
              type="number"
              className="form-control"
              placeholder="Precio por m²"
              value={precioM2}
              onChange={(e) => setPrecioM2(e.target.value)}
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-success w-100">
              {editId ? "Guardar cambios" : "Agregar"}
            </button>
          </div>
        </form>

        {loading ? (
          <p>Cargando tipos de vidrio...</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Grosor</th>
                  <th>Precio m²</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {vidrios.map((v) => (
                  <tr key={v._id}>
                    <td>{v.nombre}</td>
                    <td>{v.grosor}</td>
                    <td>${v.precioM2.toFixed(2)}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-outline-primary btn-sm me-2"
                        onClick={() => handleEdit(v)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(v._id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {vidrios.length === 0 && (
                  <tr>
                    <td colSpan="4">No hay tipos de vidrio cargados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  </div>
  );
}
