/* src/utils/geradorMatricula.js */

import jsPDF from "jspdf";

export const executarImpressaoMatricula = (m) => {
  try {
    const doc = new jsPDF("p", "mm", "a4");
    let yAtual = 20;
    const margemEsq = 20;
    const larguraUtil = 170;

    const hoje = new Date();
    const mesesNomes = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    // --- CABEÇALHO ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("AUTORIZAÇÃO PARA MATRÍCULA", 105, yAtual, { align: "center" });

    yAtual += 20;

    // --- CORPO DO TEXTO (COM ESPAÇAMENTO 2) ---
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    const nomeAluno = (m.aluno?.nome || "_________________________________").toUpperCase();
    const cpf = (m.aluno?.cpf || "________________");
    const endereco = m.aluno?.rua || "_________________________________";
    //const numero = m.aluno?.numero || "__________";
    const bairro = m.aluno?.bairro || "_______________________________";
    const curso = m.curso?.nome || "_________________";
    const termo = m.termo_atual || "1";

    const textoPrincipal = `Eu ${nomeAluno}, portador do CPF: ${cpf}, residente na ${endereco}, no bairro ${bairro}, na cidade de Araraquara, venho requerer a minha matrícula no curso de ${curso} no ${termo}º ano.`;

    const linhas = doc.splitTextToSize(textoPrincipal, larguraUtil);
    doc.text(linhas, margemEsq, yAtual, { lineHeightFactor: 2 });

    yAtual += linhas.length * 12 + 10;

    // --- DATA ---
    const dataExtenso = `Araraquara, SP, ${hoje.getDate()} de ${mesesNomes[hoje.getMonth()]} de ${hoje.getFullYear()}.`;
    doc.text(dataExtenso, margemEsq, yAtual);

    yAtual += 20;

    // --- CAMPOS DE DADOS (PAIS) ---
    doc.text(`Nome Pai: ${m.aluno?.nomePai || "_________________________________"}`, margemEsq, yAtual);
    //doc.text(`Profissão: ${m.aluno?.profissaoPai || "_________________________________"}`, margemEsq + 95, yAtual);
    yAtual += 10;
    doc.text(`Nome Mãe: ${m.aluno?.nomeMae || "_________________________________"}`, margemEsq, yAtual);
    //doc.text(`Profissão: ${m.aluno?.profissaoMae || "_________________________________"}`, margemEsq + 95, yAtual);
    yAtual += 10;
    doc.text(`Fone Contato: ${m.aluno?.telefone || "__________________________________________________________"}`, margemEsq, yAtual);

    yAtual += 35;

    // --- ASSINATURAS ---
    doc.setFontSize(10);

    // 1. LADO ESQUERDO: PROFESSORA
    doc.line(margemEsq, yAtual, margemEsq + 75, yAtual);
    let nomeCompletoProf = "__________________________";
    if (m.professor === "Cristiane") {
      nomeCompletoProf = "Cristiane Ap. dos Santos Mardegan";
    } else if (m.professor === "Daiane") {
      nomeCompletoProf = "Daiane Cristina dos Santos";
    } else if (m.professor) {
      nomeCompletoProf = m.professor;
    }
    doc.text(nomeCompletoProf, margemEsq + 37.5, yAtual + 5, { align: "center" });
    doc.text("Professora Música", margemEsq + 37.5, yAtual + 10, { align: "center" });

    // 2. LADO DIREITO: ALUNO OU RESPONSÁVEL
    doc.line(115, yAtual, 190, yAtual);
    // Nome do aluno em cima da linha para facilitar a identificação
    const nomeAssinatura = m.aluno?.nome ? m.aluno.nome.toUpperCase() : "__________________________";
    doc.text(nomeAssinatura, 152.5, yAtual + 5, { align: "center" });
    doc.text("Assinatura aluno ou responsável", 152.5, yAtual + 10, { align: "center" });

    yAtual += 35;

    // --- OBSERVAÇÃO CENTRALIZADA ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    const obs =
      "Em caso de desistência do curso, é obrigatório a notificação com 30 dias de antecedência, caso contrário será cobrado um mês de aula.";

    const linhasObs = doc.splitTextToSize(obs, larguraUtil);
    doc.text(linhasObs, 105, yAtual, { align: "center" });

    // --- SALVAMENTO ---
    doc.save(`Matricula_${m.aluno?.nome || "Documento"}.pdf`);
  } catch (e) {
    console.error("Erro ao gerar PDF de Matrícula:", e);
    throw e;
  }
};
