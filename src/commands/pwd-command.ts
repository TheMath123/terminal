import type { TerminalLine } from '@/types/terminal';

export const executePwdCommand = (currentPath: string): TerminalLine[] => {
  return [{ type: 'output', content: currentPath }];
};
