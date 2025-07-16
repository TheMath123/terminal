import type { CommandContext, TerminalLine } from '@/types/terminal';

export const executeCdCommand = (
  args: string[],
  context: CommandContext,
  setCurrentPath: React.Dispatch<React.SetStateAction<string>>,
  setAwaitingDirPassword: React.Dispatch<React.SetStateAction<string | null>>,
): TerminalLine[] => {
  const lines: TerminalLine[] = [];

  const targetPath = args[0]
    ? context.resolvePath(args[0])
    : `/system/home/${context.currentUser}`;

  const dirContents = context.getDefaultDirectoryStructure(targetPath);
  if (!dirContents || !Array.isArray(dirContents)) {
    lines.push({
      type: 'error',
      content: `cd: ${args[0] || ''}: Diretório não encontrado`,
    });
    return lines;
  }

  const isDirectory =
    dirContents.length > 0 || !!context.directoryPermissions[targetPath];
  if (!isDirectory) {
    lines.push({
      type: 'error',
      content: `cd: ${args[0]}: Não é um diretório`,
    });
    return lines;
  }

  if (!context.hasDirectoryAccess(targetPath, context.currentUser)) {
    lines.push({ type: 'error', content: `cd: ${args[0]}: Permissão negada` });
    return lines;
  }

  const permissions = context.directoryPermissions[targetPath];
  if (permissions?.requiresPassword) {
    lines.push({
      type: 'output',
      content: `Diretório protegido: ${permissions.description || targetPath}`,
    });
    lines.push({ type: 'output', content: 'Digite a senha:' });
    setAwaitingDirPassword(targetPath);
    return lines;
  }

  // Sucesso
  setCurrentPath(targetPath);
  return lines;
};
