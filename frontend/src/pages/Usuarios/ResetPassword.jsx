// Local: src/ResetPassword/index.jsx

import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { FaLock, FaKey, FaSave, FaTimes, FaExclamationCircle } from "react-icons/fa";
import Input from "../../components/Input";
import Button from "../../components/Button";

export default function ResetPassword() {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [exibindoForm, setExibindoForm] = useState(true); // Alterado para true para teste
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const nomeFormRef = useRef(null);

  // Foco no campo quando o formulário abrir
  useEffect(() => {
    if (exibindoForm) {
      const timer = setTimeout(() => {
        nomeFormRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [exibindoForm]);

  const handleReset = async (e) => {
    e.preventDefault();
    // Expressão Regular para a regra de senha forte
    const regexSenhaForte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[*@$]).{8,}$/;

    if (!regexSenhaForte.test(novaSenha)) {
      return alert(
        "A senha não atende aos requisitos:\n\n" +
          "• Mínimo de 8 caracteres\n" +
          "• Pelo menos uma letra maiúscula\n" +
          "• Pelo menos uma letra minúscula\n" +
          "• Pelo menos um número\n" +
          "• Pelo menos um caractere especial (*, @, $)",
      );
    }

    if (novaSenha !== confirmarSenha) {
      return alert("As senhas não conferem!");
    }

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
      {exibindoForm ? (
        <section className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6">
          {/* HEADER */}
          <header className="bg-white h-20 px-6 rounded-xl shadow-md flex justify-between items-center mb-6">
            <h2 className="flex items-center gap-3 text-xl font-bold text-gray-800">
              {/* Ícone Dinâmico */}
              {user?.primeiroAcesso ? <FaLock className="text-blue-600" /> : <FaKey className="text-blue-600" />}

              {/* Texto Dinâmico */}
              {user?.primeiroAcesso ? "Primeiro Acesso" : exibindoForm ? "Alterar Senha" : "Primeiro Acesso"}
            </h2>
          </header>
          {/* FORM */}
          <form onSubmit={handleReset} className="space-y-4 flex ">
            <div className="flex flex-wrap justify-center gap-2 p-3 rounded-xl border bg-gray-50">
              <div className="flex flex-wrap gap-2 p-1 ">
                <Input
                  ref={nomeFormRef}
                  label="Nova Senha"
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Digite a nova senha"
                  required
                />

                {/* Lista de tópicos para os requisitos */}
                <ul className="mt-2 text-[13px] text-gray-500 space-y-1 list-disc list-inside">
                  <li className={novaSenha.length >= 8 ? "text-green-600" : ""}>Mínimo de 8 caracteres</li>
                  <li className={/[A-Z]/.test(novaSenha) ? "text-green-600" : ""}>Pelo menos uma letra maiúscula</li>
                  <li className={/[a-z]/.test(novaSenha) ? "text-green-600" : ""}>Pelo menos uma letra minúscula</li>
                  <li className={/[0-9]/.test(novaSenha) ? "text-green-600" : ""}>Pelo menos um número</li>
                  <li className={/[*@$]/.test(novaSenha) ? "text-green-600" : ""}>Pelo menos um caractere especial (* / @ / $)</li>
                </ul>

                <Input
                  label="Confirmar Nova Senha"
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Confirme a nova senha"
                  required
                  className="w-[350px]"
                />
              </div>

              <div className="flex flex-wrap justify-center items-center gap-4 pt-[40px]">
                <Button type="submit" icon={FaSave} className="w-64">
                  Salvar
                </Button>

                <Button variant="red" onClick={() => navigate("/")} icon={FaTimes} className="w-64">
                  Cancelar
                </Button>
              </div>
            </div>
          </form>

          <div className="border-t pt-4 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
            <FaExclamationCircle />
            Após atualizar, o sistema solicitará um novo login.
          </div>
        </section>
      ) : null}
    </main>
  );
}
