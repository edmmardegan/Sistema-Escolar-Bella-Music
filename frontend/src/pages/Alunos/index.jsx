// Local: src/Alunos/index.jsx

import React, { useState, useEffect, useCallback } from "react";
import { FaTrash, FaPen, FaUserPlus, FaSave, FaTimes } from "react-icons/fa";
import api from "../../services/api.js";
import InputMask from "../../components/InputMask";
import "./styles.css";

export default function Alunos() {
  // --- ESTADOS PADRONIZADOS ---
  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [exibindoForm, setExibindoForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [filtroAba, setFiltroAba] = useState("Ativos");

  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    dataNascimento: "",
    ativo: true,
    nomePai: "",
    nomeMae: "",
    rua: "",
    bairro: "",
    cidade: "",
  });

  // --- FUNÇÃO PADRÃO: CARREGAR ---
  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      const resposta = await api.getAlunos();
      setDados(Array.isArray(resposta) ? resposta : []);
    } catch (e) {
      console.error("Erro ao carregar alunos:", e);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // --- FILTRAGEM ---
  const listaExibida = dados
    .filter((aluno) => {
      if (filtroAba === "Ativos") return aluno.ativo === true;
      if (filtroAba === "Inativos") return aluno.ativo === false;
      return true;
    })
    .sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));

  // --- FUNÇÃO PADRÃO: SALVAR ---
  const salvar = async (e) => {
    e.preventDefault();
    try {
      await api.saveAluno(form, editandoId);
      alert("Aluno salvo com sucesso!");
      fecharFormulario();
      carregar();
    } catch (e) {
      alert("Erro ao salvar aluno.");
    }
  };

  // --- FUNÇÃO PADRÃO: EXCLUIR ---
  const excluir = async (id) => {
    if (!window.confirm("Deseja realmente excluir este aluno?")) return;
    try {
      await api.deleteAluno(id);
      carregar();
    } catch (e) {
      alert("Erro ao excluir. Verifique se o aluno possui matrículas vinculadas.");
    }
  };

  // --- AUXILIARES ---
  const prepararEdicao = (aluno) => {
    const dataFormatada = aluno.dataNascimento ? String(aluno.dataNascimento).split("T")[0] : "";
    setForm({ ...aluno, dataNascimento: dataFormatada });
    setEditandoId(aluno.id);
    setExibindoForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fecharFormulario = () => {
    setForm({ nome: "", telefone: "", dataNascimento: "", ativo: true, nomePai: "", nomeMae: "", rua: "", bairro: "", cidade: "" });
    setEditandoId(null);
    setExibindoForm(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const mascaraTelefone = (valor) => {
    if (!valor) return "";
    valor = valor.replace(/\D/g, "").substring(0, 11);
    valor = valor.replace(/^(\d{2})(\d)/g, "($1) $2");
    valor = valor.replace(/(\d)(\d{4})$/, "$1-$2");
    return valor;
  };

  return (
    <div className="container-alunos">
      <div className="card">
        <div className="header-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>{editandoId ? "Editar Aluno" : "Gerenciar Alunos"}</h2>
          {!exibindoForm && (
            <button className="btn btn-primary" onClick={() => setExibindoForm(true)}>
              <FaUserPlus /> Novo Aluno
            </button>
          )}
        </div>

        {exibindoForm && (
          <form onSubmit={salvar} className="form-grid conteudo-pagina" style={{ marginTop: "20px" }}>
            <div className="input-group campo-medio">
              <label>Nome Completo:</label>
              <input required name="nome" value={form.nome} onChange={handleChange} className="input-field" />
            </div>

            <div className="input-group">
              <InputMask
                label="Telefone:"
                mask="(99) 99999-9999"
                name="telefone"
                value={form.telefone || ""}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="input-group">
              <label>Data Nasc:</label>
              <input type="date" name="dataNascimento" value={form.dataNascimento} onChange={handleChange} className="input-field" />
            </div>

            <div className="input-group campo-medio">
              <label>Rua:</label>
              <input name="rua" value={form.rua} onChange={handleChange} className="input-field" />
            </div>

            <div className="input-group">
              <label>Bairro:</label>
              <input name="bairro" value={form.bairro} onChange={handleChange} className="input-field" />
            </div>

            <div className="input-group">
              <label>Cidade:</label>
              <input name="cidade" value={form.cidade} onChange={handleChange} className="input-field" />
            </div>

            <div className="input-group campo-medio">
              <label>Nome do Pai:</label>
              <input name="nomePai" value={form.nomePai} onChange={handleChange} className="input-field" />
            </div>

            <div className="input-group campo-medio">
              <label>Nome da Mãe:</label>
              <input name="nomeMae" value={form.nomeMae} onChange={handleChange} className="input-field" />
            </div>

            <div className="input-group checkbox-group">
              <input type="checkbox" name="ativo" id="ativo" checked={form.ativo} onChange={handleChange} className="checkbox-field" />
              <label htmlFor="ativo">Aluno Ativo?</label>
            </div>

            <div className="acoes-form">
              <button type="submit" className="btn btn-primary">
                <FaSave /> Salvar Ficha
              </button>
              <button type="button" className="btn btn-secondary" onClick={fecharFormulario}>
                <FaTimes /> Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="tabela-container">
        <div className="filtro-container">
          <div className="grupo-abas">
            {["Ativos", "Inativos", "Todos"].map((aba) => (
              <button key={aba} className={`aba-item ${filtroAba === aba ? "ativa" : ""}`} onClick={() => setFiltroAba(aba)}>
                {aba}
              </button>
            ))}
          </div>
        </div>

        {carregando ? (
          <p style={{ textAlign: "center", padding: "20px" }}>Carregando dados...</p>
        ) : (
          <table className="tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Data Nascto</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {listaExibida.length > 0 ? (
                listaExibida.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <strong>{a.nome}</strong>
                    </td>
                    <td>{mascaraTelefone(a.telefone)}</td>
                    <td>{mascaraTelefone(a.dataNascimento)}</td>
                    <td>
                      <span className={`badge-status ${a.ativo ? "status-presente" : "status-falta"}`}>{a.ativo ? "ATIVO" : "INATIVO"}</span>
                    </td>
                    <td className="acoes">
                      <button onClick={() => prepararEdicao(a)} className="btn-icon btn-edit" title="Editar">
                        <FaPen />
                      </button>
                      <button onClick={() => excluir(a.id)} className="btn-icon btn-excluir" title="Excluir">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                    Nenhum aluno encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
