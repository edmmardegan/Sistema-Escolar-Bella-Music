import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../../services/api";
import { FaCheck, FaTimes, FaCalendarAlt, FaHistory, FaExclamationTriangle, FaUndoAlt, FaClock, FaTrash, FaMagic, FaSearch } from "react-icons/fa";
import "./styles.css";

export default function Agenda() {
  // --- LÓGICA DE DATAS PADRÃO ---
  const hoje = new Date().toISOString().split("T")[0];
  const trintaAtras = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  })();

  // --- ESTADOS PADRONIZADOS ---
  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("dia");

  // Filtros de Data
  const [dataFiltro, setDataFiltro] = useState(hoje);
  const [dataInicio, setDataInicio] = useState(trintaAtras);
  const [dataFim, setDataFim] = useState(hoje);

  // Filtro de Nome
  const [filtroNome, setFiltroNome] = useState("");

  const [mesGerar, setMesGerar] = useState(new Date().getMonth());
  const [anoGerar, setAnoGerar] = useState(new Date().getFullYear());

  const mesesExibicao = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  // --- FUNÇÕES AUXILIARES ---
  const getDiaSemanaExtenso = (data) => {
    if (!data) return "";
    const dias = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    const dateObj = new Date(data + "T12:00:00");
    return dias[dateObj.getDay()];
  };

  // --- FUNÇÃO CARREGAR (Atualizada com múltiplos parâmetros) ---
  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const tipoBusca = abaAtiva === "faltas" ? "reposicoes" : abaAtiva;

      // Montamos o objeto de filtros para o backend
      const filtros = {
        data: abaAtiva === "historico" ? dataInicio : dataFiltro,
        dataFim: abaAtiva === "historico" ? dataFim : null,
        nome: filtroNome,
      };

      const res = await api.getAgenda(tipoBusca, filtros);
      setDados(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setDados([]);
    } finally {
      setCarregando(false);
    }
  }, [abaAtiva, dataFiltro, dataInicio, dataFim, filtroNome]);

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
      await api.saveFrequencia(id, tipoAcao, motivo);
      carregar();
    } catch (err) {
      alert("Erro ao registrar ação.");
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
    const confirmar = window.confirm(`Deseja gerar a agenda para todos os alunos em ${mesesExibicao[mesGerar]}/${anoGerar}?`);
    if (!confirmar) return;

    try {
      setCarregando(true);
      const resultado = await api.gerarAgenda(mesGerar, anoGerar);
      alert(resultado.message || "Processado com sucesso!");
      carregar();
    } catch (err) {
      alert("Erro ao gerar agenda");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="container-agenda">
      <div className="card">
        <div className="header-agenda">
          <h2>
            <FaCalendarAlt /> Controle de Frequência
          </h2>

          <div className="bloco-geracao">
            <span className="label-geracao">Gerar Lote:</span>
            <select value={mesGerar} onChange={(e) => setMesGerar(Number(e.target.value))} className="input-field select-mes">
              {mesesExibicao.map((m, idx) => (
                <option key={idx} value={idx}>
                  {m}
                </option>
              ))}
            </select>
            <input type="number" value={anoGerar} onChange={(e) => setAnoGerar(Number(e.target.value))} className="input-field input-ano" />
            <button onClick={handleGerarAgenda} className="btn-primary" disabled={carregando}>
              <FaMagic /> Gerar
            </button>
          </div>
        </div>

        <div className="painel-filtros-agenda">
          <div className="linha-filtros-superior">
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

            {/* Filtro por Nome - Estilo compactado */}
            <div className="busca-nome-container">
              <FaSearch className="icon-busca" />
              <input
                type="text"
                placeholder="Pesquisar aluno..."
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
                className="input-busca-nome"
              />
            </div>
          </div>

          <div className="linha-filtros-inferior">
            {abaAtiva === "dia" && (
              <div className="agenda-data-seletor">
                <span className="label-filtro">Data:</span>
                <input type="date" value={dataFiltro} onChange={(e) => setDataFiltro(e.target.value)} className="input-field" />
                <span className="dia-semana-label">{getDiaSemanaExtenso(dataFiltro)}</span>
              </div>
            )}

            {abaAtiva === "historico" && (
              <div className="periodo-seletor">
                <span className="label-filtro">Período:</span>
                <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="input-field" />
                <span className="divisor-data">até</span>
                <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="input-field" />
              </div>
            )}
          </div>
        </div>

        {/*  R E S U M O    C O N T A D O R    D E    R E G I S T R O S */}
        <div className="resumo-resultados">
          <span>
            Mostrando <strong>{dados.length}</strong> {dados.length === 1 ? "registro" : "registros"}
          </span>

          {/* Opcional: Um resumo rápido por status se estiver no histórico */}
          {abaAtiva === "historico" && dados.length > 0 && (
            <div className="mini-badges-resumo">
              <small className="status-presente">Presentes: {dados.filter((d) => d.status === "Presente").length}</small>
              <small className="status-falta">Faltas: {dados.filter((d) => d.status === "Falta").length}</small>
              <small className="status-pendente">Pendente: {dados.filter((d) => d.status === "Pendente").length}</small>
            </div>
          )}
        </div>

        <div className="tabela-container">
          <table className="tabela">
            <thead>
              <tr>
                <th>Data / Dia</th>
                <th>Horário</th>
                <th>Aluno / Prof.</th>
                <th>Curso</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan="6" className="texto-centralizado">
                    Carregando...
                  </td>
                </tr>
              ) : dados.length > 0 ? (
                dados.map((aula) => {
                  const dataLocal = new Date(aula.data);
                  return (
                    <tr key={aula.id}>
                      <td>
                        {dataLocal.toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                        <div className="sub-texto">{getDiaSemanaExtenso(new Date(aula.data).toISOString().split("T")[0])}</div>
                      </td>

                      <td className="texto-negrito">
                        <FaClock className="icon-pequeno" />
                        {dataLocal.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })}
                      </td>

                      <td>
                        <strong>{aula.termo?.matricula?.aluno?.nome || aula.aluno_nome}</strong>
                        <div className="sub-texto">Prof(a): {aula.termo?.matricula?.professor || "Não atribuído"}</div>
                        {abaAtiva === "historico" && aula.obs && (
                          <div className="icon-aula-obs">
                            <FaExclamationTriangle /> {aula.obs}
                          </div>
                        )}
                      </td>

                      <td className="sub-texto">
                        <strong>{aula.termo?.matricula?.curso?.nome || "Curso"}</strong>
                        <div>{aula.termo?.numeroTermo}º Termo</div>
                      </td>
                      <td>
                        <span className={`badge status-${aula.status?.toLowerCase()}`}>{aula.status}</span>
                      </td>

                      <td className="acoes">
                        {abaAtiva === "faltas" ? (
                          <button onClick={() => registrarAcao(aula.id, "reposicao")} className="btn-icon btn-reposicao">
                            <FaCheck /> <small>Reposição</small>
                          </button>
                        ) : (
                          <>
                            {aula.status === "Pendente" && (
                              <>
                                <button onClick={() => registrarAcao(aula.id, "presenca")} className="btn-icon btn-confirm" title="Presença">
                                  <FaCheck />
                                </button>
                                <button onClick={() => registrarAcao(aula.id, "falta")} className="btn-icon btn-not-confirm" title="Falta">
                                  <FaTimes />
                                </button>
                                <button onClick={() => excluir(aula)} className="btn-icon btn-excluir" title="Excluir">
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
                    Nenhum registro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}