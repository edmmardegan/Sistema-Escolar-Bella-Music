/* src/pages/Usuarios/index.jsx */

import React, { useState, useEffect, useCallback } from "react";
import { FaUserPlus, FaKey, FaTrash, FaUserShield, FaTimes, FaPen, FaSave } from "react-icons/fa";
import api from "../../services/api";
// import "./styles.css";

const Usuarios = () => {
  // 1. ESTADOS PADRONIZADOS
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exibindoForm, setExibindoForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    role: "user",
  });

  // --- CARREGAMENTO DE DADOS ---
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

  useEffect(() => {
    carregar();
  }, [carregar]);

  // --- ATALHOS DE TECLADO [F2, F4, Esc] ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F2" && !exibindoForm) {
        e.preventDefault();
        setExibindoForm(true);
      }
      if (e.key === "F4" && exibindoForm) {
        e.preventDefault();
        document.getElementById("btn-salvar-usuario")?.click();
      }
      if (e.key === "Escape" && exibindoForm) {
        limparForm();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [exibindoForm]);

  // --- AÇÕES ---
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

  const prepararEdicao = (u) => {
    setEditandoId(u.id);
    setForm({ nome: u.nome, email: u.email, role: u.role });
    setExibindoForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  const limparForm = () => {
    setForm({ nome: "", email: "", role: "user" });
    setEditandoId(null);
    setExibindoForm(false);
  };

  return (
    <main className="p-4 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        <section className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaUserShield /> {editandoId ? "Editar Usuário" : "Gestão de Usuários"}
            </h2>
            {!exibindoForm && (
              <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition" onClick={() => setExibindoForm(true)}>
                <FaUserPlus /> Novo Usuário [F2]
              </button>
            )}
          </div>

          {exibindoForm && (
            <form className="grid grid-cols-1 md:grid-cols-3 gap-4 itens-end" onSubmit={salvar}>
              <div className="text-sm font-semibold text-gray-600 flex flex-col gap-2">
                <label>Nome Completo</label>
                <input 
                className="w-full h-8 px-4 border rounded-md bg-write text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  required name="nome" 
                  value={form.nome} 
                  onChange={(e) => 
                  setForm({ ...form, nome: e.target.value })}/>
              </div>

              <div className="text-sm font-semibold text-gray-600 flex flex-col gap-2">
                <label>E-mail (Login)</label>
                <input
                className="w-full h-8 px-4 border rounded-md bg-write text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="text-sm font-semibold text-gray-600 flex flex-col gap-2">
                <label>Nível de Acesso</label>
                <select 
                className="w-full h-8 px-4 border rounded-md bg-write text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="role" 
                  value={form.role} 
                  onChange={(e) => 
                  setForm({ ...form, role: e.target.value })} >
                    <option value="user">Usuário</option>
                    <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="md:col-span-3 flex gap-3 mt-2">
                <button 
                className="h-[35px] flex items-center gap-2 bg-green-500 text-white px-4 rounded-md font-semibold hover:bg-green-700 transition disabled:opacity-50" 
                id="btn-salvar-usuario" 
                type="submit" 
                disabled={loading}>
                  <FaSave /> Salvar [F4]
                </button>
                <button 
                className="flex items-center gap-2 bg-red-500 text-white px-4 rounded-md font-semibold hover:bg-red-700 transition disabled:opacity-50" 
                type="button"                 
                onClick={limparForm}>
                  <FaTimes /> Cancelar [Esc]
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading && (
            <p className="p-4 text-gray-600">
              Processando...
            </p>
          )}

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
                <tr 
                  className="hover:bg-gray-50 transition"
                  key={u.id}>
                  <td className="px-4 py-3 font-semi-bold text-gray-800">
                    <strong>{u.nome}</strong>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span 
                      className={`px-3 py-1 rounded-full text-xs font-semibold 
                        ${
                          u.role === "admin" 
                            ? "bg-red-100 text-red-600" 
                            : "bg-blue-100 text-blue-600"
                        }`}
                            >
                              {u.role.toUpperCase()}</span>
                  </td>

                  <td className="px-4 py-3 gap-2 flex justify-center">
                    <button 
                      className="p-2 bg-green-600 hover:bg-green-400 text-white rounded-md" 
                      onClick={() => 
                      prepararEdicao(u)} 
                      title="Editar">
                      <FaPen />
                    </button>
                    <button 
                      className="p-2 bg-yellow-600 hover:bg-orange-400 text-white rounded-md" 
                      onClick={() => 
                      handleReset(u.id, u.nome)} 
                      title="Resetar Senha">
                      <FaKey />
                    </button>
                    <button  
                      className="p-2 bg-red-600 hover:bg-red-400 text-white rounded-md"
                      onClick={() => 
                      excluir(u.id)} 
                      title="Excluir">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
};

export default Usuarios;
