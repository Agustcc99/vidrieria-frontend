
import { useEffect, useState } from "react";
import styles from "./styles/Layout.module.css";
import { LoginForm } from "./components/LoginForm";
import { HeaderBar } from "./components/HeaderBar";
import { GlassTypesManager } from "./components/GlassTypesManager";
import { Calculator } from "./components/Calculator";
import { BudgetsList } from "./components/BudgetsList";
import { apiFetch } from "./hooks/useApi";

function App() {
  // Estado del usuario logueado (objeto con info del usuario o null si no hay sesión)
  const [user, setUser] = useState(null);
  // Flag para saber si estamos verificando la sesión inicial
  // Sirve para mostrar un "cargando" mientras pegamos la primera consulta al backend
  const [checkingSession, setCheckingSession] = useState(true);
  // Lista de tipos de vidrio disponibles para la calculadora
  const [glassTypes, setGlassTypes] = useState([]);
  // Lista de presupuestos cargados desde el backend
  const [budgets, setBudgets] = useState([]);

  // (1) Verificar si hay sesión activa al cargar la app
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Llamada al endpoint que devuelve el usuario actual 
        const data = await apiFetch("/api/auth/me");
        setUser(data.user);
      } catch {
        // Si falla (no hay cookie / token inválido / error), dejamos usuario en null
        setUser(null);
      } finally {
        // Siempre dejamos de "cargar", haya sesión o no
        setCheckingSession(false);
      }
    };
    checkSession();
  }, []); // Solo se ejecuta una vez al montar el componente

  // (2) Cargar presupuestos cuando hay usuario logueado
  useEffect(() => {
    const cargarPresupuestos = async () => {
      // Si no hay usuario, no intentamos pedir presupuestos
      if (!user) return;

      try {
        const data = await apiFetch("/api/presupuestos");
        setBudgets(data);
      } catch (err) {
        console.error("Error al cargar presupuestos:", err.message);
      }
    };

    cargarPresupuestos();
  }, [user]);// Se dispara cada vez que cambia "user" (login / logout)

  // (3) Logout
  const handleLogout = async () => {
    try {
      // Avisamos al backend que cierre la sesión (borra cookie / invalida token)
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignoramos error
    } finally {
      // Limpiamos el usuario y los presupuestos en el front, pase lo que pase
      setUser(null);
      setBudgets([]);
    }
  };

  // (4) Cuaando se crea un nuevo presupuesto desde la calculadora
  const handleNewBudget = (nuevo) => {
    // Insertar al inicio de la lista sin recargar página
    setBudgets((prev) => [nuevo, ...prev]);
  };

  // (5) Cuando se elimina un presupuesto desde la lista
  const handleDeleteBudget = (id) => {
    // Filtramos la lista para sacar el presupuesto eliminado
    setBudgets((prev) => prev.filter((p) => p._id !== id));
  };

  // (6) Estado intermedio: verificando sesión
  if (checkingSession) {
    return (
      <div className={styles.appWrapper}>
        <div className="card shadow-sm p-4">
          <p>Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // (7) Si no hay usuario logueado, mostrar formulario de login
  if (!user) {
    return (
      <div className={styles.appWrapper}>
        <div className={`card shadow-sm p-4 ${styles.cardWrapper}`}>
          <LoginForm onLoginSuccess={setUser} />
        </div>
      </div>
    );
  }
  // (8) Usuario logueado: mostrar la app completa
  return (
    <div className={`app-container ${styles.appWrapper}`}>
      <div className={`card shadow-sm p-4 ${styles.cardWrapper}`}>
        <HeaderBar onLogout={handleLogout} />

        {/* Calculadora primero, como pantalla principal */}
        <Calculator glassTypes={glassTypes} onNewBudget={handleNewBudget} />

        {/* Gestión de tipos de vidrio */}
        <GlassTypesManager onGlassTypesChange={setGlassTypes} />

        {/* Lista de presupuestos actualizada en vivo */}
        <BudgetsList budgets={budgets} onDelete={handleDeleteBudget} />
      </div>
    </div>
  );
}

export default App;
