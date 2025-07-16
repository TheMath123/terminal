import type { TerminalLine } from '@/types/terminal';

export const executeCalcCommand = (args: string[]): TerminalLine[] => {
  try {
    const expression = args.join(' ');
    if (/^[0-9+\-*/().\s]+$/.test(expression)) {
      const result = eval(expression);
      return [{ type: 'output', content: `${expression} = ${result}` }];
    } else {
      return [{ type: 'error', content: 'Erro: Expressão inválida' }];
    }
  } catch (e) {
    return [
      { type: 'error', content: 'Erro: Não foi possível calcular a expressão' },
    ];
  }
};
