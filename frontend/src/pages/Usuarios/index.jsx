/* src/pages/Usuarios/index.jsx */

/* 1. IMPORTS */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaUserPlus, FaKey, FaTrash, FaUserShield, FaTimes, FaPen, FaSave } from "react-icons/fa";
import api from "../../services/api";

/* 1.1 IMPORTS COMPONENTS*/
import Input from "../../components/Input.jsx";
import Select from "../../components/Select.jsx";
import Button from "../../components/Button";
import { useShortcuts } from "../../components/useShortcuts.js";

/* 2. CONFIGURAÇÕES ESTÁTICAS */
const estadoInicial = {
  nome: "",
  email: "",
  role: "user",
};

const Usuarios = () => {
  /* 3. ESTADOS E REFS */
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exibindoForm, setExibindoForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(estadoInicial);
  const inputNomeRef = useRef(null);

  /* 4. CARREGAMENTO (Callbacks) */
  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getUsuarios();
      const lista = Array.isArray(res) ? res : res.usuarios || res.data || [];
      setRegistros(lista);
    } catch (e) {
      console.error("Erro ao carregar usuários:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  /* 5. EFEITOS (useEffect) */
  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    if (exibindoForm && inputNomeRef.current) {
      setTimeout(() => inputNomeRef.current.focus(), 100);
    }
  }, [exibindoForm]);

  /* 6. ATALHOS */
  useShortcuts({
    F2: () => !exibindoForm && setExibindoForm(true),
    F4: (e) => exibindoForm && salvar(e),
    Escape: () => exibindoForm && limparForm(),
  });

  /* 7. FUNÇÕES DE MANIPULAÇÃO (Ações) */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const salvar = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      const payload = { ...form };
      const dadosEnviar = editandoId ? payload : { ...payload, senha: "123456" };

      await api.saveUsuario(dadosEnviar, editandoId);
      alert(editandoId ? "Usuário atualizado!" : "Usuário cadastrado! Senha padrão: 123456");

      limparForm();
      carregar();
    } catch (e) {
      alert("Erro ao salvar usuário.");
    } finally {
      setLoading(false);
    }
  };

  const excluir = async (id) => {
    if (!window.confirm("Deseja realmente excluir este usuário?")) return;
    try {
      await api.deleteUsuario(id);
      carregar();
    } catch (e) {
      alert("Erro ao excluir.");
    }
  };

  const prepararEdicao = (usuario) => {
    setForm({ ...usuario });
    setEditandoId(usuario.id);
    setExibindoForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const limparForm = () => {
    setForm(estadoInicial);
    setEditandoId(null);
    setExibindoForm(false);
  };

  const handleReset = async (id, nome) => {
    if (!window.confirm(`Resetar senha de ${nome} para '123456'?`)) return;
    try {
      await api.resetPasswordAdmin(id, { novaSenha: "123456" });
      alert("Senha resetada com sucesso!");
    } catch (e) {
      alert("Erro no reset.");
    }
  };

  /* 8. RENDERIZAÇÃO */
  return (
    <main className="p-4 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER SEMPRE VISÍVEL */}
        <header className="bg-white p-6 h-20 rounded-xl shadow-md flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FaUserShield />
            {editandoId ? "Editar Usuário" : exibindoForm ? "Novo Usuário" : "Gerenciar Usuários"}
          </h2>

          {!exibindoForm && (
            <Button icon={FaUserPlus} onClick={() => setExibindoForm(true)} className="px-4">
              Novo Curso [F2]
            </Button>
          )}
        </header>

        {exibindoForm ? (
          <section className="bg-white p-6 rounded-xl shadow-md">
            <form className="grid grid-cols-1 md:grid-cols-3 gap-4 itens-end" onSubmit={salvar}>
              {/* NOME */}
              <Input
                ref={inputNomeRef}
                label="Nome Usuário"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                placeholder="Ex: João da Silva"
                className="w-70" // Use classes aqui para ajustes finos de largura
                required
              />

              {/* LOGIN - EMAIL*/}
              <Input
                label="E-mail (Login)"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Ex: nome@bellamusic.com"
                className="w-70" // Use classes aqui para ajustes finos de largura
                required
              />

              <Select
                label="Nível de Acesso"
                name="role"
                value={form.role}
                onChange={handleChange}
                options={[
                  { label: "Usuário", value: "user" },
                  { label: "Administrador", value: "admin" },
                ]}
                className="w-40"
              />

              {/* BOTÃO AÇÃO REGISTRO FORM */}
              <div className="md:col-span-3 flex gap-3 mt-2">
                <Button title="Salvar Registro" variant="green" icon={FaSave} type="submit" disabled={loading} className="px-4">
                  Salvar [F4]
                </Button>

                <Button title="Cancelar edição" variant="red" icon={FaTimes} onClick={limparForm} className="px-4">
                  Cancelar [Esc]
                </Button>
              </div>
            </form>
          </section>
        ) : (
          <section className="bg-white rounded-xl shadow-md overflow-hidden">
            {loading && <p className="p-4 text-gray-600">Processando...</p>}

            <table className="w-full text-sm text-left">
              <thead className="text-white text-xs bg-blue-500">
                <tr>
                  <th className="px-4 py-3">NOME</th>
                  <th className="px-4 py-3">E-MAIL</th>
                  <th className="px-4 py-3">ACESSO</th>
                  <th className="px-4 py-3 text-center w-[150px]">AÇOES</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {registros.map((u) => (
                  <tr className="hover:bg-gray-100 transition" key={u.id}>
                    <td className="px-4 py-3 font-semi-bold text-gray-800">
                      <strong>{u.nome}</strong>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold 
                        ${u.role === "admin" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}
                      >
                        {u.role.toUpperCase()}
                      </span>
                    </td>

                    {/* BOTÃO AÇÃO REGISTRO TABELA */}
                    <td className="px-4 py-3 gap-2 flex justify-center">
                      <Button
                        variant="green"
                        icon={FaPen}
                        onClick={() => prepararEdicao(u)}
                        title="Editar Registro"
                        className="p-2" // Sobrescrevendo o padding padrão se necessário
                      />
                      <Button 
                        variant="yellow" 
                        icon={FaTrash} 
                        onClick={() => handleReset(u.id, u.nome)}
                        title="Resetar Senha" 
                        className="p-2" 
                      />
                      <Button 
                        variant="red" 
                        icon={FaTrash} 
                        onClick={() => excluir(u.id)} 
                        title="Excluir Registro" 
                        className="p-2" 
                      />
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </main>
  );
};

export default Usuarios;
