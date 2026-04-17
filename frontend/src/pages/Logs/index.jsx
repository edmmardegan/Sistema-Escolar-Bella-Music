//Local: /src/pages/Logs/index.jsx

import React, { useEffect, useState, useCallback } from "react";
import { FaFilter, FaMusic, FaListOl } from "react-icons/fa";
import api from "../../services/api";

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [busca, setBusca] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [operacao, setOperacao] = useState("");
  const [limite, setLimite] = useState(20);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const dados = await api.getAudit({
        busca,
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

  useEffect(() => {
    const timer = setTimeout(fetchLogs, 500);
    return () => clearTimeout(timer);
  }, [fetchLogs]);

  const limparFiltros = () => {
    setBusca("");
    setDataInicio("");
    setDataFim("");
    setOperacao("");
  };

  const formatData = (data) => new Date(data).toLocaleString("pt-BR");

  if (loading && logs.length === 0) {
    return <div className="ml-[100px] p-4">Carregando auditoria...</div>;
  }

  return (
    <main className="p-4 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* CARD */}
        <section className="bg-white rounded-xl shadow-md p-2">
          {/* HEADER */}
          <div className="flex justify-between items-center flex-wrap gap-3 mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaMusic />
              🕵️ Auditoria do Sistema
            </h2>
          </div>
          {/* FILTROS */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <FaFilter className="text-gray-400" />
            {/* BUSCA */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Pesquisar usuário, tabela ou conteúdo..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full h-[38px] border rounded-md pl-9 pr-9 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>

              {busca && (
                <span
                  onClick={() => setBusca("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-red-500"
                >
                  ✖
                </span>
              )}
            </div>
            {/* DATAS */}
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="h-[38px] border rounded-md px-2 text-sm"
            />
            <span className="text-sm">até</span>
            <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="h-[38px] border rounded-md px-2 text-sm" />
            {/* SELECT OPERAÇÃO */}
            <select value={operacao} onChange={(e) => setOperacao(e.target.value)} className="h-[38px] border rounded-md px-2 text-sm">
              <option value="">Todas Operações</option>
              <option value="INSERT">INSERT</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
            </select>
            {/* LIMITE */}
            <select value={limite} onChange={(e) => setLimite(Number(e.target.value))} className="h-[38px] border rounded-md px-2 text-sm">
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="500">500</option>
            </select>
            {/* BOTÃO */}
            <button onClick={limparFiltros} className="flex items-center gap-2 h-[38px] px-4 border rounded-md bg-gray-100 hover:bg-gray-200 text-sm">
              🧹 Limpar
            </button>
          </div>

          {/* TOTAL */}
          <div className="flex justify-end">
            <span className="bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              <FaListOl /> Total de Registros: {logs.length}
            </span>
          </div>
          
          {/* ERRO */}
          {error && <div className="text-red-500 mb-2">{error}</div>}
          {/* LOADING */}
          {loading && <div className="text-sm text-gray-500 mb-2">Atualizando resultados...</div>}
        </section>

        {/* TABELA */}
        <section className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-sm border-collapse items-center">
              <colgroup>
                <col className="w-[70px]" />
                <col className="w-[130px]" />
                <col className="w-[50px]" />
                <col className="w-64" />
                <col className="w-[60px]" />
                <col className="w-96" />
              </colgroup>

              <thead className="text-white text-xs bg-blue-500">
                <tr>
                  <th className="p-2">Data/Hora</th>
                  <th className="p-2">Usuário</th>
                  <th className="p-2">Tabela</th>
                  <th className="p-2">Contexto</th>
                  <th className="p-2">Operação</th>
                  <th className="px-4 py-3 text-center">Mudanças</th>
                </tr>
              </thead>

              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-6 text-gray-400">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-gray-100">
                      <td className="p-2">{formatData(log.created_at)}</td>

                      <td className="p-2 font-semibold">{log.user_name}</td>

                      <td className="p-2">
                        <span className="bg-gray-200 px-2 py-1 rounded text-xs">{log.table_name}</span>
                      </td>

                      <td className="p-2">{log.context}</td>

                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold
                            ${log.action === "INSERT" && "bg-green-100 text-green-700"}
                            ${log.action === "UPDATE" && "bg-blue-100 text-blue-700"}
                            ${log.action === "DELETE" && "bg-red-100 text-red-700"}
                          `}
                        >
                          {log.action}
                        </span>
                      </td>

                      {/* ALTERAÇÕES */}
                      <td className="p-2">
                        <div className="flex gap-2 items-center">
                          {/* ANTERIOR */}
                          <div className="flex-1 bg-red-50 border border-red-200 p-2 rounded max-h-[200px] overflow-auto text-xs font-mono">
                            <small className="block text-red-600 font-bold mb-1">ANTERIOR</small>
                            <pre>{JSON.stringify(log.old_values, null, 2)}</pre>
                          </div>

                          <div className="text-blue-500 text-lg">➔</div>

                          {/* NOVO */}
                          <div className="flex-1 bg-green-50 border border-green-200 p-2 rounded max-h-[200px] overflow-auto text-xs font-mono">
                            <small className="block text-green-600 font-bold mb-1">NOVO</small>
                            <pre>{JSON.stringify(log.new_values, null, 2)}</pre>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AuditLogs;
