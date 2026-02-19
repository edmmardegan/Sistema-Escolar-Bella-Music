/* src/pages/Agenda/index.jsx */
import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import {
  FaCheck,
  FaTimes,
  FaCalendarAlt,
  FaHistory,
  FaExclamationTriangle,
  FaUndoAlt,
  FaClock,
  FaTrash,
  FaMagic,
  FaSearch,
  FaListOl,
} from "react-icons/fa";
import "./styles.css";
import { MESES } from "../../components/selecionarMeses";

export default function Agenda() {
  // --- LÓGICA DE DATAS PADRÃO ---
  const hoje = new Date().toISOString().split("T")[0];
  const trintaAtras = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  })();

  // --- ESTADOS PADRONIZADOS ---
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("dia");

  // Filtros
  const [dataFiltro, setDataFiltro] = useState(hoje);
  const [dataInicio, setDataInicio] = useState(trintaAtras);
  const [dataFim, setDataFim] = useState(hoje);
  const [buscaNome, setBuscaNome] = useState("");

  // Estados para geração automática
  const [mesGerar, setMesGerar] = useState(new Date().getMonth());
  const [anoGerar, setAnoGerar] = useState(new Date().getFullYear());

  // --- FUNÇÕES AUXILIARES ---
  const getDiaSemanaExtenso = (data) => {
    if (!data) return "";
    const dias = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    const dateObj = new Date(data + "T12:00:00");
    return dias[dateObj.getDay()];
  };

  // --- CARREGAR DADOS ---
  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      const tipoBusca = abaAtiva === "faltas" ? "reposicoes" : abaAtiva;

      const filtros = {
        data: abaAtiva === "historico" ? dataInicio : dataFiltro,
        dataFim: abaAtiva === "historico" ? dataFim : null,
        nome: buscaNome,
      };

      const res = await api.getAgenda(tipoBusca, filtros);
      setRegistros(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setRegistros([]);
    } finally {
      setLoading(false);
    }
  }, [abaAtiva, dataFiltro, dataInicio, dataFim, buscaNome]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // --- AÇÕES ---
  const registrarAcao = async (id, tipoAcao) => {
    try {
      let motivo = "";
      if (tipoAcao === "falta") {
        motivo = prompt("Motivo da falta:");
        if (motivo === null) return;
      }

      // O backend espera { acao, motivo }
      await api.saveFrequencia(id, tipoAcao, motivo);
      carregar();
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao registrar ação.");
    }
  };

  const excluir = async (aula) => {
    if (aula.status?.toLowerCase() !== "pendente") {
      alert(`Somente aulas pendentes podem ser removidas.`);
      return;
    }
    const dataFormatada = new Date(aula.data).toLocaleDateString("pt-BR", { timeZone: "UTC" });
    if (!window.confirm(`Deseja realmente remover a aula do dia ${dataFormatada}?`)) return;

    try {
      await api.deleteAgenda(aula.id);
      alert("Aula removida!");
      carregar();
    } catch (error) {
      alert(error.response?.data?.message || "Erro ao excluir.");
    }
  };

  const handleGerarAgenda = async () => {
    const payload = { mes: Number(mesGerar), ano: Number(anoGerar) };
    try {
      setLoading(true); // Opcional: ativa o loading enquanto gera
      const resultado = await api.gerarAgenda(payload);
      
      alert(resultado.message || "Sucesso!"); // Usa a mensagem que vem do backend

      await carregar(); // recarregar com as novas aulas geradas
    } catch (err) {
      console.error("ERRO DETALHADO NO AXIOS:", err.response);
      alert(`Erro ${err.response?.status}: ${err.response?.data?.message || "Não encontrado"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="conteudo-principal">
      <div className="container-principal">
        {/* CABEÇALHO E GERAÇÃO EM LOTE */}
        <section className="card-principal">
          <div className="header-card">
            <h2>
              <FaCalendarAlt /> Controle de Frequência
            </h2>
            <div className="bloco-geracao-compacto">
              <span className="label-lote">Gerar Lote:</span>
              <select value={mesGerar} onChange={(e) => setMesGerar(Number(e.target.value))} className="input-field select-mes">
                {MESES.map((m, idx) => (
                  <option key={idx} value={idx}>
                    {m}
                  </option>
                ))}
              </select>
              <input type="number" value={anoGerar} onChange={(e) => setAnoGerar(Number(e.target.value))} className="input-field input-ano" />
              <button onClick={handleGerarAgenda} className="btn btn-primary" disabled={loading}>
                <FaMagic /> Gerar
              </button>
            </div>
          </div>

          <div className="painel-filtros-agenda">
            <div className="grupo-abas">
              <button className={`aba-item ${abaAtiva === "dia" ? "ativa" : ""}`} onClick={() => setAbaAtiva("dia")}>
                <FaCalendarAlt /> Agenda
              </button>
              <button className={`aba-item ${abaAtiva === "pendentes" ? "ativa" : ""}`} onClick={() => setAbaAtiva("pendentes")}>
                <FaExclamationTriangle /> Esquecidas
              </button>
              <button className={`aba-item ${abaAtiva === "faltas" ? "ativa" : ""}`} onClick={() => setAbaAtiva("faltas")}>
                <FaUndoAlt /> Reposições
              </button>
              <button className={`aba-item ${abaAtiva === "historico" ? "ativa" : ""}`} onClick={() => setAbaAtiva("historico")}>
                <FaHistory /> Histórico
              </button>
            </div>

            <div className="busca-nome-container">
              <FaSearch className="icon-search" />
              <input
                type="text"
                placeholder="Pesquisar aluno..."
                value={buscaNome}
                onChange={(e) => setBuscaNome(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="contadores-flex">
              <span className="count-badge">
                <FaListOl /> Total: <strong>{registros.length}</strong>
              </span>
            </div>
          </div>

          <div className="linha-datas-agenda">
            {abaAtiva === "dia" && (
              <div className="seletor-data-container">
                <label>Data:</label>
                <input type="date" value={dataFiltro} onChange={(e) => setDataFiltro(e.target.value)} className="input-data" />
                <span className="label-dia-semana">{getDiaSemanaExtenso(dataFiltro)}</span>
              </div>
            )}

            {abaAtiva === "historico" && (
              <div className="seletor-data-container">
                <label>Período:</label>
                <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="input-data" />
                <span style={{ margin: "0 10px", fontSize: "13px" }}>até</span>
                <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="input-data" />
              </div>
            )}
          </div>
        </section>

        {/* TABELA DE REGISTROS */}
        <section className="tabela-container">
          <table className="tabela">
            <thead>
              <tr>
                <th>Data / Dia</th>
                <th>Horário</th>
                <th>Aluno / Professor</th>
                <th>Curso / Termo</th>
                <th>Status</th>
                <th style={{ textAlign: "center" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="texto-centralizado">
                    Carregando dados...
                  </td>
                </tr>
              ) : registros.length > 0 ? (
                registros.map((aula) => {
                  const dataLocal = new Date(aula.data);
                  return (
                    <tr key={aula.id}>
                      <td>
                        <strong>{dataLocal.toLocaleDateString("pt-BR", { timeZone: "UTC" })}</strong>
                        <div className="txt-complemento">{getDiaSemanaExtenso(new Date(aula.data).toISOString().split("T")[0])}</div>
                      </td>

                      <td className="txt-negrito">
                        <FaClock style={{ marginRight: "5px", color: "#888" }} />
                        {dataLocal.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })}
                      </td>

                      <td>
                        <strong>{aula.termo?.matricula?.aluno?.nome || "Aluno não identificado"}</strong>
                        <div className="txt-complemento">Prof: {aula.termo?.matricula?.professor || "Não atribuído"}</div>
                        {aula.obs && (
                          <div className="txt-complemento txt-alerta">
                            <FaExclamationTriangle /> {aula.obs}
                          </div>
                        )}
                      </td>

                      <td>
                        <div className="txt-registro">{aula.termo?.matricula?.curso?.nome || "Curso"}</div>
                        <div className="txt-complemento">{aula.termo?.numeroTermo}º Termo</div>
                      </td>

                      <td>
                        <span className={`badge-status status-${aula.status?.toLowerCase()}`}>{aula.status}</span>
                      </td>

                      <td className="acoes" style={{ justifyContent: "center" }}>
                        {abaAtiva === "faltas" ? (
                          <button onClick={() => registrarAcao(aula.id, "reposicao")} className="btn btn-primary btn-pequeno">
                            <FaCheck /> Reposição
                          </button>
                        ) : (
                          <>
                            {aula.status === "Pendente" && (
                              <>
                                <button onClick={() => registrarAcao(aula.id, "presenca")} className="btn-icon btn-edit" title="Presença">
                                  <FaCheck />
                                </button>
                                <button onClick={() => registrarAcao(aula.id, "falta")} className="btn-icon btn-excluir" title="Falta">
                                  <FaTimes />
                                </button>
                                <button onClick={() => excluir(aula)} className="btn-icon btn-secondary" title="Remover Aula">
                                  <FaTrash />
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="texto-centralizado">
                    Nenhum registro encontrado para este filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
