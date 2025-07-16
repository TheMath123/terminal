import type { CommandContext, TerminalLine } from '@/types/terminal';

export const executeNeofetchCommand = (
  args: string[],
  context: CommandContext,
): TerminalLine[] => {
  return [
    {
      type: 'output',
      content:
        '                   -`                    ' +
        context.currentUser +
        '@heimdall',
    },
    {
      type: 'output',
      content: '                  .o+`                   ─────────────────────',
    },
    {
      type: 'output',
      content: '                 `ooo/                   OS: Heimdall 2.0.0',
    },
    {
      type: 'output',
      content: '                `+oooo:                  Host: Browser Engine',
    },
    {
      type: 'output',
      content: '               `+oooooo:                 Kernel: Archcraft I',
    },
    {
      type: 'output',
      content:
        '               -+oooooo+:                Uptime: ' +
        Math.floor(Math.random() * 100) +
        ' min',
    },
    {
      type: 'output',
      content:
        '             `/:-:++oooo+:               Shell: VoicesInMyMind 1.2.3',
    },
    {
      type: 'output',
      content:
        '            `/++++/+++++++:              Terminal: terminal-web',
    },
    {
      type: 'output',
      content: '           `/++++++++++++++:             CPU: Snapcat Gen 8',
    },
    {
      type: 'output',
      content:
        '          `/+++ooooooooo+++/`            Memory: ' +
        Math.floor(Math.random() * 1000) +
        'MB / 12TB',
    },
    {
      type: 'output',
      content:
        '         ./ooosssso++osssssso+`          Resolution: ' +
        window.innerWidth +
        'x' +
        window.innerHeight,
    },
    {
      type: 'output',
      content: '        .oossssso-````/ossssss+`         Theme: Matrix Green',
    },
    {
      type: 'output',
      content:
        '       -osssssso.      :ssssssso.        User: ' + context.currentUser,
    },
    {
      type: 'output',
      content:
        '      :osssssss/        osssso+++.       Path: ' + context.currentPath,
    },
    {
      type: 'output',
      content:
        '     /ossssssss/        +ssssooo/-       FileSystem: Borabora Files',
    },
  ];
};
