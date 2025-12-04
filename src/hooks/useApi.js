// URL base de la API, se toma de las variables de entorno de Vite.
// Si no existe VITE_API_BASE_URL, cae por defecto a localhost.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
// Headers comunes para todos los requests.
// Content-Type JSON por defecto (puede sobreescribirse en cada llamada).
const defaultHeaders = {
  "Content-Type": "application/json"
};

/**
 * Helper para hacer fetch usando cookies HTTP-only.
 * Centraliza:
 *   - la URL base
 *   - el manejo de errores
 *   - el parseo automático de JSON o texto
 *   - el envío de cookies (credentials: include)
 */
export async function apiFetch(path, options = {}) {
  // Llamada fetch combinando defaults + overrides
  const response = await fetch(`${API_BASE_URL}${path}`, {
    // Enviar cookies (JWT httpOnly)
    credentials: "include",

    // Headers: merge entre defaultHeaders y los headers del caller
    headers: {
      ...defaultHeaders,
      ...(options.headers || {})
    },
    // Merge general de options (method, body, etc.)
    ...options
  });

  // Detectamos si la respuesta es JSON o texto
  const contentType = response.headers.get("content-type") || "";
  let data = null;
  if (contentType.includes("application/json")) {
    // Si la respuesta es JSON, la parseamos
    data = await response.json();
  } else {
    // Si la respuesta es JSON, la parseamos
    data = await response.text();
  }

  // Manejo centralizado de errores (status >= 400)
  if (!response.ok) {
    const message = data && data.message ? data.message : "Error en la petición";
    throw new Error(message);
  }

  // Si todo salió bien, devolvemos la data ya parseada
  return data;
}
