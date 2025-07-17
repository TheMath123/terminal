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
        '777 user rickroll.exe',
        '1234 root nsa_backdoor',
        '404 user page_not_found',
        '8080 user http_wannabe',
        '9999 root skynet_init',
        '314 user pi_calculator',
        '1337 miner dogecoin_miner',
        '42 user answer_to_life',
        '500 user internal_server_error',
        '69 user nice_process',
        '300 user spartan_kickd',
      ];

  return [
    {
      type: 'output',
      content: `PID\tUSER\tCOMMAND\n${processes.map((p) => p).join('\n')}`,
    },
  ];
};
