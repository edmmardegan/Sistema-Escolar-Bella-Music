/* src/pages/Matriculas/index.jsx */

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FaChalkboardTeacher,
  FaTrash,
  FaGraduationCap,
  FaMoneyBillWave,
  FaPen,
  FaSave,
  FaTimes,
  FaPlus,
  FaPrint,
  FaCheck,
  FaUndo,
  FaListOl,
} from "react-icons/fa";
import api from "../../services/api";
import InputMoeda from "../../components/InputMoeda";
import { executarImpressao } from "../../utils/geradorCarne";
import { useNavigate } from "react-router-dom";
import "./styles.css";

export default function Matriculas() {
  // 1. ESTADOS PADRONIZADOS
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exibindoForm, setExibindoForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  // 2. ESTADOS ESPECÍFICOS
  const [alunos, setAlunos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [filtroSituacao, setFiltroSituacao] = useState("Em Andamento");
  const [filtroProfessor, setFiltroProfessor] = useState("Todas");
  const [finSelecionado, setFinSelecionado] = useState(null);
  const [listaParcelas, setListaParcelas] = useState([]);
  const [configCarne, setConfigCarne] = useState(null);
  const [anoGeracao, setAnoGeracao] = useState(new Date().getFullYear());

  const inputFocoRef = useRef(null);
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
    dataTrancamento: "",
    dataTermino: "",
    diaSemana: "Segunda",
    horario: "08:00",
    frequencia: "Semanal",
    termo_atual: 1,
    professor: "Cristiane",
  });

  // --- FUNÇÃO DE FORMATAÇÃO PROTEGIDA ---
  const formatarSafe = (d) => {
    if (!d) return "---";
    try {
      // Converte para string YYYY-MM-DD ignorando o fuso horário original
      const dataIso = typeof d === "object" ? d.toISOString().split("T")[0] : d.split("T")[0];
      return new Date(dataIso + "T12:00:00").toLocaleDateString("pt-BR");
    } catch (e) {
      return "---";
    }
  };

  // --- CARREGAMENTO ---
  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      const [resMat, resAlu, resCur] = await Promise.all([api.getMatriculas(), api.getAlunos(), api.getCursos()]);
      setRegistros(Array.isArray(resMat) ? resMat : []);
      setAlunos(Array.isArray(resAlu) ? resAlu : []);
      setCursos(Array.isArray(resCur) ? resCur : []);
    } catch (e) {
      console.error("Erro ao carregar dados:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // --- ATALHOS DE TECLADO ---
  useEffect(() => {
    if (exibindoForm) setTimeout(() => inputFocoRef.current?.focus(), 150);
  }, [exibindoForm]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F2" && !exibindoForm) {
        e.preventDefault();
        setExibindoForm(true);
      }
      if (e.key === "F4" && exibindoForm) {
        e.preventDefault();
        document.getElementById("btn-salvar-mat")?.click();
      }
      if (e.key === "Escape" && exibindoForm) limparForm();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [exibindoForm]);

  // --- LÓGICA DE FILTRAGEM ---
  const listaExibida = registros
    .filter((m) => {
      const matchSituacao = filtroSituacao === "Todos" ? true : m.situacao === filtroSituacao;
      const matchProfessor = filtroProfessor === "Todas" ? true : m.professor === filtroProfessor;
      return matchSituacao && matchProfessor;
    })
    .sort((a, b) => (a.aluno?.nome || "").localeCompare(b.aluno?.nome || ""));

  // --- AÇÕES ---
  const salvar = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      // Enviar apenas o ID direto para o TypeORM não se perder
      aluno: Number(form.aluno),
      curso: Number(form.curso),
      valorMensalidade: Number(form.valorMensalidade || 0),
      valorMatricula: Number(form.valorMatricula || 0),
      valorCombustivel: Number(form.valorCombustivel || 0),
      diaVencimento: Number(form.diaVencimento),
      termo_atual: Number(form.termo_atual),
      dataInicio: form.dataInicio?.trim() || null,
      // Garante que campos vazios não quebrem o banco
      dataTrancamento: form.dataTrancamento?.trim() || null,
      dataTermino: form.dataTermino?.trim() || null,
    };

    try {
      await api.saveMatricula(payload, editandoId);
      alert("Matrícula salva com sucesso!");
      limparForm();
      carregar();
    } catch (erro) {
      const msg = erro.response?.data?.message;
      alert("Erro ao salvar: " + (Array.isArray(msg) ? msg.join(", ") : "Verifique os dados."));
    }
  };

  const excluir = async (id) => {
    if (!window.confirm("Deseja realmente excluir esta matrícula?")) return;
    try {
      await api.deleteMatricula(id);
      carregar();
    } catch (e) {
      alert("Erro ao excluir.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let novo = { ...form, [name]: value };

    if (name === "situacao") {
      const hoje = new Date().toISOString().split("T")[0];

      if (value === "Trancado") {
        novo.dataTrancamento = hoje; // Preenche trancamento
        novo.dataTermino = ""; // Limpa conclusão
      } else if (value === "Finalizado") {
        novo.dataTermino = hoje; // Preenche conclusão
        novo.dataTrancamento = ""; // Limpa trancamento
      } else {
        // Em Andamento
        novo.dataTrancamento = "";
        novo.dataTermino = "";
      }
    }

    // Manter lógica do curso...
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
      dataTrancamento: "",
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
      dataInicio: m.dataInicio ? (typeof m.dataInicio === "object" ? m.dataInicio.toISOString().split("T")[0] : m.dataInicio.split("T")[0]) : "",
      dataTrancamento: m.dataTrancamento
        ? typeof m.dataTrancamento === "object"
          ? m.dataTrancamento.toISOString().split("T")[0]
          : m.dataTrancamento.split("T")[0]
        : "",
      dataTermino: m.dataTermino ? (typeof m.dataTermino === "object" ? m.dataTermino.toISOString().split("T")[0] : m.dataTermino.split("T")[0]) : "",
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

  return (
    <main className="conteudo-principal">
      <div className="container-principal">
        <section className="card-principal">
          <div className="header-card">
            <h2>
              <FaChalkboardTeacher /> {editandoId ? "Editar Matrícula" : "Matrículas - Bella Music"}
            </h2>
            {!exibindoForm && (
              <button className="btn btn-primary" onClick={() => setExibindoForm(true)}>
                <FaPlus /> Nova Matrícula [F2]
              </button>
            )}
          </div>

          {exibindoForm && (
            <form onSubmit={salvar} className="form-grid">
              {/* LINHA 1 */}
              <div className="input-group campo-grande">
                <label>Aluno:</label>
                <select ref={inputFocoRef} required name="aluno" value={form.aluno} onChange={handleChange} className="input-field">
                  <option value="">Selecione o Aluno...</option>
                  {alunos
                    .filter((a) => a.ativo)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nome}
                      </option>
                    ))}
                </select>
              </div>

              {/* LINHA 2 */}
              <div className="input-group campo-curto">
                <label>Curso:</label>
                <select required name="curso" value={form.curso} onChange={handleChange} className="input-field">
                  <option value="">Selecione o Curso...</option>
                  {cursos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group campo-curto">
                <label>Modalidade:</label>
                <select name="tipo" value={form.tipo} onChange={handleChange} className="input-field">
                  <option value="Presencial">Presencial</option>
                  <option value="Residencial">Residencial</option>
                </select>
              </div>

              {/* LINHA 3 */}
              <div className="input-group campo-curto">
                <label>Dia da Aula:</label>
                <select name="diaSemana" value={form.diaSemana} onChange={handleChange} className="input-field">
                  {["Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado"].map((d) => (
                    <option key={d} value={d}>
                      {d === "Terca" ? "Terça" : d === "Sabado" ? "Sábado" : d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group campo-curto">
                <label>Horário:</label>
                <input type="time" name="horario" value={form.horario} onChange={handleChange} className="input-field" />
              </div>

              <div className="input-group campo-curto">
                <label>Frequência:</label>
                <select name="frequencia" value={form.frequencia} onChange={handleChange} className="input-field">
                  <option value="Semanal">Semanal</option>
                  <option value="Quinzenal">Quinzenal</option>
                </select>
              </div>

              {/* LINHA 4 - VALORES */}
              <div className="input-group campo-curto">
                <InputMoeda label="Valor Matrícula:" value={form.valorMatricula} onChange={(v) => setForm({ ...form, valorMatricula: v })} />
              </div>

              <div className="input-group campo-curto">
                <InputMoeda label="Valor Mensalidade:" value={form.valorMensalidade} onChange={(v) => setForm({ ...form, valorMensalidade: v })} />
              </div>

              <div className="input-group campo-curto">
                <InputMoeda
                  label="Valor Combustível:"
                  value={form.valorCombustivel}
                  onChange={(v) => setForm({ ...form, valorCombustivel: v })}
                  disabled={form.tipo !== "Residencial"}
                />
              </div>

              {/* LINHA 5 */}
              <div className="input-group campo-curto">
                <label>Dia Venc.:</label>
                <select name="diaVencimento" value={form.diaVencimento} onChange={handleChange} className="input-field">
                  {[5, 10, 15, 20, 25, 30].map((dia) => (
                    <option key={dia} value={dia}>
                      Dia {dia}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group campo-curto">
                <label>Situação:</label>
                <select name="situacao" value={form.situacao} onChange={handleChange} className="input-field">
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Trancado">Trancado</option>
                  <option value="Finalizado">Finalizado</option>
                </select>
              </div>

              <div className="input-group campo-curto">
                <label>Professora:</label>
                <select name="professor" value={form.professor} onChange={handleChange} className="input-field">
                  <option value="Cristiane">Cristiane</option>
                  <option value="Daiane">Daiane</option>
                </select>
              </div>

              {/* LINHA 6 */}
              <div className="input-group campo-curto">
                <label>Data Início:</label>
                <input type="date" name="dataInicio" value={form.dataInicio} onChange={handleChange} className="input-field" />
              </div>

              <div className="input-group campo-curto">
                <label>Data Trancamento:</label>
                <input
                  type="date"
                  name="dataTrancamento" // Nome correto conforme seu estado
                  value={form.dataTrancamento}
                  onChange={handleChange}
                  disabled={form.situacao !== "Trancado"} // Só libera se for Trancado
                  className="input-field"
                />
              </div>

              <div className="input-group campo-curto">
                <label>Data Término:</label>
                <input
                  type="date"
                  name="dataTermino" // Nome correto conforme seu estado
                  value={form.dataTermino}
                  onChange={handleChange}
                  disabled={form.situacao !== "Finalizado"} // Só libera se for Finalizado
                  className="input-field"
                />
              </div>

              <div className="input-group campo-curto">
                <label>Termo Atual:</label>
                <input type="number" name="termo_atual" value={form.termo_atual} onChange={handleChange} className="input-field" />
              </div>

              <div className="acoes-form">
                <button id="btn-salvar-mat" type="submit" className="btn btn-primary">
                  <FaSave /> Salvar [F4]
                </button>
                <button type="button" className="btn btn-secondary" onClick={limparForm}>
                  <FaTimes /> Cancelar [Esc]
                </button>
              </div>
            </form>
          )}
        </section>

        {/* LISTAGEM ABAIXO */}
        <section className="tabela-container">
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
              <select className="input-field" style={{ width: "130px" }} value={filtroProfessor} onChange={(e) => setFiltroProfessor(e.target.value)}>
                <option value="Todas">Todas</option>
                <option value="Cristiane">Cristiane</option>
                <option value="Daiane">Daiane</option>
              </select>
            </div>

            <div className="contadores-flex">
              <span className="count-badge">
                <FaListOl /> Total: <strong>{listaExibida.length}</strong>
              </span>
            </div>
          </div>

          <table className="tabela">
            <thead>
              <tr>
                <th>Aluno / Profa.</th>
                <th>Curso / Termo</th>

                {filtroSituacao === "Em Andamento" && (
                  <>
                    <th>Dia / Horário</th>
                    <th>Data Matrícula</th>
                  </>
                )}

                {filtroSituacao === "Trancado" && (
                  <>
                    <th>Data Matrícula</th>
                    <th>Data Trancamento</th>
                  </>
                )}

                {filtroSituacao === "Finalizado" && (
                  <>
                    <th>Data Matrícula</th>
                    <th>Data Conclusão</th>
                  </>
                )}

                {filtroSituacao === "Todos" && (
                  <>
                    <th>Dia / Horário</th>
                    <th>Data Matrícula</th>
                    <th>Data Final</th>
                    <th>Status</th>
                  </>
                )}

                <th className="col-centralizada">Ações</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="texto-centralizado">
                    Sincronizando...
                  </td>
                </tr>
              ) : (
                listaExibida.map((m) => {
                  // 1. Cálculo das semanas (antes do return)
                  const calcularTempoDeCurso = () => {
                    if (!m.dataInicio) return "---";

                    try {
                      const obterApenasData = (valor) => {
                        if (!valor) return null;
                        const s = typeof valor === "object" ? valor.toISOString() : String(valor);
                        return s.substring(0, 10);
                      };

                      const d1Str = obterApenasData(m.dataInicio);
                      const d2Str = obterApenasData(m.dataTermino || m.dataTrancamento) || new Date().toISOString().substring(0, 10);

                      let d1 = new Date(d1Str + "T12:00:00");
                      let d2 = new Date(d2Str + "T12:00:00");

                      let anos = d2.getFullYear() - d1.getFullYear();
                      let meses = d2.getMonth() - d1.getMonth();
                      let dias = d2.getDate() - d1.getDate();

                      // Ajuste de dias negativos (mês anterior)
                      if (dias < 0) {
                        meses--;
                        const ultimoDiaMesAnterior = new Date(d2.getFullYear(), d2.getMonth(), 0).getDate();
                        dias += ultimoDiaMesAnterior;
                      }

                      // Ajuste de meses negativos (ano anterior)
                      if (meses < 0) {
                        anos--;
                        meses += 12;
                      }

                      // Calculamos as semanas garantindo que seja um número inteiro
                      const semanas = Math.floor(dias / 7);

                      // Montagem do Array - Só adiciona se for 1 ou mais (Inteiro)
                      let partes = [];
                      if (anos >= 1) partes.push(`${anos} ${anos === 1 ? "ano" : "anos"}`);
                      if (meses >= 1) partes.push(`${meses} ${meses === 1 ? "mês" : "meses"}`);
                      if (semanas >= 1) partes.push(`${semanas} ${semanas === 1 ? "semana" : "semanas"}`);

                      // Se o aluno tiver menos de 7 dias, a lista estará vazia
                      if (partes.length === 0) return "Menos de 1 semana";

                      return partes.join(", ");
                    } catch (e) {
                      return "---";
                    }
                  };

                  const tempoFormatado = calcularTempoDeCurso();

                  //const qtdSemanas = calcularSemanas();

                  return (
                    <tr key={m.id}>
                      <td>
                        <strong>{m.aluno?.nome}</strong>
                        <br />
                        <small className="txt-detalhe-vermelho">Profa. {m.professor}</small>
                      </td>
                      <td>
                        <strong>{m.curso?.nome}</strong>
                        <br />
                        <small className="txt-detalhe-vermelho">{m.termo_atual}º Termo</small>
                      </td>

                      {filtroSituacao === "Em Andamento" && (
                        <>
                          <td>
                            {m.diaSemana} - {m.horario}h
                          </td>
                          <td>
                            {formatarSafe(m.dataInicio)}
                            <br />
                            <small className="txt-detalhe-azul">{tempoFormatado}</small>
                          </td>
                        </>
                      )}

                      {filtroSituacao === "Trancado" && (
                        <>
                          <td>
                            {formatarSafe(m.dataInicio)}
                            <br />
                            <small className="txt-detalhe-azul">{tempoFormatado}</small>
                          </td>
                          <td>{formatarSafe(m.dataTrancamento)}</td>
                        </>
                      )}

                      {filtroSituacao === "Finalizado" && (
                        <>
                          <td>
                            {formatarSafe(m.dataInicio)}
                            <br />
                            <small className="txt-detalhe-azul">{tempoFormatado} </small>
                          </td>
                          <td>{formatarSafe(m.dataTermino)}</td>
                        </>
                      )}

                      {filtroSituacao === "Todos" && (
                        <>
                          <td>
                            {m.diaSemana} - {m.horario}h
                          </td>
                          <td>
                            {formatarSafe(m.dataInicio)}
                            <br />
                            <small className="txt-detalhe-azul">{tempoFormatado} </small>
                          </td>
                          <td>{formatarSafe(m.dataTermino || m.dataTrancamento)}</td>
                          <td>
                            <span className={`badge-status status-${m.situacao.replace(" ", "").toLowerCase()}`}>{m.situacao}</span>
                          </td>
                        </>
                      )}

                      <td className="acoes">
                        {/* ... botões de ações permanecem iguais ... */}
                        <button onClick={() => prepararEdicao(m)} className="btn-icon btn-edit" title="Editar">
                          <FaPen />
                        </button>
                        <button onClick={() => setConfigCarne(m)} className="btn-icon btn-primary" title="Carnê">
                          <FaPrint />
                        </button>
                        <button onClick={() => navigate(`/boletim/${m.id}`)} className="btn-icon btn-secondary" title="Boletim">
                          <FaGraduationCap />
                        </button>
                        <button onClick={() => abrirFinanceiro(m)} className="btn-icon btn-edit" title="Financeiro">
                          <FaMoneyBillWave />
                        </button>
                        <button onClick={() => excluir(m.id)} className="btn-icon btn-excluir" title="Excluir">
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </section>
      </div>

      {/* --- MODAIS --- */}
      {configCarne && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "350px" }}>
            <div className="modal-header">
              <h3>Imprimir Carnê</h3>
              <button onClick={() => setConfigCarne(null)} className="btn-fechar">
                <FaTimes />
              </button>
            </div>
            <div style={{ padding: "15px" }}>
              <div className="input-group">
                <label>Ano do Carnê:</label>
                <input type="number" className="input-data" value={anoGeracao} onChange={(e) => setAnoGeracao(e.target.value)} />
              </div>
              <button
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "15px" }}
                onClick={() => {
                  executarImpressao(configCarne, new Date().getMonth(), String(anoGeracao), true);
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
          <div className="modal-content" style={{ maxWidth: "700px" }}>
            <div className="modal-header">
              <h3>Financeiro: {finSelecionado.aluno?.nome}</h3>
              <button onClick={() => setFinSelecionado(null)} className="btn-fechar">
                <FaTimes />
              </button>
            </div>
            <div className="tabela-container" style={{ maxHeight: "400px" }}>
              <table className="tabela">
                <thead>
                  <tr>
                    <th>Vencimento</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {listaParcelas.map((p) => (
                    <tr key={p.id}>
                      <td>{new Date(p.dataVencimento).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</td>
                      <td>{p.valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                      <td>
                        <span className={`badge-status ${p.status === "Paga" ? "status-pago" : "status-aberto"}`}>{p.status}</span>
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
    </main>
  );
}
