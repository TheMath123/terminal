"use client"

import { fetchFile } from "@/action/fetch-file"
import type { DirectoryPermissions, FileSystemStructure } from "@/types/terminal"
import { generateFileMappings } from "@/utils/generate-file-mappings"
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
      "/system/home/user": ["README.md", "documents",],
      "/system/home/user/documents": ["ti"],
      "/system/home/user/documents/ti": ["musics", "TODO.md"],
      "/system/home/user/documents/ti/musics": ["sombras_del_terminal.mp3"],
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

const fileMapping = useMemo(() => generateFileMappings(fileSystemStructure), [fileSystemStructure])


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
      const mappedPath = fileMapping[filePath]
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
