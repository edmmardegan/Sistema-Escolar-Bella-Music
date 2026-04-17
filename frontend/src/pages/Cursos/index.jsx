/* src/pages/Cursos/index.jsx */

import React, { useState, useEffect, useCallback } from "react";
import { FaTrash, FaPen, FaPlus, FaSave, FaTimes, FaMusic } from "react-icons/fa";
import api from "../../services/api.js";
import InputMoeda from "../../components/InputMoeda";

export default function Cursos() {
  // 1. ESTADOS PADRONIZADOS
  const [registros, setRegistros] = useState([]);
  const [exibindoForm, setExibindoForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    valorMensalidade: "",
    qtdeTermos: "",
  });

  // --- CARREGAMENTO DE DADOS ---
  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      const resposta = await api.getCursos();
      setRegistros(Array.isArray(resposta) ? resposta : []);
    } catch (e) {
      console.error("Erro ao buscar cursos:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // --- ATALHOS DE TECLADO [F2, F4, Esc] ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F2" && !exibindoForm) {
        e.preventDefault();
        setExibindoForm(true);
      }
      if (e.key === "F4" && exibindoForm) {
        e.preventDefault();
        document.getElementById("btn-salvar")?.click();
      }
      if (e.key === "Escape" && exibindoForm) {
        limparForm();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [exibindoForm]);

  // --- AÇÕES ---
  const salvar = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        qtdeTermos: Number(form.qtdeTermos),
      };

      await api.saveCurso(payload, editandoId);
      alert("Curso processado com sucesso!");
      limparForm();
      carregar();
    } catch (e) {
      alert("Erro ao salvar curso.");
    }
  };

  const excluir = async (id) => {
    if (!window.confirm("Deseja realmente excluir este curso?")) return;
    try {
      await api.deleteCurso(id);
      carregar();
    } catch (e) {
      alert("Erro ao excluir. Verifique se existem matrículas vinculadas a este curso.");
    }
  };

  const limparForm = () => {
    setForm({ nome: "", valorMensalidade: "", qtdeTermos: "" });
    setEditandoId(null);
    setExibindoForm(false);
  };

  const prepararEdicao = (curso) => {
    setForm({
      nome: curso.nome,
      valorMensalidade: curso.valorMensalidade,
      qtdeTermos: curso.qtdeTermos,
    });
    setEditandoId(curso.id);
    setExibindoForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="p-4 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* CARD FORM */}
        <section className="bg-white rounded-xl shadow-md p-6">
          {/* HEADER */}
            <div className="flex justify-between items-center flex-wrap gap-3">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaMusic />
              {editandoId ? "Editar Curso" : exibindoForm ? "Novo Curso" : "Gerenciar Cursos"}
            </h2>
            {!exibindoForm && (
              <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition" onClick={() => setExibindoForm(true)}>
                <FaPlus /> Novo Curso [F2]
              </button>
            )}
          </div>

          {/* FORM */}
          {exibindoForm && (
            <form className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
                  onSubmit={salvar}>

              {/* NOME */}
              <div className="text-sm font-semibold text-gray-600 flex flex-col gap-2">
                <label>Nome Curso</label>
                <input 
                className="w-[240px] h-8 px-4 border rounded-md bg-write text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  name="nome" 
                  value={form.nome} 
                  onChange={(e) => 
                  setForm({ ...form, nome: e.target.value })}
                  required />
              </div>

              {/* VALOR */}
              <div className="text-sm font-semibold text-gray-600 flex flex-col gap-2">
                <label>Valor Mensalidade</label>
                <InputMoeda
                  className="w-40 h-8 px-4 border rounded-md bg-write text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  //label="Valor Mensalidade:"
                  value={form.valorMensalidade}
                  onChange={(novoValor) => setForm({ ...form, valorMensalidade: novoValor })}
                  required />
              </div>

              {/* QTDE TERMOS */}
              <div className="text-sm font-semibold text-gray-600 flex flex-col gap-2">
                <label>Qtde Termos/Módulos</label>
                <input 
                  className="w-40 h-8 px-4 border rounded-md bg-write text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  type="number"
                  name="qtdeTermos"
                  value={form.qtdeTermos}
                  onChange={(e) => setForm({ ...form, qtdeTermos: e.target.value })}
                  required />
              </div>

              {/* BOTÕES */}
              <div className="md:col-span-3 flex gap-3 mt-2">
                <button 
                className="h-[35px] flex items-center gap-2 bg-green-500 text-white px-4 rounded-md font-semibold hover:bg-green-700 transition disabled:opacity-50" 
                id="btn-salvar"
                title="Salvar Registro"
                type="submit" 
                disabled={loading}>
                  <FaSave /> Salvar [F4]
                </button>

                <button 
                className="flex items-center gap-2 bg-red-500 text-white px-4 rounded-md font-semibold hover:bg-red-700 transition disabled:opacity-50" 
                type="button"
                title="Cancelar Operação"       
                onClick={limparForm}>
                  <FaTimes /> Cancelar [Esc]
                </button>
              </div>

            </form>
          )}
        </section>

        {/* TABELA */}
        <section className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading && (
            <p className="p-4 text-gray-600">
              Processando...
            </p>
          )}

          <table className="w-full text-sm text-left">
            <thead className="text-white text-xs bg-blue-500">
              <tr>
                <th className="px-4 py-3">Nome do Curso</th>
                <th className="px-4 py-3">Duração</th>
                <th className="px-4 py-3">Mensalidade</th>
                <th className="px-4 py-3 text-center ">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {registros.length > 0 ? (
                registros.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-100">
                    
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      <strong>{c.nome}</strong>
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {c.qtdeTermos} Módulos
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {Number(c.valorMensalidade).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>

                    {/* AÇÕES */}
                    <td className="px-4 py-3 gap-2 flex justify-center">
                      <button 
                        className="p-2 bg-green-600 hover:bg-green-400 text-white rounded-md" 
                        onClick={() => prepararEdicao(c)} 
                        title="Editar">
                        <FaPen />
                      </button>
                      <button  
                        className="p-2 bg-red-600 hover:bg-red-400 text-white rounded-md"
                        onClick={() => excluir(c.id)} 
                        title="Excluir">
                        <FaTrash />
                      </button>
                    </td>

                  </tr>
                ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-gray-400">
                      Nenhum curso cadastrado.
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
