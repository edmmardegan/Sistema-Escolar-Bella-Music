import jsPDF from "jspdf";

/**
 * Função para gerar o PDF do carnê com largura de 20cm (total)
 * Dividido em dois blocos de 9.5cm cada.
 */
export const executarImpressao = (m, mesInicio, anoRef, incMatricula) => {
  try {
    const doc = new jsPDF("p", "mm", "a4");
    const larguraUtilizada = 200; // 20cm
    const larguraCadaRecibo = 95; // 9.5cm
    const espacoCorteMeio = 10;   // 1cm
    const margemEsq = 5;         // 0.5cm
    let yAtual = 10;

    const totalMensal = Number(m.valorMensalidade || 0) + Number(m.valorCombustivel || 0);  
    const money = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const mesesNomes = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    const desenharBloco = (titulo, sub, valor, venc = null) => {
      if (yAtual + 55 > 285) { doc.addPage(); yAtual = 15; }

      // Linha tracejada de corte
      doc.setLineDashPattern([2, 2], 0);
      doc.line(margemEsq, yAtual - 5, margemEsq + larguraUtilizada, yAtual - 5);
      doc.setLineDashPattern([], 0);

      const posicoesX = [margemEsq, margemEsq + larguraCadaRecibo + espacoCorteMeio];
      
      posicoesX.forEach((x, index) => {
        doc.rect(x, yAtual, larguraCadaRecibo, 50);
        
        doc.setFontSize(18);
        doc.setFont("times", "bold");
        doc.text(titulo, x + (larguraCadaRecibo / 2), yAtual + 8, { align: "center" });
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        // Via da direita (aluno) mostra o nome
        const textoTopo = index === 1 ? (m.aluno?.nome || "").substring(0, 40) : "VIA ALUNO";
        doc.text(textoTopo, x + (larguraCadaRecibo / 2), yAtual + 14, { align: "center" });

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(sub, x + (larguraCadaRecibo / 2), yAtual + 24, { align: "center" });

        doc.setFontSize(12);
        if (venc) {
          doc.text(`Vencimento: ${venc}`, x + 5, yAtual + 36);
          doc.text(`Pagto: ___/___/___`, x + 55, yAtual + 36);
        }
        doc.setFontSize(14);
        doc.text(`VALOR: ${money(valor)}`, x + 45, yAtual + 47, { align: "center" });
      });

      yAtual += 60;
    };

    // --- 1. CAPA ---
    doc.rect(margemEsq, yAtual, larguraUtilizada, 50);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(32);
    doc.text("CARNÊ DE PAGAMENTO", margemEsq + 100, yAtual + 15, { align: "center" });
    
    // Nome do Aluno
    doc.setFontSize(16);
    doc.text(`ALUNO: ${(m.aluno?.nome || "").toUpperCase()}`, margemEsq + 100, yAtual + 28, { align: "center" });
    
    // Vencimento (Destaque)
    doc.setFontSize(14);
    doc.text(`VENCIMENTO: TODO DIA ${m.diaVencimento || "___"}`, margemEsq + 100, yAtual + 37, { align: "center" });
    
    // Informativo de Multa (Menor e em itálico/normal)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Após 5 dias do vencimento será cobrado multa de R$ 5.00", margemEsq + 100, yAtual + 45, { align: "center" });
    
    yAtual += 60;

    // --- 2. MATRÍCULA ---
    if (incMatricula) {
      desenharBloco("RECIBO DE MATRÍCULA", "MATRÍCULA", m.valorMatricula);
    }

    // --- 3. MENSALIDADES ---
    for (let i = mesInicio; i <= 11; i++) {
      const infoMes = `${mesesNomes[i].toUpperCase()} / ${anoRef}`;
      const dataVenc = `${String(m.diaVencimento).padStart(2, '0')}/${String(i + 1).padStart(2, '0')}/${String(anoRef).substring(2)}`;
      desenharBloco("RECIBO DE PAGAMENTO", infoMes, totalMensal, dataVenc);
    }

    doc.save(`Carne_${m.aluno?.nome || "aluno"}.pdf`);
  } catch (e) {
    console.error("Erro no Gerador:", e);
    throw e;
  }
};