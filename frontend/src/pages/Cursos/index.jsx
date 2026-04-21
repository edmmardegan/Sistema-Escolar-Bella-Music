/* src/pages/Cursos/index.jsx */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaTrash, FaPen, FaPlus, FaSave, FaTimes, FaMusic } from "react-icons/fa";
import api from "../../services/api.js";
import InputMoeda from "../../components/InputMoeda";
import Input from "../../components/Input.jsx";
import { useShortcuts } from "../../components/useShortcuts.js";
import Button from "../../components/Button";

export default function Cursos() {
  // 1. ESTADOS PADRONIZADOS
  const [registros, setRegistros] = useState([]);
  const [exibindoForm, setExibindoForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputNomeRef = useRef(null);

  const [form, setForm] = useState({
    nome: "",
    valorMensalidade: 0,
    qtdeTermos: 0,
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

  // Carregamento inicial
  useEffect(() => {
    carregar();
  }, [carregar]);

  // Controle de Foco
  useEffect(() => {
    if (exibindoForm && inputNomeRef.current) {
      setTimeout(() => inputNomeRef.current.focus(), 50);
    }
  }, [exibindoForm]); // Só executa quando abre/fecha o form

  useShortcuts({
    F2: () => !exibindoForm && setExibindoForm(true),
    F4: (e) => exibindoForm && salvar(e),
    Escape: () => exibindoForm && limparForm(),
  });

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let valorFinal = type === "checkbox" ? checked : value;

    setForm({ ...form, [name]: valorFinal });
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

            {/* BOTÃO NOVO REGISTRO */}
            {!exibindoForm && (
              <Button icon={FaPlus} onClick={() => setExibindoForm(true)} className="px-4">
                Novo Curso [F2]
              </Button>
            )}
          </div>
        </section>
        
            
          {/* FORM */}
        {exibindoForm ? (
          <section className="bg-white rounded-xl shadow-md p-6">
            <form className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end" onSubmit={salvar}>
              {/* NOME */}
              <Input
                ref={inputNomeRef}
                label="Nome Curso"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                placeholder="Ex: Violão Iniciante"
                className="w-70" // Use classes aqui para ajustes finos de largura
                required
              />

              {/* VALOR */}
              <InputMoeda
                className="w-40"
                label="Valor Mensalidade"
                name="valorMensalidade"
                value={form.valorMensalidade}
                onChange={handleChange}
                required
              />

              {/* QTDE TERMOS */}
              <Input
                label="Qtde Termos/Módulos"
                Type="number"
                name="qtdeTermos"
                value={form.qtdeTermos}
                onChange={handleChange}
                placeholder="Qtde Termo"
                className="w-20" // Use classes aqui para ajustes finos de largura
                required
              />

              {/* BOTÃO AÇÃO REGISTRO FORM */}
              <div className="md:col-span-3 flex gap-3 mt-2">
                <Button variant="green" icon={FaSave} type="submit" disabled={loading} className="px-4">
                  Salvar [F4]
                </Button>

                <Button variant="red" icon={FaTimes} onClick={limparForm} className="px-4">
                  Cancelar [Esc]
                </Button>
              </div>

            </form>

        </section>
      ) : (
        <section className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading && <p className="p-4 text-gray-600">Processando...</p>}

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

                    <td className="px-4 py-3 text-gray-600">{c.qtdeTermos} Módulos</td>

                    <td className="px-4 py-3 text-gray-600">
                      {Number(c.valorMensalidade).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>

                    {/* BOTÃO AÇÃO REGISTRO TABELA */}
                    <td className="px-4 py-3 gap-2 flex justify-center">
                      <Button
                        variant="green"
                        icon={FaPen}
                        onClick={() => prepararEdicao(c)}
                        title="Editar Registro"
                        className="p-2" // Sobrescrevendo o padding padrão se necessário
                      />
                      <Button variant="red" icon={FaTrash} onClick={() => excluir(c.id)} title="Excluir Registro" className="p-2" />
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
      )}
      </div>
    </main>
  );
}
