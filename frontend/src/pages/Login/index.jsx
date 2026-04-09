// Local: src/Login/index.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import api from "../../services/api.js";
import { FaUserCircle, FaLock, FaSignInAlt } from "react-icons/fa";

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
      const data = await api.login(email, password);

      if (data && data.access_token) {
        login(data.user, data.access_token);

        if (data.user?.primeiroAcesso) {
          navigate("/reset-password");
        } else {
          navigate("/");
        }
      } else {
        alert("Erro inesperado na resposta do servidor.");
      }
    } catch (error) {
      console.error("Erro ao logar:", error);
      const msg =
        error.response?.data?.message || "Usuário ou senha incorretos!";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100 z-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">

        {/* HEADER */}
        <div className="text-center mb-6">
          <FaUserCircle className="mx-auto text-blue-600" size={60} />
          <h2 className="text-2xl font-bold text-gray-800 mt-2">
            Acesso ao Sistema
          </h2>
          <p className="text-gray-500 text-sm">
            Entre com suas credenciais para continuar
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* EMAIL */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-1">
              <FaSignInAlt /> Email
            </label>
            <input
              type="email"
              required
              placeholder="seu@email.com"
              className="w-full px-4 py-2 border rounded-md bg-white text-gray-800 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* SENHA */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-1">
              <FaLock /> Senha
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-2 border rounded-md bg-white text-gray-800 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* BOTÃO */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white font-bold rounded-md
                       hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Autenticando..." : "Entrar no Sistema"}
          </button>
        </form>

        {/* FOOTER */}
        <div className="text-center mt-6 text-xs text-gray-400">
          © 2026 Sistema de Gestão Escolar
        </div>
      </div>
    </div>
  );
}