
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
// Estilos globales de la aplicación
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  // StrictMode ayuda a detectar problemas en desarrollo
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
