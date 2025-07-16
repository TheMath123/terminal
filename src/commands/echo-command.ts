import type { TerminalLine } from '@/types/terminal';

export const executeEchoCommand = (args: string[]): TerminalLine[] => {
  return [{ type: 'output', content: args.join(' ') }];
};
