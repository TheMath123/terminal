'use client';

import type { User } from '@/types/terminal';
import { useMemo } from 'react';

const userCommands = [
  'help',
  'clear',
  'whoami',
  'date',
  'echo',
  'calc',
  'pwd',
  'ls',
  'cd',
  'mkdir',
  'view',
  'cat',
  'play',
  'neofetch',
  'su',
  'exit',
];

const adminCommands = [
  ...userCommands,
  'systemctl',
  'ps',
  'find',
  'tree',
  'encode',
  'decode',
  'iptables',
  'netstat',
  'top',
  'df',
  'free',
  'useradd',
  'passwd',
];

const rootCommands = [...adminCommands, 'ufw', 'reboot'];

export const useUsers = () => {
  const users: { [key: string]: User } = useMemo(
    () => ({
      user: {
        name: 'user',
        hasPassword: false,
        commands: userCommands,
        isAdmin: false,
      },
      admin: {
        name: 'admin',
        hasPassword: true,
        password: '558751418260',
        commands: adminCommands,
        isAdmin: true,
      },
      root: {
        name: 'root',
        hasPassword: true,
        password: 'lasanha-com-suco-de-laranja',
        commands: rootCommands,
        isAdmin: true,
      },
    }),
    [],
  );

  const getCurrentUser = (currentUser: string) => users[currentUser];

  const getAvailableCommands = (currentUser: string) => {
    const user = getCurrentUser(currentUser);
    return user ? user.commands : [];
  };

  const hasCommand = (command: string, currentUser: string) => {
    return getAvailableCommands(currentUser).includes(command);
  };

  return {
    users,
    getCurrentUser,
    getAvailableCommands,
    hasCommand,
  };
};
