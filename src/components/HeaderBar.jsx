import { useEffect } from "react";

export function HeaderBar({ onLogout }) {

  // Cerrar automáticamente el menú hamburguesa al hacer clic en un link
  useEffect(() => {
    const navLinks = document.querySelectorAll(".nav-link");
    const navbarCollapse = document.querySelector("#navbarMenu");

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        const bsCollapse = window.bootstrap.Collapse.getInstance(navbarCollapse);
        if (bsCollapse) bsCollapse.hide();
      });
    });
  }, []);

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark bg-success mb-3"
      style={{ borderRadius: "0.75rem" }}  // Borde redondeado igual que las cards
    >
      <div className="container-fluid">

        {/* Título */}
        <a className="navbar-brand text-white" href="#">
          Vidriería Villarroel
        </a>

        {/* Botón hamburguesa */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMenu"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Menú colapsable */}
        <div className="collapse navbar-collapse" id="navbarMenu">
          <ul className="navbar-nav ms-auto">

            <li className="nav-item">
              <a className="nav-link text-white" href="#calculator">
                Calculadora
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link text-white" href="#glassTypes">
                Vidrios
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link text-white" href="#budgetsList">
                Presupuestos
              </a>
            </li>

            <li className="nav-item">
              <button
                className="btn btn-outline-light btn-sm ms-lg-3"
                onClick={onLogout}
              >
                Cerrar sesión
              </button>
            </li>

          </ul>
        </div>
      </div>
    </nav>
  );
}
