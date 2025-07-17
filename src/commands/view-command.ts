// commands/executeViewCommand.ts
import type {
  CommandContext,
  MediaExtension,
  TerminalLine,
} from '@/types/terminal';

export const executeViewCommand = (
  args: string[],
  context: CommandContext,
): TerminalLine[] => {
  const lines: TerminalLine[] = [];

  const fileName = args[0];

  if (!fileName) {
    lines.push({
      type: 'error',
      content: 'view: Caminho do arquivo é obrigatório',
    });
    return lines;
  }

  const resolvedPath = context.resolvePath(fileName);

  const parentPath = resolvedPath.split('/').slice(0, -1).join('/') || '/';
  const entries = context.getDefaultDirectoryStructure(parentPath);
  const fileNameOnly = resolvedPath.split('/').pop();

  const exists = entries?.includes(fileNameOnly || '');

  if (!exists) {
    lines.push({
      type: 'error',
      content: `view: Arquivo "${fileName}" não encontrado`,
    });
    return lines;
  }

  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const extension = validExtensions.find((ext) =>
    resolvedPath.toLowerCase().endsWith(ext),
  );

  if (!extension) {
    lines.push({
      type: 'error',
      content: `view: "${fileName}" não é um formato de imagem suportado`,
    });
    return lines;
  }

  lines.push({
    type: 'media',
    content: `/system${resolvedPath}`,
    extension: extension as MediaExtension,
  });

  return lines;
};
