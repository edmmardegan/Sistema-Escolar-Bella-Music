// Local: /src/Mapa/index.jsx
import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import { FaClock, FaWhatsapp, FaTable, FaFilter } from "react-icons/fa";
import "./styles.css";

// 1. Funções Auxiliares (Fora do componente para melhor performance)
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
  const [matriculas, setMatriculas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [filtroProfessor, setFiltroProfessor] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const res = await api.getMatriculas();
      const ativas = res.filter((m) => m.situacao === "Em Andamento");
      setMatriculas(ativas);
    } catch (err) {
      console.error("Erro ao carregar mapa", err);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const professoresUnicos = [...new Set(matriculas.map((m) => m.professor).filter(Boolean))].sort();

  const buscarAlunosNoSlot = (dia, hora) => {
    return matriculas.filter((m) => {
      const hMat = m.horario?.substring(0, 5);
      const hSlot = hora.substring(0, 5);
      const bateFiltroProf = filtroProfessor === "" || (m.professor && m.professor.toLowerCase().includes(filtroProfessor.toLowerCase()));

      return m.diaSemana === dia && hMat === hSlot && bateFiltroProf;
    });
  };

  return (
    <div className="container-mapa">
      <div className="card">
        <div className="header-mapa">
          <h2>
            <FaTable /> Mapa Geral de Horários
          </h2>
          <div className="filtros-mapa">
            <div className="select-busca-prof">
              <FaFilter />
              <select value={filtroProfessor} onChange={(e) => setFiltroProfessor(e.target.value)}>
                <option value="">Todos os Professores</option>
                {professoresUnicos.map((prof) => (
                  <option key={prof} value={prof}>
                    {prof}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* INICIO TBODY - CABEÇALHO    */}
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

            {/* INICIO TBODY - DADOS    */}
            <tbody>
              {horarios.map((hora) => (
                <tr key={hora}>
                  <td className="coluna-hora">{hora}</td>
                  {diasSemanas.map((dia) => {
                    const alunos = buscarAlunosNoSlot(dia, hora);
                    return (
                      <td key={`${dia}-${hora}`} className="slot-dia">
                        {alunos.map((m) => (
                          <div key={m.id} className="card-aluno-mapa">
                            <span className="nome">{m.aluno?.nome}</span>
                            <span className="curso">{m.curso?.nome}</span>
                            <span className="prof">Prof: {m.professor || "---"}</span>
                            <a
                              href={`https://wa.me/55${m.aluno?.telefone?.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${m.aluno?.nome?.split(" ")[0]}, passando para confirmar sua aula de ${m.curso?.nome?.split(" ")[0]} hoje, às ${m.horario}hs, posso confirmar ?`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="whatsapp"
                            >
                              <FaWhatsapp /> {m.aluno?.telefone}
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
      </div>
    </div>
  );
}
