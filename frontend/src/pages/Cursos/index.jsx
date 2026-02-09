// Local: src/Cursos/index.jsx

import React, { useState, useEffect, useCallback } from "react";
import { FaTrash, FaPen, FaPlus, FaSave, FaTimes } from "react-icons/fa";
import api from "../../services/api.js";
import InputMoeda from "../../components/InputMoeda";
import "./styles.css";

export default function Cursos() {
  // --- ESTADOS PADRONIZADOS ---
  const [dados, setDados] = useState([]);
  const [exibindoForm, setExibindoForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    valorMensalidade: "",
    qtdeTermos: "",
  });

  // --- FUNÇÃO PADRÃO: CARREGAR ---
  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      const resposta = await api.getCursos();
      setDados(Array.isArray(resposta) ? resposta : []);
    } catch (e) {
      console.error("Erro ao buscar cursos:", e);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // --- ATALHOS DE TECLADO ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      // F2 - Novo Registro
      if (e.key === "F2") {
        e.preventDefault();
        if (!exibindoForm) setExibindoForm(true);
      }

      // F4 - Salvar (Gatilho pelo ID do botão)
      if (e.key === "F4") {
        e.preventDefault();
        if (exibindoForm) {
          document.getElementById("btn-salvar")?.click();
        }
      }

      // Escape - Cancelar e Fechar
      if (e.key === "Escape") {
        if (exibindoForm) {
          // Em Matrículas, usamos o limparForm que já reseta tudo
          limparECancelar();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);

    // Incluímos as dependências para o F3 e F4 funcionarem com dados atuais
  }, [exibindoForm, setExibindoForm]);

  // --- FUNÇÃO PADRÃO: SALVAR ---
  const salvar = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        qtdeTermos: Number(form.qtdeTermos),
      };

      await api.saveCurso(payload, editandoId);
      alert("Curso salvo com sucesso!");
      limparECancelar();
      carregar();
    } catch (e) {
      alert("Erro ao salvar curso.");
    }
  };

  // --- FUNÇÃO PADRÃO: EXCLUIR ---
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
  };

  return (
    <div className="container-alunos">
      <div className="card">
        <div className="header-card">
          <h2>Gerenciar Cursos</h2>
          {!exibindoForm && (
            <button className="btn btn-primary" onClick={() => setExibindoForm(true)}>
              <FaPlus /> Novo Curso [F2]
            </button>
          )}
        </div>

        {exibindoForm && (
          <form onSubmit={salvar} className="form-grid">
            <div className="input-group campo-curto">
              <label>Nome do Curso:</label>
              <input required name="nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="input-field" />
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
              <button id="btn-salvar" type="submit" className="btn btn-primary">
                <FaSave /> Salvar [F4]
              </button>
              <button type="button" className="btn btn-secondary" onClick={limparECancelar}>
                <FaTimes /> Cancelar [Esc]
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="tabela-container">
        {carregando ? (
          <p style={{ textAlign: "center", padding: "20px" }}>Carregando cursos...</p>
        ) : (
          <table className="tabela">
            <thead>
              <tr>
                <th>Curso</th>
                <th>Módulos</th>
                <th>Valor Mensalidade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {dados.length > 0 ? (
                dados.map((c) => (
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
                  <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                    Nenhum curso cadastrado.
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
