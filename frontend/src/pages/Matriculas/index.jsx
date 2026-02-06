import React, { useState, useEffect, useCallback } from "react";
import { FaTrash, FaGraduationCap, FaMoneyBillWave, FaPen, FaSave, FaTimes, FaPlus, FaPrint, FaCheck, FaUndo, FaListOl } from "react-icons/fa";
import api from "../../services/api";
import InputMoeda from "../../components/InputMoeda";
import { executarImpressao } from "../../utils/geradorCarne";
import { useNavigate } from "react-router-dom";
import "./styles.css";

export default function Matriculas() {
  // --- ESTADOS PADRONIZADOS ---
  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [exibindoForm, setExibindoForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [alunos, setAlunos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [filtroSituacao, setFiltroSituacao] = useState("Em Andamento");
  const [filtroProfessor, setFiltroProfessor] = useState("Todas"); // Novo estado de filtro
  const [finSelecionado, setFinSelecionado] = useState(null);
  const [listaParcelas, setListaParcelas] = useState([]);
  const [configCarne, setConfigCarne] = useState(null);
  const [anoGeracao, setAnoGeracao] = useState(new Date().getFullYear());

  const navigate = useNavigate();

  const [form, setForm] = useState({
    aluno: "",
    curso: "",
    valorMensalidade: 0,
    valorMatricula: 0,
    valorCombustivel: 0,
    tipo: "Presencial",
    diaVencimento: "10",
    situacao: "Em Andamento",
    dataInicio: new Date().toISOString().split("T")[0],
    dataTermino: "",
    diaSemana: "Segunda",
    horario: "08:00",
    frequencia: "Semanal",
    termo_atual: 1,
    professor: "Cristiane",
  });

  // --- FUNÇÃO PADRÃO: CARREGAR ---
  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      const [resMat, resAlu, resCur] = await Promise.all([api.getMatriculas(), api.getAlunos(), api.getCursos()]);
      setDados(Array.isArray(resMat) ? resMat : []);
      setAlunos(Array.isArray(resAlu) ? resAlu : []);
      setCursos(Array.isArray(resCur) ? resCur : []);
    } catch (e) {
      console.error("Erro ao carregar dados:", e);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // --- LÓGICA DE FILTRAGEM E CONTAGEM DINÂMICA ---
  const listaExibida = dados
    .filter((m) => {
      const matchSituacao = filtroSituacao === "Todos" ? true : m.situacao === filtroSituacao;
      const matchProfessor = filtroProfessor === "Todas" ? true : m.professor === filtroProfessor;
      return matchSituacao && matchProfessor;
    })
    .sort((a, b) => (a.aluno?.nome || "").localeCompare(b.aluno?.nome || ""));

  const totalDaAba = listaExibida.length;

  // --- FUNÇÃO PADRÃO: SALVAR ---
  const salvar = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      aluno: { id: Number(form.aluno) },
      curso: { id: Number(form.curso) },
      valorMensalidade: Number(form.valorMensalidade),
      valorMatricula: Number(form.valorMatricula),
      valorCombustivel: form.valorCombustivel ? Number(form.valorCombustivel) : 0,
      diaVencimento: Number(form.diaVencimento),
      termo_atual: Number(form.termo_atual),
      dataTermino: form.dataTermino && form.dataTermino.trim() !== "" ? form.dataTermino : null,
    };
    try {
      await api.saveMatricula(payload, editandoId);
      alert("Matrícula salva com sucesso!");
      limparForm();
      carregar();
    } catch (erro) {
      alert("Erro ao salvar matrícula.");
    }
  };

  // --- FUNÇÃO PADRÃO: EXCLUIR ---
  const excluir = async (id) => {
    if (window.confirm("Deseja realmente excluir esta matrícula?")) {
      try {
        await api.deleteMatricula(id);
        carregar();
      } catch (e) {
        alert("Erro ao excluir.");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let novo = { ...form, [name]: value };
    if (name === "situacao") {
      novo.dataTermino = value === "Trancado" || value === "Finalizado" ? new Date().toISOString().split("T")[0] : "";
    }
    if (name === "curso") {
      const cursoEncontrado = cursos.find((c) => c.id == value);
      if (cursoEncontrado) novo.valorMensalidade = cursoEncontrado.valorMensalidade;
    }
    setForm(novo);
  };

  const limparForm = () => {
    setForm({
      aluno: "",
      curso: "",
      valorMensalidade: 0,
      valorMatricula: 0,
      valorCombustivel: 0,
      tipo: "Presencial",
      diaVencimento: "10",
      situacao: "Em Andamento",
      dataInicio: new Date().toISOString().split("T")[0],
      dataTermino: "",
      diaSemana: "Segunda",
      horario: "08:00",
      frequencia: "Semanal",
      termo_atual: 1,
      professor: "Cristiane",
    });
    setEditandoId(null);
    setExibindoForm(false);
  };

  const prepararEdicao = (m) => {
    setEditandoId(m.id);
    setForm({
      aluno: m.aluno?.id || "",
      curso: m.curso?.id || "",
      valorMensalidade: m.valorMensalidade,
      valorMatricula: m.valorMatricula,
      tipo: m.tipo,
      valorCombustivel: m.valorCombustivel || 0,
      diaVencimento: String(m.diaVencimento),
      situacao: m.situacao,
      dataInicio: m.dataInicio ? m.dataInicio.split("T")[0] : "",
      dataTermino: m.dataTermino ? m.dataTermino.split("T")[0] : "",
      diaSemana: m.diaSemana || "Segunda",
      horario: m.horario || "08:00",
      frequencia: m.frequencia || "Semanal",
      termo_atual: m.termo_atual || 1,
      professor: m.professor || "Cristiane",
    });
    setExibindoForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const abrirFinanceiro = async (m) => {
    setFinSelecionado(m);
    try {
      const parcelas = await api.getPorMatricula(m.id);
      setListaParcelas(Array.isArray(parcelas) ? parcelas : []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAcaoFin = async (id, acao) => {
    try {
      acao === "pagar" ? await api.pagar(id) : await api.estornar(id);
      const res = await api.getPorMatricula(finSelecionado.id);
      setListaParcelas(res);
    } catch (e) {
      console.error(e);
    }
  };

  const formatarMoeda = (v) => (v ? Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "-");

  return (
    <div className="container-matriculas">
      <div className="card">
        <div className="header-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>{editandoId ? "Editar Matrícula" : "Gerenciar Matrículas"}</h2>
          {!exibindoForm && (
            <button className="btn btn-primary" onClick={() => setExibindoForm(true)}>
              <FaPlus /> Nova Matrícula
            </button>
          )}
        </div>

        {exibindoForm && (
          <form onSubmit={salvar} className="form-grid conteudo-pagina" style={{ marginTop: "20px" }}>
            <div className="input-group full-width">
              <label>Aluno:</label>
              <select required name="aluno" value={form.aluno} onChange={handleChange} className="input-field">
                <option value="">Selecione...</option>
                {alunos
                  .filter((a) => a.ativo)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nome}
                    </option>
                  ))}
              </select>
            </div>

            <div className="input-group">
              <label>Curso:</label>
              <select required name="curso" value={form.curso} onChange={handleChange} className="input-field">
                <option value="">Selecione...</option>
                {cursos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Modalidade:</label>
              <select name="tipo" value={form.tipo} onChange={handleChange} className="input-field">
                <option value="Presencial">Presencial</option>
                <option value="Residencial">Residencial</option>
              </select>
            </div>

            <div className="input-group">
              <label>Dia da Aula:</label>
              <select name="diaSemana" value={form.diaSemana} onChange={handleChange} className="input-field">
                {["Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado"].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Horário:</label>
              <input type="time" name="horario" value={form.horario} onChange={handleChange} className="input-field" />
            </div>

            <div className="input-group">
              <label>Frequência:</label>
              <select name="frequencia" value={form.frequencia} onChange={handleChange} className="input-field">
                <option value="Semanal">Semanal</option>
                <option value="Quinzenal">Quinzenal</option>
              </select>
            </div>

            <div className="input-group">
              <InputMoeda
                label="Valor Combustível:"
                value={form.valorCombustivel}
                onChange={(valor) => setForm({ ...form, valorCombustivel: valor })}
                disabled={form.tipo !== "Residencial"}
              />
            </div>

            <div className="input-group">
              <InputMoeda label="Valor Matricula:" value={form.valorMatricula} onChange={(valor) => setForm({ ...form, valorMatricula: valor })} />
            </div>

            <div className="input-group">
              <InputMoeda
                label="Valor Mensalidade:"
                value={form.valorMensalidade}
                onChange={(valor) => setForm({ ...form, valorMensalidade: valor })}
              />
            </div>

            <div className="input-group">
              <label>Dia Venc.:</label>
              <select name="diaVencimento" value={form.diaVencimento} onChange={handleChange} className="input-field">
                {[5, 10, 15, 20, 25, 30].map((dia) => (
                  <option key={dia} value={dia}>
                    Dia {dia}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Situação:</label>
              <select name="situacao" value={form.situacao} onChange={handleChange} className="input-field">
                <option value="Em Andamento">Em Andamento</option>
                <option value="Trancado">Trancado</option>
                <option value="Finalizado">Finalizado</option>
              </select>
            </div>

            <div className="input-group">
              <label>Data Início:</label>
              <input type="date" name="dataInicio" value={form.dataInicio} onChange={handleChange} className="input-field" />
            </div>

            <div className="input-group">
              <label>Data Término:</label>
              <input type="date" name="dataTermino" value={form.dataTermino} disabled className="input-field" />
            </div>

            <div className="input-group">
              <label>Termo Inicial:</label>
              <input type="number" name="termo_atual" value={form.termo_atual} onChange={handleChange} className="input-field" />
            </div>

            <div className="input-group">
              <label>Professora:</label>
              <select name="professor" value={form.professor} onChange={handleChange} className="input-field">
                <option value="Cristiane">Cristiane</option>
                <option value="Daiane">Daiane</option>
              </select>
            </div>

            <div className="acoes-form full-width">
              <button type="submit" className="btn btn-primary">
                <FaSave /> Salvar
              </button>
              <button type="button" className="btn btn-secondary" onClick={limparForm}>
                <FaTimes /> Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="tabela-container">
        <div className="filtro-container-flex">
          <div className="grupo-abas">
            {["Em Andamento", "Trancado", "Finalizado", "Todos"].map((s) => (
              <button key={s} className={`aba-item ${filtroSituacao === s ? "ativa" : ""}`} onClick={() => setFiltroSituacao(s)}>
                {s}
              </button>
            ))}
          </div>

          <div className="input-group-filtro">
            <label>Professora:</label>
            <select className="select-filtro" value={filtroProfessor} onChange={(e) => setFiltroProfessor(e.target.value)}>
              <option value="Todas">Todas</option>
              <option value="Cristiane">Cristiane</option>
              <option value="Daiane">Daiane</option>
            </select>
          </div>

          <div className="contadores-matricula">
            <span className="count-item">
              <FaListOl /> Total nesta seleção: <strong>{totalDaAba}</strong> registros
            </span>
          </div>
        </div>

        <table className="tabela">
          <thead>
            <tr>
              <th>Aluno / Professor</th>
              <th>Curso / Termo</th>
              <th>Dia / Horário</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {listaExibida.map((m) => (
              <tr key={m.id}>
                <td>
                  <strong>{m.aluno?.nome}</strong>
                  <br />
                  <small className="txt-secundario" style={{ fontSize: "0.75rem", color: "#c41010", marginTop: "2px" }}>
                    Profa. {m.professor}
                  </small>
                </td>
                <td>
                  <strong>{m.curso?.nome}</strong>
                  <br />
                  <small className="txt-secundario" style={{ fontSize: "0.75rem", color: "#c41010", marginTop: "2px" }}>
                    {m.termo_atual} Termo
                  </small>
                </td>
                <td>
                  {m.diaSemana} - {m.horario} Hs
                </td>
                <td>
                  <span className={`badge bg-${m.situacao.replace(" ", "").toLowerCase()}`}>{m.situacao}</span>
                </td>
                <td className="acoes">
                  <button onClick={() => prepararEdicao(m)} className="btn-icon btn-edit" title="Editar">
                    <FaPen />
                  </button>
                  <button onClick={() => setConfigCarne(m)} className="btn-icon btn-print" title="Imprimir Carnê">
                    <FaPrint />
                  </button>
                  <button onClick={() => navigate(`/boletim/${m.id}`)} className="btn-icon btn-boletim" title="Boletim">
                    <FaGraduationCap />
                  </button>
                  <button onClick={() => abrirFinanceiro(m)} className="btn-icon btn-modal" title="Financeiro">
                    <FaMoneyBillWave />
                  </button>
                  <button onClick={() => excluir(m.id)} className="btn-icon btn-excluir" title="Excluir">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {configCarne && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "400px" }}>
            <div className="modal-header">
              <h3>Configurar Impressão</h3>
              <button onClick={() => setConfigCarne(null)} className="btn-fechar">
                <FaTimes />
              </button>
            </div>
            <div style={{ padding: "20px" }}>
              <div className="input-group">
                <label>Ano do Carnê:</label>
                <input type="number" className="input-field" value={anoGeracao} onChange={(e) => setAnoGeracao(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Mês de Início:</label>
                <select className="input-field" id="mesCarne" defaultValue={new Date().getMonth()}>
                  {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"].map((m, i) => (
                    <option key={i} value={i}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "20px" }}
                onClick={() => {
                  const mes = parseInt(document.getElementById("mesCarne").value);
                  executarImpressao(configCarne, mes, String(anoGeracao), true);
                  setConfigCarne(null);
                }}
              >
                <FaPrint /> Gerar PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {finSelecionado && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "800px" }}>
            <div className="modal-header">
              <h3>Financeiro: {finSelecionado.aluno?.nome}</h3>
              <button onClick={() => setFinSelecionado(null)} className="btn-fechar">
                <FaTimes />
              </button>
            </div>
            <div className="geracao-box" style={{ padding: "10px", background: "#f8f9fa", marginBottom: "10px", textAlign: "center" }}>
              <label>Ano de Geração: </label>
              <input
                type="number"
                value={anoGeracao}
                onChange={(e) => setAnoGeracao(e.target.value)}
                className="input-pequeno"
                style={{ width: "80px", marginRight: "10px" }}
              />
              <button
                onClick={() => {
                  api
                    .gerarParcelaIndividual({ matriculaId: Number(finSelecionado.id), ano: Number(anoGeracao) })
                    .then(() => {
                      alert("Parcelas geradas!");
                      abrirFinanceiro(finSelecionado);
                    })
                    .catch(() => alert("Erro ao gerar parcelas."));
                }}
                className="btn btn-primary"
                style={{ width: "auto", padding: "5px 15px" }}
              >
                Gerar Parcelas
              </button>
            </div>
            <div className="tabela-container" style={{ maxHeight: "350px", overflowY: "auto" }}>
              <table className="tabela">
                <thead>
                  <tr>
                    <th>Vencimento</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {listaParcelas.map((p) => (
                    <tr key={p.id} className={p.status === "Paga" ? "linha-paga" : ""}>
                      <td>{new Date(p.dataVencimento).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</td>
                      <td>{formatarMoeda(p.valorTotal)}</td>
                      <td>
                        <span className={`badge ${p.status === "Paga" ? "bg-paga" : "bg-aberta"}`}>{p.status}</span>
                      </td>
                      <td className="acoes">
                        <button onClick={() => handleAcaoFin(p.id, p.status === "Aberta" ? "pagar" : "estornar")} className="btn-icon">
                          {p.status === "Aberta" ? <FaCheck color="green" /> : <FaUndo color="orange" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
