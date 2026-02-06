import React, { useState, useEffect, useCallback } from "react";
import { FaMoneyBillWave, FaMagic, FaTrash, FaCheck, FaUndo, FaHandHoldingUsd, FaChalkboardTeacher } from "react-icons/fa";
import api from "../../services/api";
import "./styles.css";

export default function Financeiro() {
  // --- ESTADOS PADRONIZADOS ---
  const [dados, setDados] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [carregando, setCarregando] = useState(false);

  // Filtros de visualização
  const [mesFiltro, setMesFiltro] = useState(new Date().getMonth() + 1);
  const [anoFiltro, setAnoFiltro] = useState(new Date().getUTCFullYear());
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [professorFiltro, setProfessorFiltro] = useState("Todas");

  // --- ESTADOS PARA A GERAÇÃO DE LOTES ---
  const [mesGerar, setMesGerar] = useState(new Date().getMonth() + 1);
  const [anoGerar, setAnoGerar] = useState(new Date().getFullYear());

  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  // --- FUNÇÃO PADRÃO: CARREGAR ---
  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      const res = await api.getAllFinanceiro();
      setDados(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error("Erro ao carregar financeiro:", e);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // --- LÓGICA DE FILTRAGEM (MEMÓRIA) ---
  useEffect(() => {
    const lista = dados.filter((item) => {
      const dataVenc = new Date(item.dataVencimento || item.data_vencimento);

      const matchMes = Number(mesFiltro) === 0 ? true : dataVenc.getUTCMonth() + 1 === Number(mesFiltro);
      const matchAno = Number(anoFiltro) === 0 ? true : dataVenc.getUTCFullYear() === Number(anoFiltro);
      const matchStatus = statusFiltro === "Todos" ? true : item.status === statusFiltro;

      // Filtro por Professor (buscando dentro do objeto matricula)
      const profDaParcela = item.matricula?.professor || "";
      const matchProf = professorFiltro === "Todas" ? true : profDaParcela === professorFiltro;

      return matchMes && matchAno && matchStatus && matchProf;
    });
    setFiltrados(lista);
  }, [dados, mesFiltro, anoFiltro, statusFiltro, professorFiltro]);

  // --- CÁLCULOS DO RESUMO (Baseado nos filtrados) ---
  const totalPago = filtrados.filter((i) => i.status?.toLowerCase() === "paga").reduce((acc, curr) => acc + Number(curr.valorTotal || 0), 0);

  const totalAberto = filtrados.filter((i) => i.status?.toLowerCase() === "aberta").reduce((acc, curr) => acc + Number(curr.valorTotal || 0), 0);

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
    const confirmar = window.confirm(`Gerar parcelas para todos os alunos de ${meses[mesGerar - 1]}/${anoGerar} até Dezembro?`);
    if (!confirmar) return;
    try {
      setCarregando(true);
      await api.gerarParcelaGlobal({ mes: Number(mesGerar), ano: Number(anoGerar) });
      alert("Parcelas geradas com sucesso!");
      carregar();
    } catch (e) {
      alert("Erro ao gerar lote.");
    } finally {
      setCarregando(false);
    }
  };

  const fMoeda = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const fData = (d) => (d ? new Date(d).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "-");

  return (
    <div className="container-financeiro">
      <div className="card">
        <div className="header-financeiro">
          <h2>
            <FaMoneyBillWave /> Financeiro Global
          </h2>

          <div className="bloco-geracao">
            <span className="label-geracao">Gerar Lote:</span>
            <select className="input-field select-mes" value={mesGerar} onChange={(e) => setMesGerar(e.target.value)}>
              {meses.map((m, i) => (
                <option key={i} value={i + 1}>
                  {" "}
                  {m}{" "}
                </option>
              ))}
            </select>
            <input type="number" className="input-field input-ano" value={anoGerar} onChange={(e) => setAnoGerar(e.target.value)} />
            <button onClick={handleGerarLote} className="btn-primary" disabled={carregando}>
              <FaMagic /> Gerar
            </button>
          </div>
        </div>

        {/* RESUMO DE VALORES */}
        <div className="resumo-financeiro-cards">
          <div className="card-resumo pago">
            <div className="resumo-icon">
              <FaCheck />
            </div>
            <div className="resumo-info">
              <span>Pago ({professorFiltro})</span>
              <strong>{fMoeda(totalPago)}</strong>
            </div>
          </div>
          <div className="card-resumo aberto">
            <div className="resumo-icon">
              <FaHandHoldingUsd />
            </div>
            <div className="resumo-info">
              <span>Aberto ({professorFiltro})</span>
              <strong>{fMoeda(totalAberto)}</strong>
            </div>
          </div>
        </div>

        {/* PAINEL DE FILTROS EM LINHA ÚNICA */}
        <div className="painel-filtros linha-unica">
          <div className="input-group campo-mes">
            <label>Mês:</label>
            <select className="input-field" value={mesFiltro} onChange={(e) => setMesFiltro(e.target.value)}>
              <option value="0">Todos</option>
              {meses.map((n, i) => (
                <option key={i} value={i + 1}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group campo-ano">
            <label>Ano:</label>
            <input type="number" className="input-field" value={anoFiltro} onChange={(e) => setAnoFiltro(e.target.value)} />
          </div>
          <div className="input-group campo-prof">
            <label>Professora:</label>
            <select className="input-field" value={professorFiltro} onChange={(e) => setProfessorFiltro(e.target.value)}>
              <option value="Todas">Todas</option>
              <option value="Cristiane">Cristiane</option>
              <option value="Daiane">Daiane</option>
            </select>
          </div>
          <div className="input-group campo-status">
            <label>Status:</label>
            <select className="input-field" value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
              <option value="Todos">Todos</option>
              <option value="Aberta">Em Aberto</option>
              <option value="Paga">Pagos</option>
            </select>
          </div>
        </div>

        <div className="tabela-container">
          <table className="tabela">
            <thead>
              <tr>
                <th>Vencimento</th>
                <th>Aluno</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => {
                const isPaga = p.status?.toLowerCase() === "paga";
                const isVencida = !isPaga && new Date(p.dataVencimento) < new Date().setHours(0, 0, 0, 0);

                return (
                  <tr key={p.id}>
                    <td>{fData(p.dataVencimento)}</td>
                    <td>
                      <strong>{p.matricula?.aluno?.nome || "Aluno"}</strong>
                      <br />
                      <small className="txt-secundario">{p.matricula?.professor}</small>
                    </td>
                    <td>{fMoeda(p.valorTotal)}</td>
                    <td>
                      <span className={`badge ${isPaga ? "bg-paga" : isVencida ? "bg-vencida" : "bg-aberta"}`}>
                        {isPaga ? "Paga" : isVencida ? "Vencida" : "Aberta"}
                      </span>
                    </td>
                    <td className="acoes">
                      {!isPaga ? (
                        <>
                          <button onClick={() => handleAcao(p.id, "pagar")} className="btn-icon btn-pagar" title="Pagar">
                            <FaCheck />
                          </button>
                          <button
                            onClick={async () => {
                              if (!window.confirm("Excluir?")) return;
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
                        <button onClick={() => handleAcao(p.id, "estornar")} className="btn-icon btn-estornar" title="Estornar">
                          <FaUndo />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
