/* 1. IMPORTS */
import React, { useEffect, useState, useCallback } from "react";
import { FaFilter, FaMusic, FaListOl, FaSearch, FaTimes } from "react-icons/fa"; // Adicionado FaTimes
import api from "../../services/api";

/* 1.1 IMPORTS COMPONENTS*/
import Input from "../../components/Input";
import Select from "../../components/Select";

export const AuditLogs = () => {
  /* --- FUNÇÕES AUXILIARES (Devem vir antes dos estados) --- */
  const formatarParaInput = (data) => data.toISOString().split("T")[0];
  const formatDataTabela = (data) => new Date(data).toLocaleString("pt-BR");

  // Cálculo das datas padrão
  const hojeObjeto = new Date();
  const trintaDiasAtrasObjeto = new Date();
  trintaDiasAtrasObjeto.setDate(hojeObjeto.getDate() - 30);

  /* 3. ESTADOS */
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [busca, setBusca] = useState("");
  const [operacao, setOperacao] = useState("");
  const [limite, setLimite] = useState(20);

  // Inicializando datas com o padrão de 30 dias
  const [dataInicio, setDataInicio] = useState(formatarParaInput(trintaDiasAtrasObjeto));
  const [dataFim, setDataFim] = useState(formatarParaInput(hojeObjeto));

  /* 4. CARREGAMENTO (Callbacks) */
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const dados = await api.getAudit({
        busca, // O back espera "busca"
        dataInicio,
        dataFim,
        operacao,
        limite,
      });

      setLogs(Array.isArray(dados) ? dados : []);
    } catch (err) {
      setError("Não foi possível carregar os logs de auditoria.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [busca, dataInicio, dataFim, operacao, limite]);

  /* 5. EFEITOS (useEffect) */
  useEffect(() => {
    const timer = setTimeout(fetchLogs, 500);
    return () => clearTimeout(timer);
  }, [fetchLogs]);

  /* 7. FUNÇÕES DE MANIPULAÇÃO */
  const limparFiltros = () => {
    setBusca("");
    setOperacao("");
    setLimite(20);
    setDataInicio(formatarParaInput(trintaDiasAtrasObjeto));
    setDataFim(formatarParaInput(hojeObjeto));
  };

  return (
    <main className="p-4 bg-gray-100 h-screen flex flex-col overflow-hidden">
      <div className="max-w-7xl mx-auto w-full flex flex-col h-full space-y-4">
        {/* HEADER */}
        <header className="bg-white rounded-xl shadow-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaMusic />
              🕵️ Auditoria do Sistema
            </h2>
          </div>

          {/* FILTROS */}
          <div className="flex flex-wrap items-center gap-4 justify-between">
            {/* BUSCA */}
            <div className="flex items-center gap-2 flex-1 min-w-[300px]">
              <FaFilter className="text-gray-400" />
              <div className="relative w-full">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Pesquisar por usuário ou tabela..."
                  className="w-full pl-9 pr-10 h-9"
                />
                {busca && (
                  <FaTimes
                    onClick={() => setBusca("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-red-500"
                  />
                )}
              </div>
            </div>

            {/* DEMAIS FILTROS */}
            <div className="flex flex-wrap gap-3 items-end">
              <Input label="Início" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="w-36" />

              <Input label="Fim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="w-36" />

              <Select
                label="Operação"
                value={operacao}
                onChange={(e) => setOperacao(e.target.value)}
                options={[
                  { label: "Todas", value: "" },
                  { label: "Insert", value: "INSERT" }, // Ajustado para bater com o case do seu CSS/Banco
                  { label: "Update", value: "UPDATE" },
                  { label: "Delete", value: "DELETE" },
                ]}
                className="w-32"
              />

              <Select
                label="Limite"
                value={limite}
                onChange={(e) => setLimite(Number(e.target.value))}
                options={[
                  { label: "20", value: 20 },
                  { label: "50", value: 50 },
                  { label: "100", value: 100 },
                  { label: "500", value: 500 },
                ]}
                className="w-20"
              />

              <button
                className="h-9 px-4 rounded-md border bg-gray-100 hover:bg-gray-200 text-sm font-medium transition-colors"
                onClick={limparFiltros}
              >
                🧹 Limpar
              </button>
            </div>
          </div>

          {/* INDICADORES DE STATUS */}
          <div className="mt-4 flex justify-between items-center border-t pt-2">
            <div className="flex gap-4 items-center">
              {error && <span className="text-red-500 text-sm font-semibold">{error}</span>}
              {loading && <span className="text-blue-500 text-xs animate-pulse">Atualizando dados...</span>}
            </div>

            <div className="bg-gray-100 px-4 py-1 rounded-full border">
              <span className="text-sm flex items-center gap-2">
                <FaListOl /> Total nesta visualização: <strong className="text-blue-600">{logs.length}</strong>
              </span>
            </div>
          </div>
        </header>

        {/* TABELA - Mantive sua estrutura de colunas */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden flex-1 flex flex-col">
          <div className="overflow-auto">
            <table className="w-full table-fixed text-sm border-collapse">
              <colgroup>
                <col className="w-[150px]" />
                <col className="w-[130px]" />
                <col className="w-[100px]" />
                <col className="w-64" />
                <col className="w-[100px]" />
                <col className="w-96" />
              </colgroup>

              <thead className="text-white text-xs bg-blue-500 sticky top-0 z-10">
                <tr>
                  <th className="p-3 text-left">Data/Hora</th>
                  <th className="p-3 text-left">Usuário</th>
                  <th className="p-3 text-left">Tabela</th>
                  <th className="p-3 text-left">Contexto</th>
                  <th className="p-3 text-left">Operação</th>
                  <th className="p-3 text-center">Mudanças (De ➔ Para)</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {logs.length === 0 && !loading ? (
                  <tr>
                    <td colSpan="6" className="text-center p-10 text-gray-400">
                      Nenhum registro encontrado para este período.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-3 text-xs">{formatDataTabela(log.created_at)}</td>
                      <td className="p-3 font-semibold text-gray-700">{log.user_name}</td>
                      <td className="p-3">
                        <span className="bg-gray-100 px-2 py-1 rounded text-[10px] uppercase font-bold text-gray-600 border">{log.table_name}</span>
                      </td>
                      <td className="p-3 text-gray-600 italic text-xs">{log.context}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-black
                            ${log.action === "INSERT" ? "bg-green-100 text-green-700" : ""}
                            ${log.action === "UPDATE" ? "bg-blue-100 text-blue-700" : ""}
                            ${log.action === "DELETE" ? "bg-red-100 text-red-700" : ""}
                        `}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2 items-center">
                          <div className="flex-1 bg-red-50 border border-red-100 p-2 rounded h-24 overflow-auto text-[10px] font-mono">
                            <pre className="text-red-800">{JSON.stringify(log.old_values, null, 2)}</pre>
                          </div>
                          <div className="text-blue-500 font-bold">➔</div>
                          <div className="flex-1 bg-green-50 border border-green-100 p-2 rounded h-24 overflow-auto text-[10px] font-mono">
                            <pre className="text-green-800">{JSON.stringify(log.new_values, null, 2)}</pre>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AuditLogs;
