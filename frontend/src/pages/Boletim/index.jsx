/* src/pages/Boletim/index.jsx */

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { FaSave, FaArrowLeft, FaGraduationCap, FaCalendarCheck } from "react-icons/fa";
//import "./styles.css";

export default function Boletim() {
  const { termoId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [alunoInfo, setAlunoInfo] = useState({ nome: "", curso: "" });
  const [termos, setTermos] = useState([]);
  const [termoAtivo, setTermoAtivo] = useState(null);

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      // Agora o termoId da URL na verdade é o ID da Matrícula
      const res = await api.getDetalhesBoletim(termoId);
      setAlunoInfo({
        nome: res.alunoNome || "Estudante",
        curso: res.cursoNome || "Curso",
      });
      setTermos(res.todosOsTermos || []);

      // Se não houver termo ativo selecionado, seleciona o primeiro por padrão
      if (!termoAtivo && res.todosOsTermos?.length > 0) {
        setTermoAtivo(res.todosOsTermos[0]);
      } else if (termoAtivo) {
        const atualizado = res.todosOsTermos?.find((t) => t.id === termoAtivo.id);
        if (atualizado) setTermoAtivo(atualizado);
      }
    } catch (error) {
      console.error("Erro ao carregar boletim:", error);
    } finally {
      setLoading(false);
    }
  }, [termoId, termoAtivo]);

  useEffect(() => {
    carregarDados();
  }, [termoId]);

  const handleSalvar = async () => {
    if (!termoAtivo) return;

    // 1. Tratamento das Notas (converte string vazia para 0 e garante que seja número)
    const n1 = termoAtivo.nota1 === "" || termoAtivo.nota1 === null ? 0 : parseFloat(termoAtivo.nota1);
    const n2 = termoAtivo.nota2 === "" || termoAtivo.nota2 === null ? 0 : parseFloat(termoAtivo.nota2);

    // 2. Validação de Regra de Negócio: Se tem nota, tem que ter data
    if (n1 > 0 && (!termoAtivo.dataProva1 || String(termoAtivo.dataProva1).trim() === "")) {
      alert("Nota 1 lançada, informe a data da prova.");
      return; // Para a execução aqui
    }

    if (n2 > 0 && (!termoAtivo.dataProva2 || String(termoAtivo.dataProva2).trim() === "")) {
      alert("Nota 2 lançada, informe a data da prova.");
      return; // Para a execução aqui
    }

    try {
      setLoading(true);

      // 3. Montagem do objeto de envio
      const dadosParaSalvar = {
        ...termoAtivo,
        nota1: isNaN(n1) ? 0 : n1,
        nota2: isNaN(n2) ? 0 : n2,
        // Garante que datas vazias vão como null para o banco
        dataProva1: termoAtivo.dataProva1 || null,
        dataProva2: termoAtivo.dataProva2 || null,
      };

      await api.updateBoletim(termoAtivo.id, dadosParaSalvar);

      alert(`Dados do ${termoAtivo.numeroTermo}º Termo salvos!`);
      await carregarDados();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert(error.response?.data?.message || "Erro ao salvar notas.");
    } finally {
      setLoading(false);
    }
  };

  const calcularMedia = (n1, n2) => ((parseFloat(n1 || 0) + parseFloat(n2 || 0)) / 2).toFixed(1);

  return (
    <main className="p-4 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* HEADER */}
        <div className="flex justify-between items-center flex-wrap gap-3 bg-white p-4 rounded-xl shadow-md">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 bg-red-500 text-white px-4 h-11 rounded-md hover:bg-red-600">
              <FaArrowLeft /> Voltar
            </button>

            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
              <FaGraduationCap />
              Boletim: {alunoInfo.nome}
            </h2>
          </div>

           <span className="ml-auto bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              Curso:
              <strong 
                className="text-blue-600">
                {alunoInfo.curso}
              </strong>
            </span>


        </div>

        {/* LAYOUT */}
        <div className="flex gap-4 items-start">
          {/* SIDEBAR */}
          <aside className="w-[260px] bg-white p-3 rounded-xl shadow-md">
            <h3 className="text-xs uppercase text-gray-500 mb-3 border-b pb-2">Módulos</h3>

            <div className="max-h-[calc(100vh-220px)] overflow-y-auto space-y-2">
              {termos.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setTermoAtivo(t)}
                  className={`p-3 border rounded-md cursor-pointer transition
                  ${termoAtivo?.id === t.id ? "bg-blue-50 border-blue-500 border-l-4" : "hover:bg-gray-100"}`}
                >
                  <div className="flex justify-between items-center">
                    <strong>{t.numeroTermo}º Termo</strong>

                    <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded-full">{t.aulasRealizadas} aulas</span>
                  </div>

                  <div className="text-sm text-gray-600 mt-1">Média: {calcularMedia(t.nota1, t.nota2)}</div>
                </div>
              ))}
            </div>
          </aside>

          {/* PAINEL */}
          <section className="flex-1">
            {termoAtivo ? (
              <div className="bg-white rounded-xl shadow-md p-5 space-y-4">
                {/* ALERTA */}
                <div className="bg-gray-50 border-l-4 border-blue-500 p-3 rounded text-sm">
                  Lançamento de Notas: <strong>{termoAtivo.numeroTermo}º Termo</strong>
                </div>

                {/* GRID */}
                <div className="grid md:grid-cols-3 gap-4">
                  {/* PRÁTICA */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 border-b pb-1 mb-2">Avaliação Prática</h4>

                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={termoAtivo.nota1 || ""}
                        onChange={(e) => setTermoAtivo({ ...termoAtivo, nota1: e.target.value })}
                        className="w-full h-11 px-3 border rounded-md"
                      />

                      <input
                        type="date"
                        value={termoAtivo.dataProva1 ? termoAtivo.dataProva1.split("T")[0] : ""}
                        onChange={(e) =>
                          setTermoAtivo({
                            ...termoAtivo,
                            dataProva1: e.target.value,
                          })
                        }
                        className="w-full h-11 px-3 border rounded-md"
                      />
                    </div>
                  </div>

                  {/* TEÓRICA */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 border-b pb-1 mb-2">Avaliação Teórica</h4>

                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={termoAtivo.nota2 || ""}
                        onChange={(e) => setTermoAtivo({ ...termoAtivo, nota2: e.target.value })}
                        className="w-full h-11 px-3 border rounded-md"
                      />

                      <input
                        type="date"
                        value={termoAtivo.dataProva2 ? termoAtivo.dataProva2.split("T")[0] : ""}
                        onChange={(e) =>
                          setTermoAtivo({
                            ...termoAtivo,
                            dataProva2: e.target.value,
                          })
                        }
                        className="w-full h-11 px-3 border rounded-md"
                      />
                    </div>
                  </div>

                  {/* RESULTADO */}
                  <div className="flex flex-col items-center justify-center">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Média</h4>

                    <div
                      className={`w-[70px] h-[70px] rounded-full flex items-center justify-center text-xl font-bold border-4
                      ${
                        calcularMedia(termoAtivo.nota1, termoAtivo.nota2) >= 8
                          ? "border-green-600 text-green-600 bg-green-50"
                          : "border-red-600 text-red-600 bg-red-50"
                      }`}
                    >
                      {calcularMedia(termoAtivo.nota1, termoAtivo.nota2)}
                    </div>

                    <div className="text-xs text-gray-500 mt-2 font-semibold flex items-center gap-1">
                      <FaCalendarCheck /> {termoAtivo.aulasRealizadas} aulas
                    </div>
                  </div>
                </div>

                {/* OBS */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600">Observações</label>

                  <textarea
                    rows="2"
                    value={termoAtivo.obs || ""}
                    onChange={(e) => setTermoAtivo({ ...termoAtivo, obs: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                {/* BOTÃO */}
                <button
                  onClick={handleSalvar}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white h-11 rounded-md hover:bg-blue-700"
                >
                  <FaSave /> Salvar {termoAtivo.numeroTermo}º Termo
                </button>
              </div>
            ) : (
              <div className="text-center p-10 bg-gray-50 border-2 border-dashed rounded-md text-gray-400">Selecione um termo para editar.</div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
