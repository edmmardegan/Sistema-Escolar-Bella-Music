/* src/pages/Cursos/index.jsx */

import React, { useState, useEffect, useCallback } from "react";
import { FaTrash, FaPen, FaPlus, FaSave, FaTimes, FaMusic } from "react-icons/fa";
import api from "../../services/api.js";
import InputMoeda from "../../components/InputMoeda";
import "./styles.css";

export default function Cursos() {
  // 1. ESTADOS PADRONIZADOS
  const [registros, setRegistros] = useState([]);
  const [exibindoForm, setExibindoForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    valorMensalidade: "",
    qtdeTermos: "",
  });

  // --- CARREGAMENTO DE DADOS ---
  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      const resposta = await api.getCursos();
      setRegistros(Array.isArray(resposta) ? resposta : []);
    } catch (e) {
      console.error("Erro ao buscar cursos:", e);
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
        document.getElementById("btn-salvar-curso")?.click();
      }
      if (e.key === "Escape" && exibindoForm) {
        limparECancelar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [exibindoForm]);

  // --- AÇÕES ---
  const salvar = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        qtdeTermos: Number(form.qtdeTermos),
      };

      await api.saveCurso(payload, editandoId);
      alert("Curso processado com sucesso!");
      limparECancelar();
      carregar();
    } catch (e) {
      alert("Erro ao salvar curso.");
    }
  };

  const excluir = async (id) => {
    if (!window.confirm("Deseja realmente excluir este curso?")) return;
    try {
      await api.deleteCurso(id);
      carregar();
    } catch (e) {
      alert("Erro ao excluir. Verifique se existem matrículas vinculadas a este curso.");
    }
  };

  const limparECancelar = () => {
    setForm({ nome: "", valorMensalidade: "", qtdeTermos: "" });
    setEditandoId(null);
    setExibindoForm(false);
  };

  const prepararEdicao = (curso) => {
    setForm({
      nome: curso.nome,
      valorMensalidade: curso.valorMensalidade,
      qtdeTermos: curso.qtdeTermos,
    });
    setEditandoId(curso.id);
    setExibindoForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="conteudo-principal">
      <div className="container-principal">
        {/* CARD DE FORMULÁRIO */}
        <section className="card-principal">
          <div className="header-card">
            <h2>
              <FaMusic /> {editandoId ? "Editar Curso" : "Gerenciar Cursos"}
            </h2>
            {!exibindoForm && (
              <button className="btn btn-primary" onClick={() => setExibindoForm(true)}>
                <FaPlus /> Novo Curso [F2]
              </button>
            )}
          </div>

          {exibindoForm && (
            <form onSubmit={salvar} className="form-grid">
              <div className="input-group campo-medio">
                <label>Nome do Curso:</label>
                <input
                  required
                  name="nome"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="input-field"
                  autoComplete="off"
                />
              </div>

              <div className="input-group campo-curto">
                <InputMoeda
                  label="Valor Mensalidade:"
                  value={form.valorMensalidade}
                  onChange={(novoValor) => setForm({ ...form, valorMensalidade: novoValor })}
                  required
                />
              </div>

              <div className="input-group campo-curto">
                <label>Qtde Termos/Módulos:</label>
                <input
                  type="number"
                  required
                  name="qtdeTermos"
                  value={form.qtdeTermos}
                  onChange={(e) => setForm({ ...form, qtdeTermos: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="acoes-form">
                <button id="btn-salvar-curso" type="submit" className="btn btn-primary">
                  <FaSave /> Salvar [F4]
                </button>
                <button type="button" className="btn btn-secondary" onClick={limparECancelar}>
                  <FaTimes /> Cancelar [Esc]
                </button>
              </div>
            </form>
          )}
        </section>

        {/* TABELA DE REGISTROS */}
        <section className="tabela-container">
          {loading ? (
            <p className="txt-carregando">Carregando cursos...</p>
          ) : (
            <table className="tabela">
              <thead>
                <tr>
                  <th>Nome do Curso</th>
                  <th>Duração</th>
                  <th>Mensalidade</th>
                  <th style={{ width: "100px" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {registros.length > 0 ? (
                  registros.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.nome}</strong>
                      </td>
                      <td>{c.qtdeTermos} Módulos</td>
                      <td>
                        {Number(c.valorMensalidade).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </td>
                      <td className="acoes">
                        <button onClick={() => prepararEdicao(c)} className="btn-icon btn-edit" title="Editar">
                          <FaPen />
                        </button>
                        <button onClick={() => excluir(c.id)} className="btn-icon btn-excluir" title="Excluir">
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: "30px" }}>
                      Nenhum curso cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  );
}
