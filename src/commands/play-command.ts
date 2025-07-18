import path from 'path';
import { fetchFileUrl } from '@/action/fetch-file-url';
import type {
  CommandContext,
  MediaExtension,
  TerminalLine,
} from '@/types/terminal';

const allowedAudioVideoExtensions = ['.mp3', '.mp4'];

export const executePlayCommand = async (
  args: string[],
  context: CommandContext,
): Promise<TerminalLine[]> => {
  const newLines: TerminalLine[] = [];

  if (!args[0]) {
    newLines.push({ type: 'error', content: 'play: faltando nome do arquivo' });
    return newLines;
  }

  const filePath = context.resolvePath(args[0]);
  const parentDir =
    filePath.substring(0, filePath.lastIndexOf('/')) || '/system';
  const fileName = path.basename(filePath);
  const ext = path.extname(fileName).toLowerCase();

  if (!allowedAudioVideoExtensions.includes(ext)) {
    newLines.push({
      type: 'error',
      content: `play: ${args[0]}: formato não suportado`,
    });
    return newLines;
  }

  if (!context.hasDirectoryAccess(parentDir, context.currentUser)) {
    newLines.push({
      type: 'error',
      content: `play: ${args[0]}: Permissão negada`,
    });
    return newLines;
  }

  const parentContents = context.getDefaultDirectoryStructure(parentDir);
  if (!parentContents.includes(fileName)) {
    newLines.push({
      type: 'error',
      content: `play: ${args[0]}: Arquivo não encontrado`,
    });
    return newLines;
  }

  try {
    const url = await fetchFileUrl(filePath);
    newLines.push({
      type: 'media',
      content: url,
      extension: ext as MediaExtension,
    });
  } catch (err) {
    newLines.push({ type: 'error', content: `play: erro ao carregar mídia` });
  }

  return newLines;
};
