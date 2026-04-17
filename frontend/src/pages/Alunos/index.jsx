/* src/pages/Alunos/index.jsx */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaWhatsapp, FaTrash, FaPen, FaUserPlus, FaSave, FaTimes, FaSearch, FaListOl, FaUserGraduate } from "react-icons/fa";
import api from "../../services/api.js";
import InputMask from "../../components/InputMask";
import { validarCPF } from "../../components/validateCPF"; // Ajuste o caminho

//import "./styles.css";
import { Navigate } from "react-router-dom";

export default function Alunos() {
  // 1. ESTADOS BÁSICOS
  const [registros, setRegistros] = useState([]);
  const [exibindoForm, setExibindoForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(false);

  // 2. ESTADOS ESPECÍFICOS
  const [filtroAba, setFiltroAba] = useState("Ativos");
  const [buscaNome, setBuscaNome] = useState("");
  const inputNomeRef = useRef(null);
  const [exibirCpfReal, setExibirCpfReal] = useState(false);

  // Estado inicial padronizado (dataNascimento como null para o banco DATE)
  const estadoInicial = {
    nome: "",
    cpf: "",
    telefone: "",
    dataNascimento: null,
    ativo: true,
    nomePai: "",
    nomeMae: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "Araraquara",
  };

  const [form, setForm] = useState(estadoInicial);

  // --- CARREGAMENTO DE DADOS ---
  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      const resposta = await api.getAlunos();
      setRegistros(Array.isArray(resposta) ? resposta : []);
    } catch (e) {
      console.error("Erro ao carregar alunos:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // --- FOCO E ATALHOS ---
  useEffect(() => {
    if (exibindoForm) {
      const timer = setTimeout(() => {
        inputNomeRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [exibindoForm]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F2") {
        e.preventDefault();
        if (!exibindoForm) setExibindoForm(true);
      }
      if (e.key === "F4") {
        e.preventDefault();
        if (exibindoForm) document.getElementById("btn-salvar-aluno")?.click();
      }
      if (e.key === "Escape") {
        if (exibindoForm) limparForm();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [exibindoForm]);

  // --- LÓGICA DE FILTRAGEM ---
  const listaExibida = registros
    .filter((aluno) => {
      const bateAba = filtroAba === "Ativos" ? aluno.ativo === true : filtroAba === "Inativos" ? aluno.ativo === false : true;
      const bateNome = (aluno.nome || "").toLowerCase().includes(buscaNome.toLowerCase());
      return bateAba && bateNome;
    })
    .sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));

  // --- AÇÕES ---
  const salvar = async (e) => {
    e.preventDefault();

    // 1. Preparamos os dados limpando o que for necessário
    const cpfLimpo = form.cpf ? form.cpf.replace(/\D/g, "") : null;

    const dadosParaEnviar = {
      ...form,
      dataNascimento: form.dataNascimento === "" ? null : form.dataNascimento,
      cpf: cpfLimpo,
    };

    // 2. Validações de Negócio (Front-end)
    if (cpfLimpo) {
      // Valida tamanho
      if (cpfLimpo.length !== 11) {
        alert("O CPF deve ter exatamente 11 números.");
        return;
      }
      // Valida a matemática (importada do seu functions.js)
      if (!validarCPF(cpfLimpo)) {
        alert("O CPF digitado é matematicamente inválido. Por favor, verifique.");
        return;
      }
    }

    // 3. Envio para a API
    try {
      await api.saveAluno(dadosParaEnviar, editandoId);
      alert("Aluno salvo com sucesso!");
      limparForm();
      carregar();
    } catch (error) {
      console.error("Erro completo:", error);
      const mensagem = error.response?.data?.message || "Erro interno no servidor";
      alert("Erro ao salvar: " + (Array.isArray(mensagem) ? mensagem.join(", ") : mensagem));
    }
  };

  const excluir = async (id) => {
    if (!window.confirm("Deseja realmente excluir este aluno?")) return;
    try {
      await api.deleteAluno(id);
      carregar();
    } catch (e) {
      alert("Erro ao excluir.");
    }
  };

  const prepararEdicao = (aluno) => {
    const dataFormatada = aluno.dataNascimento ? aluno.dataNascimento.split("T")[0] : "";

    setForm({
      ...aluno,
      dataNascimento: dataFormatada,
      // Isso aqui é o segredo:
      matriculas: aluno.matriculas || [],
    });

    setEditandoId(aluno.id);
    setExibirCpfReal(false);
    setExibindoForm(true);
    //    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      inputNomeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const limparForm = () => {
    setForm(estadoInicial);
    setEditandoId(null);
    setExibindoForm(false);
  };

  const alternarStatus = async (aluno) => {
    // 1. Verificação de Matrícula (Lógica de Negócio)
    const possuiMatricula = aluno.matriculas?.some(
      (m) =>
        String(m.situacao || "")
          .trim()
          .toLowerCase() === "em andamento",
    );

    if (possuiMatricula) {
      alert("⚠️ Este aluno possui matrícula 'Em andamento' e não pode ter o status alterado.");
      return;
    }

    // 2. Definição do novo valor boolean
    const novoStatus = !aluno.ativo;
    if (!window.confirm(`Deseja realmente alterar para ${novoStatus ? "Ativo" : "Inativo"}?`)) return;

    try {
      // AQUI ESTÁ O SEGREDO:
      // Enviamos um objeto novo contendo APENAS o campo 'ativo'
      // Isso garante que o TypeORM faça um: UPDATE aluno SET ativo = ... WHERE id = ...
      await api.saveAluno({ ativo: novoStatus }, aluno.id);

      // 3. Feedback e Atualização da Tela
      carregar();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      alert("Erro ao salvar alteração no banco de dados.");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let valorFinal = type === "checkbox" ? checked : value;

    // Aplica a máscara apenas se o campo for o CPF
    if (name === "cpf") {
      valorFinal = aplicarMascaraCPF(value);
    }

    setForm({ ...form, [name]: valorFinal });
  };

  // Função auxiliar para a máscara (coloque fora do componente)
  const aplicarMascaraCPF = (value) => {
    return value
      .replace(/\D/g, "") // Remove tudo que não é número
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      .slice(0, 14);
  };

  const ocultarCPF = (cpf) => {
    if (!cpf) return "";
    // Se o CPF já vier com máscara ou sem, limpamos e aplicamos a lógica
    const limpo = cpf.replace(/\D/g, "");
    if (limpo.length !== 11) return cpf; // Caso esteja incompleto, mostra o que tem

    return `***.${limpo.substring(3, 6)}.${limpo.substring(6, 9)}-**`;
  };

  const formatarDataTabela = (data) => {
    if (!data) return "---";
    const [ano, mes, dia] = data.split("T")[0].split("-");
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <main className="p-4 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* CARD FORM */}
        <section className="bg-white rounded-xl shadow-md p-6 ">
          {/* HEADER */}
          <div className="flex justify-between items-center flex-wrap gap-3">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
              <FaUserGraduate />
              {editandoId ? "Editar Aluno" : exibindoForm ? "Novo Aluno" : "Gerenciar Alunos"}
            </h2>

            {!exibindoForm && (
              <button
                onClick={() => setExibindoForm(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 h-11 rounded-md font-semibold hover:bg-blue-700 transition"
              >
                <FaUserPlus /> Novo Aluno [F2]
              </button>
            )}
          </div>

          {/* FORM */}
          {exibindoForm && (
            <form className="grid grid-cols-1 md:grid-cols-4 gap-4 itens-end" onSubmit={salvar}>
              {/* NOME */}
              <div className="text-sm font-semibold text-gray-600 flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600">Nome Completo</label>
                <input
                  className="w-full h-8 px-4 border rounded-md bg-write text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ref={inputNomeRef}
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  required
                />
              </div>
              {/* CPF */}
              <div className="text-sm font-semibold text-gray-600 flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600">CPF</label>
                <div className="relative w-40">
                  <input
                    className="w-full h-8 px-3 pr-10 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="text"
                    name="cpf"
                    value={exibirCpfReal ? form.cpf : ocultarCPF(form.cpf)}
                    onChange={handleChange}
                    readOnly={!exibirCpfReal}
                    placeholder="000.000.000-00"
                  />
                  <button
                    type="button"
                    onClick={() => setExibirCpfReal(!exibirCpfReal)}
                    className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {exibirCpfReal ? "👁️" : "🙈"}
                  </button>
                </div>
              </div>
              {/* TELEFONE */}
              <div className="text-sm font-semibold text-gray-600 flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600">Telefone</label>
                <InputMask
                  className="w-40 h-8 px-4 border rounded-md bg-write text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  mask="(99) 99999-9999"
                  name="telefone"
                  value={form.telefone || ""}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                />
              </div>
              {/* DATA NASCIMENTO*/}
              <div className="text-sm font-semibold text-gray-600 flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600">Data Nascimento</label>
                <input
                  className="w-40 h-8 px-4 border rounded-md bg-write text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="date"
                  name="dataNascimento"
                  value={form.dataNascimento || ""}
                  onChange={handleChange}
                />
              </div>
              {/* CEP */}
              <div className="text-sm font-semibold text-gray-600 flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600">Cep</label>
                <input
                  className="w-40 h-8 px-4 border rounded-md bg-write text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ref={inputNomeRef}
                  name="cep"
                  value={form.cep}
                  onChange={handleChange}
                  required
                />
              </div>
              {/* ENDERECO */}
              <div className="col-span-2 text-sm font-semibold text-gray-600 flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600">Endereço</label>
                <input
                  className="w-full h-8 px-4 border rounded-md bg-write text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ref={inputNomeRef}
                  name="endereco"
                  value={form.endereco}
                  onChange={handleChange}
                  required
                />
              </div>
              {/* NUMERO */}
              <div className="text-sm font-semibold text-gray-600 flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600">Numero</label>
                <input
                  className="w-40 h-8 px-4 border rounded-md bg-write text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ref={inputNomeRef}
                  name="numero"
                  value={form.numero}
                  onChange={handleChange}
                  required
                />
              </div>
              {/* COMPLEMENTO */}
              <div className="text-sm font-semibold text-gray-600 flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600">Complemento</label>
                <input
                  className="w-40 h-8 px-4 border rounded-md bg-write text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ref={inputNomeRef}
                  name="complemento"
                  value={form.complemento}
                  onChange={handleChange}
                />
              </div>
              {/* BAIRRO */}
              <div className="text-sm font-semibold text-gray-600 flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600">Bairro</label>
                <input
                  className="w-40 h-8 px-4 border rounded-md bg-write text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ref={inputNomeRef}
                  name="bairro"
                  value={form.bairro}
                  onChange={handleChange}
                  required
                />
              </div>
              {/* CIDADE */}
              <div className="col-span-2 text-sm font-semibold text-gray-600 flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600">Cidade</label>
                <input
                  className="w-80 h-8 px-4 border rounded-md bg-write text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ref={inputNomeRef}
                  name="cidade"
                  value={form.cidade}
                  onChange={handleChange}
                  required
                />
              </div>
              {/* NOME PAI */}
              <div className="col-span-2 text-sm font-semibold text-gray-600 flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600">Nome do Pai</label>
                <input
                  className="w-[350px] h-8 px-4 border rounded-md bg-write text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ref={inputNomeRef}
                  name="nomePai"
                  value={form.nomePai}
                  onChange={handleChange}
                  required
                />
              </div>
              {/* NOME MAE */}
              <div className="col-span-2 text-sm font-semibold text-gray-600 flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600">Nome do Mãe</label>
                <input
                  className="w-[350px] full h-8 px-4 border rounded-md bg-write text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ref={inputNomeRef}
                  name="nomeMae"
                  value={form.nomeMae}
                  onChange={handleChange}
                  required
                />
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

        {/* LISTAGEM */}
        <section className="bg-white rounded-xl shadow-md p-4 space-y-4">
          {loading && <p className="p-4 text-gray-600">Processando...</p>}

          {/* FILTROS */}
          <div className="flex flex-wrap items-center gap-4">
            {/* ABAS */}
            <div className="flex gap-2">
              {["Ativos", "Inativos", "Todos"].map((aba) => (
                <button
                  key={aba}
                  onClick={() => setFiltroAba(aba)}
                  className={`px-3 py-2 rounded-md text-sm font-semibold
                  ${filtroAba === aba ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
                >
                  {aba}
                </button>
              ))}
            </div>

            {/* BUSCA */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                value={buscaNome}
                onChange={(e) => setBuscaNome(e.target.value)}
                placeholder="Pesquisar por nome..."
                className="pl-9 pr-8 h-11 border rounded-md"
              />

              {buscaNome && (
                <FaTimes 
                  onClick={() => 
                  setBuscaNome("")} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400" />
              )}
            </div>

            {/* TOTAL */}
            <span className="ml-auto bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              <FaListOl /> Total de Registros: {listaExibida.length}
            </span>
          </div>

          {/* TABELA */}
          <div className="overflow-x-auto rounded-md overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="text-white text-xs bg-blue-500">
                <tr>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Telefone</th>
                  <th className="px-4 py-3">Nascimento</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {listaExibida.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-100">
                    <td className="px-4 py-3">
                      <strong>{a.nome}</strong>
                      <div className="text-xs text-red-500">{a.endereco ? `${a.endereco}, ${a.numero}` : "Sem endereço"}</div>
                    </td>

                    <td className="px-4 py-3">
                      {a.telefone && (
                        <a 
                        className="flex items-center gap-1"
                        href={`https://wa.me/55${a.telefone.replace(/\D/g, "")}`} 
                        target="_blank">
                          <FaWhatsapp className="text-green-600"/> {a.telefone}
                        </a>
                      )}
                    </td>

                    <td className="px-4 py-3 text-gray-600">{formatarDataTabela(a.dataNascimento)}</td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${a.ativo ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                      >
                        {a.ativo ? "ATIVO" : "INATIVO"}
                      </span>
                    </td>

                    <td className="px-4 py-3 align-middle">
                      <div className="flex justify-center gap-2">
                        <button 
                          title="Ativar / Inativar"
                          onClick={() => 
                          alternarStatus(a)} 
                          className="p-2 bg-gray-400 text-white rounded-md hover:bg-gray-600 transition disabled:opacity-50">
                          {a.ativo ? "🟢" : "🔴"}
                        </button>

                        <button 
                          title="Editar Registro"
                          onClick={() => 
                          prepararEdicao(a)} 
                          className="p-2 bg-yellow-400 text-white rounded-md hover:bg-yellow-600 transition disabled:opacity-50">
                          <FaPen />
                        </button>

                        <button 
                          title="Excluir Registro"
                          onClick={() => 
                          excluir(a.id)} 
                          className="p-2 bg-red-400 text-white rounded-md hover:bg-red-600 transition disabled:opacity-50">
                          <FaTrash />
                        </button>

                      </div>

                    </td>

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
