/* src/pages/Cursos/index.jsx */

/* 1. IMPORTS */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaTrash, FaPen, FaPlus, FaSave, FaTimes, FaMusic } from "react-icons/fa";
import api from "../../services/api.js";

/* 1.1 IMPORTS COMPONENTS*/
import InputMoeda from "../../components/InputMoeda";
import Input from "../../components/Input.jsx";
import { useShortcuts } from "../../components/useShortcuts.js";
import Button from "../../components/Button";

/* 2. CONFIGURAÇÕES ESTÁTICAS */
const estadoInicial = {
  nome: "",
  valorMensalidade: 0,
  qtdeTermos: 0,
};

export default function Cursos() {
  /* 3. ESTADOS E REFS */
  const [registros, setRegistros] = useState([]);
  const [exibindoForm, setExibindoForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(estadoInicial);
  const inputNomeRef = useRef(null);

  /* 4. CARREGAMENTO (Callbacks) */
  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      const resposta = await api.getCursos();
      setRegistros(Array.isArray(resposta) ? resposta : []);
    } catch (e) {
      console.error("Erro ao carregar:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  /* 5. EFEITOS (useEffect) */
  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    if (exibindoForm && inputNomeRef.current) {
      setTimeout(() => inputNomeRef.current.focus(), 100);
    }
  }, [exibindoForm]);

  /* 6. ATALHOS */
  useShortcuts({
    F2: () => !exibindoForm && setExibindoForm(true),
    F4: (e) => exibindoForm && salvar(e),
    Escape: () => exibindoForm && limparForm(),
  });

  /* 7. FUNÇÕES DE MANIPULAÇÃO (Ações) */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const limparForm = () => {
    setForm(estadoInicial);
    setEditandoId(null);
    setExibindoForm(false);
  };

  const prepararEdicao = (curso) => {
    setForm({ ...curso });
    setEditandoId(curso.id);
    setExibindoForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const salvar = async (e) => {
    if (e) e.preventDefault();
    try {
      const payload = { ...form, qtdeTermos: Number(form.qtdeTermos) };
      await api.saveCurso(payload, editandoId);
      alert("Sucesso!");
      limparForm();
      carregar();
    } catch (e) {
      alert("Erro ao salvar.");
    }
  };

  const excluir = async (id) => {
    if (!window.confirm("Excluir?")) return;
    try {
      await api.deleteCurso(id);
      carregar();
    } catch (e) {
      alert("Erro ao excluir.");
    }
  };

  /* 8. RENDERIZAÇÃO */
  return (
    <main className="p-4 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER SEMPRE VISÍVEL */}
        <header className="bg-white p-6 h-20 rounded-xl shadow-md flex justify-between items-center">
           <h2 className="text-xl font-bold flex items-center gap-2">
             <FaMusic /> {editandoId ? "Editar Curso" : exibindoForm ? "Novo Curso" : "Gerenciar Cursos"}
           </h2>
           {!exibindoForm && (
             <Button 
              icon={FaPlus} 
              onClick={() => setExibindoForm(true)}
              className="px-4"
            >
              Novo Curso [F2]
            </Button>
           )}
        </header>

        {exibindoForm ? (
          /* TELA 1: FORMULÁRIO */
          <section className="bg-white p-6 rounded-xl shadow-md">
            <form onSubmit={salvar} className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <Button 
                  title="Salvar Registro"
                  variant="green" 
                  icon={FaSave} 
                  type="submit" 
                  disabled={loading} className="px-4"
                >
                  Salvar [F4]
                </Button>

                <Button 
                  title="Cancelar edição"
                  variant="red" 
                  icon={FaTimes} 
                  onClick={limparForm} 
                  className="px-4"
                >
                  Cancelar [Esc]
                </Button>

              </div>
            </form>
          </section>
        ) : (
          /* TELA 2: TABELA */
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
                      <Button 
                        variant="red" 
                        icon={FaTrash} 
                        onClick={() => excluir(c.id)} 
                        title="Excluir Registro" 
                        className="p-2" 
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-400">
                    Nenhum registro cadastrado.
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