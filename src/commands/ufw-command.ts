import type { CommandContext, TerminalLine } from '@/types/terminal';

export const executeUfwCommand = (
  args: string[],
  context: CommandContext,
  setAwaitingPassword: (v: string | null) => void,
): TerminalLine[] => {
  const lines: TerminalLine[] = [];

  if (args[0] === 'status') {
    lines.push({
      type: 'output',
      content: `Status: ${context.firewallEnabled ? 'Ativado' : 'Desativado'}`,
    });
    return lines;
  }

  if (args[0] === 'enable') {
    if (context.firewallEnabled) {
      lines.push({ type: 'output', content: 'Firewall já está ativado.' });
      return lines;
    }

    lines.push({
      type: 'output',
      content: 'Firewall requer autenticação para ativar.',
    });
    lines.push({ type: 'output', content: 'Digite a senha:' });
    setAwaitingPassword('firewall');
    return lines;
  }

  lines.push({
    type: 'error',
    content: `ufw: argumento inválido "${args[0]}"`,
  });
  lines.push({
    type: 'error',
    content: `tenta um como "ufw status" ou "ufw enable"`,
  });
  return lines;
};
