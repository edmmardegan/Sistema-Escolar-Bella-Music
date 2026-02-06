// Local: src/Login/index.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import api from "../../services/api.js";
import { FaUserCircle, FaLock, FaSignInAlt } from "react-icons/fa";
import "./styles.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Chama a função login da nossa api.js padronizada
      const data = await api.login(email, password);

      if (data && data.access_token) {
        // Salva os dados no contexto de autenticação
        login(data.user, data.access_token);

        // LÓGICA DE DIRECIONAMENTO:
        // Se for o primeiro acesso, obriga a troca de senha.
        if (data.user?.primeiroAcesso) {
          navigate("/reset-password");
        } else {
          navigate("/"); // Vai para a Home (Agenda)
        }
      } else {
        alert("Erro inesperado na resposta do servidor.");
      }
    } catch (error) {
      console.error("Erro ao logar:", error);
      const msg = error.response?.data?.message || "Usuário ou senha incorretos!";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <FaUserCircle size={60} color="#007bff" />
          <h2>Acesso ao Sistema</h2>
          <p>Entre com suas credenciais para continuar</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <FaSignInAlt /> Email
            </label>
            <input
              type="email"
              required
              className="input-field"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>
              <FaLock /> Senha
            </label>
            <input
              type="password"
              required
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Autenticando..." : "Entrar no Sistema"}
          </button>
        </form>

        <div className="login-footer">
          <small>&copy; 2026 Sistema de Gestão Escolar</small>
        </div>
      </div>
    </div>
  );
}
