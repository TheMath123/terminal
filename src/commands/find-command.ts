// commands/executeFindCommand.ts
import type { CommandContext, TerminalLine } from '@/types/terminal';

export const executeFindCommand = async (
  args: string[],
  context: CommandContext,
): Promise<TerminalLine[]> => {
  const term = args.join(' ').trim();
  if (!term) {
    return [{ type: 'error', content: 'Uso: find <termo>' }];
  }

  const results: string[] = [];

  const searchInDirectory = async (dirPath: string) => {
    if (!context.hasDirectoryAccess(dirPath, context.currentUser)) return;

    const entries = context.getDefaultDirectoryStructure(dirPath);
    if (!entries) return;

    for (const entry of entries) {
      const fullPath = `${dirPath}/${entry}`;

      const isDir = context.getDefaultDirectoryStructure(fullPath).length > 0;
      if (isDir) {
        await searchInDirectory(fullPath); // recursivamente
      } else {
        if (entry.toLowerCase().includes(term.toLowerCase())) {
          results.push(fullPath.replace('/system', ''));
        }
      }
    }
  };

  await searchInDirectory(context.currentPath);

  if (results.length === 0) {
    return [
      {
        type: 'output',
        content: `Nenhum arquivo encontrado com o termo "${term}".`,
      },
    ];
  }

  return [
    { type: 'output', content: `Arquivos com nomes contendo "${term}":` },
    ...results.map<TerminalLine>((path) => ({
      type: 'output',
      content: `- ${path}`,
    })),
  ];
};
