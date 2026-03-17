// Local: src/ResetPassword/index.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { FaLock, FaKey, FaExclamationCircle } from "react-icons/fa";
import "../Usuarios/resetpassword.style.css";

export default function ResetPassword() {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    if (novaSenha.length < 6) return alert("A senha deve ter pelo menos 6 caracteres.");
    if (novaSenha !== confirmarSenha) return alert("As senhas não conferem!");

    setLoading(true);
    try {
      await api.updateOwnPassword(user.id, { novaSenha });
      alert("Senha atualizada com sucesso! Por favor, realize o login novamente.");
      localStorage.clear();
      window.location.href = "/login";
    } catch (error) {
      alert("Erro ao atualizar senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="reset-page-container">
      <section className="auth-card-reset">
        <div className="auth-header-reset">
          {user?.primeiroAcesso ? (
            <>
              <FaLock size={30} color="#007bff" />
              <h2>Primeiro Acesso</h2>
              <p style={{ marginTop: "10px", color: "#666" }}>Cadastre uma nova senha para continuar.</p>
            </>
          ) : (
            <>
              <FaKey size={30} color="#007bff" />
              <h2>Alterar Senha</h2>
              <p style={{ marginTop: "10px", color: "#666" }}>
                Olá <strong>{user?.nome}</strong>, altere sua senha abaixo.
              </p>
            </>
          )}
        </div>

        <form onSubmit={handleReset} className="auth-form-reset">
          <div className="auth-input-group">
            <label>Nova Senha</label>
            <input
              type="password"
              className="auth-input-field"
              required
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Digite sua nova senha"
            />
          </div>

          <div className="auth-input-group">
            <label>Confirmar Nova Senha</label>
            <input
              type="password"
              className="auth-input-field"
              required
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Confirme a nova senha"
            />
          </div>

          <button type="submit" className="auth-btn-reset btn-azul" disabled={loading}>
            {loading ? "Processando..." : "Salvar Nova Senha"}
          </button>
          
          <button type="button" className="auth-btn-reset btn-vermelho" onClick={() => navigate("/")}>
            Cancelar e Voltar
          </button>
        </form>

        <div className="auth-footer-reset">
          <FaExclamationCircle /> Após atualizar, o sistema solicitará um novo login.
        </div>
      </section>
    </main>
  );
}