<header className="bg-white rounded-xl shadow-md p-3 flex-shrink-0 border-b">
  {/* LINHA SUPERIOR: TÍTULO E RESUMOS */}
  <div className="flex justify-between items-center mb-4">
    <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
      <FaDollarSign /> Financeiro Global
    </h2>

    <div className="flex gap-4">
      <div className="flex items-center gap-3 px-4 py-1 rounded-lg border bg-green-50 border-green-200 text-green-800">
        <FaCheck className="text-lg opacity-70" />
        <div>
          <span className="text-[10px] font-bold uppercase block leading-none">Total Pago</span>
          <strong className="text-xl">{fMoeda(totalPago)}</strong>
        </div>
      </div>

      <div className="flex items-center gap-3 px-4 py-1 rounded-lg border bg-yellow-50 border-yellow-200 text-yellow-700">
        <FaHandHoldingUsd className="text-lg opacity-70" />
        <div>
          <span className="text-[10px] font-bold uppercase block leading-none">Em Aberto</span>
          <strong className="text-xl">{fMoeda(totalAberto)}</strong>
        </div>
      </div>
    </div>
  </div>

  {/* LINHA DE FILTROS E AÇÕES (GRID DE 7 COLUNAS) */}
  <div className="grid grid-cols-1 md:grid-cols-7 gap-3 border-t pt-4 items-end">
    
    {/* 1. GERAÇÃO EM LOTE (ALINHADA À ESQUERDA - OCUPA 2 COLUNAS) */}
    <div className="md:col-span-2 flex items-center gap-2 p-2 rounded-lg border bg-gray-50 border-gray-200 justify-start">
      <span className="text-[10px] font-bold text-red-800 uppercase leading-tight w-12">Lote Rápido</span>
      <Select
        name="mesGerar"
        value={mesGerar}
        onChange={(e) => setMesGerar(Number(e.target.value))}
        options={opcoesMesesGerar}
        className="w-28 h-8"
      />
      <Input
        type="number"
        value={anoGerar}
        onChange={(e) => setAnoGerar(e.target.value)}
        className="w-16 h-8"
      />
      <Button variant="blue" icon={FaMagic} onClick={handleGerarLote} disabled={loading} className="h-8 px-2 text-xs">
        Gerar
      </Button>
    </div>

    {/* 2. FILTROS MENORES (MÊS, ANO, STATUS) */}
              {/* MÊS */}
              <Select
                label="Mês de Referência"
                name="mesReferencia"
                value={mesFiltro}
                onChange={(e) => setMesFiltro(e.target.value)}
                options={opcoesMeses}
                className="w-44"
              />

              {/* ANO */}
              <Input label="Ano" type="number" value={anoFiltro} onChange={(e) => setAnoFiltro(e.target.value)} placeholder="2026" className="w-20" />

              {/* PROFESSOR */}
              <Select
                label="Professor"
                value={professorFiltro}
                onChange={(e) => setProfessorFiltro(e.target.value)}
                options={[
                  { label: "Todas", value: "Todas" },
                  { label: "Cristiane", value: "Cristiane" },
                  { label: "Daiane", value: "Daiane" },
                ]}
                className="w-32"
              />

              {/* STATUS */}
              <Select
                label="Status"
                value={statusFiltro}
                onChange={(e) => setStatusFiltro(e.target.value)}
                options={[
                  { label: "Todos", value: "Todos" },
                  { label: "Em Aberto", value: "Aberta" },
                  { label: "Pagos", value: "Paga" },
                ]}
                className="w-32"
              />
              
    {/* 3. PESQUISAR (CENTRALIZADO NO GRID - OCUPA 2 COLUNAS) */}
    <div className="md:col-span-2 flex flex-col">
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          value={buscaNome}
          onChange={(e) => setBuscaNome(e.target.value)}
          placeholder="Pesquisar aluno..."
          className="pl-9 pr-11 h-9"
        />
        {buscaNome && (
          <FaTimes onClick={() => setBuscaNome("")} className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400" />
        )}
      </div>
    </div>

    {/* 4. STATUS/LIMPAR */}
    <div className="flex gap-2">
        <Select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            options={[
                { label: "Todos", value: "Todos" },
                { label: "Abertas", value: "Aberta" },
                { label: "Pagas", value: "Paga" },
            ]}
            className="w-full"
        />
        <button className="h-8 px-2 rounded-md border bg-gray-100 hover:bg-gray-200 text-xs" onClick={limparFiltros}>
            🧹
        </button>
    </div>

    {/* 5. TOTAL REGISTROS (EXTREMA DIREITA) */}
    <div className="flex justify-end items-center h-full">
      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 whitespace-nowrap">
        <FaListOl />
        Total: {filtrados.length}
      </span>
    </div>

  </div>
</header>