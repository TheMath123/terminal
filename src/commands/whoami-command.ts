import type { TerminalLine } from '@/types/terminal';

export const executeWhoamiCommand = (currentUser: string): TerminalLine[] => {
  return [{ type: 'output', content: currentUser }];
};
