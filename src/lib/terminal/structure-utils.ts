import type { CommandContext } from '@/types/terminal';

export function hasDirectory(path: string, context: CommandContext): boolean {
  const contents = context.getDefaultDirectoryStructure(path);
  return Array.isArray(contents);
}

export function hasFile(path: string, context: CommandContext): boolean {
  const parent = path.substring(0, path.lastIndexOf('/')) || '/system';
  const fileName = path.split('/').pop();
  const parentContents = context.getDefaultDirectoryStructure(parent);
  return Array.isArray(parentContents) && fileName
    ? parentContents.includes(fileName)
    : false;
}
