/* src/pages/Usuarios/index.jsx */

import React, { useState, useEffect, useCallback } from "react";
import { FaUserPlus, FaKey, FaTrash, FaUserShield, FaTimes, FaPen, FaSave } from "react-icons/fa";
import api from "../../services/api";
import "./styles.css";

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
    <main className="conteudo-principal">
      <div className="container-principal">
        <section className="card-principal">
          <div className="header-card">
            <h2>
              <FaUserShield /> {editandoId ? "Editar Usuário" : "Gestão de Usuários"}
            </h2>
            {!exibindoForm && (
              <button className="btn btn-primary" onClick={() => setExibindoForm(true)}>
                <FaUserPlus /> Novo Usuário [F2]
              </button>
            )}
          </div>

          {exibindoForm && (
            <form className="form-grid" onSubmit={salvar}>
              <div className="input-group campo-medio">
                <label>Nome Completo</label>
                <input required name="nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="input-field" />
              </div>
              <div className="input-group campo-medio">
                <label>E-mail (Login)</label>
                <input
                  required
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="input-group campo-curto">
                <label>Nível de Acesso</label>
                <select name="role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-field">
                  <option value="user">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="acoes-form">
                <button id="btn-salvar-usuario" type="submit" className="btn btn-primary" disabled={loading}>
                  <FaSave /> Salvar [F4]
                </button>
                <button type="button" className="btn btn-secondary" onClick={limparForm}>
                  <FaTimes /> Cancelar [Esc]
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="tabela-container">
          {loading && <p style={{ padding: "10px" }}>Processando...</p>}

          <table className="tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Acesso</th>
                <th style={{ textAlign: "center", width: "150px" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.nome}</strong>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge-status ${u.role === "admin" ? "status-inativo" : "status-ativo"}`}>{u.role.toUpperCase()}</span>
                  </td>
                  <td className="acoes">
                    <button className="btn-icon btn-edit" onClick={() => prepararEdicao(u)} title="Editar">
                      <FaPen />
                    </button>
                    <button className="btn-icon btn-key" onClick={() => handleReset(u.id, u.nome)} title="Resetar Senha">
                      <FaKey />
                    </button>
                    <button className="btn-icon btn-excluir" onClick={() => excluir(u.id)} title="Excluir">
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
