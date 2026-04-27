// Local: src/Login/index.jsx

import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import api from "../../services/api.js";
import { FaUserCircle, FaLock, FaSignInAlt, FaSave, FaTimes } from "react-icons/fa";
import Input from "../../components/Input.jsx";
import Button from "../../components/Button.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [exibindoForm, setExibindoForm] = useState(true);
  const emailInputRef = useRef(null);
  const { login } = useAuth();
  const [isEditable, setIsEditable] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const forceClear = setTimeout(() => {
      setEmail("");
      setPassword("");
    }, 500);

    if (exibindoForm) {
      const timer = setTimeout(() => {
        emailInputRef.current?.focus();
      }, 100);
      return () => {
        clearTimeout(timer);
        clearTimeout(forceClear);
      };
    }
  }, [exibindoForm]);

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
      const msg = error.response?.data?.message || "Usuário ou senha incorretos!";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="fixed inset-0 flex items-center justify-center bg-gray-100 z-50">
      {exibindoForm ? (
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <FaUserCircle className="mx-auto text-blue-600" size={60} />
            <h2 className="text-2xl font-bold text-gray-800 mt-2">Acesso ao Sistema</h2>
            <p className="text-gray-500 text-sm">Entre com suas credenciais para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input type="text" style={{ display: "none" }} aria-hidden="true" />
            <input type="password" style={{ display: "none" }} aria-hidden="true" />
            <div>
              <FaSignInAlt />
              <Input
                label="Nova Senha"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="off"
                readOnly={!isEditable} // Começa bloqueado
                onFocus={() => setIsEditable(true)} // Desbloqueia ao clicar
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="none"
              />
            </div>
            {/* SENHA */}
            <div>
              <FaLock />
              <Input 
                label="Senha" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="••••••••" 
              />
            </div>

            <div className="flex flex-col items-center gap-4 pt-[40px]">
              {/* BOTÃO DE LOGIN */}
              <Button type="submit" disabled={loading} icon={FaSave} className="w-64">
                {loading ? "Autenticando..." : "Acessar o Sistema"}
              </Button>

              {/* BOTÃO DE CANCELAR / FECHAR */}
              <Button
                type="button"
                variant="red"
                onClick={() => {
                  // Tenta fechar a janela
                  window.close();

                  // Se não fechar em 500ms (porque o navegador bloqueou), redireciona
                  setTimeout(() => {
                    window.location.href = "https://www.google.com";
                  }, 500);
                }}
                icon={FaTimes}
                className="w-64"
                autoComplete="off"
              >
                Sair do Sistema
              </Button>
            </div>
          </form>

          <div className="text-center mt-6 text-xs text-gray-400">© 2026 Sistema de Gestão Escolar</div>
        </div>
      ) : null}
    </main>
  );
}
