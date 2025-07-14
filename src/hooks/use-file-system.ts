"use client"

import { fetchFile } from "@/action/fetch-file"
import type { DirectoryPermissions, FileSystemStructure } from "@/types/terminal"
import { useMemo } from "react"

export const useFileSystem = () => {
  const directoryPermissions: DirectoryPermissions = useMemo(
    () => ({
      "/system": { allowedUsers: ["user", "admin", "root", "guest"] },
      "/system/home": { allowedUsers: ["user", "admin", "root", "guest"] },
      "/system/home/user": { allowedUsers: ["user", "admin", "root"] },
      "/system/home/admin": { allowedUsers: ["admin", "root"] },
      "/system/home/admin/secrets": {
        allowedUsers: ["admin", "root"],
        requiresPassword: true,
        password: "secret123",
        description: "Diretório com informações confidenciais",
      },
      "/system/home/guest": { allowedUsers: ["user", "admin", "root", "guest"] },
      "/system/etc": { allowedUsers: ["admin", "root"] },
      "/system/var": { allowedUsers: ["admin", "root"] },
      "/system/var/log": { allowedUsers: ["admin", "root"] },
      "/system/var/www": { allowedUsers: ["user", "admin", "root"] },
      "/system/root": { allowedUsers: ["root"] },
    }),
    [],
  )

  const fileSystemStructure: FileSystemStructure = useMemo(
    () => ({
      "/system": ["home", "etc", "var", "root"],
      "/system/home": ["user", "admin", "guest"],
      "/system/home/user": ["README.md", "documents", "test.txt"],
      "/system/home/user/documents": ["projeto.txt", "notas.md"],
      "/system/home/admin": ["config.conf", "secrets"],
      "/system/home/admin/secrets": ["passwords.txt"],
      "/system/home/guest": ["welcome.txt"],
      "/system/etc": ["passwd", "hosts"],
      "/system/var": ["log", "www"],
      "/system/var/log": ["system.log"],
      "/system/var/www": ["index.html"],
      "/system/root": ["admin-notes.txt"],
    }),
    [],
  )

  const fileMapping = useMemo(
    () => ({
      "/system/home/user/README.md": "/system/home/user/README.md",
      "/system/home/user/documents/projeto.txt": "/system/home/user/documents/projeto.txt",
      "/system/home/user/documents/notas.md": "/system/home/user/documents/notas.md",
      "/system/home/admin/config.conf": "/system/home/admin/config.conf",
      "/system/home/admin/secrets/passwords.txt": "/system/home/admin/secrets/passwords.txt",
      "/system/home/guest/welcome.txt": "/system/home/guest/welcome.txt",
      "/system/etc/passwd": "/system/etc/passwd",
      "/system/etc/hosts": "/system/etc/hosts",
      "/system/var/log/system.log": "/system/var/log/system.log",
      "/system/var/www/index.html": "/system/var/www/index.html",
      "/system/root/admin-notes.txt": "/system/root/admin-notes.txt",
    }),
    [],
  )

  const hasDirectoryAccess = (path: string, user: string): boolean => {
    const permissions = directoryPermissions[path]
    if (!permissions) {
      const parentPath = path.substring(0, path.lastIndexOf("/")) || "/system"
      if (parentPath === path) return false
      return hasDirectoryAccess(parentPath, user)
    }
    return permissions.allowedUsers.includes(user)
  }

  const getDefaultDirectoryStructure = (path: string): string[] => {
    return fileSystemStructure[path] || []
  }

  const fetchFileContent = async (filePath: string): Promise<string> => {
    try {
      // Mapeamento direto dos caminhos virtuais para os arquivos reais
      const pathMappings: { [key: string]: string } = {
        "/system/home/user/README.md": "/system/home/user/README.md",
        "/system/home/user/documents/projeto.txt": "/system/home/user/documents/projeto.txt",
        "/system/home/user/documents/notas.md": "/system/home/user/documents/notas.md",
        "/system/home/admin/config.conf": "/system/home/admin/config.conf",
        "/system/home/admin/secrets/passwords.txt": "/system/home/admin/secrets/passwords.txt",
        "/system/home/guest/welcome.txt": "/system/home/guest/welcome.txt",
        "/system/etc/passwd": "/system/etc/passwd",
        "/system/etc/hosts": "/system/etc/hosts",
        "/system/var/log/system.log": "/system/var/log/system.log",
        "/system/var/www/index.html": "/system/var/www/index.html",
        "/system/root/admin-notes.txt": "/system/root/admin-notes.txt",
        "/system/home/user/test.txt": "/system/home/user/test.txt",
      }

      const mappedPath = pathMappings[filePath]
      if (!mappedPath) {
        throw new Error(`Not found file: ${filePath}`)
      }

      const response = await fetchFile(mappedPath)

      if (!response.ok) {
        console.error(response)
        console.error(response.error)
        throw new Error(response.error || 'Shiitt! Problem loading content file, sorry =(')
      }

      if (!response.content) {
        throw new Error('Content is empty, sorry =(')
      }

      return response.content
    } catch (error) {
        console.error( error)
      throw new Error(`${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return {
    directoryPermissions,
    fileSystemStructure,
    fileMapping,
    hasDirectoryAccess,
    getDefaultDirectoryStructure,
    fetchFileContent,
  }
}
