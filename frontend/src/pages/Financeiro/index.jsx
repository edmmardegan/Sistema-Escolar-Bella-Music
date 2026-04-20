//Local: /src/pages/Financeiro/index.jsx

import React, { useState, useEffect, useCallback } from "react";
import { FaDollarSign, FaMagic, FaTrash, FaFilter, FaCheck, FaUndo, FaHandHoldingUsd, FaListOl, FaTimes, FaSearch } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import api from "../../services/api";

export default function Financeiro() {
  const [searchParams, setSearchParams] = useSearchParams();
  const alunoIdViaUrl = searchParams.get("alunoId");

  // --- ESTADOS ---
  const [registros, setRegistros] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filtros de visualização
  const [buscaNome, setBuscaNome] = useState("");
  const [mesFiltro, setMesFiltro] = useState(alunoIdViaUrl ? 0 : new Date().getMonth() + 1);
  const [anoFiltro, setAnoFiltro] = useState(new Date().getUTCFullYear());
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [professorFiltro, setProfessorFiltro] = useState("Todas");

  // Geração de Lotes
  const [mesGerar, setMesGerar] = useState(new Date().getMonth() + 1);
  const [anoGerar, setAnoGerar] = useState(new Date().getFullYear());

  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  // --- CARREGAMENTO ---
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

  // --- LÓGICA DE FILTRAGEM ---
  // --- LÓGICA DE FILTRAGEM AJUSTADA ---
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

  // --- AÇÕES ---
  const handleAcao = async (id, tipo) => {
    try {
      tipo === "pagar" ? await api.pagar(id) : await api.estornar(id);
      carregar();
    } catch (e) {
      alert("Erro na operação.");
    }
  };

  const handleGerarLote = async () => {
    if (!window.confirm(`Gerar parcelas de ${meses[mesGerar - 1]}/${anoGerar} até Dezembro?`)) return;
    try {
      setLoading(true);
      await api.gerarParcelaGlobal({ mes: Number(mesGerar), ano: Number(anoGerar) });
      alert("Parcelas geradas!");
      carregar();
    } catch (e) {
      alert("Erro ao gerar lote.");
    } finally {
      setLoading(false);
    }
  };

  // --- FORMATAÇÃO ---
  const fMoeda = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const fData = (d) => (d ? new Date(d).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "-");

  const totalPago = filtrados.filter((i) => i.status === "Paga").reduce((acc, curr) => acc + Number(curr.valorTotal || 0), 0);
  const totalAberto = filtrados.filter((i) => i.status === "Aberta").reduce((acc, curr) => acc + Number(curr.valorTotal || 0), 0);

  const limparFiltros = () => {
    setBuscaNome("");
    const mesAtual = new Date().getMonth() + 1;
    setMesFiltro(alunoIdViaUrl ? 0 : mesAtual);
    setAnoFiltro(new Date().getUTCFullYear());
    setStatusFiltro("Todos");
    setProfessorFiltro("Todas");
  };

  return (
    <main className="p-4 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* CARD FORM */}
        <section className="bg-white rounded-xl shadow-md p-6 ">
          {/* HEADER */}
          <div className="flex justify-between items-center flex-wrap gap-3">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
              <FaDollarSign /> Financeiro Global
            </h2>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold">Lote:</span>

              <select 
                className="h-10 px-3 border rounded-md" 
                value={mesGerar} 
                onChange={(e) => setMesGerar(e.target.value)}
                >
                {meses.map((m, i) => (
                  <option key={i} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>

              <input 
                type="number" 
                className="h-10 px-3 border rounded-md w-20" 
                value={anoGerar} 
                onChange={(e) => setAnoGerar(e.target.value)}
              />

              <button
                onClick={handleGerarLote}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 h-10 rounded-md"
              >
                <FaMagic /> Gerar
              </button>
            </div>
          </div>

          {/* RESUMO */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg border bg-green-50 border-green-200 text-green-800">
              <FaCheck className="text-lg opacity-70" />
              <div>
                <span className="text-xs font-bold uppercase block">Total Pago</span>
                <strong className="text-2xl">{fMoeda(totalPago)}</strong>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-2 rounded-lg border bg-yellow-50 border-yellow-200 text-yellow-700">
              <FaHandHoldingUsd className="text-lg opacity-70" />
              <div>
                <span className="text-xs font-bold uppercase block">Em Aberto</span>
                <strong className="text-2xl">{fMoeda(totalAberto)}</strong>
              </div>
            </div>

            {/* TOTAL */}
            <div className="ml-auto self-end ">
            <span className="bg-gray-200 px-3 py-1 rounded-full text-sm flex items-end gap-2">
              <FaListOl />
              Total Registros:
              <strong className="text-[var(--primary)]">{filtrados.length}</strong>
            </span>
            </div>
          </div>

          {/* FILTROS */}
          <div className="flex flex-wrap gap-3 border-t pt-4">
            {/* BUSCA */}
            <div className="flex flex-col flex-1 min-w-[220px]">
              <label className="text-xs font-bold mb-1 text-gray-600">Pesquisar Aluno</label>

              <div className="relative">
                <input
                  type="text"
                  value={buscaNome}
                  onChange={(e) => setBuscaNome(e.target.value)}
                  placeholder="Pesquisar por nome..."
                  className="w-full h-10 pl-10 pr-10 border rounded-md"
                />

                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                {buscaNome && (
                  <FaTimes
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-red-500"
                    onClick={() => {
                      setBuscaNome("");
                      setSearchParams({});
                      setMesFiltro(new Date().getMonth() + 1);
                    }}
                  />
                )}
              </div>
            </div>

            {/* MÊS */}
            <div className="flex flex-col">
              <label className="text-xs font-bold mb-1 text-gray-600">Mês</label>
              <select 
                className="h-10 px-3 border rounded-md" 
                value={mesFiltro} 
                onChange={(e) => setMesFiltro(e.target.value)}
              >
                <option value="0">Todos</option>
                {meses.map((n, i) => (
                  <option key={i} value={i + 1}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            {/* ANO */}
            <div className="flex flex-col">
              <label className="text-xs font-bold mb-1 text-gray-600">Ano</label>
              <input 
                type="number" 
                className="h-10 px-3 border rounded-md w-24" 
                value={anoFiltro} 
                onChange={(e) => setAnoFiltro(e.target.value)} />
            </div>

            {/* PROFESSOR */}
            <div className="flex flex-col">
              <label className="text-xs font-bold mb-1 text-gray-600">Professora</label>
              <select 
                className="h-10 px-3 border rounded-md" 
                value={professorFiltro} 
                onChange={(e) => setProfessorFiltro(e.target.value)}
              >
                <option value="Todas">Todas</option>
                <option value="Cristiane">Cristiane</option>
                <option value="Daiane">Daiane</option>
              </select>
            </div>

            {/* STATUS */}
            <div className="flex flex-col">
              <label className="text-xs font-bold mb-1 text-gray-600">Status</label>
              <select 
                className="h-10 px-3 border rounded-md" 
                value={statusFiltro} 
                onChange={(e) => setStatusFiltro(e.target.value)}
              >
                <option value="Todos">Todos</option>
                <option value="Aberta">Em Aberto</option>
                <option value="Paga">Pagos</option>
              </select>
            </div>

            {/* LIMPAR */}
            <div className="flex items-end">
              <button 
                className="h-10 px-4 rounded-md border bg-gray-100 hover:bg-gray-200"
                onClick={limparFiltros}>
                🧹 Limpar
              </button>
            </div>
          </div>
        </section>

        {/* TABELA */}
          <div className="overflow-x-auto rounded-md overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="text-white text-xs bg-blue-500">
              <tr>
                <th className="px-2 py-2">Vencimento</th>
                <th className="px-2 py-2">Aluno / Professor</th>
                <th className="px-2 py-2">Valor</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Ações</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="text-center py-10 text-gray-400">
                    Carregando dados...
                  </td>
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
                              <button onClick={() => handleAcao(p.id, "pagar")} 
                                className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-md">
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
    </main>
  );
}
