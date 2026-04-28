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
import { executarImpressao } from "../../utils/geradorCarne";
import { useNavigate } from "react-router-dom";
//import "./styles.css";
import { executarImpressaoMatricula } from "../../utils/geradorMatricula";

import Input from "../../components/Input";
import InputMoeda from "../../components/InputMoeda";
import Select from "../../components/Select";
import { useShortcuts } from "../../components/useShortcuts";
import Button from "../../components/Button";

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
  const inputNomeRef = useRef(null);
  const inputBuscaRef = useRef(null);
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

  useEffect(() => {
    if (exibindoForm) {
      const timer = setTimeout(() => {
        inputNomeRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [exibindoForm]);

  // Foco no campo Busca ao carregar a página (se o form não estiver aberto)
  useEffect(() => {
    if (!exibindoForm) {
      const timer = setTimeout(() => {
        inputBuscaRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [exibindoForm]);

  /* 6. ATALHOS */
  useShortcuts({
    F2: () => !exibindoForm && setExibindoForm(true),
    F4: (e) => exibindoForm && salvar(e),
    Escape: () => exibindoForm && limparForm(),
  });

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
        novo.dataTrancamento = "";
        novo.dataTermino = hoje;
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

  const optionsAlunos = [
    { value: "", label: "Selecione o Aluno..." },
    ...alunos
      .filter((a) => a.ativo || a.id === form.aluno) // Mantém o aluno atual mesmo se inativo
      .map((a) => ({
        value: a.id,
        label: a.nome,
      })),
  ];

  const optionsCursos = [
    { value: "", label: "Selecione o Curso..." },
    ...cursos.map((a) => ({
      value: a.id,
      label: a.nome,
    })),
  ];

  return (
    <main className="p-4 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER SEMPRE VISÍVEL */}
        <header className="bg-white h-20 px-6 rounded-xl shadow-md flex justify-between items-center">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <FaChalkboardTeacher />
            {editandoId ? "Editar Matrícula" : "Matrículas"}

            {/* Opcional: Aviso visual abaixo do curso quando editando */}
            {editandoId && <small className="text-[#888] text-[11px] block mt-1">* Aluno e Curso não podem ser alterados na edição.</small>}
          </h2>

          {!exibindoForm && (
            <Button icon={FaPlus} onClick={() => setExibindoForm(true)} className="px-4">
              Nova Matricula [F2]
            </Button>
          )}
        </header>

        {exibindoForm ? (
          /* TELA 1: FORMULÁRIO */
          <section className="bg-white p-6 rounded-xl shadow-md">
            <form onSubmit={salvar} className="grid grid-cols-1 md:grid-cols-4 gap-2">
              {/* NOME */}
              <Select
                ref={inputNomeRef}
                label="Aluno"
                name="aluno"
                value={form.aluno}
                onChange={handleChange}
                options={optionsAlunos}
                required
                disabled={!!editandoId} // 🔒 Bloqueia se estiver editando
                className="w-[270px]" // Ajuste de largura se necessário
              />
              {/* CURSO */}
              <Select
                label="Curso"
                name="curso"
                value={form.curso}
                onChange={handleChange}
                options={optionsCursos}
                required
                disabled={!!editandoId} // 🔒 Bloqueia se estiver editando
                className="w-[200px]" // Ajuste de largura se necessário
              />

              {/* PROFESSOR */}
              <Select
                label="Professor"
                value={form.professor}
                onChange={handleChange}
                options={[
                  { label: "Cristiane", value: "Cristiane" },
                  { label: "Daiane", value: "Daiane" },
                ]}
                className="w-32"
              />

              {/* MODALIDADE */}
              <Select
                label="Modalidade"
                value={form.tipo}
                onChange={handleChange}
                options={[
                  { label: "Presencial", value: "Presencial" },
                  { label: "Residencial", value: "Residencial" },
                ]}
                className="w-32"
              />

              {/* FREQUENCIA */}
              <Select
                label="Frequência"
                value={form.frequencia}
                onChange={handleChange}
                options={[
                  { label: "Semanal", value: "Semanal" },
                  { label: "Quinzenal", value: "Quinzenal" },
                ]}
                className="w-32"
              />

              {/* DIA SEMANAL */}
              <Select
                label="Dia Semana"
                value={form.diaSemana}
                onChange={handleChange}
                options={[
                  { label: "Segunda", value: "Segunda" },
                  { label: "Terça", value: "Terca" },
                  { label: "Quarta", value: "Quarta" },
                  { label: "Quinta", value: "Quinta" },
                  { label: "Sexta", value: "Sexta" },
                ]}
                className="w-32"
              />

              {/* HORÁRIO */}
              <Input
                label="Horário"
                name="horario"
                value={form.horario}
                onChange={handleChange}
                placeholder="10:00"
                onBlur={validarHorarioAoSair}
                required
                className="w-20"
              />

              {/* TERMO */}
              <Input
                label="Termo Atual"
                name="termo_atual"
                value={form.termo_atual}
                onChange={handleChange}
                placeholder="Ex. 1"
                required
                className="w-20"
              />

              {/* VENCIMENTO */}
              <Select
                label="Dia Vencimento"
                name="diaVencimento"
                value={form.diaVencimento}
                onChange={handleChange}
                options={[
                  { label: "05", value: "5" },
                  { label: "10", value: "10" },
                  { label: "15", value: "15" },
                  { label: "20", value: "20" },
                  { label: "25", value: "25" },
                  { label: "30", value: "30" },
                ]}
                className="w-20"
              />

              {/* VALOR MENSALIDADE */}
              <InputMoeda
                className="w-40"
                label="Valor Mensalidade"
                name="valorMensalidade"
                value={form.valorMensalidade}
                onChange={handleChange}
                required
              />

              {/* VALOR COMBUSTIVEL */}
              <InputMoeda className="w-40" label="Valor Combustivel" name="valorCombustivel" value={form.valorCombustivel} onChange={handleChange} />

              <InputMoeda
                className="w-40"
                label="Valor Matrícula"
                name="valorMatricula"
                value={form.valorMatricula}
                onChange={handleChange}
                // onChange={(novoValor) => setForm({ ...form, valorMatricula: novoValor })} formato antigo
                required
              />

              {/* DATA INICIO */}
              <Input label="Data Início" type="date" name="dataInicio" value={form.dataInicio} onChange={handleChange} className="w-36" required />

              {/* DATA TRANCAMENTO */}
              <Input
                label="Data Trancamento"
                type="date"
                name="dataTrancamento"
                value={form.dataTrancamento}
                onChange={handleChange}
                className="w-36"
                disabled={form.situacao !== "Trancado"} // Só libera se for Trancado
              />

              {/* DATA TERMINO */}
              <Input
                label="Data Término"
                type="date"
                name="dataTermino"
                value={form.dataTermino}
                onChange={handleChange}
                className="w-36"
                disabled={form.situacao !== "Finalizado"} // Só libera se for Finalizado
              />

              {/* SITUAÇÃO */}
              <Select
                label="Situação"
                name="situacao"
                value={form.situacao}
                onChange={handleChange}
                options={[
                  { label: "Em Andamento", value: "Em Andamento" },
                  { label: "Finalizado", value: "Finalizado" },
                  { label: "Trancado", value: "Trancado" },
                ]}
                className="w-40"
              />

              {/* BOTÃO AÇÃO REGISTRO FORM */}
              <div className="md:col-span-3 flex gap-3 mt-2">
                <Button variant="green" icon={FaSave} type="submit" disabled={loading} className="px-4">
                  Salvar [F4]
                </Button>

                <Button variant="red" icon={FaTimes} onClick={limparForm} className="px-4">
                  Cancelar [Esc]
                </Button>
              </div>
            </form>
          </section>
        ) : (
          /* TELA 2: TABELA */
          <section className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col gap-2 p-2 max-h-[600px]">
            {loading && <p className="p-4 text-gray-600">Processando...</p>}

            {/* FILTROS */}
            <div className="flex flex-wrap justify-center items-center gap-4">
              {/* ABAS */}
              <div className="flex gap-2 p-2 gap-2">
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
              <div className="relative p-2">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                <Input
                  ref={inputBuscaRef}
                  value={buscaNome}
                  onChange={(e) => setBuscaNome(e.target.value)}
                  placeholder="Pesquisar por nome..."
                  className="w-64 pl-9 pr-11 h-9 rounded-md"
                />
                {buscaNome && (
                  <FaTimes onClick={() => setBuscaNome("")} className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400" />
                )}
              </div>

              <div className="relative">
                {/* FILTRO PROFESSORA */}
                <Select
                  label="Professor"
                  value={filtroProfessor}
                  onChange={(e) => setFiltroProfessor(e.target.value)}
                  options={[
                    { label: "Todas", value: "Todas" },
                    { label: "Cristiane", value: "Cristiane" },
                    { label: "Daiane", value: "Daiane" },
                  ]}
                  className="w-32"
                />
              </div>
              {/* TOTAL */}
              <span className="ml-auto bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                <FaListOl />
                Total Registros:
                <strong className="text-blue-600">{listaExibida.length}</strong>
              </span>
            </div>

            {/* TABELA */}
            <div className="overflow-y-auto w-full rounded-xl">
              <table className="w-full text-sm text-left">
                <thead className="text-white text-xs bg-blue-500 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 cursor-pointer" onClick={() => handleOrdenar("aluno")} title="Click na seta para ordenação">
                      Aluno / Profa.
                      {ordenacao.campo === "aluno" && (ordenacao.direcao === "asc" ? "🔼" : "🔽")}
                    </th>

                    <th className="px-4 py-3">Curso / Termo</th>

                    {filtroSituacao === "Em Andamento" && (
                      <>
                        <th className="px-4 py-3">Dia / Horário</th>

                        <th
                          className="px-4 py-3 cursor-pointer text-center"
                          onClick={() => handleOrdenar("data")}
                          title="Click na seta para ordenação"
                        >
                          Data Matrícula
                          {ordenacao.campo === "data" && (ordenacao.direcao === "asc" ? "🔼" : "🔽")}
                        </th>
                      </>
                    )}

                    {filtroSituacao === "Trancado" && (
                      <>
                        <th
                          className="px-4 py-3 cursor-pointer text-center"
                          onClick={() => handleOrdenar("data")}
                          title="Click na seta para ordenação"
                        >
                          Data Matrícula
                          {ordenacao.campo === "data" && (ordenacao.direcao === "asc" ? "🔼" : "🔽")}
                        </th>

                        <th className="px-4 py-3">Data Trancamento</th>
                      </>
                    )}

                    {filtroSituacao === "Finalizado" && (
                      <>
                        <th
                          className="px-4 py-3 cursor-pointer text-center"
                          onClick={() => handleOrdenar("data")}
                          title="Click na seta para ordenação"
                        >
                          Data Matrícula
                          {ordenacao.campo === "data" && (ordenacao.direcao === "asc" ? "🔼" : "🔽")}
                        </th>

                        <th className="px-4 py-3">Data Conclusão</th>
                      </>
                    )}

                    {filtroSituacao === "Todos" && (
                      <>
                        <th className="px-4 py-3">Dia / Horário</th>

                        <th
                          className="px-4 py-3 cursor-pointer text-center"
                          onClick={() => handleOrdenar("data")}
                          title="Click na seta para ordenação"
                        >
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

                <tbody className="divide-y bg-white">
                  {listaExibida.length > 0 ? (
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
                              <Button
                                variant="green"
                                icon={FaPen}
                                onClick={() => prepararEdicao(m)}
                                title="Editar Registro"
                                className="p-2" // Sobrescrevendo o padding padrão se necessário
                              />
                              <Button variant="red" icon={FaTrash} onClick={() => excluir(m.id)} title="Excluir Registro" className="p-2" />

                              <Button
                                variant="blue"
                                icon={FaPrint}
                                onClick={() => setConfigCarne(m)}
                                title="Gerar Carnê Mensalidade"
                                className="p-2"
                              />

                              <Button
                                variant="gray"
                                icon={FaGraduationCap}
                                onClick={() => navigate(`/boletim/${m.id}`)}
                                title="Boletim Escolar"
                                className="p-2"
                              />

                              <Button
                                variant="blue"
                                icon={FaPrint}
                                onClick={() => executarImpressaoMatricula(m)}
                                title="Imprimir Matrícula"
                                className="p-2"
                              />

                              <Button variant="purple" icon={FaMoneyBillWave} onClick={() => abrirFinanceiro(m)} title="Financeiro" className="p-2" />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-10 text-gray-400">
                        Nenhum registro encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {/* --- MODAIS --- */}
      {configCarne && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-lg w-[95%] max-w-[350px] shadow-lg overflow-hidden">
            {/* HEADER */}
            <div className="px-4 py-3 bg-[var(--dark)] text-white flex justify-between items-center">
              <h3 className="text-base m-0">Imprimir Carnê</h3>
              <Button variant="red" icon={FaTimes} onClick={() => setConfigCarne(null)} className="p-2" />
            </div>

            {/* CONTEÚDO */}
            <div className="p-[15px] flex flex-col items-center gap-4">
              <div className="flex items-center justify-center gap-2 text-[13px]">
                <label className="font-semibold">Ano do Carnê a ser gerado: </label>
                <Input type="number" value={anoGeracao} onChange={(e) => setAnoGeracao(e.target.value)} placeholder="2026" className="w-20" />
              </div>

              <Button
                variant="blue"
                title="Imprimir Carnê"
                onClick={() => {
                  executarImpressao(configCarne, new Date().getMonth(), String(anoGeracao), true);
                  setConfigCarne(null);
                }}
                className="px-6" // Aumentei o padding lateral para o texto respirar
              >
                Gerar PDF
              </Button>
            </div>
          </div>
        </div>
      )}

      {finSelecionado && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-lg w-[95%] max-w-[550px] shadow-lg overflow-hidden">
            {/* HEADER */}
            <div className="px-4 py-3 bg-[var(--dark)] text-white flex justify-between items-center">
              <h3 className="text-base m-0">Financeiro: {finSelecionado.aluno?.nome}</h3>
              <Button variant="red" icon={FaTimes} onClick={() => setFinSelecionado(null)} className="p-2" />
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

                        <td className="py-1 flex justify-center items-center">
                          <Button
                            variant={isPaga ? "yellow" : "green"}
                            icon={isPaga ? FaUndo : FaCheck}
                            onClick={() => handleAcaoFinanceiro(p.id, isPaga ? "estornar" : "pagar")}
                            className="p-2"
                            // Dica: adicione um título para acessibilidade
                            title={isPaga ? "Estornar Pagamento" : "Confirmar Pagamento"}
                          />
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
