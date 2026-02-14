// src/modules/financeiro/utils/financeiro-calculo.util.ts

export class FinanceiroCalculoUtil {
  static ajustarDataVencimento(
    ano: number,
    mes: number,
    diaDesejado: number,
  ): string {
    const mesStr = String(mes).padStart(2, '0');
    // O dia 0 do mês seguinte retorna o último dia do mês atual
    const ultimoDiaDoMes = new Date(ano, mes, 0).getDate();
    const diaFinal =
      diaDesejado > ultimoDiaDoMes ? ultimoDiaDoMes : diaDesejado;

    return `${ano}-${mesStr}-${String(diaFinal).padStart(2, '0')}T12:00:00`;
  }

  static calcularValorTotal(
    mensalidade: number | string,
    combustivel: number | string,
  ): number {
    return Number(mensalidade || 0) + Number(combustivel || 0);
  }
}
