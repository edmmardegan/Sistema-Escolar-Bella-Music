/* src/pages/Financeiro/index.jsx */

import React, { useState, useEffect, useCallback } from "react";
import { FaDollarSign, FaMagic, FaTrash, FaCheck, FaUndo, FaHandHoldingUsd, FaListOl } from "react-icons/fa";
import api from "../../services/api";
import "./styles.css";

export default function Financeiro() {
  // --- ESTADOS PADRONIZADOS ---
  const [registros, setRegistros] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filtros de visualização
  const [mesFiltro, setMesFiltro] = useState(new Date().getMonth() + 1);
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
      setRegistros(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error("Erro ao carregar financeiro:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // --- LÓGICA DE FILTRAGEM ---
  useEffect(() => {
    const lista = registros.filter((item) => {
      const dataVenc = new Date(item.dataVencimento || item.data_vencimento);
      const matchMes = Number(mesFiltro) === 0 ? true : dataVenc.getUTCMonth() + 1 === Number(mesFiltro);
      const matchAno = Number(anoFiltro) === 0 ? true : dataVenc.getUTCFullYear() === Number(anoFiltro);
      const matchStatus = statusFiltro === "Todos" ? true : item.status === statusFiltro;
      const profDaParcela = item.matricula?.professor || "";
      const matchProf = professorFiltro === "Todas" ? true : profDaParcela === professorFiltro;

      return matchMes && matchAno && matchStatus && matchProf;
    });
    setFiltrados(lista);
  }, [registros, mesFiltro, anoFiltro, statusFiltro, professorFiltro]);

  // --- CÁLCULOS ---
  const totalPago = filtrados.filter((i) => i.status?.toLowerCase() === "paga").reduce((acc, curr) => acc + Number(curr.valorTotal || 0), 0);
  const totalAberto = filtrados.filter((i) => i.status?.toLowerCase() === "aberta").reduce((acc, curr) => acc + Number(curr.valorTotal || 0), 0);

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

  const fMoeda = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const fData = (d) => (d ? new Date(d).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "-");

  return (
    <main className="conteudo-principal">
      <div className="container-principal">
        <section className="card-principal">
          <div className="header-card">
            <h2>
              <FaDollarSign /> Financeiro Global
            </h2>
            <div className="bloco-geracao-compacto">
              <span style={{ fontSize: "12px", fontWeight: "bold" }}>Lote:</span>
              <select className="input-field select-mes" value={mesGerar} onChange={(e) => setMesGerar(e.target.value)}>
                {meses.map((m, i) => (
                  <option key={i} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
              <input type="number" className="input-data" style={{ width: "80px" }} value={anoGerar} onChange={(e) => setAnoGerar(e.target.value)} />
              <button onClick={handleGerarLote} className="btn btn-primary" disabled={loading}>
                <FaMagic /> Gerar
              </button>
            </div>
          </div>

          <div className="resumo-financeiro-grid">
            <div className="resumo-box pago">
              <FaCheck className="resumo-icon" />
              <div className="resumo-txt">
                <span>Total Pago</span>
                <strong>{fMoeda(totalPago)}</strong>
              </div>
            </div>
            <div className="resumo-box aberto">
              <FaHandHoldingUsd className="resumo-icon" />
              <div className="resumo-txt">
                <span>Em Aberto</span>
                <strong>{fMoeda(totalAberto)}</strong>
              </div>
            </div>
            <div className="contadores-flex">
              <span className="count-badge">
                <FaListOl /> Total: <strong>{filtrados.length}</strong>
              </span>
            </div>
          </div>

          <div className="painel-filtros-linha">
            <div className="input-group">
              <label>Mês</label>
              <select className="input-field select-mes" value={mesFiltro} onChange={(e) => setMesFiltro(e.target.value)}>
                <option value="0">Todos</option>
                {meses.map((n, i) => (
                  <option key={i} value={i + 1}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>Ano</label>
              <input
                type="number"
                className="input-data"
                style={{ width: "90px" }}
                value={anoFiltro}
                onChange={(e) => setAnoFiltro(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Professora</label>
              <select className="input-field" style={{ width: "150px" }} value={professorFiltro} onChange={(e) => setProfessorFiltro(e.target.value)}>
                <option value="Todas">Todas</option>
                <option value="Cristiane">Cristiane</option>
                <option value="Daiane">Daiane</option>
              </select>
            </div>
            <div className="input-group">
              <label>Status</label>
              <select className="input-field" style={{ width: "130px" }} value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
                <option value="Todos">Todos</option>
                <option value="Aberta">Em Aberto</option>
                <option value="Paga">Pagos</option>
              </select>
            </div>
          </div>
        </section>

        <section className="tabela-container">
          <table className="tabela">
            <thead>
              <tr>
                <th>Vencimento</th>
                <th>Aluno / Professor</th>
                <th>Valor Total</th>
                <th>Status</th>
                <th style={{ textAlign: "center" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="texto-centralizado">
                    Carregando dados financeiros...
                  </td>
                </tr>
              ) : (
                filtrados.map((p) => {
                  const isPaga = p.status?.toLowerCase() === "paga";
                  const isVencida = !isPaga && new Date(p.dataVencimento) < new Date().setHours(0, 0, 0, 0);

                  return (
                    <tr key={p.id}>
                      <td>{fData(p.dataVencimento)}</td>
                      <td>
                        <strong>{p.matricula?.aluno?.nome || "Aluno"}</strong>
                        <div className="txt-detalhe-vermelho">{p.matricula?.professor}</div>
                      </td>
                      <td className="txt-negrito">{fMoeda(p.valorTotal)}</td>
                      <td>
                        <span className={`badge-status ${isPaga ? "status-pago" : isVencida ? "status-vencido" : "status-aberto"}`}>
                          {isPaga ? "PAGA" : isVencida ? "VENCIDA" : "ABERTA"}
                        </span>
                      </td>
                      <td className="acoes" style={{ justifyContent: "center" }}>
                        {!isPaga ? (
                          <>
                            <button onClick={() => handleAcao(p.id, "pagar")} className="btn-icon btn-edit" title="Pagar">
                              <FaCheck />
                            </button>
                            <button
                              onClick={async () => {
                                if (!window.confirm("Excluir parcela?")) return;
                                await api.deleteParcela(p.id);
                                carregar();
                              }}
                              className="btn-icon btn-excluir"
                              title="Excluir"
                            >
                              <FaTrash />
                            </button>
                          </>
                        ) : (
                          <button onClick={() => handleAcao(p.id, "estornar")} className="btn-icon btn-secondary" title="Estornar">
                            <FaUndo />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
