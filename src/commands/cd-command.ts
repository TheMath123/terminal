// commands/executeCdCommand.ts
import type { CommandContext, TerminalLine } from '@/types/terminal';

interface CdResult {
  lines: TerminalLine[];
  newPath?: string;
  awaitingDirPassword?: string;
}

export const executeCdCommand = (
  args: string[],
  context: CommandContext,
): CdResult => {
  const lines: TerminalLine[] = [];

  const newPath = args[0]
    ? context.resolvePath(args[0])
    : `/system/home/${context.currentUser}`;
  const dirContents = context.getDefaultDirectoryStructure(newPath);
  console.log(dirContents);

  // Verifica se existe
  const filePath = context.resolvePath(args[0]);
  const isDirectory =
    context.getDefaultDirectoryStructure(filePath).length > 0 ||
    context.directoryPermissions[filePath];
  if (!isDirectory) {
    lines.push({
      type: 'error',
      content: `cd: ${args[0] || ''}: Diretório não encontrado`,
    });
    return { lines };
  }

  // Verifica permissão
  if (!context.hasDirectoryAccess(newPath, context.currentUser)) {
    lines.push({ type: 'error', content: `cd: ${args[0]}: Permissão negada` });
    return { lines };
  }

  // Protegido com senha
  const permissions = context.directoryPermissions[newPath];
  if (permissions?.requiresPassword) {
    lines.push({
      type: 'output',
      content: `Diretório protegido: ${permissions.description || newPath}`,
    });
    lines.push({ type: 'output', content: 'Digite a senha:' });
    return { lines, awaitingDirPassword: newPath };
  }

  // Sucesso
  return { lines, newPath };
};
