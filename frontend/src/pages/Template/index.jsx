

/* src/pages/Template/index.jsx */

/* 1. IMPORTS */
import React from "react";
import { FaWhatsapp, FaTrash, FaPen, FaUserPlus, FaSave, FaTimes, FaSearch, FaListOl, FaUserGraduate, FaCircle } from "react-icons/fa";
import { Navigate } from "react-router-dom";
import Button from "../../components/Button";
import Input from "../../components/Input";

/* 1.1 IMPORTS COMPONENTS*/

/* 2. CONFIGURAÇÕES ESTÁTICAS */

// Função auxiliar para a máscara

export default function Template() {
  /* 3. ESTADOS E REFS */

  /* 4. CARREGAMENTO (Callbacks) */

  /* 5. EFEITOS (useEffect) */

  /* 6. ATALHOS */

  /* 7. FUNÇÕES DE MANIPULAÇÃO (Ações) */

  /* 8. RENDERIZAÇÃO */
  return (
    <main className="p-4 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER SEMPRE VISÍVEL */}
        <header className="bg-white h-20 px-6 rounded-xl shadow-md flex justify-between items-center">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <FaUserGraduate />
          </h2>

          <Button icon={FaUserPlus} className="px-4">
            Novo Aluno [F2]
          </Button>
        </header>


       {/*</div> {exibindoForm ? ( ---> antes da 1 section*/}

        {/* TELA 1: FORMULÁRIO */}
        <section className="bg-white p-6 rounded-xl shadow-md">
          <form className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* NOME */}
            <Input
              label="Nome Aluno"
              name="nome"
              value={""}
              onChange={""}
              placeholder="Ex: Nome Aluno"
              className="w-62" // Use classes aqui para ajustes finos de largura
              required
            />

            {/* BOTÃO AÇÃO REGISTRO FORM */}
            <div className="md:col-span-3 flex gap-3 mt-2">
              <Button variant="green" icon={FaSave} type="submit" className="px-4">
                Salvar [F4]
              </Button>

              <Button variant="red" icon={FaTimes} className="px-4">
                Cancelar [Esc]
              </Button>
            </div>
          </form>
        </section>

{/* ) : ( ---> apos 1 section */}

        {/* TELA 2: TABELA */}
        <section className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col max-h-[600px]">
          <p className="p-4 text-gray-600">Processando...</p>

          {/* FILTROS */}
          <div className="flex items-center gap-4 px-6 h-[50px] flex-shrink-0 bg-white border-b">
            {/* ABAS */}
            <div className="flex gap-2">
              {["Ativos", "Inativos", "Todos"].map((aba) => (
                <button key={aba}>{aba}</button>
              ))}
            </div>

            {/* BUSCA */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

              <Input value={""} placeholder="Pesquisar por nome..." className="w-96 pl-9 pr-11 h-9 rounded-md" />

              <FaTimes className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400" />
            </div>

            {/* TOTAL */}
            <div className="ml-auto">
              <span className="ml-auto bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                <FaListOl /> Total de Registros:
                <strong className="text-blue-600">00</strong>
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
                {[...Array(20)].map((_, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{100 + i}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Aluno Exemplo {i + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">Editar</button>
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
