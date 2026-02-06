import React, { useState, useEffect } from "react";
import { FaPlus, FaSave, FaTimes, FaPen, FaTrash } from "react-icons/fa";
import api from "../../services/api"; // Já deixa a API no gatilho
import "./styles.css"; // Você pode centralizar as classes no App.css depois

export default function PaginaTemplate() {
  // 1. ESTADOS BÁSICOS
  const [registros, setRegistros] = useState([]);
  const [exibindoForm, setExibindoForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(false);

  // 2. ESTADO DO FORMULÁRIO (Mude os campos conforme a necessidade)
  const [formData, setFormData] = useState({
    campo1: "",
    campo2: "",
    ativo: true,
  });

  // 3. CARREGAMENTO INICIAL
  useEffect(() => {
    // carregarDados(); 
  }, []);

  // 4. FUNÇÕES DE APOIO (Limpas e padronizadas)
  const handleLimpar = () => {
    setFormData({ campo1: "", campo2: "", ativo: true });
    setEditandoId(null);
    setExibindoForm(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  // 5. RENDERIZAÇÃO
  return (
    <div className="conteudo-principal">
      
      {/* CABEÇALHO PADRÃO */}
      <div className="header-pagina">
        <h2 className="titulo-pagina">
          {editandoId ? "Editar Registro" : "Gerenciar Template"}
        </h2>
        {!exibindoForm && (
          <button className="btn btn-primary" onClick={() => setExibindoForm(true)}>
            <FaPlus /> Novo Registro
          </button>
        )}
      </div>

      {/* CARD DO FORMULÁRIO (Só aparece se clicar em Novo ou Editar) */}
      {exibindoForm && (
        <div className="card-padrao">
          <form className="form-grid">
            <div className="input-group">
              <label>Campo Exemplo 1:</label>
              <input name="campo1" value={formData.campo1} onChange={handleChange} className="input-field" />
            </div>

            <div className="acoes-form">
              <button type="submit" className="btn btn-save">
                <FaSave /> Salvar
              </button>
              <button type="button" className="btn btn-cancel" onClick={handleLimpar}>
                <FaTimes /> Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TABELA DE RESULTADOS */}
      <div className="card-padrao">
        <table className="tabela-padrao">
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {/* O MAP viria aqui */}
            <tr>
              <td>Exemplo de Dado</td>
              <td><span className="badge-status status-presente">Ativo</span></td>
              <td className="acoes-tabela">
                <button className="btn-icon btn-edit"><FaPen /></button>
                <button className="btn-icon btn-delete"><FaTrash /></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}