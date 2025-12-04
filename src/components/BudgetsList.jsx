
import { apiFetch } from "../hooks/useApi";

/**
 * Lista de presupuestos guardados.
 * Se actualiza desde el estado del componente padre (App).
 *
 * props:
 *  - budgets: array de presupuestos (viene ya populado desde el backend)
 *  - onDelete: callback para avisar al padre cuando se elimina uno
 */
export function BudgetsList({ budgets, onDelete }) {
  // ---------------------------------------------
  // Copiar presupuesto al portapapeles
  // ---------------------------------------------
  const handleCopy = async (p) => {
    // Si el vidrio tiene grosor, lo agregamos al texto
    const grosorText = p.tipoVidrio?.grosor ? ` ${p.tipoVidrio.grosor}` : "";
    const msg =
      "Presupuesto Vidriería Villarroel:\n" +
      `Medidas: ${p.alto.toFixed(2)}m x ${p.ancho.toFixed(2)}m\n` +
      `Vidrio: ${p.tipoVidrio?.nombre || ""}${grosorText}\n` +
      `Metros cuadrados: ${p.m2.toFixed(2)}\n` +
      `Precio cliente: $${p.precioCliente.toFixed(2)}`;

    try {
      await navigator.clipboard.writeText(msg);
      alert("Presupuesto copiado al portapapeles");
    } catch (err) {
      console.error("Error al copiar el presupuesto:", err);
      alert("No se pudo copiar el presupuesto");
    }
  };

  // ---------------------------------------------
  // WhatsApp con mensaje prearmado
  // ---------------------------------------------
  const handleWhatsApp = (p) => {
    const grosorText = p.tipoVidrio?.grosor ? ` ${p.tipoVidrio.grosor}` : "";
    const text =
      "Hola! Te paso tu presupuesto:%0A%0A" +
      `Vidrio: ${p.tipoVidrio?.nombre || ""}${grosorText}%0A` +
      `Medidas: ${p.alto.toFixed(2)}m x ${p.ancho.toFixed(2)}m%0A` +
      `m2: ${p.m2.toFixed(2)}%0A` +
      `Precio final: $${p.precioCliente.toFixed(2)}%0A%0A` +
      "Cualquier consulta estoy a disposición.";

    const url = `https://wa.me/?text=${text}`;
    window.open(url, "_blank");
  };

  // ---------------------------------------------
  // Eliminar presupuesto
  // ---------------------------------------------
  const handleDelete = async (p) => {
    if (!confirm("¿Eliminar este presupuesto?")) return;
    try {
      // DELETE /api/presupuestos/:id
      await apiFetch(`/api/presupuestos/${p._id}`, { method: "DELETE" });

      // Avisamos al padre para que saque el presupuesto del estado
      onDelete && onDelete(p._id);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
  
  <div id="budgetsList">
    <div className="card">
      <div className="card-body">
        <h4 className="card-title mb-3">Presupuestos guardados</h4>
        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Vidrio</th>
                <th>Medidas</th>
                <th>m²</th>
                <th>Precio final</th>
                <th>Nota</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((p) => (
                <tr key={p._id}>
                  <td>{new Date(p.fecha).toLocaleString()}</td>
                  <td>
                    {p.tipoVidrio?.nombre}{" "}
                    {p.tipoVidrio?.grosor && `(${p.tipoVidrio.grosor})`}
                  </td>
                  <td>
                    {p.alto.toFixed(2)}m x {p.ancho.toFixed(2)}m
                  </td>
                  <td>{p.m2.toFixed(2)}</td>
                  <td>${p.precioCliente.toFixed(2)}</td>
                  <td>{p.nota}</td>
                  <td className="text-end">
                    <button
                      className="btn btn-outline-secondary btn-sm me-2"
                      onClick={() => handleCopy(p)}
                    >
                      Copiar
                    </button>
                    <button
                      className="btn btn-outline-success btn-sm me-2"
                      onClick={() => handleWhatsApp(p)}
                    >
                      WhatsApp
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDelete(p)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {budgets.length === 0 && (
                <tr>
                  <td colSpan="7">No hay presupuestos guardados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  );
}
