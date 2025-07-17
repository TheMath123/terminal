import path from 'path';
import { fetchFileUrl } from '@/action/fetch-file-url';
import type {
  CommandContext,
  MediaExtension,
  TerminalLine,
} from '@/types/terminal';

export const allowedImageExtensions = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
];

export const executeViewCommand = async (
  args: string[],
  context: CommandContext,
): Promise<TerminalLine[]> => {
  const lines: TerminalLine[] = [];

  if (!args[0]) {
    lines.push({
      type: 'error',
      content: 'view: faltando nome do arquivo',
    });
    return lines;
  }

  const filePath = context.resolvePath(args[0]);
  const parentDir =
    filePath.substring(0, filePath.lastIndexOf('/')) || '/system';
  const fileName = path.basename(filePath);
  const ext = path.extname(fileName).toLowerCase();

  if (!allowedImageExtensions.includes(ext)) {
    lines.push({
      type: 'error',
      content: `view: ${args[0]}: formato não suportado`,
    });
    return lines;
  }

  if (!context.hasDirectoryAccess(parentDir, context.currentUser)) {
    lines.push({
      type: 'error',
      content: `view: ${args[0]}: Permissão negada`,
    });
    return lines;
  }

  const parentContents = context.getDefaultDirectoryStructure(parentDir);
  if (!parentContents.includes(fileName)) {
    lines.push({
      type: 'error',
      content: `view: ${args[0]}: Arquivo não encontrado`,
    });
    return lines;
  }

  try {
    const url = await fetchFileUrl(filePath);
    lines.push({
      type: 'media',
      content: url,
      extension: ext as MediaExtension,
    });
  } catch (err) {
    lines.push({ type: 'error', content: `view: erro ao carregar imagem` });
  }

  return lines;
};
