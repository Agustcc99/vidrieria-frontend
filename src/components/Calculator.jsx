
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../hooks/useApi";
import styles from "../styles/Calculator.module.css";

/**
 * Calculadora de presupuestos.
 * Lo primero que se ve en la pantalla.
 */
export function Calculator({ glassTypes, onNewBudget }) {
  // Alto y ancho ingresados por el usuario (strings porque vienen del input)
  const [alto, setAlto] = useState("");
  const [ancho, setAncho] = useState("");
  // ID del vidrio seleccionado en el <select>
  const [vidrioId, setVidrioId] = useState("");
  // Porcentaje de ganancia (string para poder editarlo en el input)
  const [porcentajeGanancia, setPorcentajeGanancia] = useState("30");
  // Nota opcional que acompaña al presupuesto
  const [nota, setNota] = useState("");
  // Mensaje de error a mostrar en la UI
  const [error, setError] = useState("");
  // Flag para indicar que se está guardando
  const [saving, setSaving] = useState(false);

  
  // ---------------------------------------------
  // Seleccionar vidrio por defecto cuando haya lista
  // ---------------------------------------------
  useEffect(() => {
    // Si ya tenemos tipos de vidrio y aún no hay uno seleccionado
    if (glassTypes.length > 0 && !vidrioId) {
      // Tomamos el primero como default
      setVidrioId(glassTypes[0]._id);
    }
  }, [glassTypes]); // depende de la lista de vidrios

  // Vidrio actualmente seleccionado (objeto completo)
  const selectedGlass = useMemo(
    () => glassTypes.find((g) => g._id === vidrioId),
    [glassTypes, vidrioId]
  );

  // ---------------------------------------------
  // Cálculo en el front para mostrar en vivo
  // ---------------------------------------------
  const calcResult = useMemo(() => {
    const a = parseFloat(alto);
    const b = parseFloat(ancho);
    const pg = parseFloat(porcentajeGanancia);

    // Si falta algo o hay NaN, no devolvemos resultado
    if (!selectedGlass || isNaN(a) || isNaN(b) || isNaN(pg)) return null;

    const m2 = a * b;
    const precioCosto = m2 * selectedGlass.precioM2;
    const precioCliente = precioCosto * (1 + pg / 100);

    return { m2, precioCosto, precioCliente };
  }, [alto, ancho, porcentajeGanancia, selectedGlass]);

  // ---------------------------------------------
  // Copiar presupuesto al portapapeles
  // ---------------------------------------------
  const handleCopy = async () => {
    if (!calcResult || !selectedGlass) return;
    const { m2, precioCliente } = calcResult;
    const a = parseFloat(alto);
    const b = parseFloat(ancho);

    // Si el vidrio tiene grosor, lo agregamos al texto
    const grosorText = selectedGlass.grosor ? ` ${selectedGlass.grosor}` : "";
    const msg =
      "Presupuesto Vidriería Villarroel:\n" +
      `Medidas: ${a.toFixed(2)}m x ${b.toFixed(2)}m\n` +
      `Vidrio: ${selectedGlass.nombre}${grosorText}\n` +
      `Metros cuadrados: ${m2.toFixed(2)}\n` +
      `Precio cliente: $${precioCliente.toFixed(2)}`;

    try {
      await navigator.clipboard.writeText(msg);
      alert("Presupuesto copiado al portapapeles");
    } catch (err) {
      console.error("Error al copiar el presupuesto:", err);
      alert("No se pudo copiar el presupuesto");
    }
  };

  // ---------------------------------------------
  // Abrir WhatsApp con mensaje prearmado
  // ---------------------------------------------
  const handleWhatsApp = () => {
    if (!calcResult || !selectedGlass) return;
    const { m2, precioCliente } = calcResult;
    const a = parseFloat(alto);
    const b = parseFloat(ancho);
    const grosorText = selectedGlass.grosor ? ` ${selectedGlass.grosor}` : "";

    // Usamos %0A para saltos de línea (URL encoded)
    const text =
      "Hola! Te paso tu presupuesto:%0A%0A" +
      `Vidrio: ${selectedGlass.nombre}${grosorText}%0A` +
      `Medidas: ${a.toFixed(2)}m x ${b.toFixed(2)}m%0A` +
      `m2: ${m2.toFixed(2)}%0A` +
      `Precio final: $${precioCliente.toFixed(2)}%0A%0A` +
      "Cualquier consulta estoy a disposición.";

    // Sin número: abre WhatsApp y el usuario elige el contacto
    const url = `https://wa.me/?text=${text}`;
    window.open(url, "_blank");
  };

  // ---------------------------------------------
  // Guardar presupuesto en el backend
  // ---------------------------------------------
  const handleSave = async () => {
    setError("");
    if (!calcResult || !selectedGlass) {
      setError("Faltan datos para calcular el presupuesto.");
      return;
    }
    const a = parseFloat(alto);
    const b = parseFloat(ancho);
    const pg = parseFloat(porcentajeGanancia);

    if (isNaN(a) || isNaN(b) || isNaN(pg)) {
      setError("Alto, ancho y porcentaje de ganancia deben ser números.");
      return;
    }

    try {
      setSaving(true);

      // Cuerpo que espera el backend
      const body = {
        alto: a,
        ancho: b,
        tipoVidrio: selectedGlass._id,
        porcentajeGanancia: pg,
        nota
      };

      // POST /api/presupuestos
      const nuevo = await apiFetch("/api/presupuestos", {
        method: "POST",
        body: JSON.stringify(body)
      });

      // Actualizar lista de presupuestos en la UI sin recargar
      onNewBudget && onNewBudget(nuevo);
      alert("Presupuesto guardado con éxito");
    } catch (err) {
      // Mostramos el mensaje que vino del backend (o useApi)
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="calculator">
    <div className="card mb-3">
      <div className="card-body">
        <h4 className="card-title mb-3">Calculadora de presupuestos</h4>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className={styles.formRow}>
          <div>
            <label className="form-label">Alto (m)</label>
            <input
              type="number"
              className="form-control"
              value={alto}
              onChange={(e) => setAlto(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="form-label">Ancho (m)</label>
            <input
              type="number"
              className="form-control"
              value={ancho}
              onChange={(e) => setAncho(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="form-label">Tipo de vidrio</label>
            <select
              className="form-select"
              value={vidrioId}
              onChange={(e) => setVidrioId(e.target.value)}
            >
              {glassTypes.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.nombre} {g.grosor && `(${g.grosor})`} - ${g.precioM2}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">% Ganancia</label>
            <input
              type="number"
              className="form-control"
              value={porcentajeGanancia}
              onChange={(e) => setPorcentajeGanancia(e.target.value)}
              min="0"
              step="1"
            />
          </div>
        </div>

        <div className="mt-3">
          <label className="form-label">Nota (opcional)</label>
          <textarea
            className="form-control"
            rows="2"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Ej: incluye colocación, seña del 50%, etc."
          />
        </div>

        {selectedGlass && calcResult && (
          <div className="mt-3 p-3 bg-light rounded">
            <p className="mb-1">
              <strong>m² totales:</strong> {calcResult.m2.toFixed(2)}
            </p>
            <p className="mb-1">
              <strong>Precio costo:</strong> ${calcResult.precioCosto.toFixed(2)}
            </p>
            <p className="mb-1">
              <strong>Precio cliente:</strong> ${calcResult.precioCliente.toFixed(2)}
            </p>
          </div>
        )}

        <div className="mt-3 d-flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-success"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar presupuesto"}
          </button>
          <button type="button" className="btn btn-outline-secondary" onClick={handleCopy}>
            Copiar presupuesto
          </button>
          <button type="button" className="btn btn-outline-success" onClick={handleWhatsApp}>
            Enviar por WhatsApp
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}
