// Local: src/usuarios/index.jsx

import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import { FaUserPlus, FaKey, FaTrash, FaUserShield, FaTimes, FaPen, FaSave } from "react-icons/fa";
import "./styles.css";

const Usuarios = () => {
  // --- ESTADOS PADRONIZADOS ---
  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [exibirForm, setExibirForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    role: "user",
  });

  // --- FUNÇÃO PADRÃO: CARREGAR ---
  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      const res = await api.getUsuarios();
      const lista = Array.isArray(res) ? res : res.usuarios || res.data || [];
      setDados(lista);
    } catch (e) {
      console.error("Erro ao carregar usuários:", e);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // --- FUNÇÃO PADRÃO: SALVAR ---
  const salvar = async (e) => {
    if (e) e.preventDefault();
    try {
      setCarregando(true);
      const payload = { ...form, username: form.email };

      // Se for novo, envia a senha padrão
      const dadosEnviar = editandoId ? payload : { ...payload, senha: "123456" };

      await api.saveUsuario(dadosEnviar, editandoId);
      alert(editandoId ? "Usuário atualizado!" : "Usuário cadastrado! Senha padrão: 123456");

      limparForm();
      carregar();
    } catch (e) {
      alert("Erro ao salvar usuário.");
    } finally {
      setCarregando(false);
    }
  };

  // --- FUNÇÃO PADRÃO: EXCLUIR ---
  const excluir = async (id) => {
    if (!window.confirm("Deseja realmente excluir este usuário?")) return;
    try {
      await api.deleteUsuario(id);
      alert("Usuário removido!");
      carregar();
    } catch (e) {
      alert("Erro ao excluir. Verifique se o usuário possui registros vinculados.");
    }
  };

  // --- AUXILIARES ---
  const prepararEdicao = (u) => {
    setEditandoId(u.id);
    setForm({ nome: u.nome, email: u.email, role: u.role });
    setExibirForm(true);
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
    setExibirForm(false);
  };

  return (
    <div className="container-usuarios">
      <div className="header-pagina">
        <h2>
          <FaUserShield /> Gestão de Usuários
        </h2>
        {!exibirForm && (
          <button className="btn btn-primary" onClick={() => setExibirForm(true)}>
            <FaUserPlus /> Novo Usuário
          </button>
        )}
      </div>

      {exibirForm && (
        <form className="form-cadastro-usuario" onSubmit={salvar}>
          <div className="form-header-sessao">
            <h3>{editandoId ? "Editar Usuário" : "Cadastrar Novo Usuário"}</h3>
          </div>

          <div className="form-grid-inputs">
            <div className="input-group">
              <label>Nome Completo</label>
              <input required name="nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="input-reset" />
            </div>
            <div className="input-group">
              <label>E-mail (Login)</label>
              <input
                required
                type="email"
                name="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-reset"
              />
            </div>
            <div className="input-group">
              <label>Nível de Acesso</label>
              <select name="role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-reset">
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>

          <div className="form-actions-row">
            <button type="submit" className="btn btn-success" disabled={carregando}>
              <FaSave /> {carregando ? "Salvando..." : "Salvar"}
            </button>
            <button type="button" className="btn btn-cancelar" onClick={limparForm}>
              <FaTimes /> Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="tabela-responsiva">
        <table className="tabela-padrao">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Cargo</th>
              <th style={{ textAlign: "center" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {!carregando &&
              dados.map((u) => (
                <tr key={u.id}>
                  <td>{u.nome}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === "admin" ? "bg-danger" : "bg-info"}`}>{u.role}</span>
                  </td>
                  <td className="acoes-cell">
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
        {carregando && <p style={{ padding: "20px" }}>Carregando...</p>}
      </div>
    </div>
  );
};

export default Usuarios;
