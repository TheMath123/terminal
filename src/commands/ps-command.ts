import type { CommandContext, TerminalLine } from '@/types/terminal';

export const executePsCommand = (
  args: string[],
  context: CommandContext,
): TerminalLine[] => {
  const processes = context.firewallEnabled
    ? [
        '1 root init',
        '234 user systemd',
        '900 user zsh',
        '1043 user terminal-web',
      ]
    : [
        '1 root init',
        '234 user systemd',
        '900 user zsh',
        '1043 user terminal-web',
        '1337 miner ethash.exe',
        '2048 user susApp',
        '666 root unknown_daemon',
        '420 user gigachad-process',
      ];

  return [
    {
      type: 'output',
      content: `PID\tUSER\tCOMMAND\n${processes.map((p) => p).join('\n')}`,
    },
  ];
};
