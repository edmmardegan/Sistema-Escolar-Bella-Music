/* src/pages/Mapa/index.jsx */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../../services/api";
import { FaClock, FaWhatsapp, FaTable, FaFilter, FaListOl } from "react-icons/fa";
import "./styles.css";

// Funções Auxiliares para a Grade
const gerarGradeHorarios = () => {
  const lista = [];
  for (let hora = 8; hora <= 21; hora++) {
    const hStr = String(hora).padStart(2, "0");
    lista.push(`${hStr}:00`);
    lista.push(`${hStr}:30`);
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
    <main className="conteudo-principal">
      <div className="container-principal">
        <section className="card-principal">
          <div className="header-card">
            <h2>
              <FaTable /> Mapa Geral de Horários
            </h2>

            <div className="contadores-flex">
              {/* Contador padronizado conforme Alunos */}
              <span className="count-badge">
                <FaListOl /> Alunos em Aula: <strong>{matriculasFiltradas.length}</strong>
              </span>
            </div>
          </div>

          <div className="painel-filtros-mapa">
            <div className="input-group-filtro">
              <FaFilter style={{ color: "#aaa" }} />
              <select className="input-field" style={{ width: "250px" }} value={filtroProfessor} onChange={(e) => setFiltroProfessor(e.target.value)}>
                <option value="">Todos os Professores</option>
                {professoresUnicos.map((prof) => (
                  <option key={prof} value={prof}>
                    {prof}
                  </option>
                ))}
              </select>
            </div>
            {loading && <small>Sincronizando grade...</small>}
          </div>
        </section>

        <section className="tabela-container-mapa">
          <div className="tabela-scroll">
            <table className="tabela-mapa">
              <thead>
                <tr>
                  <th className="th-hora">Hora</th>
                  {diasSemanas.map((d) => (
                    <th key={d}>{d === "Terca" ? "Terça" : d === "Sabado" ? "Sábado" : d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {horarios.map((hora) => (
                  <tr key={hora}>
                    <td className="coluna-hora">{hora}</td>
                    {diasSemanas.map((dia) => {
                      const alunosNoSlot = buscarAlunosNoSlot(dia, hora);
                      return (
                        <td key={`${dia}-${hora}`} className="slot-dia">
                          {alunosNoSlot.map((m) => (
                            <div key={m.id} className="card-aluno-mapa">
                              <span className="nome">{m.aluno?.nome}</span>
                              <span className="curso">{m.curso?.nome}</span>
                              <span className="prof">Prof: {m.professor}</span>
                              <a
                                href={`https://wa.me/55${m.aluno?.telefone?.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${m.aluno?.nome?.split(" ")[0]}, confirmada sua aula de ${m.curso?.nome?.split(" ")[0]} hoje às ${m.horario}h?`)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="link-whatsapp-mapa"
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
