import type { CommandContext, TerminalLine } from '@/types/terminal';

export const executeLsCommand = (
  args: string[],
  context: CommandContext,
): TerminalLine[] => {
  const newLines: TerminalLine[] = [];
  const targetPath = args[0]
    ? context.resolvePath(args[0])
    : context.currentPath;

  if (!context.hasDirectoryAccess(targetPath, context.currentUser)) {
    newLines.push({
      type: 'error',
      content: `ls: ${args[0] || context.currentPath}: Permissão negada`,
    });
    return newLines;
  }

  try {
    const contents = context.getDefaultDirectoryStructure(targetPath);
    if (contents.length > 0) {
      contents.forEach((item) => {
        const itemPath =
          targetPath === '/system'
            ? `/system/${item}`
            : `${targetPath}/${item}`;
        const isDirectory =
          context.getDefaultDirectoryStructure(itemPath).length > 0 ||
          context.directoryPermissions[itemPath];

        if (isDirectory) {
          newLines.push({ type: 'output', content: `${item}/` });
        } else {
          newLines.push({ type: 'output', content: item });
        }
      });
    } else {
      newLines.push({ type: 'output', content: 'Diretório vazio' });
    }
  } catch (error) {
    newLines.push({
      type: 'error',
      content: `ls: ${args[0] || context.currentPath}: Diretório não encontrado`,
    });
  }

  return newLines;
};
