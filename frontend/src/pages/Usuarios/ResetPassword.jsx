// Local: src/ResetPassword/index.jsx

// Local: src/ResetPassword/index.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { FaLock, FaKey, FaExclamationCircle } from "react-icons/fa";

export default function ResetPassword() {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();

    if (novaSenha.length < 6)
      return alert("A senha deve ter pelo menos 6 caracteres.");

    if (novaSenha !== confirmarSenha)
      return alert("As senhas não conferem!");

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
    <main className="fixed inset-0 flex items-center justify-center bg-gray-100 z-50 px-4">
      <section className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6">

        {/* HEADER */}
        <div className="text-center">
          {user?.primeiroAcesso ? (
            <>
              <FaLock className="mx-auto text-blue-600" size={30} />
              <h2 className="text-2xl font-bold text-gray-800 mt-3">
                Primeiro Acesso
              </h2>
              <p className="text-gray-500 text-sm mt-2">
                Cadastre uma nova senha para continuar.
              </p>
            </>
          ) : (
            <>
              <FaKey className="mx-auto text-blue-600" size={30} />
              <h2 className="text-2xl font-bold text-gray-800 mt-3">
                Alterar Senha
              </h2>
              <p className="text-gray-500 text-sm mt-2">
                Olá <strong>{user?.nome}</strong>, altere sua senha abaixo.
              </p>
            </>
          )}
        </div>

        {/* FORM */}
        <form onSubmit={handleReset} className="space-y-4">

          {/* NOVA SENHA */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Nova Senha
            </label>
            <input
              type="password"
              required
              placeholder="Digite sua nova senha"
              className="w-full h-11 px-4 border rounded-md bg-white text-gray-800
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         transition"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
            />
          </div>

          {/* CONFIRMAR SENHA */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Confirmar Nova Senha
            </label>
            <input
              type="password"
              required
              placeholder="Confirme a nova senha"
              className="w-full h-11 px-4 border rounded-md bg-white text-gray-800
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         transition"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
            />
          </div>

          {/* BOTÃO SALVAR */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-blue-600 text-white font-bold rounded-md
                       hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Processando..." : "Salvar Nova Senha"}
          </button>

          {/* BOTÃO CANCELAR */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full h-11 bg-red-500 text-white font-bold rounded-md
                       hover:bg-red-600 transition"
          >
            Cancelar e Voltar
          </button>
        </form>

        {/* FOOTER */}
        <div className="border-t pt-4 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
          <FaExclamationCircle />
          Após atualizar, o sistema solicitará um novo login.
        </div>
      </section>
    </main>
  );
}