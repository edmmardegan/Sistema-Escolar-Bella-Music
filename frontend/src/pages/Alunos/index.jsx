import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaWhatsapp, FaTrash, FaPen, FaUserPlus, FaSave, FaTimes, FaSearch, FaListOl } from "react-icons/fa";
import api from "../../services/api.js";
import InputMask from "../../components/InputMask";
import "./styles.css";

export default function Alunos() {
  // --- ESTADOS ---
  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [exibindoForm, setExibindoForm] = useState(false);
  const inputNomeRef = useRef(null);
  const [editandoId, setEditandoId] = useState(null);
  const [filtroAba, setFiltroAba] = useState("Ativos");
  const [buscaNome, setBuscaNome] = useState("");

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

  useEffect(() => {
    if (exibindoForm) {
      const timer = setTimeout(() => {
        inputNomeRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [exibindoForm]);

  // para as teclas de atalho
  useEffect(() => {
    const handleKeyDown = (e) => {
      // F2 - Novo Registro: Abre o form se estiver fechado
      if (e.key === "F2") {
        e.preventDefault();
        if (!exibindoForm) setExibindoForm(true);
      }

      // F4 - Salvar: Clica no botão de salvar se o form estiver aberto
      if (e.key === "F4") {
        e.preventDefault();
        if (exibindoForm) {
          // Busca o botão pelo ID que você colocar nele
          document.getElementById("btn-salvar")?.click();
        }
      }

      // Escape - Cancelar: Fecha o form se estiver aberto
      if (e.key === "Escape") {
        if (exibindoForm) fecharFormulario(); // Ou limparForm() em Matrículas
      }
    };

    // Adiciona o "ouvido" no navegador
    window.addEventListener("keydown", handleKeyDown);

    // Limpa o "ouvido" quando você sai da página (muito importante!)
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [exibindoForm]);

  // --- FILTRAGEM ---
  const listaExibida = dados
    .filter((aluno) => {
      const bateAba = filtroAba === "Ativos" ? aluno.ativo === true : filtroAba === "Inativos" ? aluno.ativo === false : true;

      const bateNome = (aluno.nome || "").toLowerCase().includes(buscaNome.toLowerCase());

      return bateAba && bateNome;
    })
    .sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));

  const totalExibido = listaExibida.length;

  // --- AÇÕES ---
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

  const excluir = async (id) => {
    if (!window.confirm("Deseja realmente excluir este aluno?")) return;
    try {
      await api.deleteAluno(id);
      carregar();
    } catch (e) {
      alert("Erro ao excluir.");
    }
  };

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

  const formatarDataTabela = (data) => {
    if (!data) return "";
    const [ano, mes, dia] = data.split("T")[0].split("-");
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <div className="container-alunos">
      {/* titlo e botao novo registro */}
      <div className="card">
        <div className="header-card">
          <h2>{editandoId ? "Editar Aluno" : exibindoForm ? "Novo Aluno" : "Gerenciar Alunos"}</h2>
          {!exibindoForm && (
            <button className="btn btn-primary" onClick={() => setExibindoForm(true)}>
              <FaUserPlus /> Novo Aluno [F2]
            </button>
          )}
        </div>
        {/* Formulario de dados - inputs */}
        {exibindoForm && (
          <form onSubmit={salvar} className="form-grid">
            <div className="input-group campo-curto">
              <label>Nome Completo:</label>
              <input ref={inputNomeRef} required name="nome" value={form.nome} onChange={handleChange} className="input-field" autoComplete="off" />
            </div>

            <div className="input-group campo-curto">
              <InputMask
                label="Telefone:"
                mask="(99) 99999-9999"
                name="telefone"
                value={form.telefone || ""}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="input-group campo-curto">
              <label>Data Nasc:</label>
              <input type="date" name="dataNascimento" value={form.dataNascimento} onChange={handleChange} className="input-field" />
            </div>

            <div className="input-group campo-curto">
              <label>Rua:</label>
              <input name="rua" value={form.rua} onChange={handleChange} className="input-field" />
            </div>

            <div className="input-group campo-curto">
              <label>Bairro:</label>
              <input name="bairro" value={form.bairro} onChange={handleChange} className="input-field" />
            </div>

            <div className="input-group campo-curto">
              <label>Cidade:</label>
              <input name="cidade" value={form.cidade} onChange={handleChange} className="input-field" />
            </div>

            <div className="input-group campo-curto">
              <label>Nome do Pai:</label>
              <input name="nomePai" value={form.nomePai} onChange={handleChange} className="input-field" />
            </div>

            <div className="input-group campo-curto">
              <label>Nome da Mãe:</label>
              <input name="nomeMae" value={form.nomeMae} onChange={handleChange} className="input-field" />
            </div>

            <div className="input-group checkbox-group">
              <input type="checkbox" name="ativo" id="ativo" checked={form.ativo} onChange={handleChange} className="checkbox-field" />
              <label htmlFor="ativo">Aluno Ativo?</label>
            </div>

            <div className="acoes-form">
              <button id="btn-salvar" type="submit" className="btn btn-primary">
                <FaSave /> Salvar Ficha [F4]
              </button>
              <button type="button" className="btn btn-secondary" onClick={fecharFormulario}>
                <FaTimes /> Cancelar [Esc]
              </button>
            </div>
          </form>
        )}
      </div>

      {/* container de dados */}
      <div className="tabela-container">
        {/* Cabeçalho Superior */}
        <div className="filtro-container-flex">
          {/* Aba de filtros */}
          <div className="grupo-abas">
            {["Ativos", "Inativos", "Todos"].map((aba) => (
              <button key={aba} className={`aba-item ${filtroAba === aba ? "ativa" : ""}`} onClick={() => setFiltroAba(aba)}>
                {aba}
              </button>
            ))}
          </div>

          {/* Pesquisa por nome */}
          <div className="busca-nome-container">
            <FaSearch className="icon-search" />
            <input
              type="text"
              placeholder="    Pesquisar por nome..."
              value={buscaNome}
              onChange={(e) => setBuscaNome(e.target.value)}
              className="input-busca-field"
            />
            {buscaNome && <FaTimes className="icon-clear" onClick={() => setBuscaNome("")} />}
          </div>

          {/* contador de registo */}
          <div className="contadores-matricula">
            <span className="count-item">
              <FaListOl /> Total: <strong>{totalExibido}</strong> registros
            </span>
          </div>
        </div>

        {/* registros da tabela */}
        {carregando ? (
          <p className="txt-carregando">Carregando dados...</p>
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
              {/* inicio dos registros */}
              {listaExibida.length > 0 ? (
                listaExibida.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <strong className="tabela-registros" >{a.nome}</strong>
                      <small className="tabela-registros-complemento">
                        <br /> End.: {a.rua}, - {a.bairro}
                      </small>
                    </td>
                    <a
                      href={`https://wa.me/55${a.telefone?.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${a.nome}, tudo bem? Aqui é da Escola Bella Music.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="whatsapp"
                    >
                      <FaWhatsapp /> {a.telefone}
                    </a>

                    <td>
                      {" "}
                      <small className="tabela-registros"> {formatarDataTabela(a.dataNascimento)} </small>{" "}
                    </td>

                    <td>
                      <span className={`badge-status ${a.ativo ? "status-presente" : "status-falta"}`}>{a.ativo ? "ATIVO" : "INATIVO"}</span>
                    </td>

                    {/* botões de ação por registro */}
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
                  <td colSpan="5" className="txt-vazio">
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
