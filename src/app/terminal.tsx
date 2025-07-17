'use client';

import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  executeCalcCommand,
  executeCatCommand,
  executeCdCommand,
  executeDateCommand,
  executeEchoCommand,
  executeExitCommand,
  executeHelpCommand,
  executeLsCommand,
  executeNeofetchCommand,
  executePlayCommand,
  executePwdCommand,
  executeSuCommand,
  executeWhoamiCommand,
} from '@/commands';
import { CustomAudioPlayer } from '@/components/custom-audio-player';
import { CustomVideoPlayer } from '@/components/custom-video-player';
import { Input } from '@/components/ui/input';
import { useFileSystem } from '@/hooks/use-file-system';
import { useUsers } from '@/hooks/use-users';
import type { CommandContext, TerminalLine } from '@/types/terminal';
import { createPathResolver } from '@/utils/path-resolver';

export default function Component() {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      type: 'output',
      content: 'Heimdall v2.0.0 - Os olhos que veem o invisível',
    },
    {
      type: 'output',
      content: 'Digite "help" para ver os comandos disponíveis.',
    },
    { type: 'output', content: '' },
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentUser, setCurrentUser] = useState('user');
  const [currentPath, setCurrentPath] = useState('/system/home/user');
  const [awaitingPassword, setAwaitingPassword] = useState<string | null>(null);
  const [awaitingDirPassword, setAwaitingDirPassword] = useState<string | null>(
    null,
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Hooks customizados
  const { users, getCurrentUser, getAvailableCommands, hasCommand } =
    useUsers();
  const {
    directoryPermissions,
    hasDirectoryAccess,
    getDefaultDirectoryStructure,
    fetchFileContent,
  } = useFileSystem();

  // Memoized values
  const resolvePath = useMemo(
    () => createPathResolver(currentPath),
    [currentPath],
  );

  const commandContext: CommandContext = useMemo(
    () => ({
      currentUser,
      currentPath,
      users,
      directoryPermissions,
      hasDirectoryAccess,
      resolvePath,
      getDefaultDirectoryStructure,
    }),
    [
      currentUser,
      currentPath,
      users,
      directoryPermissions,
      hasDirectoryAccess,
      resolvePath,
      getDefaultDirectoryStructure,
    ],
  );

  const executeCommand = useCallback(
    async (input: string) => {
      const trimmedInput = input.trim();
      if (!trimmedInput) return;

      // Handle password inputs
      if (awaitingDirPassword) {
        const permissions = directoryPermissions[awaitingDirPassword];
        if (permissions && permissions.password === trimmedInput) {
          setCurrentPath(awaitingDirPassword);
          setLines((prev) => [
            ...prev,
            {
              type: 'output',
              content: `Acesso autorizado a ${awaitingDirPassword}`,
            },
          ]);
        } else {
          setLines((prev) => [
            ...prev,
            { type: 'error', content: 'Senha incorreta!' },
          ]);
        }
        setAwaitingDirPassword(null);
        return;
      }

      if (awaitingPassword) {
        const targetUser = users[awaitingPassword];
        if (targetUser && targetUser.password === trimmedInput) {
          setCurrentUser(awaitingPassword);
          setCurrentPath(
            awaitingPassword === 'root'
              ? '/system/root'
              : `/system/home/${awaitingPassword}`,
          );
          setLines((prev) => [
            ...prev,
            {
              type: 'output',
              content: `Mudando para usuário ${awaitingPassword}...`,
            },
            { type: 'output', content: `Bem-vindo, ${awaitingPassword}!` },
            {
              type: 'output',
              content: 'Digite "help" para ver comandos disponíveis.',
            },
          ]);
        } else {
          setLines((prev) => [
            ...prev,
            { type: 'error', content: 'Senha incorreta!' },
          ]);
        }
        setAwaitingPassword(null);
        return;
      }

      // Add to history
      setCommandHistory((prev) => [...prev, trimmedInput]);
      setHistoryIndex(-1);

      // Parse command
      const [command, ...args] = trimmedInput.split(' ');
      const prompt = getCurrentUser(currentUser)?.isAdmin ? '#' : '$';
      const newLines: TerminalLine[] = [
        { type: 'command', content: `${prompt} ${trimmedInput}` },
      ];

      // Check permissions
      if (!hasCommand(command.toLowerCase(), currentUser)) {
        newLines.push({
          type: 'error',
          content: `Comando não encontrado ou sem permissão: ${command}`,
        });
        setLines((prev) => [...prev, ...newLines]);
        return;
      }

      try {
        let commandResult: TerminalLine[] = [];

        switch (command.toLowerCase()) {
          case 'help':
            commandResult = executeHelpCommand(
              getAvailableCommands(currentUser),
              currentUser,
            );
            break;

          case 'clear':
            setLines([]);
            return;

          case 'whoami':
            commandResult = executeWhoamiCommand(currentUser);
            break;

          case 'date':
            commandResult = executeDateCommand();
            break;

          case 'pwd':
            commandResult = executePwdCommand(currentPath);
            break;

          case 'echo':
            commandResult = executeEchoCommand(args);
            break;

          case 'calc':
            commandResult = executeCalcCommand(args);
            break;

          case 'ls':
            commandResult = executeLsCommand(args, commandContext);
            break;

          case 'cat':
            commandResult = await executeCatCommand(
              args,
              commandContext,
              fetchFileContent,
            );
            break;

          case 'play':
            commandResult = await executePlayCommand(args, commandContext);
            break;

          case 'cd':
            commandResult = executeCdCommand(
              args,
              commandContext,
              setCurrentPath,
              setAwaitingDirPassword,
            );
            break;

          case 'su': {
            commandResult = executeSuCommand(
              args,
              commandContext,
              setCurrentUser,
              setCurrentPath,
              setAwaitingPassword,
            );
            break;
          }

          case 'exit':
            commandResult = executeExitCommand(
              args,
              commandContext,
              setCurrentUser,
              setCurrentPath,
            );

            break;

          case 'neofetch':
            commandResult = executeNeofetchCommand(args, commandContext);
            break;

          default:
            commandResult = [
              { type: 'error', content: `Comando não encontrado: ${command}` },
            ];
        }

        setLines((prev) => [...prev, ...newLines, ...commandResult]);
      } catch (error) {
        setLines((prev) => [
          ...prev,
          ...newLines,
          { type: 'error', content: 'Erro interno do terminal' },
        ]);
      }
    },
    [
      awaitingDirPassword,
      awaitingPassword,
      directoryPermissions,
      users,
      currentUser,
      getCurrentUser,
      hasCommand,
      getAvailableCommands,
      commandContext,
      fetchFileContent,
      resolvePath,
      hasDirectoryAccess,
      getDefaultDirectoryStructure,
    ],
  );

  const handleAutocomplete = useCallback(
    (input: string) => {
      const parts = input.split(' ');
      const command = parts[0];
      const currentArg = parts.slice(1).join(' ');

      // Se não há argumentos, nada a completar
      if (!currentArg) return;

      // Divide o caminho e nome parcial
      const lastSlash = currentArg.lastIndexOf('/');
      const basePathInput =
        lastSlash !== -1 ? currentArg.slice(0, lastSlash + 1) : '';
      const partialName =
        lastSlash !== -1 ? currentArg.slice(lastSlash + 1) : currentArg;

      // Resolve o caminho absoluto
      const resolvedBasePath = resolvePath(basePathInput || '.');

      const entries = getDefaultDirectoryStructure(resolvedBasePath);
      if (!entries) return;

      const matches = entries.filter((entry) => entry.startsWith(partialName));

      if (matches.length === 1) {
        const completedPath = basePathInput + matches[0];
        setCurrentInput(`${command} ${completedPath}`);
      } else if (matches.length > 1) {
        setLines((prev) => [
          ...prev,
          { type: 'output', content: matches.join('    ') },
        ]);
      }
    },
    [resolvePath, getDefaultDirectoryStructure, setCurrentInput, setLines],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        executeCommand(currentInput);
        setCurrentInput('');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (commandHistory.length > 0) {
          const newIndex =
            historyIndex === -1
              ? commandHistory.length - 1
              : Math.max(0, historyIndex - 1);
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex]);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex !== -1) {
          const newIndex = historyIndex + 1;
          if (newIndex >= commandHistory.length) {
            setHistoryIndex(-1);
            setCurrentInput('');
          } else {
            setHistoryIndex(newIndex);
            setCurrentInput(commandHistory[newIndex]);
          }
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        handleAutocomplete(currentInput);
      }
    },
    [currentInput, executeCommand, commandHistory, historyIndex],
  );

  // Effects
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    const handleClick = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  // Memoized display values
  const prompt = useMemo(
    () => (getCurrentUser(currentUser)?.isAdmin ? '#' : '$'),
    [currentUser, getCurrentUser],
  );
  const promptColor = useMemo(
    () =>
      getCurrentUser(currentUser)?.isAdmin ? 'text-red-400' : 'text-green-300',
    [currentUser, getCurrentUser],
  );
  const displayPath = useMemo(
    () =>
      currentPath.replace('/system', '').replace(`/home/${currentUser}`, '~') ||
      '/',
    [currentPath, currentUser],
  );

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono text-sm p-4">
      <div
        ref={terminalRef}
        className="h-[calc(100vh-8rem)] overflow-y-auto mb-4 scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-gray-800"
      >
        {lines.map((line, index) => (
          <div
            key={index}
            className={`whitespace-pre-wrap font-mono ${
              line.type === 'command' && index !== 0 ? 'mt-4' : ''
            }`}
          >
            {line.type === 'output' && <span>{line.content}</span>}
            {line.type === 'error' && (
              <span className="text-red-500">{line.content}</span>
            )}
            {line.type === 'media' &&
              (line.extension === '.mp3' ? (
                <CustomAudioPlayer src={line.content} />
              ) : (
                <CustomVideoPlayer src={line.content} />
              ))}
            {line.type === 'command' && <span>{line.content}</span>}
          </div>
        ))}
      </div>

      <div className="flex items-center">
        <span className={`${promptColor} mr-2 text-nowrap`}>
          {currentUser}@terminal-web:{displayPath}
          {prompt}
        </span>
        <Input
          ref={inputRef}
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          type={awaitingPassword || awaitingDirPassword ? 'password' : 'text'}
          className="bg-transparent border-none text-white font-mono focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto shadow-none"
          placeholder={
            awaitingPassword
              ? 'Digite a senha do usuário...'
              : awaitingDirPassword
                ? 'Digite a senha do diretório...'
                : 'Digite um comando...'
          }
          autoComplete="off"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
