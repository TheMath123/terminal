import type { CommandContext, TerminalLine } from '@/types/terminal';

export const executeUnzipCommand = async (
  args: string[],
  context: CommandContext,
  fetchFileContent: (path: string) => Promise<string>,
): Promise<TerminalLine[]> => {
  const lines: TerminalLine[] = [];
  const fileName = args[0];

  if (!fileName) {
    lines.push({
      type: 'error',
      content: 'unzip: caminho do arquivo é obrigatório',
    });
    return lines;
  }

  const resolvedPath = context.resolvePath(fileName);
  const fileNameOnly = resolvedPath.split('/').pop() || '';
  const parentPath = resolvedPath.split('/').slice(0, -1).join('/') || '/';
  const parentContents = context.getDefaultDirectoryStructure(parentPath);

  const exists = parentContents.includes(fileNameOnly);
  if (!exists) {
    lines.push({
      type: 'error',
      content: `unzip: arquivo "${fileName}" não encontrado`,
    });
    return lines;
  }

  if (!fileNameOnly.endsWith('.zip')) {
    lines.push({
      type: 'error',
      content: `unzip: "${fileName}" não é um arquivo zip`,
    });
    return lines;
  }

  if (!context.hasDirectoryAccess(parentPath, context.currentUser)) {
    lines.push({
      type: 'error',
      content: `unzip: permissão negada para acessar "${fileName}"`,
    });
    return lines;
  }

  try {
    const fileContent = await fetchFileContent(resolvedPath);
    const linesFromContent = fileContent.split('\n');
    lines.push({
      type: 'output',
      content: `Conteúdo de ${fileName} extraído:`,
    });
    lines.push(
      ...linesFromContent.map<TerminalLine>((line) => ({
        type: 'output',
        content: line,
      })),
    );
  } catch (err) {
    console.error(err);
    lines.push({
      type: 'error',
      content: 'unzip: erro ao ler o conteúdo do arquivo',
    });
  }

  return lines;
};
