/* src/pages/Alunos/index.jsx */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaWhatsapp, FaTrash, FaPen, FaUserPlus, FaSave, FaTimes, FaSearch, FaListOl, FaUserGraduate } from "react-icons/fa";
import api from "../../services/api.js";
import InputMask from "../../components/InputMask";
import { validarCPF } from "../../components/validateCPF"; // Ajuste o caminho

import "./styles.css";
import { Navigate } from "react-router-dom";

export default function Alunos() {
  // 1. ESTADOS BÁSICOS
  const [registros, setRegistros] = useState([]);
  const [exibindoForm, setExibindoForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(false);

  // 2. ESTADOS ESPECÍFICOS
  const [filtroAba, setFiltroAba] = useState("Ativos");
  const [buscaNome, setBuscaNome] = useState("");
  const inputNomeRef = useRef(null);
  const [exibirCpfReal, setExibirCpfReal] = useState(false);

  // Estado inicial padronizado (dataNascimento como null para o banco DATE)
  const estadoInicial = {
    nome: "",
    cpf: "",
    telefone: "",
    dataNascimento: null,
    ativo: true,
    nomePai: "",
    nomeMae: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "Araraquara",
  };

  const [form, setForm] = useState(estadoInicial);

  // --- CARREGAMENTO DE DADOS ---
  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      const resposta = await api.getAlunos();
      setRegistros(Array.isArray(resposta) ? resposta : []);
    } catch (e) {
      console.error("Erro ao carregar alunos:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // --- FOCO E ATALHOS ---
  useEffect(() => {
    if (exibindoForm) {
      const timer = setTimeout(() => {
        inputNomeRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [exibindoForm]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F2") {
        e.preventDefault();
        if (!exibindoForm) setExibindoForm(true);
      }
      if (e.key === "F4") {
        e.preventDefault();
        if (exibindoForm) document.getElementById("btn-salvar-aluno")?.click();
      }
      if (e.key === "Escape") {
        if (exibindoForm) fecharFormulario();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [exibindoForm]);

  // --- LÓGICA DE FILTRAGEM ---
  const listaExibida = registros
    .filter((aluno) => {
      const bateAba = filtroAba === "Ativos" ? aluno.ativo === true : filtroAba === "Inativos" ? aluno.ativo === false : true;
      const bateNome = (aluno.nome || "").toLowerCase().includes(buscaNome.toLowerCase());
      return bateAba && bateNome;
    })
    .sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));

  // --- AÇÕES ---
  const salvar = async (e) => {
    e.preventDefault();

    // 1. Preparamos os dados limpando o que for necessário
    const cpfLimpo = form.cpf ? form.cpf.replace(/\D/g, "") : null;

    const dadosParaEnviar = {
      ...form,
      dataNascimento: form.dataNascimento === "" ? null : form.dataNascimento,
      cpf: cpfLimpo,
    };

    // 2. Validações de Negócio (Front-end)
    if (cpfLimpo) {
      // Valida tamanho
      if (cpfLimpo.length !== 11) {
        alert("O CPF deve ter exatamente 11 números.");
        return;
      }
      // Valida a matemática (importada do seu functions.js)
      if (!validarCPF(cpfLimpo)) {
        alert("O CPF digitado é matematicamente inválido. Por favor, verifique.");
        return;
      }
    }

    // 3. Envio para a API
    try {
      await api.saveAluno(dadosParaEnviar, editandoId);
      alert("Aluno salvo com sucesso!");
      fecharFormulario();
      carregar();
    } catch (error) {
      console.error("Erro completo:", error);
      const mensagem = error.response?.data?.message || "Erro interno no servidor";
      alert("Erro ao salvar: " + (Array.isArray(mensagem) ? mensagem.join(", ") : mensagem));
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
    const dataFormatada = aluno.dataNascimento ? aluno.dataNascimento.split("T")[0] : "";

    setForm({
      ...aluno,
      dataNascimento: dataFormatada,
      // Isso aqui é o segredo:
      matriculas: aluno.matriculas || [],
    });

    setEditandoId(aluno.id);
    setExibirCpfReal(false);
    setExibindoForm(true);
    //    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      inputNomeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const fecharFormulario = () => {
    setForm(estadoInicial);
    setEditandoId(null);
    setExibindoForm(false);
  };

  const alternarStatus = async (aluno) => {
    // 1. Verificação de Matrícula (Lógica de Negócio)
    const possuiMatricula = aluno.matriculas?.some(
      (m) =>
        String(m.situacao || "")
          .trim()
          .toLowerCase() === "em andamento",
    );

    if (possuiMatricula) {
      alert("⚠️ Este aluno possui matrícula 'Em andamento' e não pode ter o status alterado.");
      return;
    }

    // 2. Definição do novo valor boolean
    const novoStatus = !aluno.ativo;
    if (!window.confirm(`Deseja realmente alterar para ${novoStatus ? "Ativo" : "Inativo"}?`)) return;

    try {
      // AQUI ESTÁ O SEGREDO:
      // Enviamos um objeto novo contendo APENAS o campo 'ativo'
      // Isso garante que o TypeORM faça um: UPDATE aluno SET ativo = ... WHERE id = ...
      await api.saveAluno({ ativo: novoStatus }, aluno.id);

      // 3. Feedback e Atualização da Tela
      carregar();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      alert("Erro ao salvar alteração no banco de dados.");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let valorFinal = type === "checkbox" ? checked : value;

    // Aplica a máscara apenas se o campo for o CPF
    if (name === "cpf") {
      valorFinal = aplicarMascaraCPF(value);
    }

    setForm({ ...form, [name]: valorFinal });
  };

  // Função auxiliar para a máscara (coloque fora do componente)
  const aplicarMascaraCPF = (value) => {
    return value
      .replace(/\D/g, "") // Remove tudo que não é número
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      .slice(0, 14);
  };

  const ocultarCPF = (cpf) => {
    if (!cpf) return "";
    // Se o CPF já vier com máscara ou sem, limpamos e aplicamos a lógica
    const limpo = cpf.replace(/\D/g, "");
    if (limpo.length !== 11) return cpf; // Caso esteja incompleto, mostra o que tem

    return `***.${limpo.substring(3, 6)}.${limpo.substring(6, 9)}-**`;
  };

  const formatarDataTabela = (data) => {
    if (!data) return "---";
    const [ano, mes, dia] = data.split("T")[0].split("-");
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <main className="conteudo-principal">
      <div className="container-principal">
        {/* CARD DE FORMULÁRIO */}
        <div className="card-principal">
          <div className="header-card">
            <h2>
              <FaUserGraduate /> {editandoId ? "Editar Aluno" : exibindoForm ? "Novo Aluno" : "Gerenciar Alunos"}
            </h2>
            {!exibindoForm && (
              <button className="btn btn-primary" onClick={() => setExibindoForm(true)}>
                <FaUserPlus /> Novo Aluno [F2]
              </button>
            )}
          </div>

          {exibindoForm && (
            <form onSubmit={salvar} className="form-grid">
              <div className="input-group campo-medio">
                <label>Nome Completo:</label>
                <input ref={inputNomeRef} required name="nome" value={form.nome} onChange={handleChange} className="input-field" autoComplete="off" />
              </div>

              <div className="input-group campo-curto">
                <label>CPF:</label>
                <div className="cpf-container">
                  <input
                    type="text"
                    name="cpf"
                    className="input-field"
                    maxLength="14"
                    // Lógica de exibição:
                    value={exibirCpfReal ? form.cpf : ocultarCPF(form.cpf)}
                    onChange={handleChange}
                    // Desabilitamos a edição se estiver oculto para evitar salvar asteriscos
                    readOnly={!exibirCpfReal}
                    placeholder="000.000.000-00"
                  />
                  <button
                    type="button"
                    className="btn-toggle-cpf"
                    onClick={() => setExibirCpfReal(!exibirCpfReal)}
                    title={exibirCpfReal ? "Ocultar CPF" : "Mostrar CPF"}
                  >
                    {exibirCpfReal ? "👁️" : "🙈"}
                  </button>
                  {!exibirCpfReal && form.cpf && <small style={{ fontSize: "10px", color: "#999" }}>Clique no ícone para editar</small>}
                </div>
              </div>

              <div className="input-group campo-pequeno">
                <InputMask
                  label="Telefone:"
                  mask="(99) 99999-9999"
                  name="telefone"
                  value={form.telefone || ""}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="input-group campo-pequeno">
                <label>Data Nasc:</label>
                <input type="date" name="dataNascimento" value={form.dataNascimento || ""} onChange={handleChange} className="input-field" />
              </div>

              <div className="input-group campo-pequeno">
                <label>Cep:</label>
                <input name="cep" value={form.cep || ""} onChange={handleChange} className="input-field" />
              </div>

              <div className="input-group campo-medio">
                <label>Endereço:</label>
                <input name="endereco" value={form.endereco || ""} onChange={handleChange} className="input-field" />
              </div>

              <div className="input-group campo-pequeno">
                <label>Número:</label>
                <input name="numero" value={form.numero || ""} onChange={handleChange} className="input-field" />
              </div>

              <div className="input-group campo-curto">
                <label>Complemento:</label>
                <input name="complemento" value={form.complemento || ""} onChange={handleChange} className="input-field" />
              </div>

              <div className="input-group campo-curto">
                <label>Bairro:</label>
                <input name="bairro" value={form.bairro || ""} onChange={handleChange} className="input-field" />
              </div>

              <div className="input-group campo-curto">
                <label>Cidade:</label>
                <input name="cidade" value={form.cidade || ""} onChange={handleChange} className="input-field" />
              </div>

              <div className="input-group campo-medio">
                <label>Nome do Pai:</label>
                <input name="nomePai" value={form.nomePai || ""} onChange={handleChange} className="input-field" />
              </div>

              <div className="input-group campo-medio">
                <label>Nome da Mãe:</label>
                <input name="nomeMae" value={form.nomeMae || ""} onChange={handleChange} className="input-field" />
              </div>

              {/* BOTOES DO FORMULARIO */}
              <div className="acoes-form">
                <button id="btn-salvar-aluno" type="submit" className="btn btn-success">
                  <FaSave /> Salvar Ficha [F4]
                </button>
                <button type="button" className="btn btn-secondary" onClick={fecharFormulario}>
                  <FaTimes /> Cancelar [Esc]
                </button>
              </div>
            </form>
          )}
        </div>

        {/* LISTAGEM E TABELA */}
        <div className="tabela-container">
          <div className="filtro-container-flex">
            <div className="grupo-abas">
              {["Ativos", "Inativos", "Todos"].map((aba) => (
                <button key={aba} className={`aba-item ${filtroAba === aba ? "ativa" : ""}`} onClick={() => setFiltroAba(aba)}>
                  {aba}
                </button>
              ))}
            </div>

            <div className="busca-nome-container">
              <FaSearch className="icon-search" />
              <input
                type="text"
                placeholder="Pesquisar por nome..."
                value={buscaNome}
                onChange={(e) => setBuscaNome(e.target.value)}
                className="input-field"
              />
              {buscaNome && <FaTimes className="icon-clear" onClick={() => setBuscaNome("")} />}
            </div>

            <div className="contadores-flex">
              <span className="count-badge">
                <FaListOl /> Total: <strong>{listaExibida.length}</strong> registros
              </span>
            </div>
          </div>

          {loading ? (
            <p className="txt-carregando">Carregando dados...</p>
          ) : (
            <table className="tabela">
              <thead>
                <tr>
                  <th>Nome / Endereço</th>
                  <th>Curso</th>
                  <th>Telefone</th>
                  <th>Nascimento</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {listaExibida.length > 0 ? (
                  listaExibida.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <strong className="txt-registros">{a.nome}</strong>
                        <br />
                        <small className="txt-registros txt-complemento">
                          {a.endereco ? `End.: ${a.endereco}, ${a.numero} - ${a.bairro}` : "Sem endereço cadastrado"}
                        </small>
                      </td>
                      <td>
                        {a.matriculas && a.matriculas.length > 0 && (
                          <div>
                            {a.matriculas
                              .filter((m) => m.situacao === "Em Andamento")
                              .map((m) => (
                                <span key={m.id} style={{ fontSize: "11px", fontWeight: "bold" }}>
                                  {/*Matricula: {m.id} - */}
                                  Curso: {}
                                  <span style={{ color: "#007bff", fontSize: "11px", fontWeight: "bold" }}>
                                    {m.curso?.nome}
                                    {/*<br />({m.situacao})*/}
                                  </span>
                                </span>
                              ))}
                          </div>
                        )}
                      </td>
                      <td>
                        <a
                          href={`https://wa.me/55${a.telefone?.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${a.nome}, tudo bem? Aqui é da Escola Bella Music.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="link-whatsapp"
                        >
                          {/*Ocultar o simbolo do whatzap quando não tem telefone cadastrado*/}
                          {a.telefone && (
                            <>
                              <FaWhatsapp /> {a.telefone}
                            </>
                          )}
                        </a>
                      </td>
                      <td>
                        <small className="txt-registros">{formatarDataTabela(a.dataNascimento)}</small>
                      </td>
                      <td>
                        <span className={`badge-status ${a.ativo ? "status-ativo" : "status-inativo"}`}>{a.ativo ? "ATIVO" : "INATIVO"}</span>
                      </td>
                      <td className="acoes">
                        <button onClick={() => alternarStatus(a)} className={`btn-icon status`} title={a.ativo ? "Inativar Aluno" : "Ativar Aluno"}>
                          {a.ativo ? "🟢" : "🔴"}
                        </button>
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
                    <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                      Nenhum aluno encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
