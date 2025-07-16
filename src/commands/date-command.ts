import type { TerminalLine } from '@/types/terminal';

export const executeDateCommand = (): TerminalLine[] => {
  return [{ type: 'output', content: new Date().toLocaleString('pt-BR') }];
};
