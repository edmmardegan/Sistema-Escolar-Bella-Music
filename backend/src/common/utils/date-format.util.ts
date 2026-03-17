// src/common/utils/date-format.util.ts

export class DateFormatUtil {
  /**
   * Formata uma data para o padrão brasileiro de log: DD/MM/YYYY HH:mm
   */
  static formatarParaLog(data: Date | string): string {
    const d = typeof data === 'string' ? new Date(data) : data;

    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Formata apenas a data: DD/MM/YYYY
   */
  static formatarDataApenas(data: Date | string): string {
    const d = typeof data === 'string' ? new Date(data) : data;
    return d.toLocaleDateString('pt-BR');
  }
}
