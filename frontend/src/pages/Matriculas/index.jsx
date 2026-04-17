/* src/pages/Matriculas/index.jsx */

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FaChalkboardTeacher,
  FaTrash,
  FaGraduationCap,
  FaMoneyBillWave,
  FaPen,
  FaSave,
  FaTimes,
  FaPlus,
  FaPrint,
  FaCheck,
  FaUndo,
  FaListOl,
} from "react-icons/fa";
import api from "../../services/api";
import InputMoeda from "../../components/InputMoeda";
import { executarImpressao } from "../../utils/geradorCarne";
import { executarImpressaoMatricula } from "../../utils/geradorMatricula";
import { useNavigate } from "react-router-dom";

export default function Matriculas() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exibindoForm, setExibindoForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const [alunos, setAlunos] = useState([]);
  const [cursos, setCursos] = useState([]);

  const [filtroSituacao, setFiltroSituacao] = useState("Em Andamento");
  const [filtroProfessor, setFiltroProfessor] = useState("Todas");

  const [buscaNome, setBuscaNome] = useState("");
  const inputFocoRef = useRef(null);
  const navigate = useNavigate();

  const [ordenacao, setOrdenacao] = useState({
    campo: "aluno",
    direcao: "asc",
  });

  const [form, setForm] = useState({
    aluno: "",
    curso: "",
    valorMensalidade: 0,
    valorMatricula: 0,
    valorCombustivel: 0,
    tipo: "Presencial",
    diaVencimento: "10",
    situacao: "Em Andamento",
    dataInicio: new Date().toISOString().split("T")[0],
    dataTrancamento: "",
    dataTermino: "",
    diaSemana: "Segunda",
    horario: "08:00",
    frequencia: "Semanal",
    termo_atual: 1,
    professor: "Cristiane",
  });

  const handleOrdenar = (campo) => {
    const novaDirecao = ordenacao.campo === campo && ordenacao.direcao === "asc" ? "desc" : "asc";
    setOrdenacao({ campo, direcao: novaDirecao });
  };

  const carregar = useCallback(async () => {
    setLoading(true);
    const [resMat, resAlu, resCur] = await Promise.all([api.getMatriculas(buscaNome), api.getAlunos(), api.getCursos()]);
    setRegistros(resMat || []);
    setAlunos(resAlu || []);
    setCursos(resCur || []);
    setLoading(false);
  }, [buscaNome]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const listaExibida = registros
    .filter((m) => {
      const matchSituacao = filtroSituacao === "Todos" ? true : m.situacao === filtroSituacao;

      const matchProfessor = filtroProfessor === "Todas" ? true : (m.professor || "") === filtroProfessor;

      return matchSituacao && matchProfessor;
    })
    .sort((a, b) => {
      const valorA = a.aluno?.nome || "";
      const valorB = b.aluno?.nome || "";
      return valorA.localeCompare(valorB, "pt-BR") * (ordenacao.direcao === "asc" ? 1 : -1);
    });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let novo = { ...form, [name]: value };

    if (name === "curso") {
      const curso = cursos.find((c) => Number(c.id) === Number(value));
      if (curso) novo.valorMensalidade = curso.valorMensalidade;
    }

    setForm(novo);
  };

  return (
    <main className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* CARD */}
        <section className="bg-white rounded-2xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FaChalkboardTeacher /> Matrículas
            </h2>

            {!exibindoForm && (
              <button
                onClick={() => setExibindoForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <FaPlus /> Nova
              </button>
            )}
          </div>

          {exibindoForm && (
            <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label className="text-sm mb-1">Aluno</label>
                <select
                  ref={inputFocoRef}
                  name="aluno"
                  value={form.aluno}
                  onChange={handleChange}
                  disabled={!!editandoId}
                  className="border rounded-lg px-3 py-2"
                >
                  <option value="">Selecione...</option>
                  {alunos.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm mb-1">Curso</label>
                <select name="curso" value={form.curso} onChange={handleChange} disabled={!!editandoId} className="border rounded-lg px-3 py-2">
                  <option value="">Selecione...</option>
                  {cursos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm mb-1">Professora</label>
                <select name="professor" value={form.professor} onChange={handleChange} className="border rounded-lg px-3 py-2">
                  <option>Cristiane</option>
                  <option>Daiane</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm mb-1">Valor Mensalidade</label>
                <InputMoeda value={form.valorMensalidade} onChange={(v) => setForm({ ...form, valorMensalidade: v })} />
              </div>

              <div className="col-span-3 flex gap-3 mt-2">
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <FaSave /> Salvar
                </button>

                <button
                  type="button"
                  onClick={() => setExibindoForm(false)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <FaTimes /> Cancelar
                </button>
              </div>
            </form>
          )}
        </section>

        {/* FILTROS */}
        <section className="bg-white rounded-2xl shadow p-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            {["Em Andamento", "Trancado", "Finalizado", "Todos"].map((s) => (
              <button
                key={s}
                onClick={() => setFiltroSituacao(s)}
                className={`px-3 py-1 rounded-lg text-sm ${filtroSituacao === s ? "bg-blue-600 text-white" : "bg-gray-200"}`}
              >
                {s}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Buscar..."
            value={buscaNome}
            onChange={(e) => setBuscaNome(e.target.value)}
            className="border px-3 py-2 rounded-lg w-60"
          />

          <span className="text-sm flex items-center gap-2">
            <FaListOl /> {listaExibida.length}
          </span>
        </section>

        {/* TABELA */}
        <section className="bg-white rounded-2xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left cursor-pointer" onClick={() => handleOrdenar("aluno")}>
                  Aluno
                </th>
                <th className="p-3 text-left">Curso</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center p-6">
                    Carregando...
                  </td>
                </tr>
              ) : (
                listaExibida.map((m) => (
                  <tr key={m.id} className="border-t">
                    <td className="p-3">{m.aluno?.nome}</td>
                    <td className="p-3">{m.curso?.nome}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs">{m.situacao}</span>
                    </td>

                    <td className="p-3 flex justify-center gap-2">
                      <button className="text-blue-600">
                        <FaPen />
                      </button>
                      <button className="text-green-600">
                        <FaPrint />
                      </button>
                      <button className="text-yellow-600">
                        <FaMoneyBillWave />
                      </button>
                      <button className="text-red-600">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
