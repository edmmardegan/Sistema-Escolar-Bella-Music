//Local: /src/App.jsx
import "./App.css";
import React, { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { FaBirthdayCake, FaTimes } from "react-icons/fa";

// 1. Contexto e Hooks
import { AuthProvider } from "./AuthContext.jsx";
import { useAuth } from "./hooks/useAuth.js";
import api from "./services/api.js";
import Sidebar from "./components/Menu/Sidebar.jsx";

// 2. Componentes de Layout e Páginas
import Login from "./pages/Login";
const Home = lazy(() => import("./pages/Home/index"));
const Alunos = lazy(() => import("./pages/Alunos/index.jsx"));
const Cursos = lazy(() => import("./pages/Cursos/index.jsx"));
const Mapa = lazy(() => import("./pages/Mapa/index.jsx"));
const Matriculas = lazy(() => import("./pages/Matriculas/index.jsx"));
const Agenda = lazy(() => import("./pages/Agenda/index.jsx"));
const Financeiro = lazy(() => import("./pages/Financeiro/index.jsx"));
const Usuarios = lazy(() => import("./pages/Usuarios/index.jsx"));
const Boletim = lazy(() => import("./pages/Boletim/index.jsx"));
const AuditLogs = lazy(() => import("./pages/Logs/index.jsx"));
const ResetPassword = lazy(() => import("./pages/Usuarios/ResetPassword.jsx"));

// 🎂 Componente de Aniversário (Otimizado para aparecer apenas 1x por sessão)
function NotificacaoAniversario() {
  const [aniversariantes, setAniversariantes] = useState([]);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const jaExibiu = sessionStorage.getItem("@App:exibiuAniversario");
    if (!jaExibiu) {
      api
        .getAniversariantes()
        .then((dados) => {
          if (Array.isArray(dados) && dados.length > 0) {
            setAniversariantes(dados);
            setVisivel(true);
            sessionStorage.setItem("@App:exibiuAniversario", "true");
          }
        })
        .catch((err) => console.error("Erro aniversariantes:", err));
    }
  }, []);

  if (!visivel || aniversariantes.length === 0) return null;

function PrivateLayout({ children }) {
  const { user, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false); // Novo estado

  if (loading) return <div style={{ padding: "20px" }}>Sincronizando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.primeiroAcesso === 1) return <Navigate to="/reset-password" replace />;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* O novo Menu */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      
      {/* Conteúdo Principal com margem dinâmica */}
      <div 
        className={`flex-1 transition-all duration-300 ${collapsed ? "ml-[72px]" : "ml-[260px]"}`}
      >
        <NotificacaoAniversario />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

  return (
    <div className="alerta-aniversario-container">
      <div className="alerta-aniversario-content">
        <FaBirthdayCake className="animar-bolo" />
        <span>
          <strong>Aniversariantes de hoje:</strong> {aniversariantes.map((a) => a.nome).join(", ")}
        </span>
        <button className="btn-fechar-alerta" onClick={() => setVisivel(false)}>
          <FaTimes />
        </button>
      </div>
    </div>
  );
}

function PrivateLayout({ children }) {
  const { user, loading } = useAuth();
  // Criamos o estado para controlar se o menu está recolhido ou não
  const [collapsed, setCollapsed] = useState(false);

  if (loading) return <div style={{ padding: "20px" }}>Sincronizando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.primeiroAcesso === 1) return <Navigate to="/reset-password" replace />;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* 1. Usamos o novo Sidebar aqui */}
      <Sidebar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed(!collapsed)} 
      />
      
      {/* 2. Ajustamos a margem do conteúdo principal conforme o estado do menu */}
      <div 
        className={`flex-1 transition-all duration-300 flex flex-col overflow-hidden 
          ${collapsed ? "ml-[72px]" : "ml-[260px]"}`}
      >
        <NotificacaoAniversario />
        <main className="flex-1 p-6 bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<div style={{ padding: 20 }}>Carregando...</div>}>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/login" element={<Login />} />

            {/* Rotas Privadas (Estrutura Plana) */}
            <Route path="/" element={<PrivateLayout><Home /></PrivateLayout>} />
            <Route path="/alunos" element={<PrivateLayout><Alunos /></PrivateLayout>} />
            <Route path="/matriculas" element={<PrivateLayout><Matriculas /></PrivateLayout>} />
            <Route path="/boletim/:termoId" element={<PrivateLayout><Boletim /></PrivateLayout>} />
            <Route path="/cursos" element={<PrivateLayout><Cursos /></PrivateLayout>} />
            <Route path="/mapa" element={<PrivateLayout><Mapa /></PrivateLayout>} />
            <Route path="/agenda" element={<PrivateLayout><Agenda /></PrivateLayout>} />
            <Route path="/financeiro" element={<PrivateLayout><Financeiro /></PrivateLayout>} />
            <Route path="/usuarios" element={<PrivateLayout><Usuarios /></PrivateLayout>} />
            <Route path="/logs" element={<PrivateLayout><AuditLogs /></PrivateLayout>} />
            <Route path="/reset-password" element={<PrivateLayout><ResetPassword /></PrivateLayout>} />

            {/* Rota de escape */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}