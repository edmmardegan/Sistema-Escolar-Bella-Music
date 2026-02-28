import "./App.css";
import React, { useState, useEffect } from "react"; // Adicionado useEffect
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { FaBirthdayCake, FaTimes } from "react-icons/fa"; // Ícones que você já usa

// 1. Imports de Autenticação
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
import PaginaFantasma from "./pages/Template/index.jsx";
import Boletim from "./pages/Boletim/index.jsx";
import AuditLogs from "./pages/Logs/index.jsx";


// 🎂 Componente de Notificação de Aniversariantes
function NotificacaoAniversario() {
  const [aniversariantes, setAniversariantes] = useState([]);
  const [visivel, setVisivel] = useState(true);

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const dados = await api.getAniversariantes();
        console.log("DEBUG ANIVERSARIANTES:", dados); // Veja isso no F12 do navegador

        if (Array.isArray(dados)) {
          setAniversariantes(dados);
        }
      } catch (err) {
        console.error("Erro ao buscar aniversariantes:", err);
      }
    };
    buscarDados();
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

// 🛡️ Componente de Proteção Geral
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: "20px" }}>Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (user.primeiroAcesso === true) {
    return <Navigate to="/reset-password" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<AuthConsumerReset />} />

          <Route
            path="/*"
            element={
              <PrivateRoute>
                <div className="app-layout">
                  <Menu />
                  {/* Container flex para empilhar o alerta e o conteúdo */}
                  <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
                    <NotificacaoAniversario />
                    <main className="conteudo-principal">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/alunos" element={<Alunos />} />
                        <Route path="/boletim/:termoId" element={<Boletim />} />
                        <Route path="/cursos" element={<Cursos />} />
                        <Route path="/mapa" element={<Mapa />} />
                        <Route path="/matriculas" element={<Matriculas />} />
                        <Route path="/agenda" element={<Agenda />} />
                        <Route path="/financeiro" element={<Financeiro />} />
                        <Route path="/usuarios" element={<Usuarios />} />
                        {<Route path="/logs" element={<AuditLogs />} />}
                        <Route path="/developer/template" element={<PaginaFantasma />} />
                        {/*<Route path="*" element={<Navigate to="/" replace />} />*/}
                      </Routes>
                    </main>
                  </div>
                </div>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// 🔑 Componente de Reset Integrado
function AuthConsumerReset() {
  const { user, authenticated, logout } = useAuth();
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [loading, setLoading] = useState(false);

  if (!authenticated) return <Navigate to="/login" replace />;
  if (user?.primeiroAcesso === false) return <Navigate to="/" replace />;

  const handleReset = async (e) => {
    e.preventDefault();
    if (novaSenha !== confirmar) return alert("As senhas não coincidem!");
    setLoading(true);
    try {
      await api.updateOwnPassword(user.id, { novaSenha });
      alert("Senha atualizada com sucesso!");
      logout();
    } catch (err) {
      alert("Erro ao atualizar senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2 style={{ textAlign: "center", color: "#333" }}>Nova Senha</h2>
        <p style={{ textAlign: "center", color: "#666" }}>
          Olá <strong>{user?.nome}</strong>, altere sua senha inicial.
        </p>

        <form onSubmit={handleReset} className="reset-password-form">
          <input
            className="input-reset"
            type="password"
            placeholder="Nova senha"
            required
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
          />
          <input
            className="input-reset"
            type="password"
            placeholder="Confirme a nova senha"
            required
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
          />
          <button type="submit" disabled={loading} className="btn-reset">
            {loading ? "Processando..." : "Salvar Nova Senha"}
          </button>
        </form>
      </div>
    </div>
  );
}
