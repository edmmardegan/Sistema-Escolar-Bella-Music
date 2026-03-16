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
    /* Mudei de conteudo-principal para reset-password-page */
    <main className="reset-password-page">
      {/* Mudei de card-principal para reset-password-card e removi a div container-principal que era desnecessária para centralizar */}
      <section className="reset-password-card">
        <div className="header-card">
          {user?.primeiroAcesso ? (
            <>
              <FaLock size={30} color="#007bff" />
              <h2>Primeiro Acesso</h2>
              <p style={{ marginTop: "10px", color: "#666" }}>Para sua segurança, você precisa cadastrar uma nova senha antes de continuar.</p>
            </>
          ) : (
            <>
              <FaKey size={30} color="#007bff" />
              <h2>Alterar Senha</h2>
              <p style={{ marginTop: "10px", color: "#666" }}>
                Olá <strong>{user?.nome}</strong>, preencha os campos abaixo 
                para alterar sua senha.
              </p>
            </>
          )}
        </div>

        <form onSubmit={handleReset} className="form-padrao">
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

          <div className="input-group" style={{ marginTop: "15px" }}>
            <label>Confirmar Nova Senha</label>
            <input
              type="password"
              className="input-field"
              required
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Confirme a nova senha"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Processando..." : "Salvar Nova Senha"}
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => navigate("/")} // Ou navigate(-1) para voltar onde estava
          >
            Cancelar e Voltar
          </button>
        </form>

        <div className="footer-card">
          <small>
            <FaExclamationCircle /> Após atualizar, o sistema solicitará um novo login por segurança.
          </small>
        </div>
      </section>
    </main>
  );
}
