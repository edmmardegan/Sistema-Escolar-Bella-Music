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
  FaSearch,
  FaListOl,
} from "react-icons/fa";
import api from "../../services/api";
import InputMoeda from "../../components/InputMoeda";
import { executarImpressao } from "../../utils/geradorCarne";
import { useNavigate } from "react-router-dom";
//import "./styles.css";
import { executarImpressaoMatricula } from "../../utils/geradorMatricula";
import { Input } from "postcss";

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

  const [buscaNome, setBuscaNome] = useState("");
  const inputFocoRef = useRef(null);
  const navigate = useNavigate();
  const [ordenacao, setOrdenacao] = useState({ campo: "aluno.nome", direcao: "asc" });

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

  const handleOrdenar = (campo) => {
    const novaDirecao = ordenacao.campo === campo && ordenacao.direcao === "asc" ? "desc" : "asc";
    setOrdenacao({ campo, direcao: novaDirecao });
  };

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
      // Passamos o buscaNome para o service
      const [resMat, resAlu, resCur] = await Promise.all([
        api.getMatriculas(buscaNome), // 👈 Ajustado aqui
        api.getAlunos(),
        api.getCursos(),
      ]);
      setRegistros(Array.isArray(resMat) ? resMat : []);
      setAlunos(Array.isArray(resAlu) ? resAlu : []);
      setCursos(Array.isArray(resCur) ? resCur : []);
    } catch (e) {
      console.error("Erro ao carregar dados:", e);
    } finally {
      setLoading(false);
    }
  }, [buscaNome]); // 👈 Adicione buscaNome como dependência

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
        document.getElementById("btn-salvar")?.click();
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
    .sort((a, b) => {
      let valorA, valorB;

      // Mapeia os campos do clique para os dados do objeto
      switch (ordenacao.campo) {
        case "aluno":
          valorA = a.aluno?.nome || "";
          valorB = b.aluno?.nome || "";
          break;
        case "curso":
          valorA = a.curso?.nome || "";
          valorB = b.curso?.nome || "";
          break;
        case "dia":
          valorA = a.diaSemana?.none || "";
          valorB = b.diaSemana?.none || "";
          break;
        case "situacao":
          valorA = a.diaSemana?.none || "";
          valorB = b.diaSemana?.none || "";
          break;

        case "data":
          valorA = a.dataInicio || "";
          valorB = b.dataInicio || "";
          break;
        case "dataTrancamento":
          valorA = a.dataTrancamento || "";
          valorB = b.dataTrancamento || "";
          break;
        case "dataConclusao":
          valorA = a.dataConclusao || "";
          valorB = b.dataConclusao || "";
          break;
        case "matricula":
          valorA = a.id;
          valorB = b.id;
          break;
        default:
          valorA = a.aluno?.nome || "";
          valorB = b.aluno?.nome || "";
      }

      if (valorA < valorB) return ordenacao.direcao === "asc" ? -1 : 1;
      if (valorA > valorB) return ordenacao.direcao === "asc" ? 1 : -1;
      return 0;
    });

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
        novo.dataTrancamento = hoje;
        novo.dataTermino = "";
      } else if (value === "Finalizado") {
        novo.dataTermino = hoje;
        novo.dataTrancamento = "";
      } else {
        novo.dataTrancamento = "";
        novo.dataTermino = "";
      }
    }

    if (name === "tipo" && value === "Presencial") {
      novo.valorCombustivel = 0;
    }

    //  setForm(novo);
    //};

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

  const handleAcaoFinanceiro = async (id, tipo) => {
    try {
      // Chama a mesma API que o Financeiro Global usa
      if (tipo === "pagar") {
        await api.pagar(id);
      } else {
        await api.estornar(id);
      }

      // ✅ RECARREGA as parcelas no modal após a ação
      // Usamos o id da matrícula que já está guardado no finSelecionado
      const parcelasAtualizadas = await api.getPorMatricula(finSelecionado.id);
      setListaParcelas(Array.isArray(parcelasAtualizadas) ? parcelasAtualizadas : []);
    } catch (e) {
      console.error("Erro na operação financeira:", e);
      alert("Erro ao processar o pagamento/estorno.");
    }
  };

  const validarHorarioAoSair = (e) => {
    const valor = e.target.value; // Formato "HH:mm"
    if (!valor) return;

    const [hora, minutos] = valor.split(":").map(Number);
    const minutosString = valor.split(":")[1];
    const minutosValidos = ["00", "15", "30", "45"];

    let erro = "";

    // Validação do Intervalo de Horas (8h às 22h)
    if (hora < 8 || hora > 22) {
      erro = "O horário de aula deve ser entre 08:00 e 22:00.";
    }
    // Validação dos Minutos (Múltiplos de 15)
    else if (!minutosValidos.includes(minutosString)) {
      erro = "Os minutos devem ser 00, 15, 30 ou 45.";
    }

    if (erro) {
      alert(erro);
      // Opcional: Reseta para um valor seguro para evitar que o erro persista
      setForm((prev) => ({ ...prev, horario: "08:00" }));
    }
  };

  return (
    <main className="p-4 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* CARD FORM */}
        <section className="bg-white rounded-xl shadow-md p-6">
          {/* HEADER */}
          <div className="flex justify-between items-center flex-wrap gap-3">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaChalkboardTeacher />
              {editandoId ? "Editar Matrícula" : "Matrículas"}

              {/* Opcional: Aviso visual abaixo do curso quando editando */}
              {editandoId && <small className="text-[#888] text-[11px] block mt-1">* Aluno e Curso não podem ser alterados na edição.</small>}
            </h2>

            {!exibindoForm && (
              <button
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition"
                onClick={() => setExibindoForm(true)}
              >
                <FaPlus /> Nova Matricula [F2]
              </button>
            )}
          </div>

          {exibindoForm && (
            <form className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end" onSubmit={salvar}>
              {/* NOME */}
              <div className="text-sm font-semibold text-gray-600 flex flex-col gap-2">
                <label>Aluno</label>
                <select
                  ref={inputFocoRef}
                  required
                  name="aluno"
                  value={form.aluno}
                  onChange={handleChange}
                  className="w-[300px] h-8 px-4 border rounded-md bg-write text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!!editandoId}
                >
                  {" "}
                  // 🔒 Bloqueia se estiver editando
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

              {/* CURSO */}
              <div className="text-sm font-semibold text-gray-600 flex flex-col gap-2">
                <label>Curso</label>
                <select
                  ref={inputFocoRef}
                  required
                  name="curso"
                  value={form.curso}
                  onChange={handleChange}
                  className="w-[300px] h-8 px-4 border rounded-md bg-write text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!!editandoId}
                >
                  {" "}
                  // 🔒 Bloqueia se estiver editando
                  <option value="">Selecione o Curso...</option>
                  {cursos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* PROFESSORA */}
              <div className="text-sm font-semibold text-gray-600 flex flex-col gap-2">
                <label>Professora</label>
                <select
                  ref={inputFocoRef}
                  required
                  name="professor"
                  value={form.Professor}
                  onChange={handleChange}
                  className="w-[300px] h-8 px-4 border rounded-md bg-write text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Cristiane">Cristiane</option>
                  <option value="Daiane">Daiane</option>
                </select>
              </div>

              {/* MODALIDADE */}
              <div className="text-sm font-semibold text-gray-600 flex flex-col gap-2">
                <label>Modalidade</label>
                <select
                  ref={inputFocoRef}
                  required
                  name="tipo"
                  value={form.tipo}
                  onChange={handleChange}
                  //onChange={handleChange}
                  className="w-32 h-8 px-4 border rounded-md bg-write text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Presencial">Presencial</option>
                  <option value="Residencial">Residencial</option>
                </select>
              </div>

              {/* FREQUENCIA */}
              <div className="text-sm font-semibold text-gray-600 flex flex-col gap-2">
                <label>Frequência</label>
                <select
                  //ref={inputFocoRef}
                  required
                  name="Frequência"
                  value={form.Frequência}
                  onChange={handleChange}
                  className="w-32 h-8 px-4 border rounded-md bg-write text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Semanal">Semanal</option>
                  <option value="Quinzenal">Quinzenal</option>
                </select>
              </div>

              {/* DIA SEMANAL */}
              <div className="text-sm font-semibold text-gray-600 flex flex-col gap-2">
                <label>Dia Semanal</label>
                <select
                  ref={inputFocoRef}
                  required
                  name="diaSemana"
                  value={form.diaSemana}
                  onChange={handleChange}
                  className="w-32 h-8 px-4 border rounded-md bg-write text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {["Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado"].map((d) => (
                    <option key={d} value={d}>
                      {d === "Terca" ? "Terça" : d === "Sabado" ? "Sábado" : d}
                    </option>
                  ))}
                </select>
              </div>

              {/* HORÁRIO */}
              <div className="text-sm font-semibold text-gray-600 flex flex-col gap-2">
                <label>Horário</label>
                <input
                  className="w-32 h-8 px-4 border rounded-md bg-write text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="horario"
                  value={form.horario}
                  onChange={handleChange}
                  onBlur={validarHorarioAoSair}
                  required
                />
              </div>

              {/* TERMO */}
              <div className="text-sm font-semibold text-gray-600 flex flex-col gap-2">
                <label>Termo Atual</label>
                <input
                  className="w-32 h-8 px-4 border rounded-md bg-write text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="termo_atual"
                  value={form.termo_atual}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* VENCIMENTO */}
              <div className="text-sm font-semibold text-gray-600 flex flex-col gap-2">
                <label>Dia Vencimento</label>
                <select
                  className="w-32 h-8 px-4 border rounded-md bg-write text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="diaVencimento"
                  value={form.diaVencimento}
                  onChange={handleChange}
                  required
                >
                  {[5, 10, 15, 20, 25, 30].map((dia) => (
                    <option key={dia} value={dia}>
                      Dia {dia}
                    </option>
                  ))}
                </select>
              </div>

              {/* VALOR MENSALIDADE */}
              <div className="text-sm font-semibold text-gray-600 flex flex-col gap-2">
                <label>Valor Mensalidade</label>
                <InputMoeda
                  className="w-40 h-8 px-4 border rounded-md bg-write text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  //label="Valor Mensalidade:"
                  value={form.valorMensalidade}
                  onChange={handleChange}
                  //onChange={(novoValor) => setForm({ ...form, valorMensalidade: novoValor })}
                  required
                />
              </div>

              {/* VALOR COMBUSTIVEL */}
              <div className="text-sm font-semibold text-gray-600 flex flex-col gap-2">
                <label>Valor Combustivel</label>
                <InputMoeda
                  className="w-40 h-8 px-4 border rounded-md bg-write text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  //label="Valor Combustivel:"
                  value={form.valorCombustivel}
                  //onChange={handleChange}
                  onChange={(novoValor) => setForm({ ...form, valorCombustivel: novoValor })}
                  disabled={form.tipo === "Presencial"}
                />
              </div>

              {/* VALOR MATRICULA */}
              <div className="text-sm font-semibold text-gray-600 flex flex-col gap-2">
                <label>Valor Matrícula</label>
                <InputMoeda
                  className="w-40 h-8 px-4 border rounded-md bg-write text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  //label="Valor Mensalidade:"
                  value={form.valorMatricula}
                  onChange={handleChange}
                  //onChange={(novoValor) => setForm({ ...form, valorMatricula: novoValor })}
                  required
                />
              </div>

              {/* DATA INICIO */}
              <div className="text-sm font-semibold text-gray-600 flex flex-col gap-2">
                <label>Data Início</label>
                <input
                  className="w-40 h-8 px-4 border rounded-md bg-write text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="date"
                  name="dataInicio"
                  value={form.dataInicio}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* DATA TRANCAMENTO */}
              <div className="text-sm font-semibold text-gray-600 flex flex-col gap-2">
                <label>Data Trancamento</label>
                <input
                  className="w-40 h-8 px-4 border rounded-md bg-write text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="date"
                  name="dataTrancamento"
                  value={form.dataTrancamento}
                  onChange={handleChange}
                  disabled={form.situacao !== "Trancado"} // Só libera se for Trancado
                  required
                />
              </div>

              {/* DATA TERMINO */}
              <div className="text-sm font-semibold text-gray-600 flex flex-col gap-2">
                <label>Data Término</label>
                <input
                  className="w-40 h-8 px-4 border rounded-md bg-write text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="date"
                  name="dataTermino"
                  value={form.dataTermino}
                  onChange={handleChange}
                  disabled={form.situacao !== "Finalizado"} // Só libera se for Finalizado
                />
              </div>

              {/* SITUAÇÃO */}
              <div className="text-sm font-semibold text-gray-600 flex flex-col gap-2">
                <label>Situação</label>
                <select
                  className="w-40 h-8 px-4 border rounded-md bg-write text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ref={inputFocoRef}
                  required
                  name="situacao"
                  value={form.situacao}
                  onChange={handleChange}
                >
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Trancado">Trancado</option>
                  <option value="Finalizado">Finalizado</option>
                </select>
              </div>

              {/* BOTÕES */}
              <div className="md:col-span-3 flex gap-3 mt-2">
                <button
                  className="h-[35px] flex items-center gap-2 bg-green-500 text-white px-4 rounded-md font-semibold hover:bg-green-700 transition disabled:opacity-50"
                  id="btn-salvar"
                  title="Salvar Registro"
                  type="submit"
                  disabled={loading}
                >
                  <FaSave /> Salvar [F4]
                </button>

                <button
                  className="flex items-center gap-2 bg-red-500 text-white px-4 rounded-md font-semibold hover:bg-red-700 transition disabled:opacity-50"
                  type="button"
                  title="Cancelar Operação"
                  onClick={limparForm}
                >
                  <FaTimes /> Cancelar [Esc]
                </button>
              </div>
            </form>
          )}
        </section>


        {/* LISTAGEM */}
        <section className="bg-white rounded-xl shadow-md p-4 space-y-4">
          {loading && <p className="p-4 text-gray-600">Processando...</p>}
          {/* FILTROS */}
          <div className="flex flex-wrap items-center gap-4">
            {/* ABAS */}
            <div className="flex gap-2">
              {["Em Andamento", "Trancado", "Finalizado", "Todos"].map((s) => (
                <button
                  key={s}
                  className={`px-3 py-2 rounded-md text-sm font-semibold
                  ${filtroSituacao === s ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
                  onClick={() => setFiltroSituacao(s)}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* BUSCA */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                value={buscaNome}
                onChange={(e) => setBuscaNome(e.target.value)}
                placeholder="Pesquisar por nome..."
                className="pl-9 pr-8 h-11 border rounded-md"
              />

              {buscaNome && (
                <FaTimes onClick={() => setBuscaNome("")} className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400" />
              )}
            </div>

            {/* FILTRO PROFESSORA */}
            <div className="flex items-center gap-2 text-base">
              <label>Professora</label>
              <select
                className="w-32 h-8 px-4 border rounded-md bg-write text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="professor"
                value={filtroProfessor}
                onChange={(e) => setFiltroProfessor(e.target.value)}
              >
                <option value="Todas">Todas</option>
                <option value="Cristiane">Cristiane</option>
                <option value="Daiane">Daiane</option>
              </select>
            </div>

            {/* TOTAL */}
            <span className="ml-auto bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              <FaListOl />
              Total Registros:
              <strong className="text-blue-600">{listaExibida.length}</strong>
            </span>
          </div>

          {/* TABELA */}
          <div className="overflow-x-auto rounded-md overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="text-white text-xs bg-blue-500">
                <tr>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => handleOrdenar("aluno")} title="Click na seta para ordenação">
                    Aluno / Profa.
                    {ordenacao.campo === "aluno" && (ordenacao.direcao === "asc" ? "🔼" : "🔽")}
                  </th>

                  <th className="px-4 py-3">Curso / Termo</th>

                  {filtroSituacao === "Em Andamento" && (
                    <>
                      <th className="px-4 py-3">Dia / Horário</th>

                      <th className="px-4 py-3 cursor-pointer text-center" onClick={() => handleOrdenar("data")} title="Click na seta para ordenação">
                        Data Matrícula
                        {ordenacao.campo === "data" && (ordenacao.direcao === "asc" ? "🔼" : "🔽")}
                      </th>
                    </>
                  )}

                  {filtroSituacao === "Trancado" && (
                    <>
                      <th className="px-4 py-3 cursor-pointer text-center" onClick={() => handleOrdenar("data")} title="Click na seta para ordenação">
                        Data Matrícula
                        {ordenacao.campo === "data" && (ordenacao.direcao === "asc" ? "🔼" : "🔽")}
                      </th>

                      <th className="px-4 py-3">Data Trancamento</th>
                    </>
                  )}

                  {filtroSituacao === "Finalizado" && (
                    <>
                      <th className="px-4 py-3 cursor-pointer text-center" onClick={() => handleOrdenar("data")} title="Click na seta para ordenação">
                        Data Matrícula
                        {ordenacao.campo === "data" && (ordenacao.direcao === "asc" ? "🔼" : "🔽")}
                      </th>

                      <th className="px-4 py-3">Data Conclusão</th>
                    </>
                  )}

                  {filtroSituacao === "Todos" && (
                    <>
                      <th className="px-4 py-3">Dia / Horário</th>

                      <th className="px-4 py-3 cursor-pointer text-center" onClick={() => handleOrdenar("data")} title="Click na seta para ordenação">
                        Data Matrícula
                        {ordenacao.campo === "data" && (ordenacao.direcao === "asc" ? "🔼" : "🔽")}
                      </th>

                      <th className="px-4 py-3">Data Final</th>

                      <th className="px-4 py-3">Status</th>
                    </>
                  )}

                  <th className="px-4 py-3 text-center">Ações</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td className="p-4 text-gray-600">Processando..</td>
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

                    return (
                      <tr key={m.id} className="hover:bg-gray-100">
                        <td>
                          <strong className="px-4 py-3">{m.aluno?.nome}</strong>
                          <div className="px-4 text-xs text-red-500">Profa. {m.professor}</div>
                        </td>
                        <td>
                          <strong className="px-4 py-3">{m.curso?.nome}</strong>
                          <div className="px-4 text-xs text-red-500">{m.termo_atual}º Termo</div>
                        </td>

                        {filtroSituacao === "Em Andamento" && (
                          <>
                            <td>
                              <strong className="px-4 py-3">{m.diaSemana}</strong>
                              <div className="px-4 text-xs text-red-500">{m.horario}h</div>
                            </td>

                            <td>
                              <strong className="px-4 py-3 text-center">{formatarSafe(m.dataInicio)} </strong>
                              <div className="px-4 text-xs text-blue-500">{tempoFormatado}</div>
                            </td>
                          </>
                        )}

                        {filtroSituacao === "Trancado" && (
                          <>
                            <td>
                              <strong className="px-4 py-3 text-center">{formatarSafe(m.dataInicio)}</strong>
                              <div className="px-4 text-xs text-blue-500">{tempoFormatado}</div>
                            </td>

                            <td>
                              <strong className="px-4 py-3 text-center">{formatarSafe(m.dataTrancamento)}</strong>
                            </td>
                          </>
                        )}

                        {filtroSituacao === "Finalizado" && (
                          <>
                            <td>
                              <strong className="px-4 py-3 text-center">{formatarSafe(m.dataInicio)}</strong>
                              <div className="px-4 text-xs text-blue-500">{tempoFormatado}</div>
                            </td>

                            <td>
                              <strong className="px-4 py-3 text-center">{formatarSafe(m.dataTermino)}</strong>
                            </td>
                          </>
                        )}

                        {filtroSituacao === "Todos" && (
                          <>
                            <td>
                              <strong className="px-4 py-3">{m.diaSemana}</strong>
                              <div className="px-4 text-xs text-red-500">{m.horario}h</div>
                            </td>

                            <td className="px-4 py-3 text-center">
                              <strong>{formatarSafe(m.dataInicio)}</strong>
                              <div className="px-4 text-xs text-blue-500">{tempoFormatado}</div>
                            </td>

                            <td className="px-4 py-3 text-center">
                              <strong>{formatarSafe(m.dataTermino)}</strong>
                            </td>

                            <td className="px-4 py-3" text-center>
                              {m.situacao}
                            </td>
                          </>
                        )}

                        <td className="px-4 py-3 align-middle">
                          <div className="flex justify-center gap-2">
                            <button
                              className="p-2 bg-green-400 text-white rounded-md hover:bg-green-600 transition disabled:opacity-50"
                              title="Editar Registro"
                              onClick={() => prepararEdicao(m)}
                            >
                              <FaPen />
                            </button>

                            <button
                              className="p-2 bg-red-400 text-white rounded-md hover:bg-red-600 transition disabled:opacity-50"
                              title="Excluir Registro"
                              onClick={() => excluir(m.id)}
                            >
                              <FaTrash />
                            </button>

                            <button
                              className="p-2 bg-blue-400 text-white rounded-md hover:bg-blue-600 transition disabled:opacity-50"
                              title="Gerar Carnê Mensalidade"
                              onClick={() => setConfigCarne(m)}
                            >
                              <FaPrint />
                            </button>

                            <button
                              className="p-2 bg-gray-400 text-white rounded-md hover:bg-gray-600 transition disabled:opacity-50"
                              title="Boletim Escolar"
                              onClick={() => navigate(`/boletim/${m.id}`)}
                            >
                              <FaGraduationCap />
                            </button>

                            <button
                              className="p-2 bg-blue-400 text-white rounded-md hover:bg-blue-600 transition disabled:opacity-50"
                              title="Imprimir Matrícula"
                              onClick={() => executarImpressaoMatricula(m)}
                            >
                              <FaPrint />
                            </button>

                            <button
                              className="p-2 bg-purple-400 text-white rounded-md hover:bg-purple-600 transition disabled:opacity-50"
                              title="Financeiro"
                              onClick={() => abrirFinanceiro(m)}
                            >
                              <FaMoneyBillWave />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* --- MODAIS --- */}
      {configCarne && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-lg w-[95%] max-w-[350px] shadow-lg overflow-hidden">
            {/* HEADER */}
            <div className="px-4 py-3 bg-[var(--dark)] text-white flex justify-between items-center">
              <h3 className="text-base m-0">
                Imprimir Carnê
              </h3>
              <button 
                className="cursor-pointer"
                onClick={() => setConfigCarne(null)}>
                <FaTimes />
              </button>
            </div>

            {/* CONTEÚDO */}
            <div className="p-[15px]">
              <div className="flex items-center gap-2 text-[13px]">
                <label className="font-semibold">Ano do Carnê a ser gerado: </label>
                <input 
                  className="w-[80px] border rounded-md px-2 py-1 text-center" 
                  type="number" 
                  value={anoGeracao} 
                  onChange={(e) => setAnoGeracao(e.target.value)} />
              </div>

              <button
                className="w-full mt-4 bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition"
                onClick={() => {
                  executarImpressao(configCarne, new Date().getMonth(), String(anoGeracao), true);
                  setConfigCarne(null);
                }}
              >
                Gerar PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {finSelecionado && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-lg w-[95%] max-w-[550px] shadow-lg overflow-hidden">
            {/* HEADER */}
            <div className="px-4 py-3 bg-[var(--dark)] text-white flex justify-between items-center">
              <h3 
                className="text-base m-0">
                Financeiro {finSelecionado.aluno?.nome}
              </h3>
              <button 
                className="bg-transparent border-0 text-white cursor-pointer text-[1.2rem]" 
                onClick={() => setFinSelecionado(null)}>
                <FaTimes />
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-3 max-h-[800px] overflow-y-auto">
              <table className="w-full border-collapse">
                <thead className="text-white text-xs bg-blue-500">
                  <tr>
                    <th className="px-4 py-2">Vencimento</th>
                    <th className="px-4 py-2">Valor</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Ação</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {listaParcelas.map((p) => {
                  const isPaga = p.status?.toLowerCase() === "paga";
                  const isVencida = !isPaga && new Date(p.dataVencimento) < new Date().setHours(0, 0, 0, 0);

                    return (
                      <tr key={p.id} className="hover:bg-gray-100 text-center">
                        <td className="py-1">{new Date(p.dataVencimento).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</td>

                        <td className="py-1">
                          {p.valorTotal.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </td>

                        {/* ✅ STATUS PADRONIZADO */}
                        <td>
                          <span
                            className={`px-2 py-1 text-xs rounded font-bold
                            ${isPaga && "bg-green-100 text-green-700"}
                            ${!isPaga && isVencida && "bg-red-100 text-red-600 border border-red-200"}
                            ${!isPaga && !isVencida && "bg-yellow-100 text-yellow-700"}
                            `}
                          >
                            {isPaga ? "PAGA" : isVencida ? "VENCIDA" : "ABERTA"}
                          </span>
                        </td>

                        <td className="py-1">
                          <button 
                            onClick={() => handleAcaoFinanceiro(p.id, isPaga ? "estornar" : "pagar")} 
                            className="py-1">
                            {isPaga ?
                              <FaUndo 
                                className="text-orange-500" /> 
                              : 
                              <FaCheck 
                                className="text-green-600" />
                            }
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
