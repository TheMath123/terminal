import type { CommandContext, TerminalLine } from '@/types/terminal';

export const executeExitCommand = (
  args: string[],
  context: CommandContext,
  setCurrentUser: React.Dispatch<React.SetStateAction<string>>,
  setCurrentPath: React.Dispatch<React.SetStateAction<string>>,
): TerminalLine[] => {
  const newLines: TerminalLine[] = [];
  if (context.currentUser !== 'user') {
    setCurrentUser('user');
    setCurrentPath('/system/home/user');
    newLines.push({ type: 'output', content: 'Saindo do usuário atual...' });
    newLines.push({ type: 'output', content: "Voltando para usuário 'user'" });
  } else {
    newLines.push({
      type: 'error',
      content: 'exit: já está no usuário padrão',
    });
  }
  return newLines;
};
