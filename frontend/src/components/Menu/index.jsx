//Local: /src/components/Menu/index.jsx

import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { FaUserGraduate, FaBook, FaKey, FaTable, FaFileSignature, FaCalendarAlt, FaWallet, FaSignOutAlt, FaUserCog, FaHistory } from "react-icons/fa";
import logo from "../../assets/logo2.jpg";
import Button from "../Button.jsx";

export default function Menu() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    sessionStorage.removeItem("@App:exibiuAniversario");
    logout();
    navigate("/login");
  };

  const allItems = [
    { to: "/agenda", label: "Agenda", icon: <FaCalendarAlt /> },
    { to: "/alunos", label: "Alunos", icon: <FaUserGraduate /> },
    { to: "/cursos", label: "Cursos", icon: <FaBook /> },
    { to: "/financeiro", label: "Financeiro", icon: <FaWallet />, adminOnly: true },
    { to: "/mapa", label: "Mapa de Horários", icon: <FaTable /> },
    { to: "/matriculas", label: "Matrículas", icon: <FaFileSignature /> },
    { to: "/logs", label: "Auditoria", icon: <FaHistory />, adminOnly: true },
    { to: "/usuarios", label: "Usuários", icon: <FaUserCog />, adminOnly: true },
    { to: "/reset-password", label: "Alterar Senha", icon: <FaKey /> },
  ];

  const menuItems = allItems.filter((item) => !item.adminOnly || user?.role?.toLowerCase() === "admin");

  return (
    <nav className="w-[200px] min-w-[200px] h-screen bg-[#2c3e50] text-white p-5 flex flex-col fixed left-0 top-0 z-[100] box-border">
      {/* LOGO */}
      <div 
        onClick={() => navigate("/")} 
        className="flex justify-center items-center gap-2 cursor-pointer mt-5 p-2">
        {/*<img src={logo} alt="Logo" className="w-[30px] block" />*/}
        <span className="font-bold text-white text-base">Home</span>
      </div>

      {/* AMBIENTE */}
      {import.meta.env.VITE_STATUS === "development" && (
        <div className="text-[10px] bg-orange-400 text-black font-bold text-center rounded mt-1 px-1 py-[2px] uppercase tracking-wider">
          Ambiente de Desenvolvimento
        </div>
      )}

      {/* USER */}
      <div className="mt-5 mb-2 text-center">
        <span className="text-sm">Logado como:</span>
        <strong className="block text-lg text-yellow-400 bg-black">{user?.nome || "Usuário"}</strong>
      </div>

      {/* DIVIDER */}
      <hr className="border-0 border-t border-[#34495e] my-2" />

      {/* LINKS */}
      <div className="flex flex-col gap-2 flex-grow">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.to;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`
                flex items-center gap-2 text-sm rounded px-2 py-1 transition
                ${isActive ? "bg-blue-600 text-white font-bold border-r-4 border-blue-400" : "text-gray-200 hover:bg-white/10 hover:text-white"}
              `}
            >
              <span className="flex items-center justify-center w-[20px]">{item.icon}</span>
              <span className="text-[15px]">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* LOGOUT */}
      <Button 
        variant="red" 
        icon={FaSignOutAlt} 
        onClick={handleLogout} 
        className="px-4"
      >
      Sair
      </Button>
    </nav>
  );
}
