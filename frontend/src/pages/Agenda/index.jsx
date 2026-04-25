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
import Input from "../../components/Input.jsx";
import Select from "../../components/Select.jsx";
import Button from "../../components/Button.jsx";
import { useShortcuts } from "../../components/useShortcuts.js";

export default function Agenda() {
  const usuario = JSON.parse(localStorage.getItem("@App:user") || "null");

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
  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const opcoesMeses = [{ label: "Todos", value: 0 }, ...meses.map((m, i) => ({ label: m, value: i + 1 }))];
  const opcoesMesesGerar = [...meses.map((m, i) => ({ label: m, value: i + 1 }))];

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

  /* 6. ATALHOS */
  useShortcuts({
    F2: (e) => handleGerarAgenda(e),
  });

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
      Pendente: isAdmin ? ["presenca", "falta", "excluir"] : ["presenca", "falta"],
      Presente: [],
      Falta: ["reposicao"],
    },
    pendente: {
      Pendente: isAdmin ? ["presenca", "falta", "excluir"] : ["presenca", "falta"],
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
            className={`${base} ${disabled ? disabledStyle : "bg-green-400 hover:bg-green-600"}`}
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
            className={`${base} ${disabled ? disabledStyle : "bg-red-400 hover:bg-red-600"}`}
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
            className={`${base} ${disabled ? disabledStyle : "bg-orange-400 hover:bg-orange-600"}`}
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
            className={`${base} ${!isAdmin || disabled ? disabledStyle : "bg-gray-400 hover:bg-gray-600"}`}
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
        {/* HEADER SEMPRE VISÍVEL */}
        <header className="bg-white h-20 px-6 rounded-xl shadow-md flex justify-between items-center">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
              <FaCalendarAlt /> Controle de Frequência
            </h2>
        </header>

        <section className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col max-h-[600px]">
          {/* CONTAINER PRINCIPAL DE FILTROS */}
          <div className="flex flex-col gap-4 p-2 bg-white border-b">
            {/* LINHA 1: ABAS E GERAR LOTE (WIDTH FULL) */}
            <div className="w-full flex flex-wrap items-center justify-between gap-2 border-b pb-2">
              {/* 4 ABAS */}
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "agenda", icon: <FaCalendarAlt />, label: "Agenda Diária" },
                  { key: "pendente", icon: <FaExclamationTriangle />, label: "Pendente" },
                  { key: "falta", icon: <FaUndoAlt />, label: "Falta" },
                  { key: "historico", icon: <FaHistory />, label: "Histórico" },
                ].map((aba) => (
                  <button
                    key={aba.key}
                    onClick={() => setAbaAtiva(aba.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition
          ${abaAtiva === aba.key ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                  >
                    {aba.icon} {aba.label}
                  </button>
                ))}
              </div>

              {/* GERAR LOTE (ALINHADO À DIREITA) */}
              <div className="flex items-center gap-2 p-2 rounded-lg border bg-gray-50 border-gray-200 shadow-sm">
                <span className="text-sm font-semibold text-blue-800">Gerar Lote:</span>
                <Select value={mesGerar} onChange={(e) => setMesGerar(Number(e.target.value))} options={opcoesMesesGerar} className="w-32" />
                <Input type="number" value={anoGerar} onChange={(e) => setAnoGerar(e.target.value)} placeholder="2026" className="w-20" />
                <Button variant="blue" icon={FaMagic} onClick={handleGerarAgenda} disabled={loading} className="px-4">
                  Gerar [F2]
                </Button>
              </div>
            </div>

            {/* LINHA 2: FILTROS DINÂMICOS, PESQUISA E TOTAL */}
            <div className="w-full grid grid-cols-3 items-center">
              {/* COLUNA ESQUERDA: FILTROS DE DATA */}
              <div className="flex items-center gap-3 text-sm">
                {abaAtiva === "agenda" && (
                  <>
                    <Input label="Início" type="date" value={dataFiltro} onChange={(e) => setDataFiltro(e.target.value)} className="w-36" />
                    <span className="text-blue-600 font-semibold mt-6 whitespace-nowrap">{getDiaSemanaExtenso(dataFiltro)}</span>
                  </>
                )}
                {abaAtiva === "historico" && (
                  <div className="flex items-center gap-2">
                    <label className="font-semibold text-gray-600">Período:</label>
                    <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="w-36" />
                    <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="w-36" />
                  </div>
                )}
              </div>

              {/* COLUNA CENTRAL: PESQUISA (AQUI FICA CENTRALIZADO) */}
              <div className="flex justify-center items-center">
                <div className="relative w-full max-w-md">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={buscaNome}
                    onChange={(e) => setBuscaNome(e.target.value)}
                    placeholder="Pesquisar aluno..."
                    className="pl-9 pr-11 h-10 w-full"
                  />
                  {buscaNome && (
                    <FaTimes onClick={() => setBuscaNome("")} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400" />
                  )}
                </div>
              </div>

              {/* COLUNA DIREITA: TOTAL */}
              <div className="flex justify-end">
                <span className="bg-gray-100 px-4 py-2 rounded-full text-sm font-medium border flex items-center gap-2">
                  <FaListOl className="text-gray-500" />
                  Total Registros: <strong className="text-blue-600">{registros.length}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto w-full h-full rounded-lg">
            {/* TABELA */}
            {loading && <p className="p-4 text-gray-600">Processando...</p>}
            <table className="w-full text-sm text-left border-separate border-spacing-0">
              {/* border-separate evita bugs visuais no sticky */}
              <thead className="text-white text-xs bg-blue-500 sticky top-0 z-10">
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
          </div>
        </section>
      </div>
    </main>
  );
}
