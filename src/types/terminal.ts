export type ImageExtension = '.jpg' | '.jpeg' | '.png' | '.webp' | '.gif';
export type AudioExtension = '.mp3';
export type VideoExtension = '.mp4';
export type MediaExtension = VideoExtension | AudioExtension | ImageExtension;

export type TerminalLine =
  | { type: 'command'; content: string }
  | { type: 'output'; content: string }
  | { type: 'error'; content: string }
  | {
      type: 'media';
      content: string;
      extension: MediaExtension;
    };

export interface User {
  name: string;
  hasPassword: boolean;
  password?: string;
  commands: string[];
  isAdmin: boolean;
}

export interface DirectoryPermissions {
  [path: string]: {
    allowedUsers: string[];
    requiresPassword?: boolean;
    password?: string;
    description?: string;
  };
}

export interface FileSystemStructure {
  [path: string]: string[];
}

export interface CommandContext {
  currentUser: string;
  currentPath: string;
  users: { [key: string]: User };
  currentDirectory?: string;
  directoryPermissions: DirectoryPermissions;
  hasDirectoryAccess: (path: string, user: string) => boolean;
  resolvePath: (path: string) => string;
  getDefaultDirectoryStructure: (path: string) => string[];
}
