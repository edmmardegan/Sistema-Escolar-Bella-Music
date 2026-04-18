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
import { MESES } from "../../components/selecionarMeses";

export default function Agenda() {

  const usuario = JSON.parse(localStorage.getItem("@App:user") || "null");

  console.log("USUARIO LOGADO:", usuario);

  const isAdmin = usuario?.role?.toLowerCase() === "admin";


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
  const [abaAtiva, setAbaAtiva] = useState("agenda");

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

      const filtros = {
        data: abaAtiva === "agenda" ? dataFiltro : abaAtiva === "historico" ? dataInicio : null,

        dataFim: abaAtiva === "historico" ? dataFim : null,

        nome: buscaNome,
      };

      const res = await api.getAgenda(abaAtiva, filtros);

      let dados = Array.isArray(res) ? res : [];

      // 🔒 GARANTIA EXTRA NO FRONT (opcional, mas seguro)
      if (abaAtiva === "falta") {
        dados = dados.filter((a) => a.status === "Falta");
      }

      if (abaAtiva === "pendente") {
        dados = dados.filter((a) => a.status === "Pendente");
      }

      if (abaAtiva === "agenda") {
        dados = dados.filter((a) => a.data?.split("T")[0] === dataFiltro);
      }

      setRegistros(dados);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setRegistros([]);
    } finally {
      setLoading(false);
    }
  }, [abaAtiva, dataFiltro, dataInicio, dataFim, buscaNome]);

  useEffect(() => {
    // Se for histórico, só carrega quando datas existirem
    if (abaAtiva === "historico") {
      if (dataInicio && dataFim) {
        carregar();
      }
    } else {
      carregar();
    }
  }, [abaAtiva, dataFiltro, dataInicio, dataFim, buscaNome]);

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

  const REGRAS_ACOES = {
    agenda: {
      Pendente: isAdmin ? ["presenca", "falta", "excluir"] : ["presenca", "falta" ],
      Presente: [],
      Falta: ["reposicao"],
    },
    pendente: {
      Pendente: isAdmin ? ["presenca", "falta", "excluir"] : ["presenca", "falta" ],
    },
    falta: {
      Falta: ["reposicao"],
    },
    historico: {
      Pendente: isAdmin ? ["presenca", "falta", "excluir"] : ["presenca", "falta"],
      Presente: [],
      Falta: ["reposicao"],
    },
  };

  const ACAO_DESABILITADA = (acao, aula) => {
    const status = aula.status;

    if (acao === "presenca" && status === "Presente") return true;
    if (acao === "falta" && status === "Falta") return true;
    if (acao === "reposicao" && status !== "Falta") return true;
    if (acao === "excluir" && status !== "Pendente") return true;

    return false;
  };

  const renderBotao = (acao, aula) => {
    const disabled = ACAO_DESABILITADA(acao, aula);

    const base = "p-2 rounded-md text-white transition";
    const disabledStyle = "bg-gray-300 cursor-not-allowed opacity-60";

    switch (acao) {
      case "presenca":
        return (
          <button
            key="presenca"
            disabled={disabled}
            onClick={() => !disabled && registrarAcao(aula.id, "presenca")}
            className={`${base} ${disabled ? disabledStyle : "bg-green-500 hover:bg-green-600"}`}
            title={disabled ? "Já está presente" : "Registrar Presença"}
          >
            <FaCheck />
          </button>
        );

      case "falta":
        return (
          <button
            key="falta"
            disabled={disabled}
            onClick={() => !disabled && registrarAcao(aula.id, "falta")}
            className={`${base} ${disabled ? disabledStyle : "bg-red-500 hover:bg-red-600"}`}
            title={disabled ? "Já está como falta" : "Registrar Falta"}
          >
            <FaTimes />
          </button>
        );

      case "reposicao":
        return (
          <button
            key="reposicao"
            disabled={disabled}
            onClick={() => !disabled && registrarAcao(aula.id, "reposicao")}
            className={`${base} ${disabled ? disabledStyle : "bg-blue-500 hover:bg-blue-600"}`}
            title={disabled ? "Só disponível para faltas" : "Registrar Reposição"}
          >
            <FaUndoAlt />
          </button>
        );

      case "excluir":         
        return (
          <button
            key="excluir"
            disabled={!isAdmin || disabled}
            onClick={() => isAdmin && !disabled && excluir(aula)}
            className={`${base} ${!isAdmin || disabled ? disabledStyle : "bg-gray-500 hover:bg-gray-600"}`}
            title={!isAdmin ? "Apenas administrador pode excluir" : "Excluir"}
          >
            <FaTrash />
          </button>
        );

      default:
        return null;
    }
  };

  return (
    <main className="p-4 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* CARD FORM */}
        <section className="bg-white rounded-xl shadow-md p-6">
          {/* HEADER */}
          <div className="flex justify-between items-center flex-wrap gap-3">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaCalendarAlt /> Controle de Frequência
            </h2>

            {/* GERAR LOTE */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-600">Gerar Lote:</span>

              <select
                value={mesGerar}
                onChange={(e) => setMesGerar(Number(e.target.value))}
                className="h-11 px-3 border rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {MESES.map((m, idx) => (
                  <option key={idx} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={anoGerar}
                onChange={(e) => setAnoGerar(Number(e.target.value))}
                className="h-11 w-24 px-3 border rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={handleGerarAgenda}
                disabled={loading}
                className="h-11 px-4 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                <FaMagic /> Gerar
              </button>
            </div>
          </div>

          {/* FILTROS */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            {/* ABAS */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: "agenda", icon: <FaCalendarAlt />, label: "Agenda Diária" },
                { key: "pendente", icon: <FaExclamationTriangle />, label: "Pendente" },
                { key: "falta", icon: <FaUndoAlt />, label: "Falta" },
                { key: "historico", icon: <FaHistory />, label: "Histórico" },
              ].map((aba) => (
                <button
                  key={aba.key}
                  onClick={() => {
                    console.log("ABA:", aba.key);
                    setAbaAtiva(aba.key);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition
                  ${abaAtiva === aba.key ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                >
                  {aba.icon} {aba.label}
                </button>
              ))}
            </div>

            {/* BUSCA */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                placeholder="Pesquisar por nome..."
                value={buscaNome}
                onChange={(e) => setBuscaNome(e.target.value)}
                className="pl-9 pr-8 h-8 border rounded-md bg-white text-gray-800
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {buscaNome && (
                <FaTimes onClick={() => setBuscaNome("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" />
              )}
            </div>

            {/* CONTADOR */}
            <span className="ml-auto text-sm bg-gray-200 px-3 py-1 rounded-full flex items-center gap-2">
              <FaListOl /> Total de Registros: <strong>{registros.length}</strong>
            </span>
          </div>

          {/* ABAS ATIVAS */}
          <div className="border-t pt-3 flex flex-wrap items-center gap-3 text-sm">
            {abaAtiva === "agenda" && (
              <>
                <label className="font-semibold text-gray-600">Data:</label>

                <input type="date" value={dataFiltro} onChange={(e) => setDataFiltro(e.target.value)} className="h-10 px-3 border rounded-md" />

                <span className="text-blue-600 font-semibold">{getDiaSemanaExtenso(dataFiltro)}</span>
              </>
            )}

            {abaAtiva === "historico" && (
              <>
                <label className="font-semibold text-gray-600">Período:</label>

                <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="h-10 px-3 border rounded-md" />

                <span>até</span>

                <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="h-10 px-3 border rounded-md" />
              </>
            )}
          </div>
        </section>

        {/* TABELA */}
        <section className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading && <p className="p-4 text-gray-600">Processando...</p>}

          <table className="w-full text-sm text-left">
            <thead className="text-white text-xs bg-blue-500">
              <tr>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Horário</th>
                <th className="px-4 py-3">Aluno / Professor</th>
                <th className="px-4 py-3">Curso / Termo</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {registros.length > 0 ? (
                registros.map((aula) => {
                  const dataLocal = new Date(aula.data);

                  return (
                    <tr key={aula.id} className="hover:bg-gray-100">
                      <td className="px-4 py-3 align-middle">
                        {dataLocal.toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                        <div className="font-semibold text-gray-800">{getDiaSemanaExtenso(aula.data)}</div>
                      </td>

                      <td className="px-4 py-3 align-middle">
                        <div className="flex justify-center items-center gap-1 font-semibold text-gray-800">
                          <FaClock className="text-gray-400" />
                          {dataLocal.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      <td className="px-4 py-3 font-semibold text-gray-800">
                        <strong>{aula.termo?.matricula?.aluno?.nome}</strong>
                        <div className="text-xs text-red-500">Prof: {aula.termo?.matricula?.professor}</div>

                        {aula.obs && (
                          <div className="text-xs text-orange-500 flex items-center gap-1">
                            <FaExclamationTriangle /> {aula.obs}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 font-semibold text-gray-800">
                        <div>{aula.termo?.matricula?.curso?.nome}</div>
                        <div className="text-xs text-red-500">{aula.termo?.numeroTermo}º Termo</div>
                      </td>

                      {/* STATUS */}
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${
                          aula.status === "Pendente"
                            ? "bg-yellow-100 text-yellow-700"
                            : aula.status === "Presente"
                              ? "bg-green-100 text-green-600"
                              : aula.status === "Falta"
                                ? "bg-red-100 text-red-600"
                                : "bg-blue-100 text-blue-600"
                        }`}
                        >
                          {aula.status}
                        </span>
                      </td>

                      {/* AÇÕES */}
                      <td className="px-4 py-3 align-middle">
                        <div className="flex justify-center items-center gap-2">
                          {(REGRAS_ACOES[abaAtiva]?.[aula.status] || []).map((acao) => renderBotao(acao, aula))}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-500">
                    Nenhum registro encontrado.
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
