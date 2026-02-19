import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { FaUserGraduate, FaBook, FaTable, FaFileSignature, FaCalendarAlt, FaWallet, FaSignOutAlt, FaUserCog } from "react-icons/fa";
import "./styles.css";
import logo from "../../assets/logo2.jpg";

export default function Menu() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const allItems = [
    { to: "/agenda", label: "Agenda", icon: <FaCalendarAlt /> },
    { to: "/alunos", label: "Alunos", icon: <FaUserGraduate /> },
    { to: "/cursos", label: "Cursos", icon: <FaBook /> },
    { to: "/mapa", label: "Mapa de Horários", icon: <FaTable /> },
    { to: "/matriculas", label: "Matrículas", icon: <FaFileSignature /> },
    { to: "/financeiro", label: "Financeiro", icon: <FaWallet />, adminOnly: true },
    { to: "/usuarios", label: "Usuários", icon: <FaUserCog />, adminOnly: true },
  ];

  const menuItems = allItems
    .filter((item) => !item.adminOnly || user?.role?.toLowerCase() === "admin")
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <nav className="sidebar-menu">
      <div className="logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        <img className="logo-mini" src={logo} alt="Logo"/>
        <span> - Home</span>
      </div>
      {/* AVISO DE AMBIENTE DINÂMICO */}
      {import.meta.env.VITE_STATUS === "development" ? (
        <div
          style={{
            fontSize: "10px",
            background: "#ff9800", // Laranja para Dev
            color: "#000",
            fontWeight: "bold",
            textAlign: "center",
            borderRadius: "4px",
            marginTop: "5px",
            padding: "2px 4px",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Ambiente de Desenvolvimento
        </div>
      ) : null}

      <div className="user-info">
        <span>Logado como:</span>
        <strong className="user-status"> {user?.nome || "Usuário"}</strong>
      </div>

      <hr className="menu-divider" />

      <div className="menu-links">
        {menuItems.map((item) => (
          <Link key={item.to} to={item.to} className={`menu-link-item ${location.pathname === item.to ? "active" : ""}`}>
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-label">{item.label}</span>
          </Link>
        ))}
      </div>

      <button onClick={handleLogout} className="btn-logout">
        <FaSignOutAlt /> Sair
      </button>
    </nav>
  );
}
