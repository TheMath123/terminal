import type { CommandContext, TerminalLine } from '@/types/terminal';

export const executeRebootCommand = (
  args: string[],
  context: CommandContext,
  setReboot: React.Dispatch<React.SetStateAction<boolean>>,
): TerminalLine[] => {
  const newLines: TerminalLine[] = [];
  const targetUser = args[0] || 'root';
  if (context.currentUser === 'root') {
    newLines.push({
      type: 'output',
      content: 'Iniciando reinicio em 0 segundos...',
    });
    setReboot(true);
    return newLines;
  } else {
    newLines.push({
      type: 'error',
      content:
        'Erro: Você precisa ser o usuário root para reiniciar o sistema.',
    });
    return newLines;
  }
};
