//Local: /src/App.jsx
import "./App.css";
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { FaBirthdayCake, FaTimes } from "react-icons/fa";

// 1. Contexto e Hooks
import { AuthProvider } from "./AuthContext.jsx";
import { useAuth } from "./hooks/useAuth.js";
import api from "./services/api.js";

// 2. Componentes de Layout e Páginas
import Menu from "./components/Menu/index.jsx";
import Home from "./pages/Home/index";
import Login from "./pages/Login";
import Alunos from "./pages/Alunos/index.jsx";
import Cursos from "./pages/Cursos/index.jsx";
import Mapa from "./pages/Mapa/index.jsx";
import Matriculas from "./pages/Matriculas/index.jsx";
import Agenda from "./pages/Agenda/index.jsx";
import Financeiro from "./pages/Financeiro/index.jsx";
import Usuarios from "./pages/Usuarios/index.jsx";
import Boletim from "./pages/Boletim/index.jsx";
import AuditLogs from "./pages/Logs/index.jsx";
import ResetPassword from "./pages/Usuarios/ResetPassword.jsx";
import Template from "./pages/Template/index.jsx";

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

// 🛡️ Wrapper de Proteção e Layout (Garante que o Menu apareça em todas)
function PrivateLayout({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: "20px" }}>Sincronizando...</div>;
  if (!user) return <Navigate to="/login" replace />;

  // Redireciona se for primeiro acesso
  if (user.primeiroAcesso === 1) return <Navigate to="/reset-password" replace />;

  return (
    <div className="flex">
      <Menu />
      <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
        <NotificacaoAniversario />
        <main className="flex-1 ml-[80px] p-3 min-h-screen bg-white">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />

          {/* Rotas Privadas (Estrutura Plana) */}
          <Route path="/" element={<PrivateLayout><Home /></PrivateLayout>}/>
          <Route path="/alunos" element={<PrivateLayout><Alunos /></PrivateLayout>}/>
          <Route path="/matriculas" element={<PrivateLayout><Matriculas /></PrivateLayout>}/>
          <Route path="/boletim/:termoId" element={<PrivateLayout><Boletim /></PrivateLayout>}/>
          <Route path="/cursos" element={<PrivateLayout><Cursos /></PrivateLayout>}/>
          <Route path="/mapa" element={<PrivateLayout><Mapa /></PrivateLayout>}/>
          <Route path="/agenda" element={<PrivateLayout><Agenda /></PrivateLayout>}/>
          <Route path="/financeiro"element={<PrivateLayout><Financeiro /></PrivateLayout>}/>
          <Route path="/usuarios"element={<PrivateLayout><Usuarios /></PrivateLayout>}/>
          <Route path="/logs" element={<PrivateLayout><AuditLogs /></PrivateLayout>}/>
          <Route path="/reset-password" element={<PrivateLayout> <ResetPassword /> </PrivateLayout>} />
          <Route path="/template" element={<PrivateLayout> <Template /> </PrivateLayout>} />

          {/* Rota de escape */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}