//Local: /src/pages/Financeiro/index.jsx

/* 1. IMPORTS */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaDollarSign, FaMagic, FaTrash, FaFilter, FaCheck, FaUndo, FaHandHoldingUsd, FaListOl, FaTimes, FaSearch } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import api from "../../services/api";

/* 1.1 IMPORTS COMPONENTS*/
import Input from "../../components/Input";
import Button from "../../components/Button";
import Select from "../../components/Select";
import { useShortcuts } from "../../components/useShortcuts";

export default function Financeiro() {
  /* 3. ESTADOS E REFS */
  const [searchParams, setSearchParams] = useSearchParams();
  const alunoIdViaUrl = searchParams.get("alunoId");
  const [registros, setRegistros] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputNomeRef = useRef(null);
  // Filtros de visualização
  const [buscaNome, setBuscaNome] = useState("");
  const [mesFiltro, setMesFiltro] = useState(alunoIdViaUrl ? 0 : new Date().getMonth() + 1);
  const [anoFiltro, setAnoFiltro] = useState(new Date().getUTCFullYear());
  const [statusFiltro, setStatusFiltro] = useState("Todos"); //Status validos "Aberta", "Paga"
  const [professorFiltro, setProfessorFiltro] = useState("Todas");
  // Geração de Lotes
  const [mesGerar, setMesGerar] = useState(new Date().getMonth() + 1);
  const [anoGerar, setAnoGerar] = useState(new Date().getFullYear());
  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const opcoesMeses = [{ label: "Todos", value: 0 }, ...meses.map((m, i) => ({ label: m, value: i + 1 }))];
  const opcoesMesesGerar = [...meses.map((m, i) => ({ label: m, value: i + 1 }))];

  // Formatação
  const fMoeda = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const fData = (d) => (d ? new Date(d).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "-");
  // Somatoria
  const totalPago = filtrados.filter((i) => i.status === "Paga").reduce((acc, curr) => acc + Number(curr.valorTotal || 0), 0);
  const totalAberto = filtrados.filter((i) => i.status === "Aberta").reduce((acc, curr) => acc + Number(curr.valorTotal || 0), 0);

  /* 4. CARREGAMENTO (Callbacks) */
  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getAllFinanceiro();
      const dados = Array.isArray(res) ? res : [];
      setRegistros(dados);
      return dados; // Retorna para o useEffect de inicialização
    } catch (e) {
      console.error("Erro ao carregar financeiro:", e);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /* 5. EFEITOS (useEffect) */
  // SINCRONIZAÇÃO COM A URL (Matrícula -> Financeiro)
  useEffect(() => {
    async function inicializar() {
      const dados = await carregar();

      if (alunoIdViaUrl && dados.length > 0) {
        const encontrado = dados.find(
          (r) => String(r.aluno?.id) === String(alunoIdViaUrl) || String(r.matricula?.aluno?.id) === String(alunoIdViaUrl),
        );

        if (encontrado) {
          const nome = encontrado.aluno?.nome || encontrado.matricula?.aluno?.nome;
          setBuscaNome(nome || "");
          setMesFiltro(0); // Abre para "Todos" para ver histórico
        }
      }
    }
    inicializar();
  }, [carregar, alunoIdViaUrl]);

  useEffect(() => {
    if (!registros || registros.length === 0) {
      setFiltrados([]);
      return;
    }

    const lista = registros.filter((item) => {
      const dataBruta = item.dataVencimento || item.data_vencimento;
      const dataVenc = new Date(dataBruta);
      const dataValida = !isNaN(dataVenc.getTime());

      // 1. Filtro por Nome (Sempre ativo)
      const nomeAluno = (item.aluno?.nome || item.matricula?.aluno?.nome || "").toLowerCase();
      const matchNome = nomeAluno.includes(buscaNome.toLowerCase());

      // 2. Filtro de Mês:
      // Se mesFiltro for 0 (Todos), retorna true.
      // Se não, compara com o mês da parcela.
      const matchMes = Number(mesFiltro) === 0 ? true : dataValida && dataVenc.getUTCMonth() + 1 === Number(mesFiltro);

      // 3. Filtro de Ano:
      // Se anoFiltro for 0, retorna true.
      // Se não, compara com o ano da parcela.
      const matchAno = Number(anoFiltro) === 0 ? true : dataValida && dataVenc.getUTCFullYear() === Number(anoFiltro);

      // 4. Status e Professor
      const matchStatus = statusFiltro === "Todos" ? true : item.status === statusFiltro;
      const profDaParcela = (item.matricula?.professor || "").toLowerCase();
      const matchProf = professorFiltro === "Todas" ? true : profDaParcela.includes(professorFiltro.toLowerCase());

      return matchNome && matchMes && matchAno && matchStatus && matchProf;
    });

    setFiltrados(lista);
  }, [registros, buscaNome, mesFiltro, anoFiltro, statusFiltro, professorFiltro]);

  useEffect(() => {
    if (carregar && inputNomeRef.current) {
      setTimeout(() => inputNomeRef.current.focus(), 100);
    }
  }, [carregar]);

  /* 6. ATALHOS */
  useShortcuts({
    F2: (e) => handleGerarLote(e),
  });

  /* 7. FUNÇÕES DE MANIPULAÇÃO (Ações) */
  const handleAcao = async (id, tipo) => {
    try {
      tipo === "pagar" ? await api.pagar(id) : await api.estornar(id);
      carregar();
    } catch (e) {
      alert("Erro na operação.");
    }
  };

  const handleGerarLote = async () => {
    const m = parseInt(mesGerar, 10);
    const a = parseInt(anoGerar, 10);

    console.log("DADOS QUE VÃO PARA API =>", { mes: mesGerar, ano: anoGerar });

    if (!m || !a) {
      alert("Mês ou Ano inválidos");
      return;
    }

    if (!window.confirm(`Gerar parcelas de ${meses[mesGerar - 1]}/${anoGerar}`)) return;
    try {
      setLoading(true);
      await api.gerarParcelaGlobal({ mes: m, ano: a });
      alert("Parcelas geradas!");

      // Força os filtros de visualização a serem iguais ao que foi gerado
      setMesFiltro(Number(mesGerar));
      setAnoFiltro(Number(anoGerar));
      setBuscaNome(""); // Limpa busca de nome para ver o lote todo
      setStatusFiltro("Todos");

      await carregar();
    } catch (e) {
      alert("Erro ao gerar lote.");
    } finally {
      setLoading(false);
    }
  };

  const limparFiltros = () => {
    setBuscaNome("");
    const mesAtual = new Date().getMonth() + 1;
    setMesFiltro(alunoIdViaUrl ? 0 : mesAtual);
    setAnoFiltro(new Date().getUTCFullYear());
    setStatusFiltro("Todos");
    setProfessorFiltro("Todas");
  };

  return (
    <main className="p-4 bg-gray-100 h-screen flex flex-col overflow-hidden">
      <div className="max-w-6xl mx-auto w-full flex flex-col h-full space-y-4">
        {/* HEADER SEMPRE VISÍVEL (Filtros e Resumo) */}
        <header className="bg-white h-20 px-6 rounded-xl shadow-md flex justify-between items-center">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <FaDollarSign /> Financeiro Global
          </h2>
        </header>

        <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col flex-1 min-h-0">
          <div className="p-3 gap-3 w-full h-full">
            {/* TABELA */} {/* ÁREA DA TABELA COM ROLAGEM PRÓPRIA */}
            <div className="bg-white rounded-xl shadow-md flex flex-col flex-1 min-h-0">
              {/* RESUMO E TOTAL */}
              <div className="mr-4 flex gap-3 items-center  justify-center ">
                {/*Total Pago*/}
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg border bg-green-50 border-green-200 text-green-800">
                  <FaCheck className="text-lg opacity-70" />
                  <div>
                    <span className="text-xs font-bold uppercase block">Total Pago</span>
                    <strong className="text-2xl">{fMoeda(totalPago)}</strong>
                  </div>
                </div>
                {/*Total Em aberto*/}
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg border bg-yellow-50 border-yellow-200 text-yellow-700">
                  <FaHandHoldingUsd className="text-lg opacity-70" />
                  <div>
                    <span className="text-xs font-bold uppercase block">Em Aberto</span>
                    <strong className="text-2xl">{fMoeda(totalAberto)}</strong>
                  </div>
                </div>
                {/*Geração em Lote*/}
                <div className="flex flex-end ml-auto items-center gap-3 p-4 rounded-lg border bg-gray-50 border-gray-200 ">
                  <span className="text-xs font-bold text-red-800">Geração em Lote:</span>

                  {/* MÊS GERAR */}
                  <Select
                    label="Mês Gerar"
                    name="mesGerar"
                    value={mesGerar}
                    onChange={(e) => setMesGerar(Number(e.target.value))}
                    options={opcoesMesesGerar}
                    className="w-32"
                  />

                  {/* ANO GERAR */}
                  <Input
                    label="Ano Gerar"
                    type="number"
                    value={anoGerar}
                    onChange={(e) => setAnoGerar(e.target.value)}
                    placeholder="2026"
                    className="w-20"
                  />
                  <Button variant="blue" icon={FaMagic} onClick={handleGerarLote} disabled={loading} className="px-4">
                    Gerar [F2]
                  </Button>
                </div>
              </div>
              {/* DEMAIS FILTROS */}
              <div className="gap-2 mt-4 flex items-center justify-center rounded-lg">
                {/* 3. PESQUISAR (CENTRALIZADO NO GRID - OCUPA 2 COLUNAS) */}
                <div className="md:col-span-2  flex flex-col">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      ref={inputNomeRef}
                      value={buscaNome}
                      onChange={(e) => setBuscaNome(e.target.value)}
                      placeholder="Pesquisar aluno..."
                      className="pl-9 pr-11 h-9"
                    />
                    {buscaNome && (
                      <FaTimes onClick={() => setBuscaNome("")} className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400" />
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-auto">
                  {/* 2. FILTROS MENORES (MÊS, ANO, STATUS) */}
                  {/* MÊS */}
                  <Select
                    label="Mês de Referência"
                    name="mesReferencia"
                    value={mesFiltro}
                    onChange={(e) => setMesFiltro(e.target.value)}
                    options={opcoesMeses}
                    className="w-32"
                  />

                  {/* ANO */}
                  <Input
                    label="Ano"
                    type="number"
                    value={anoFiltro}
                    onChange={(e) => setAnoFiltro(e.target.value)}
                    placeholder="2026"
                    className="w-20"
                  />

                  {/* PROFESSOR */}
                  <Select
                    label="Professor"
                    value={professorFiltro}
                    onChange={(e) => setProfessorFiltro(e.target.value)}
                    options={[
                      { label: "Todas", value: "Todas" },
                      { label: "Cristiane", value: "Cristiane" },
                      { label: "Daiane", value: "Daiane" },
                    ]}
                    className="w-32"
                  />

                  {/* STATUS */}
                  <Select
                    label="Status"
                    value={statusFiltro}
                    onChange={(e) => setStatusFiltro(e.target.value)}
                    options={[
                      { label: "Todos", value: "Todos" },
                      { label: "Em Aberto", value: "Aberta" },
                      { label: "Pagos", value: "Paga" },
                    ]}
                    className="w-32"
                  />

                  {/* 4. STATUS/LIMPAR */}
                  <div className="flex p-4 justify-center items-center">
                    <button className="h-8 px-2 rounded-md border bg-gray-100 hover:bg-gray-200 text-xs" onClick={limparFiltros}>
                      🧹 Limpar
                    </button>
                  </div>
                </div>

                {/* 5. TOTAL REGISTROS (EXTREMA DIREITA) */}
                <div className="ml-auto ">
                  <span className="bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <FaListOl /> Total de Registros:
                    <strong className="text-blue-600">{filtrados.length}</strong>
                  </span>
                </div>
              </div>
            </div>
            <div className="overflow-y-auto w-full h-full">
              <table className="w-full text-sm text-left">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-blue-600 text-white">
                    <th className="px-2 py-2">Vencimento</th>
                    <th className="px-2 py-2">Aluno / Professor</th>
                    <th className="px-2 py-2">Valor</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-2 py-2">Ações</th>
                  </tr>
                </thead>

                <tbody className="divide-y bg-white">
                  {loading ? (
                    <tr>
                      <td className="text-center py-10 text-gray-400">Carregando dados...</td>
                    </tr>
                  ) : (
                    filtrados.map((p) => {
                      const isPaga = p.status?.toLowerCase() === "paga";
                      const isVencida = !isPaga && new Date(p.dataVencimento) < new Date().setHours(0, 0, 0, 0);

                      return (
                        <tr key={p.id} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-3">{fData(p.dataVencimento)}</td>

                          <td className="px-4 py-3">
                            <strong>{p.aluno?.nome || p.matricula?.aluno?.nome || "Sem Nome"}</strong>
                            <div className="text-xs text-red-500">Profa. {p.matricula?.professor || "---"}</div>
                          </td>

                          <td className="px-4 py-3 font-semibold">{fMoeda(p.valorTotal)}</td>

                          <td className="px-4 py-3">
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

                          <td className="px-4 py-3">
                            <div className="flex justify-center gap-2">
                              {!isPaga ? (
                                <>
                                  <button
                                    onClick={() => handleAcao(p.id, "pagar")}
                                    className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
                                  >
                                    <FaCheck />
                                  </button>

                                  <button
                                    onClick={async () => {
                                      if (window.confirm("Excluir?")) {
                                        await api.deleteParcela(p.id);
                                        carregar();
                                      }
                                    }}
                                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
                                  >
                                    <FaTrash />
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleAcao(p.id, "estornar")}
                                  className="p-2 bg-orange-400 hover:bg-orange-500 text-white rounded-md"
                                >
                                  <FaUndo />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
