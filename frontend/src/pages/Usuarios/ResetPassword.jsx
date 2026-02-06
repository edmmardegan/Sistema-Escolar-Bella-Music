// Local: src/ResetPassword/index.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { FaLock, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import "./styles.css";

export default function ResetPassword() {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();

    if (novaSenha.length < 6) {
      return alert("A senha deve ter pelo menos 6 caracteres.");
    }

    if (novaSenha !== confirmarSenha) {
      return alert("As senhas não conferem!");
    }

    setLoading(true);
    try {
      // Chama a rota PATCH /usuarios/:id/update-own-password que criamos no UsersController
      await api.updateOwnPassword(user.id, { novaSenha });

      alert("Senha atualizada com sucesso! Por favor, realize o login novamente.");

      // Limpeza de segurança para forçar novo login
      localStorage.clear();
      window.location.href = "/login";
    } catch (error) {
      console.error("Erro ao atualizar senha:", error);
      alert("Erro ao atualizar senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-reset">
      <div className="card-reset">
        <div className="header-reset">
          <FaLock size={40} color="#007bff" />
          <h2>Primeiro Acesso</h2>
          <p>Para sua segurança, você precisa cadastrar uma nova senha antes de continuar.</p>
        </div>

        <form onSubmit={handleReset} className="form-reset">
          <div className="input-group">
            <label>Nova Senha</label>
            <input
              type="password"
              className="input-field"
              required
              minLength={6}
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Digite sua nova senha"
            />
          </div>

          <div className="input-group">
            <label>Confirmar Nova Senha</label>
            <input
              type="password"
              className="input-field"
              required
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Confirme a senha"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", marginTop: "20px" }}>
            {loading ? "Processando..." : "Atualizar e Acessar Sistema"}
          </button>
        </form>

        <div className="footer-reset">
          <small>
            <FaExclamationCircle /> Após atualizar, você será redirecionado para o login.
          </small>
        </div>
      </div>
    </div>
  );
}
