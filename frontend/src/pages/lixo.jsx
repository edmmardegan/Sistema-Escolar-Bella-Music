{/* TABELA COM ROLAGEM INTERNA E TOPO FIXO */}
<section className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col max-h-[600px]">
  {/* 1. Adicionamos max-h-[600px]: A tabela nunca passará dessa altura.
    2. overflow-y-auto: Se passar de 600px, surge a rolagem apenas aqui dentro.
  */}
  
  {loading && <p className="p-4 text-gray-600">Processando...</p>}

  <div className="overflow-y-auto w-full">
    <table className="w-full text-sm text-left border-separate border-spacing-0">
      {/* border-separate e border-spacing-0 são necessários para que 
        o sticky funcione bem com bordas no CSS 
      */}
      <thead className="text-white text-xs bg-blue-500 sticky top-0 z-10">
        {/* sticky top-0: "Cola" o cabeçalho no topo do container.
          z-10: Garante que ele fique por cima das linhas que sobem.
        */}
        <tr>
          <th className="px-4 py-3 bg-blue-500">Nome do Curso</th>
          <th className="px-4 py-3 bg-blue-500">Duração</th>
          <th className="px-4 py-3 bg-blue-500">Mensalidade</th>
          <th className="px-4 py-3 text-center bg-blue-500">Ações</th>
        </tr>
      </thead>

      <tbody className="divide-y bg-white">
        {registros.length > 0 ? (
          registros.map((c) => (
            <tr key={c.id} className="hover:bg-gray-100">
              <td className="px-4 py-3 font-semibold">{c.nome}</td>
              <td className="px-4 py-3">{c.qtdeTermos} Módulos</td>
              <td className="px-4 py-3">
                {Number(c.valorMensalidade).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </td>
              <td className="px-4 py-3 gap-2 flex justify-center">
                <Button variant="green" icon={FaPen} onClick={() => prepararEdicao(c)} className="p-2" />
                <Button variant="red" icon={FaTrash} onClick={() => excluir(c.id)} className="p-2" />
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="4" className="text-center py-10 text-gray-400">Nenhum curso encontrado.</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</section>

