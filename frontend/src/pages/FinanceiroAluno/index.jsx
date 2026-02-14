import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheck, FaUndo, FaMoneyBillWave, FaPlus } from "react-icons/fa";
import api from "../../services/api";
import "./styles.css";

export default function FinanceiroAluno() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [parcelas, setParcelas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nomeAluno, setNomeAluno] = useState("");
  const [anoGeracao, setAnoGeracao] = useState(new Date().getFullYear());

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getPorMatricula(id);
      const dados = Array.isArray(res) ? res : [];
      setParcelas(dados);
      if (dados.length > 0) setNomeAluno(dados[0].aluno?.nome);
    } catch (e) {
      setParcelas([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleAcao = async (idParc, status) => {
    try {
      status === "Aberta" ? await api.pagar(idParc) : await api.estornar(idParc);
      carregar();
    } catch (e) {
      alert("Erro ao processar.");
    }
  };

  const total = (s) => parcelas.filter((p) => p.status === s).reduce((acc, p) => acc + Number(p.valorTotal || 0), 0);

  return (
    <main className="conteudo-principal">
      <div className="container-principal">
        <header className="header-paginas">
          
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            <FaArrowLeft /> Voltar
          </button>
          <h2 style={{ margin: 0 }}>
            <FaMoneyBillWave color="#2b8a3e" /> Financeiro: {nomeAluno}
          </h2>
        </header>

        <section className="filtro-container-flex">
          <div className="input-group-horizontal">
            <label>Ano:</label>
            <input
              type="number"
              className="input-field"
              style={{ width: "80px" }}
              value={anoGeracao}
              onChange={(e) => setAnoGeracao(e.target.value)}
            />
            <button className="btn btn-primary" onClick={() => {}}>
              <FaPlus /> Gerar Mensalidades
            </button>
          </div>
        </section>

        <section className="resumo-cards-fin">
          <div className="card-mini pendente">
            <small>Total em Aberto</small>
            <strong>{total("Aberta").toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
          </div>
          <div className="card-mini pago">
            <small>Total Recebido</small>
            <strong>{total("Paga").toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
          </div>
        </section>

        <section className="tabela-container">
          <table className="tabela">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Vencimento</th>
                <th>Valor</th>
                <th>Status</th>
                <th style={{ textAlign: "center" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {parcelas.map((p) => (
                <tr key={p.id}>
                  <td>{p.descricao}</td>
                  <td>{p.dataVencimento ? new Date(p.dataVencimento).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "-"}</td>
                  <td>{Number(p.valorTotal).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                  <td>
                    <span className={`badge-status ${p.status === "Paga" ? "status-pago" : "status-aberto"}`}>{p.status}</span>
                  </td>
                  <td style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                    <button
                      onClick={() => handleAcao(p.id, p.status)}
                      className={`btn-acao-financeira ${p.status === "Aberta" ? "btn-pagar" : "btn-estornar"}`}
                    >
                      {p.status === "Aberta" ? <FaCheck /> : <FaUndo />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
