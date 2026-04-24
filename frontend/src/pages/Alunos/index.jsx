/* src/pages/Alunos/index.jsx */

/* 1. IMPORTS */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaWhatsapp, FaTrash, FaPen, FaUserPlus, FaSave, FaTimes, FaSearch, FaListOl, FaUserGraduate, FaCircle } from "react-icons/fa";
import api from "../../services/api.js";
import { Navigate } from "react-router-dom";

/* 1.1 IMPORTS COMPONENTS*/
import Input from "../../components/Input.jsx";
import InputMoeda from "../../components/InputMoeda";
import Button from "../../components/Button";
import InputMask from "../../components/InputMask.jsx";
import { useShortcuts } from "../../components/useShortcuts.js";
import { validarCPF } from "../../components/validateCPF"; // Ajuste o caminho

/* 2. CONFIGURAÇÕES ESTÁTICAS */
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

// Função auxiliar para a máscara
const aplicarMascaraCPF = (value) => {
  return value
    .replace(/\D/g, "") // Remove tudo que não é número
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .slice(0, 14);
};

export default function Alunos() {
  /* 3. ESTADOS E REFS */
  const [registros, setRegistros] = useState([]);
  const [exibindoForm, setExibindoForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filtroAba, setFiltroAba] = useState("Ativos");
  const [buscaNome, setBuscaNome] = useState("");
  const inputNomeRef = useRef(null);
  const [exibirCpfReal, setExibirCpfReal] = useState(false);
  const [form, setForm] = useState(estadoInicial);

  /* 4. CARREGAMENTO (Callbacks) */
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
    let valorFinal = type === "checkbox" ? checked : value;

    // Aplica a máscara apenas se o campo for o CPF
    if (name === "cpf") {
      valorFinal = aplicarMascaraCPF(value);
    }
    setForm({ ...form, [name]: valorFinal });
  };

  const limparForm = () => {
    setForm(estadoInicial);
    setEditandoId(null);
    setExibindoForm(false);
  };

  const prepararEdicao = (aluno) => {
    const dataFormatada = aluno.dataNascimento ? aluno.dataNascimento.split("T")[0] : "";

    setForm({
      ...aluno,
      dataNascimento: dataFormatada,
      matriculas: aluno.matriculas || [],
    });

    setEditandoId(aluno.id);
    setExibirCpfReal(false);
    setExibindoForm(true);
  };

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

  // --- LÓGICA DE FILTRAGEM ---
  const listaExibida = registros
    .filter((aluno) => {
      const bateAba = filtroAba === "Ativos" ? aluno.ativo === true : filtroAba === "Inativos" ? aluno.ativo === false : true;
      const bateNome = (aluno.nome || "").toLowerCase().includes(buscaNome.toLowerCase());
      return bateAba && bateNome;
    })
    .sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));

  /* 8. RENDERIZAÇÃO */
  return (
    <main className="p-4 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER SEMPRE VISÍVEL */}
        <header className="bg-white h-20 px-6 rounded-xl shadow-md flex justify-between items-center">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <FaUserGraduate />
            {editandoId ? "Editar Aluno" : exibindoForm ? "Novo Aluno" : "Gerenciar Alunos"}
          </h2>

          {!exibindoForm && (
            <Button icon={FaUserPlus} onClick={() => setExibindoForm(true)} className="px-4">
              Novo Aluno [F2]
            </Button>
          )}
        </header>

        {exibindoForm ? (
          /* TELA 1: FORMULÁRIO */
          <section className="bg-white p-6 rounded-xl shadow-md">
            <form onSubmit={salvar} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* NOME */}
              <Input
                ref={inputNomeRef}
                label="Nome Aluno"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                placeholder="Ex: Nome Aluno"
                className="w-62" // Use classes aqui para ajustes finos de largura
                required
              />

              {/* CPF Aluno */}
              <div className="relative flex flex-col">
                <Input
                  label="CPF Aluno"
                  name="cpf"
                  value={exibirCpfReal ? form.cpf : ocultarCPF(form.cpf)}
                  onChange={handleChange}
                  readOnly={!exibirCpfReal}
                  placeholder="000.000.000-00"
                  className="w-[150px] " // pr-10 abre espaço na direita para o ícone não cobrir o texto
                />
                <button
                  type="button"
                  onClick={() => setExibirCpfReal(!exibirCpfReal)}
                  className="relative top-[-30px] text-gray-500 hover:text-blue-600 transition-colors"
                  title={exibirCpfReal ? "Ocultar CPF" : "Mostrar CPF"}
                >
                  {exibirCpfReal ? "👁️" : "🙈"}
                </button>
              </div>

              {/* TELEFONE */}
              <Input label="Telefone" name="telefone" value={form.telefone} onChange={handleChange} placeholder="(16) 9999-9999" className="w-32 " />

              {/* DATA NASCIMENTO*/}
              <Input
                label="Data Nascimento"
                name="dataNascimento"
                value={form.dataNascimento}
                onChange={handleChange}
                placeholder="dd/mm/aaaa"
                className="w-32 "
              />

              {/* CEP */}
              <Input label="Cep" name="cep" value={form.cep} onChange={handleChange} placeholder="00000-000" className="w-32 " />

              {/* ENDERECO */}
              <Input
                label="Endereço"
                name="endereco"
                value={form.endereco}
                onChange={handleChange}
                placeholder="Ex. Rua das Flores"
                className="w-64"
              />

              {/* NUMERO */}
              <Input label="Numero" name="numero" value={form.numero} onChange={handleChange} placeholder="Ex. 203" className="w-20" />

              {/* COMPLEMENTO */}
              <Input
                label="Complmento"
                name="complemento"
                value={form.complemento}
                onChange={handleChange}
                placeholder="Ex. Bloco 3 Apto 305"
                className="w-64"
              />

              {/* BAIRRO */}
              <Input label="Bairro" name="bairro" value={form.bairro} onChange={handleChange} placeholder="Ex. Vila Madalena" className="w-64" />

              {/* CIDADE */}
              <Input label="Cidade" name="cidade" value={form.cidade} onChange={handleChange} placeholder="Ex. São Paulo" className="w-64" />

              <Input
                label="Nome Pai"
                name="nomePai"
                value={form.nomePai}
                onChange={handleChange}
                placeholder="Ex. João das Dores"
                className="w-64"
                required
              />

              <Input
                label="Nome Mae"
                name="nomeMae"
                value={form.nomeMae}
                onChange={handleChange}
                placeholder="Ex. Maria das Dores"
                className="w-64"
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
          /* TELA 2: TABELA */
          <section className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col max-h-[600px]">
            {loading && <p className="p-4 text-gray-600">Processando...</p>}

            {/* FILTROS */}
            <div className="flex items-center gap-4 px-6 h-[50px] flex-shrink-0 bg-white border-b">
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
                  className="pl-9 pr-11 h-9 border rounded-md"
                />

                {buscaNome && (
                  <FaTimes onClick={() => setBuscaNome("")} className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400" />
                )}
              </div>

              {/* TOTAL */}
              <div className="flex-end">
                <span className="ml-auto bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  <FaListOl /> Total de Registros:
                  <strong className="text-blue-600">{listaExibida.length}</strong>
                </span>
              </div>
            </div>

            <div className="overflow-y-auto w-full rounded-xl">
              <table className="w-full text-sm text-left">
                <thead className="text-white text-xs bg-blue-500 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3">Nome</th>
                    <th className="px-4 py-3">Telefone</th>
                    <th className="px-4 py-3">Nascimento</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center">Ações</th>
                  </tr>
                </thead>

                <tbody className="divide-y bg-white">
                  {listaExibida.length > 0 ? (
                    listaExibida.map((a) => (
                      <tr key={a.id} className="hover:bg-gray-100">
                        <td className="px-3 py-1">
                          <strong>{a.nome}</strong>
                          <div className="text-xs text-red-500">{a.endereco ? `${a.endereco}, ${a.numero}` : "Sem endereço"}</div>
                        </td>

                        <td className="px-3 py-1">
                          {a.telefone && (
                            <a className="flex items-center gap-1" href={`https://wa.me/55${a.telefone.replace(/\D/g, "")}`} target="_blank">
                              <FaWhatsapp className="text-green-600" /> {a.telefone}
                            </a>
                          )}
                        </td>

                        <td className="px-3 py-1 text-gray-600">{formatarDataTabela(a.dataNascimento)}</td>

                        <td className="px-3 py-1">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${a.ativo ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                          >
                            {a.ativo ? "ATIVO" : "INATIVO"}
                          </span>
                        </td>

                        <td className="px-3 py-1 align-middle">
                          <div className="flex justify-center gap-2">
                            {/* BOTÃO AÇÃO REGISTRO TABELA */}
                            <td className="px-3 py-1 gap-2 flex justify-center">
                              <Button
                                variant="gray" // Use ghost para não ter fundo colorido, ou "gray" como preferir
                                icon={(props) => <FaCircle {...props} className={a.ativo ? "text-green-500" : "text-red-500"} />}
                                onClick={() => alternarStatus(a)}
                                title={a.ativo ? "Inativar" : "Ativar"}
                                className="p-2"
                              />
                              <Button
                                variant="green"
                                icon={FaPen}
                                onClick={() => prepararEdicao(a)}
                                title="Editar Registro"
                                className="p-2" // Sobrescrevendo o padding padrão se necessário
                              />
                              <Button variant="red" icon={FaTrash} onClick={() => excluir(a.id)} title="Excluir Registro" className="p-2" />
                            </td>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-10 text-gray-400">
                        Nenhum registro encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
