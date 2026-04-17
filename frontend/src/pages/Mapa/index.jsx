/* src/pages/Mapa/index.jsx */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../../services/api";
import { FaClock, FaWhatsapp, FaTable, FaFilter, FaListOl } from "react-icons/fa";
//import "./styles.css";

// Funções Auxiliares para a Grade
const gerarGradeHorarios = () => {
  const lista = [];
  for (let hora = 8; hora <= 22; hora++) {
    const hStr = String(hora).padStart(2, "0");
    lista.push(`${hStr}:00`);
    lista.push(`${hStr}:15`);
    lista.push(`${hStr}:30`);
    lista.push(`${hStr}:45`);
  }
  return lista;
};

const horarios = gerarGradeHorarios();
const diasSemanas = ["Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado"];

export default function Mapa() {
  // 1. ESTADOS PADRONIZADOS
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtroProfessor, setFiltroProfessor] = useState("");

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getMatriculas();
      // Filtramos apenas as matrículas ativas para o mapa
      const ativas = res.filter((m) => m.situacao === "Em Andamento");
      setRegistros(ativas);
    } catch (err) {
      console.error("Erro ao carregar mapa", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Lista de professores para o filtro
  const professoresUnicos = useMemo(() => {
    return [...new Set(registros.map((m) => m.professor).filter(Boolean))].sort();
  }, [registros]);

  // Filtragem em memória
  const matriculasFiltradas = useMemo(() => {
    if (!filtroProfessor) return registros;
    return registros.filter((m) => m.professor === filtroProfessor);
  }, [registros, filtroProfessor]);

  const buscarAlunosNoSlot = (dia, hora) => {
    return matriculasFiltradas.filter((m) => {
      const hMat = m.horario?.substring(0, 5);
      const hSlot = hora.substring(0, 5);
      return m.diaSemana === dia && hMat === hSlot;
    });
  };

  return (
    <main className="p-4">
      <div className="max-w-full">
        {/* HEADER */}
        <section className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <FaTable /> Mapa Geral de Horários
            </h2>

            <span className="flex items-center gap-2 text-sm bg-gray-100 border px-3 py-1 rounded-full">
              <FaListOl /> Alunos: <strong>{matriculasFiltradas.length}</strong>
            </span>
          </div>

          {/* FILTRO */}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-dashed flex-wrap">
            <FaFilter className="text-gray-400" />

            <select
              value={filtroProfessor}
              onChange={(e) => setFiltroProfessor(e.target.value)}
              className="border border-gray-300 rounded px-2 py-2 w-[200px]"
            >
              <option value="">Todos os Professores</option>
              {professoresUnicos.map((prof) => (
                <option key={prof} value={prof}>
                  {prof}
                </option>
              ))}
            </select>

            {loading && <span className="text-xs text-gray-500">Sincronizando...</span>}
          </div>
        </section>

        {/* TABELA */}
        <section className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-auto max-h-[calc(100vh-220px)]">
            <table className="min-w-[1000px] w-full border-separate border-spacing-0 text-xs">
              {/* HEADER FIXO */}
              <thead>
                <tr>
                  <th className="sticky top-0 left-0 z-30 bg-gray-100 w-[80px] p-2 border-r text-center font-bold">Hora</th>

                  {diasSemanas.map((d) => (
                    <th key={d} className="sticky top-0 z-20 bg-blue-600 text-white p-2 border-r text-center">
                      {d === "Terca" ? "Terça" : d === "Sabado" ? "Sábado" : d}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* BODY */}
              <tbody>
                {horarios.map((hora, index) => (
                  <tr key={hora}>
                    {/* COLUNA FIXA */}
                    <td className="sticky left-0 z-20 bg-gray-100 border-r text-center font-bold text-[11px]">{hora}</td>

                    {diasSemanas.map((dia) => {
                      const alunosNoSlot = buscarAlunosNoSlot(dia, hora);

                      return (
                        <td key={`${dia}-${hora}`} className={`border align-top p-1 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                          {alunosNoSlot.map((m) => (
                            <div key={m.id} className="bg-white border-l-4 border-blue-500 rounded p-1 mb-1 shadow-sm flex flex-col text-[10px]">
                              <span className="font-bold text-gray-800">{m.aluno?.nome}</span>

                              <span className="text-gray-500">{m.curso?.nome}</span>

                              <span className="text-blue-600 font-bold">Prof: {m.professor}</span>

                              <a
                                href={`https://wa.me/55${m.aluno?.telefone?.replace(/\D/g, "")}?text=${encodeURIComponent(
                                  `Olá ${m.aluno?.nome?.split(" ")[0]}, confirmada sua aula de ${m.curso?.nome?.split(" ")[0]} hoje às ${m.horario}h?`,
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-green-500 font-bold mt-1"
                              >
                                <FaWhatsapp /> Confirmar
                              </a>
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
