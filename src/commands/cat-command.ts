import path from 'path';
import type { CommandContext, TerminalLine } from '@/types/terminal';

const allowedExtensions = [
  '',
  '.md',
  '.txt',
  '.html',
  '.json',
  '.js',
  '.ts',
  '.css',
  '.xml',
  '.csv',
  '.log',
  '.yaml',
  '.yml',
  '.conf',
  '.ini',
  '.sh',
  '.bash',
  '.py',
  '.java',
  '.c',
  '.cpp',
  '.h',
  '.hpp',
];

export const executeCatCommand = async (
  args: string[],
  context: CommandContext,
  fetchFileContent: (path: string) => Promise<string>,
): Promise<TerminalLine[]> => {
  const newLines: TerminalLine[] = [];

  if (!args[0]) {
    newLines.push({ type: 'error', content: 'cat: faltando nome do arquivo' });
    return newLines;
  }

  const filePath = context.resolvePath(args[0]);
  const parentDir =
    filePath.substring(0, filePath.lastIndexOf('/')) || '/system';

  // Verifica permissões do diretório
  if (!context.hasDirectoryAccess(parentDir, context.currentUser)) {
    newLines.push({
      type: 'error',
      content: `cat: ${args[0]}: Permissão negada`,
    });
    return newLines;
  }

  // Verifica se o arquivo existe na estrutura
  const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
  const parentContents = context.getDefaultDirectoryStructure(parentDir);

  if (!parentContents.includes(fileName)) {
    newLines.push({
      type: 'error',
      content: `cat: ${args[0]}: Arquivo não encontrado`,
    });
    return newLines;
  }

  // Verifica se não é um diretório
  const isDirectory =
    context.getDefaultDirectoryStructure(filePath).length > 0 ||
    context.directoryPermissions[filePath];
  if (isDirectory) {
    newLines.push({
      type: 'error',
      content: `cat: ${args[0]}: É um diretório`,
    });
    return newLines;
  }

  // Verifica extensão permitida

  const fileExt = path.extname(fileName);

  if (!allowedExtensions.includes(fileExt)) {
    newLines.push({
      type: 'error',
      content: `cat: ${args[0]}: Tipo de arquivo não suportado`,
    });
    return newLines;
  }

  try {
    const content = await fetchFileContent(filePath);

    // Simplesmente divide por \n e exibe cada linha
    const lines = content.split('\n');

    lines.forEach((line) => {
      newLines.push({ type: 'output', content: line });
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erro desconhecido';
    newLines.push({
      type: 'error',
      content: `cat: ${args[0]}: ${errorMessage}`,
    });
  }

  return newLines;
};
