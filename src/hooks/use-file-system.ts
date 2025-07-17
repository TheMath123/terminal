'use client';

import { fetchFile } from '@/action/fetch-file';
import files from '@/assets/captchas.json';
import type {
  DirectoryPermissions,
  FileSystemStructure,
} from '@/types/terminal';
import { generateFileMappings } from '@/utils/generate-file-mappings';
import { useMemo } from 'react';

export const useFileSystem = () => {
  const directoryPermissions: DirectoryPermissions = useMemo(
    () => ({
      '/system': { allowedUsers: ['user', 'admin', 'root'] },
      '/system/home': { allowedUsers: ['user', 'admin', 'root'] },
      '/system/home/user': { allowedUsers: ['user', 'admin', 'root'] },
      '/system/home/admin': { allowedUsers: ['admin', 'root'] },
      '/system/home/admin/bin/bash': {
        allowedUsers: ['admin', 'root'],
        requiresPassword: true,
        password: 'f1405b8e61bcea02c60bb1d376b3e57b',
        description: 'Diretório com informações confidenciais',
      },
      '/system/home/guest': {
        allowedUsers: ['user', 'admin', 'root'],
      },
      '/system/etc': { allowedUsers: ['admin', 'root'] },
      '/system/var': { allowedUsers: ['admin', 'root'] },
      '/system/var/log': { allowedUsers: ['admin', 'root'] },
      '/system/var/www': { allowedUsers: ['admin', 'root'] },
      '/system/root': { allowedUsers: ['root'] },
    }),
    [],
  );

  const fileSystemStructure: FileSystemStructure = useMemo(
    () => ({
      '/system': ['home', 'etc', 'var', 'root'],
      '/system/home': ['user', 'admin'],
      '/system/home/user': ['README.md', 'documents'],
      '/system/home/user/documents': ['ti'],
      '/system/home/user/documents/ti': [
        'musics',
        'TODO.md',
        'lista-compras.txt',
      ],
      '/system/home/user/documents/ti/musics': ['sombras_del_terminal.mp3'],

      '/system/home/admin': ['documents', 'images', 'videos'],
      '/system/home/admin/bin/bash': ['secrets.zip'],
      '/system/home/admin/documents': ['jessica.doc'],
      '/system/home/admin/images': ['porn', 'orgia4andar.jpg'],
      '/system/home/admin/images/porn': ['heavy'],
      '/system/home/admin/images/porn/heavy': ['tem-certeza?'],
      '/system/home/admin/images/porn/heavy/tem-certeza?': ['ta-bom'],
      '/system/home/admin/images/porn/heavy/tem-certeza?/ta-bom': [
        'cat1.gif',
        'cat2.jpg',
        'cat3.jpg',
        'cat4.webp',
      ],
      '/system/home/admin/videos': [
        'campanha_natal.mp4',
        'estudantes.mp4',
        'o_matador.mp4',
      ],

      '/system/root': ['admin-notes.txt'],

      '/system/etc': ['envs', 'hosts', 'passwd'],
      '/system/var': ['log', 'www'],
      '/system/var/log': ['syslog'],
      '/system/var/www': ['index.html', 'captchas'],
      '/system/var/www/captchas': files.captchas,
    }),
    [],
  );

  const fileMapping = useMemo(
    () => generateFileMappings(fileSystemStructure),
    [fileSystemStructure],
  );

  const hasDirectoryAccess = (path: string, user: string): boolean => {
    const permissions = directoryPermissions[path];
    if (!permissions) {
      const parentPath = path.substring(0, path.lastIndexOf('/')) || '/system';
      if (parentPath === path) return false;
      return hasDirectoryAccess(parentPath, user);
    }
    return permissions.allowedUsers.includes(user);
  };

  const getDefaultDirectoryStructure = (path: string): string[] => {
    return fileSystemStructure[path] || [];
  };

  const fetchFileContent = async (filePath: string): Promise<string> => {
    try {
      const mappedPath = fileMapping[filePath];
      if (!mappedPath) {
        throw new Error(`Not found file: ${filePath}`);
      }

      const response = await fetchFile(mappedPath);

      if (!response.ok) {
        console.error(response);
        console.error(response.error);
        throw new Error(
          response.error || 'Shiitt! Problem loading content file, sorry =(',
        );
      }

      if (!response.content) {
        throw new Error('Content is empty, sorry =(');
      }

      return response.content;
    } catch (error) {
      console.error(error);
      throw new Error(
        `${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  };

  return {
    directoryPermissions,
    fileSystemStructure,
    fileMapping,
    hasDirectoryAccess,
    getDefaultDirectoryStructure,
    fetchFileContent,
  };
};
