// URL base de la API, se toma de las variables de entorno de Vite.
// Si no existe VITE_API_BASE_URL, cae por defecto a "" (misma URL del front).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
console.log("👉 API_BASE_URL =", API_BASE_URL);

const defaultHeaders = {
  "Content-Type": "application/json",
};

// Une base + path sin duplicar / ni /api/api
function unirUrl(base, path) {
  const b = (base || "").replace(/\/+$/, ""); // quita barras al final
  const p = (path || "").startsWith("/") ? path : `/${path}`;

  // Evita /api/api cuando base="/api" y path="/api/..."
  if (b.endsWith("/api") && p.startsWith("/api/")) {
    return `${b}${p.slice(4)}`; // quita el primer "/api"
  }

  return `${b}${p}`;
}

export async function apiFetch(path, options = {}) {
  const url = unirUrl(API_BASE_URL, path);

  const response = await fetch(url, {
    credentials: "include",
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  let data = null;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message = data && data.message ? data.message : "Error en la petición";
    throw new Error(message);
  }

  return data;
}
