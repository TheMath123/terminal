export interface TerminalLine {
  type: "command" | "output" | "error" | "input"
  content: string
  timestamp?: Date
}

export interface User {
  name: string
  hasPassword: boolean
  password?: string
  commands: string[]
  isAdmin: boolean
}

export interface DirectoryPermissions {
  [path: string]: {
    allowedUsers: string[]
    requiresPassword?: boolean
    password?: string
    description?: string
  }
}

export interface FileSystemStructure {
  [path: string]: string[]
}

export interface CommandContext {
  currentUser: string
  currentPath: string
  users: { [key: string]: User }
  directoryPermissions: DirectoryPermissions
  hasDirectoryAccess: (path: string, user: string) => boolean
  resolvePath: (path: string) => string
  getDefaultDirectoryStructure: (path: string) => string[]
}
