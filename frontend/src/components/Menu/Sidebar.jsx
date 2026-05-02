import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  Users,
  BookOpen,
  Table,
  FileEdit,
  GraduationCap,
  CircleDollarSign,
  Calendar,
  History,
  UserCog,
  Key,
  LogOut,
  ShieldUser,
  Clock,
  CalendarClock,
} from "lucide-react"; // Importe os ícones do Lucide


export default function Sidebar({ collapsed, onToggle }) {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState({});

  const handleLogout = () => {
    sessionStorage.removeItem("@App:exibiuAniversario");
    logout();
    navigate("/login");
  };

  const menuItems = [
    { id: "home", label: "Home", to: "/", icon: <LayoutDashboard size={22} /> },
    {
      id: "cadastros",
      label: "Cadastros",
      icon: <Calendar size={22} />,
      subItems: [
    { label: "Alunos", to: "/alunos", icon: <Users size={16} /> },
    { label: "Cursos", to: "/cursos", icon: <BookOpen size={16} /> },
    { label: "Matrículas", to: "/matriculas", icon: <GraduationCap size={16} /> },
     ],
    },

    { id: "financeiro", label: "Financeiro", to: "/financeiro", icon: <CircleDollarSign size={22} />, adminOnly: true },
 
    {
      id: "horarios",
      label: "Horários",
      icon: <Clock size={22} />,
      subItems: [
        { label: "Frequencia", to: "/agenda", icon: <Calendar size={16} /> },
        { label: "Mapa Horários", to: "/mapa", icon: <CalendarClock size={16} /> },
      ],
    },

    {
      id: "usuarios",
      label: "Usuários",
      icon: <ShieldUser size={22} />,
      subItems: [
        { label: "Usuários", to: "/usuarios", icon: <UserCog size={16} />, adminOnly: true },
        { label: "Alterar Senha", to: "/reset-password", icon: <Key size={16} /> },
      ],
    },

  ] // 1. Primeiro filtramos os itens principais
    .filter((item) => !item.adminOnly || user?.role?.toLowerCase() === "admin")
    // 2. Agora filtramos os subItems dentro dos itens que sobraram
    .map((item) => {
      if (item.subItems) {
        return {
          ...item,
          subItems: item.subItems.filter((sub) => !sub.adminOnly || user?.role?.toLowerCase() === "admin"),
        };
      }
      return item;
    });

  return (
    <aside
      className={`fixed top-0 left-0 h-full z-40 bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 ${collapsed ? "w-[72px]" : "w-[260px]"}`}
    >
      {/* Header com Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700/50">
        {!collapsed && <span className="font-bold text-lg tracking-tight text-center">Bela Music</span>}
        <button onClick={onToggle} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400">
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* AMBIENTE */}
      {import.meta.env.VITE_STATUS === "development" &&
        (collapsed ? (
          /* Quando fechado: apenas uma bolinha laranja */
          <div className="flex justify-center mt-2">
            <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse" title="Desenvolvimento" />
          </div>
        ) : (
          /* Quando aberto: a faixa completa */
          <div className="mx-3 mt-2 bg-orange-400 text-black font-bold text-center rounded px-1 py-[4px] uppercase tracking-wider">
            <p className="text-[10px]">Ambiente de Desenvolvimento</p>
          </div>
        ))}
      {/* USER */}
      {!collapsed && (
        <div className="flex justify-center gap-2 p-2 items-center text-center border-b border-slate-700/50">
          <span className="text-sm">Login:</span>
          <strong className="block text-lg text-yellow-400">{user?.nome || "Usuário"}</strong>
        </div>
      )}

      {/* Navegação */}
      {/* Navegação */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isExpanded = expandedMenus[item.id];
          const isActive = location.pathname === item.to;

          return (
            <div key={item.id}>
              {hasSubItems ? (
                /* RENDERIZA BOTÃO PARA DROPDOWN */
                <button
                  onClick={() => !collapsed && setExpandedMenus((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all group relative cursor-pointer
                    ${isExpanded ? "bg-slate-700/30 text-white" : "text-slate-300 hover:bg-slate-700/50"}`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                  </div>

                  {!collapsed && <span className="text-slate-500">{isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>}

                  {collapsed && (
                    <div className="absolute left-full ml-3 px-3 py-2 rounded bg-slate-800 text-xs invisible group-hover:visible z-50 whitespace-nowrap shadow-xl">
                      {item.label}
                    </div>
                  )}
                </button>
              ) : (
                /* RENDERIZA LINK NORMAL */
                <Link
                  to={item.to}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative
                    ${isActive ? "bg-indigo-600 text-white shadow-lg" : "text-slate-300 hover:bg-slate-700/50"}`}
                >
                  {item.icon}
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}

                  {collapsed && (
                    <div className="absolute left-full ml-3 px-3 py-2 rounded bg-slate-800 text-xs invisible group-hover:visible z-50 whitespace-nowrap shadow-xl">
                      {item.label}
                    </div>
                  )}
                </Link>
              )}

              {/* ÁREA DOS SUBITENS */}
              {hasSubItems && isExpanded && !collapsed && (
                <div className="ml-4 pl-6 border-l border-slate-700 space-y-1 mt-1">
                  {item.subItems.map((sub, idx) => (
                    <Link
                      key={idx}
                      to={sub.to}
                      className={`flex items-center gap-3 py-2 px-2 text-sm rounded-lg transition-colors ${
                        location.pathname === sub.to ? "text-indigo-400 font-bold" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {sub.icon && <span className="opacity-70">{sub.icon}</span>}
                      <span>{sub.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-700/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all"
        >
          <LogOut size={22} />
          {!collapsed && <span className="text-sm font-medium">Sair</span>}
        </button>
      </div>
    </aside>
  );
}
