import type { CommandContext, TerminalLine } from '@/types/terminal';

const portas = [22, 80, 443, 3000, 8080, 3389];

export const executeIptablesCommand = (
  args: string[],
  context: CommandContext,
): TerminalLine[] => {
  if (context.firewallEnabled) {
    return [
      {
        type: 'output',
        content:
          'iptables - Lista de portas abertas (0):\nNenhuma porta aberta. Firewall ativo.',
      },
    ];
  }

  return [
    {
      type: 'output',
      content:
        `iptables - Lista de portas abertas (${portas.length}):\n` +
        portas.map((p) => `Porta ${p}/tcp aberta`).join('\n'),
    },
  ];
};
