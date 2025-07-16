import type { FileSystemStructure } from '@/types/terminal';

export function generateFileMappings(
  structure: FileSystemStructure,
  currentPath = '/system',
): Record<string, string> {
  const result: Record<string, string> = {};

  const contents = structure[currentPath] || [];

  contents.forEach((entry) => {
    const fullPath = `${currentPath}/${entry}`;
    if (structure[fullPath]) {
      // é diretório, faz recursão
      const childMappings = generateFileMappings(structure, fullPath);
      Object.assign(result, childMappings);
    } else {
      // é arquivo
      result[fullPath] = fullPath;
    }
  });

  return result;
}
