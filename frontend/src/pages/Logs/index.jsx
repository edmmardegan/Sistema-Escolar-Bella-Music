//Local: /src/pages/Logs/index.jsx

import React, { useEffect, useState, useCallback } from "react";
import {FaFilter} from "react-icons/fa";
import api from "../../services/api";
import "./styles.css";

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para os filtros
  const [busca, setBusca] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [operacao, setOperacao] = useState("");

  const [limite, setLimite] = useState(20); // Valor padrão inicial
  // 1. fetchLogs agora aceita e envia os filtros
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filtros = {
        busca,
        dataInicio,
        dataFim,
        operacao,
        limite,
      };

      console.log("🔍 Enviando filtros:", filtros); // Bom para você ver no F12

      const dados = await api.getAudit(filtros);
      setLogs(Array.isArray(dados) ? dados : []);
    } catch (err) {
      setError("Não foi possível carregar os logs de auditoria.");
      console.error(err);
    } finally {
      setLoading(false);
    }
    // 👈 VOCÊ PRECISA ADICIONAR 'limite' AQUI NAS DEPENDÊNCIAS TAMBÉM
  }, [busca, dataInicio, dataFim, operacao, limite]);

  // 2. useEffect configurado para disparar sempre que um filtro mudar
  useEffect(() => {
    // Timer para não sobrecarregar o banco enquanto você digita (Debounce)
    const timer = setTimeout(() => {
      fetchLogs();
    }, 500);

    return () => clearTimeout(timer);
  }, [fetchLogs]);

  const limparFiltros = () => {
    setBusca("");
    setDataInicio("");
    setDataFim("");
    setOperacao("");
    // O useEffect vai perceber que os estados mudaram e chamará o fetchLogs sozinho
  };

  const formatData = (data) => {
    return new Date(data).toLocaleString("pt-BR");
  };

  // Se estiver carregando pela primeira vez, mostra o loading
  if (loading && logs.length === 0) return <div className="audit-container">Carregando auditoria...</div>;

  return (
    <div className="audit-container">
      <div className="card-principal">
        <header style={{ marginBottom: "20px" }}>
          <h2>🕵️ Auditoria do Sistema</h2>
          <p>Histórico de alterações realizadas no banco de dados.</p>
        </header>
      </div>
      {/* --- CONTAINER DE FILTROS --- */}
      <div className="filtro-container-flex">
        <FaFilter style={{ color: "#aaa" }} />
        <div className="busca-nome-container">
          <span className="icon-search">🔍</span>
          <input
            type="text"
            className="input-field"
            placeholder="Pesquisar usuário, tabela ou conteúdo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          {busca && (
            <span className="icon-clear" onClick={() => setBusca("")}>
              ✖
            </span>
          )}
        </div>
        <label>Período:</label>
        <input type="date" className="input-data" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} title="Data Inicial" />
        <label>até</label>
        <input type="date" className="input-data" value={dataFim} onChange={(e) => setDataFim(e.target.value)} title="Data Final" />

        <select className="input-operacao" value={operacao} onChange={(e) => setOperacao(e.target.value)}>
          <option value="">Todas Operações</option>
          <option value="INSERT">INSERT</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
        </select>
        <select className="input-limite" value={limite} onChange={(e) => setLimite(Number(e.target.value))} title="Quantidade de registros">
          <option value="20">20 itens</option>
          <option value="50">50 itens</option>
          <option value="100">100 itens</option>
          <option value="500">500 itens</option>
        </select>
        <button type="button" className="btn-limpar-filtros" onClick={limparFiltros} title="Limpar todos os filtros">
          <span className="icon-clear">🧹</span> Limpar
        </button>
      </div>

      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

      {/* Indicador visual de que uma nova busca está ocorrendo */}
      {loading && <div style={{ fontSize: "12px", color: "#666" }}>Atualizando resultados...</div>}

      <div className="table-responsive">
        <table className="tabela">
          <thead>
            <tr>
              <th>Data/Hora</th>
              <th>Usuário</th>
              <th>Tabela</th>
              <th>Contexto</th>
              <th>Operação</th>
              <th>Mudanças</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                  Nenhum registro encontrado.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td>{formatData(log.created_at)}</td>
                  <td>
                    <strong>{log.user_name}</strong>
                  </td>
                  <td>
                    <span className="tag-table">{log.table_name}</span>
                  </td>
                  <td>{log.context}</td>
                  <td>
                    <span className={`badge-action ${log.action?.toLowerCase()}`}>{log.action}</span>
                  </td>
                  <td className="diff-cell">
                    <div className="diff-container">
                      <div className="box old">
                        <small>ANTERIOR</small>
                        <pre>{JSON.stringify(log.old_values, null, 2)}</pre>
                      </div>
                      <div className="separator">➔</div>
                      <div className="box new">
                        <small>NOVO</small>
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
    </div>
  );
};

export default AuditLogs;
