"use client"

import {
  executeCalcCommand,
  executeDateCommand,
  executeEchoCommand,
  executeHelpCommand,
  executePwdCommand,
  executeWhoamiCommand,
} from "@/commands/basic-commands"
import { executeCatCommand } from "@/commands/cat-command"
import { executeLsCommand } from "@/commands/ls-command"
import { Input } from "@/components/ui/input"
import { useFileSystem } from "@/hooks/use-file-system"
import { useUsers } from "@/hooks/use-users"
import type { CommandContext, TerminalLine } from "@/types/terminal"
import { createPathResolver } from "@/utils/path-resolver"
import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

export default function Component() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: "output", content: "Heimdall v2.0.0 - Os olhos que veem o invisível" },
    { type: "output", content: 'Digite "help" para ver os comandos disponíveis.' },
    { type: "output", content: "" },
  ])
  const [currentInput, setCurrentInput] = useState("")
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [currentUser, setCurrentUser] = useState("user")
  const [currentPath, setCurrentPath] = useState("/system/home/user")
  const [awaitingPassword, setAwaitingPassword] = useState<string | null>(null)
  const [awaitingDirPassword, setAwaitingDirPassword] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  // Hooks customizados
  const { users, getCurrentUser, getAvailableCommands, hasCommand } = useUsers()
  const { directoryPermissions, hasDirectoryAccess, getDefaultDirectoryStructure, fetchFileContent } = useFileSystem()

  // Memoized values
  const resolvePath = useMemo(() => createPathResolver(currentPath), [currentPath])

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
  )

  const executeCommand = useCallback(
    async (input: string) => {
      const trimmedInput = input.trim()
      if (!trimmedInput) return

      // Handle password inputs
      if (awaitingDirPassword) {
        const permissions = directoryPermissions[awaitingDirPassword]
        if (permissions && permissions.password === trimmedInput) {
          setCurrentPath(awaitingDirPassword)
          setLines((prev) => [...prev, { type: "output", content: `Acesso autorizado a ${awaitingDirPassword}` }])
        } else {
          setLines((prev) => [...prev, { type: "error", content: "Senha incorreta!" }])
        }
        setAwaitingDirPassword(null)
        return
      }

      if (awaitingPassword) {
        const targetUser = users[awaitingPassword]
        if (targetUser && targetUser.password === trimmedInput) {
          setCurrentUser(awaitingPassword)
          setCurrentPath(awaitingPassword === "root" ? "/system/root" : `/system/home/${awaitingPassword}`)
          setLines((prev) => [
            ...prev,
            { type: "output", content: `Mudando para usuário ${awaitingPassword}...` },
            { type: "output", content: `Bem-vindo, ${awaitingPassword}!` },
            { type: "output", content: 'Digite "help" para ver comandos disponíveis.' },
          ])
        } else {
          setLines((prev) => [...prev, { type: "error", content: "Senha incorreta!" }])
        }
        setAwaitingPassword(null)
        return
      }

      // Add to history
      setCommandHistory((prev) => [...prev, trimmedInput])
      setHistoryIndex(-1)

      // Parse command
      const [command, ...args] = trimmedInput.split(" ")
      const prompt = getCurrentUser(currentUser)?.isAdmin ? "#" : "$"
      const newLines: TerminalLine[] = [{ type: "command", content: `${prompt} ${trimmedInput}` }]

      // Check permissions
      if (!hasCommand(command.toLowerCase(), currentUser)) {
        newLines.push({ type: "error", content: `Comando não encontrado ou sem permissão: ${command}` })
        setLines((prev) => [...prev, ...newLines])
        return
      }

      try {
        let commandResult: TerminalLine[] = []

        switch (command.toLowerCase()) {
          case "help":
            commandResult = executeHelpCommand(getAvailableCommands(currentUser), currentUser)
            break

          case "clear":
            setLines([])
            return

          case "whoami":
            commandResult = executeWhoamiCommand(currentUser)
            break

          case "date":
            commandResult = executeDateCommand()
            break

          case "pwd":
            commandResult = executePwdCommand(currentPath)
            break

          case "echo":
            commandResult = executeEchoCommand(args)
            break

          case "calc":
            commandResult = executeCalcCommand(args)
            break

          case "ls":
            commandResult = executeLsCommand(args, commandContext)
            break

          case "cat":
            commandResult = await executeCatCommand(args, commandContext, fetchFileContent)
            break

          case "cd":
            const newPath = args[0] ? resolvePath(args[0]) : `/system/home/${currentUser}`

            if (!hasDirectoryAccess(newPath, currentUser)) {
              commandResult = [{ type: "error", content: `cd: ${args[0]}: Permissão negada` }]
              break
            }

            const permissions = directoryPermissions[newPath]
            if (permissions && permissions.requiresPassword) {
              commandResult = [
                { type: "output", content: `Diretório protegido: ${permissions.description || newPath}` },
                { type: "output", content: "Digite a senha:" },
              ]
              setAwaitingDirPassword(newPath)
              break
            }

            const dirContents = getDefaultDirectoryStructure(newPath)
            if (dirContents !== null) {
              setCurrentPath(newPath)
              commandResult = []
            } else {
              commandResult = [{ type: "error", content: `cd: ${args[0]}: Diretório não encontrado` }]
            }
            break

          case "su":
            const targetUser = args[0] || "root"
            if (!users[targetUser]) {
              commandResult = [
                { type: "error", content: `su: usuário '${targetUser}' não existe` },
                { type: "output", content: "Usuários disponíveis: " + Object.keys(users).join(", ") },
              ]
            } else if (users[targetUser].hasPassword) {
              commandResult = [{ type: "output", content: `Senha para ${targetUser}:` }]
              setAwaitingPassword(targetUser)
            } else {
              setCurrentUser(targetUser)
              setCurrentPath(targetUser === "root" ? "/system/root" : `/system/home/${targetUser}`)
              commandResult = [
                { type: "output", content: `Mudando para usuário ${targetUser}...` },
                { type: "output", content: `Bem-vindo, ${targetUser}!` },
              ]
            }
            break

          case "exit":
            if (currentUser !== "user") {
              setCurrentUser("user")
              setCurrentPath("/system/home/user")
              commandResult = [
                { type: "output", content: "Saindo do usuário atual..." },
                { type: "output", content: "Voltando para usuário 'user'" },
              ]
            } else {
              commandResult = [{ type: "error", content: "exit: já está no usuário padrão" }]
            }
            break

          case "neofetch":
            commandResult = [
              { type: "output", content: "                   -`                    " + currentUser + "@heimdall" },
              { type: "output", content: "                  .o+`                   ─────────────────────" },
              { type: "output", content: "                 `ooo/                   OS: Heimdall 2.0.0" },
              { type: "output", content: "                `+oooo:                  Host: Browser Engine" },
              { type: "output", content: "               `+oooooo:                 Kernel: Archcraft I" },
              {
                type: "output",
                content: "               -+oooooo+:                Uptime: " + Math.floor(Math.random() * 100) + " min",
              },
              { type: "output", content: "             `/:-:++oooo+:               Shell: VoicesInMyMind 1.2.3" },
              { type: "output", content: "            `/++++/+++++++:              Terminal: terminal-web" },
              { type: "output", content: "           `/++++++++++++++:             CPU: Snapcat Gen 8" },
              {
                type: "output",
                content:
                  "          `/+++ooooooooo+++/`            Memory: " +
                  Math.floor(Math.random() * 1000) +
                  "MB / 12TB",
              },
              {
                type: "output",
                content:
                  "         ./ooosssso++osssssso+`          Resolution: " +
                  window.innerWidth +
                  "x" +
                  window.innerHeight,
              },
              { type: "output", content: "        .oossssso-````/ossssss+`         Theme: Matrix Green" },
              { type: "output", content: "       -osssssso.      :ssssssso.        User: " + currentUser },
              { type: "output", content: "      :osssssss/        osssso+++.       Path: " + currentPath },
              { type: "output", content: "     /ossssssss/        +ssssooo/-       FileSystem: Borabora Files" },
            ]
            break

          default:
            commandResult = [{ type: "error", content: `Comando não encontrado: ${command}` }]
        }

        setLines((prev) => [...prev, ...newLines, ...commandResult])
      } catch (error) {
        setLines((prev) => [...prev, ...newLines, { type: "error", content: "Erro interno do terminal" }])
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
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        executeCommand(currentInput)
        setCurrentInput("")
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        if (commandHistory.length > 0) {
          const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
          setHistoryIndex(newIndex)
          setCurrentInput(commandHistory[newIndex])
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        if (historyIndex !== -1) {
          const newIndex = historyIndex + 1
          if (newIndex >= commandHistory.length) {
            setHistoryIndex(-1)
            setCurrentInput("")
          } else {
            setHistoryIndex(newIndex)
            setCurrentInput(commandHistory[newIndex])
          }
        }
      }
    },
    [currentInput, executeCommand, commandHistory, historyIndex],
  )

  // Effects
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [lines])

  useEffect(() => {
    const handleClick = () => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }

    document.addEventListener("click", handleClick)
    return () => {
      document.removeEventListener("click", handleClick)
    }
  }, [])

  // Memoized display values
  const prompt = useMemo(() => (getCurrentUser(currentUser)?.isAdmin ? "#" : "$"), [currentUser, getCurrentUser])
  const promptColor = useMemo(
    () => (getCurrentUser(currentUser)?.isAdmin ? "text-red-400" : "text-green-300"),
    [currentUser, getCurrentUser],
  )
  const displayPath = useMemo(
    () => currentPath.replace("/system", "").replace(`/home/${currentUser}`, "~") || "/",
    [currentPath, currentUser],
  )

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono text-sm p-4">
      <div
        ref={terminalRef}
        className="h-[calc(100vh-8rem)] overflow-y-auto mb-4 scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-gray-800"
      >
        {lines.map((line, index) => (
          <div
            key={index}
            className={`mb-1 whitespace-pre-wrap ${
              line.type === "command"
                ? line.content.startsWith("#")
                  ? "text-red-300"
                  : "text-green-300"
                : line.type === "error"
                  ? "text-red-400"
                  : "text-green-400"
            }`}
          >
            {line.content}
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
          type={awaitingPassword || awaitingDirPassword ? "password" : "text"}
          className="bg-transparent border-none text-white font-mono focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto shadow-none"
          placeholder={
            awaitingPassword
              ? "Digite a senha do usuário..."
              : awaitingDirPassword
                ? "Digite a senha do diretório..."
                : "Digite um comando..."
          }
          autoComplete="off"
          spellCheck={false}
        />
      </div>
    </div>
  )
}
