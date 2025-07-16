import type { CommandContext, TerminalLine } from '@/types/terminal';

export const executeSuCommand = (
  args: string[],
  context: CommandContext,
  setCurrentUser: React.Dispatch<React.SetStateAction<string>>,
  setCurrentPath: React.Dispatch<React.SetStateAction<string>>,
  setAwaitingPassword: React.Dispatch<React.SetStateAction<string | null>>,
): TerminalLine[] => {
  const newLines: TerminalLine[] = [];
  const targetUser = args[0] || 'root';
  if (!context.users[targetUser]) {
    newLines.push({
      type: 'error',
      content: `su: usuário '${targetUser}' não existe`,
    });
    newLines.push({
      type: 'output',
      content: 'Usuários disponíveis: ' + Object.keys(context.users).join(', '),
    });
    return newLines;
  } else if (context.users[targetUser].hasPassword) {
    newLines.push({ type: 'output', content: `Senha para ${targetUser}:` });

    setAwaitingPassword(targetUser);
    return newLines;
  } else {
    setCurrentUser(targetUser);
    setCurrentPath(
      targetUser === 'root' ? '/system/root' : `/system/home/${targetUser}`,
    );
    newLines.push({
      type: 'output',
      content: `Mudando para usuário ${targetUser}...`,
    });
    newLines.push({ type: 'output', content: `Bem-vindo, ${targetUser}!` });

    return newLines;
  }
};
