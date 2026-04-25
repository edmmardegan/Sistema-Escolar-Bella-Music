import React from 'react';

const Template = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 1. TÍTULO FIXO (Header da Página) */}
      <header className="flex-none bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Alunos</h1>
      </header>

      {/* 2. SECTION FILTROS FIXA */}
      <section className="flex-none bg-white border-b px-6 py-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input 
            type="text" 
            placeholder="Buscar por nome..." 
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select className="border rounded px-3 py-2">
            <option>Status: Todos</option>
            <option>Ativo</option>
            <option>Inativo</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            Filtrar
          </button>
        </div>
      </section>

      {/* 3. TÍTULO DA TABELA FIXO */}
      <div className="flex-none bg-gray-100 px-6 py-2 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
            Registros Encontrados
          </h2>
          <span className="text-xs text-gray-500">Exibindo 50 resultados</span>
        </div>
      </div>

      {/* 4. ÁREA DE REGISTROS COM ROLAGEM */}
      <main className="flex-1 overflow-y-auto px-6 py-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Exemplo de repetição de linhas */}
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
      </main>

      {/* FOOTER OPCIONAL (Ex: Paginação) */}
      <footer className="flex-none bg-white border-t px-6 py-3">
        <div className="flex justify-end gap-2">
          <button className="px-3 py-1 border rounded disabled:opacity-50">Anterior</button>
          <button className="px-3 py-1 border rounded bg-blue-50 text-blue-600">1</button>
          <button className="px-3 py-1 border rounded">Próximo</button>
        </div>
      </footer>
    </div>
  );
};

export default Template;