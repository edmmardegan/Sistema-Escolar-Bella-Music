import "./App.css";
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// 1. Imports de Autenticação
import { AuthProvider } from "./AuthContext.jsx";
import { useAuth } from "./hooks/useAuth.js";
import api from "./services/api.js"; // Importado para a troca de senha

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
import PaginaFantasma from "./pages/Template/index.jsx"; //pagina modelo
import Boletim from "./pages/Boletim";


// 🛡️ Componente de Proteção Geral
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: "20px" }}>Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;

  // Se for primeiro acesso, bloqueia as rotas normais e força o reset
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
          {/* Rota Pública */}
          <Route path="/login" element={<Login />} />

          {/* Rota de Reset (Sem Menu lateral) */}
          <Route path="/reset-password" element={<AuthConsumerReset />} />

          {/* Rotas Protegidas (Com Menu e Layout) */}
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <div className="app-layout">
                  <Menu />
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
                      <Route path="/developer/template" element={<PaginaFantasma />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                </div>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// 🔑 Componente de Reset Integrado (Evita erro de arquivo externo)
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
      alert("Senha atualizada com sucesso! Faça login novamente.");
      logout(); // Desloga para limpar o estado
    } catch (err) {
      alert("Erro ao atualizar senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f0f2f5" }}>
      <div style={{ background: "#fff", padding: "40px", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", width: "380px" }}>
        <h2 style={{ textAlign: "center", color: "#333", marginBottom: "10px" }}>Nova Senha</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "25px" }}>
          Olá <strong>{user?.nome}</strong>, por segurança, altere sua senha inicial.
        </p>

        <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <input
            type="password"
            placeholder="Nova senha"
            required
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "16px" }}
          />
          <input
            type="password"
            placeholder="Confirme a nova senha"
            required
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "16px" }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px",
              background: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            {loading ? "Processando..." : "Salvar Nova Senha"}
          </button>
        </form>
      </div>
    </div>
  );
}
