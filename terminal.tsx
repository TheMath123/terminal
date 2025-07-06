"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"

interface TerminalLine {
  type: "command" | "output" | "error" | "input"
  content: string
  timestamp?: Date
}

interface User {
  name: string
  hasPassword: boolean
  password?: string
  commands: string[]
  isAdmin: boolean
}

interface FileSystem {
  [path: string]: {
    type: "file" | "directory"
    content?: string
    children?: string[]
  }
}

export default function Component() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: "output", content: "Terminal Web v1.0.0" },
    { type: "output", content: 'Digite "help" para ver os comandos disponíveis.' },
    { type: "output", content: "" },
  ])
  const [currentInput, setCurrentInput] = useState("")
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [currentUser, setCurrentUser] = useState("user")
  const [currentPath, setCurrentPath] = useState("/home/user")
  const [awaitingPassword, setAwaitingPassword] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  // Configuração de usuários - PERSONALIZÁVEL
  const users: { [key: string]: User } = {
    user: {
      name: "user",
      hasPassword: false,
      commands: [
        "help",
        "clear",
        "whoami",
        "date",
        "echo",
        "calc",
        "pwd",
        "ls",
        "cd",
        "mkdir",
        "cat",
        "neofetch",
        "su",
      ],
      isAdmin: false,
    },
    root: {
      name: "root",
      hasPassword: true,
      password: "admin123",
      commands: [
        "help",
        "clear",
        "whoami",
        "date",
        "echo",
        "calc",
        "pwd",
        "ls",
        "cd",
        "mkdir",
        "cat",
        "neofetch",
        "exit",
        "iptables",
        "ufw",
        "systemctl",
        "netstat",
        "ps",
        "top",
        "df",
        "free",
        "useradd",
        "passwd",
      ],
      isAdmin: true,
    },
    admin: {
      name: "admin",
      hasPassword: true,
      password: "senha123",
      commands: [
        "help",
        "clear",
        "whoami",
        "date",
        "echo",
        "calc",
        "pwd",
        "ls",
        "cd",
        "mkdir",
        "cat",
        "neofetch",
        "exit",
        "systemctl",
        "ps",
      ],
      isAdmin: true,
    },
    guest: {
      name: "guest",
      hasPassword: false,
      commands: ["help", "clear", "whoami", "date", "echo", "pwd", "ls", "cat"],
      isAdmin: false,
    },
  }

  // Sistema de arquivos virtual - PERSONALIZÁVEL
  const [fileSystem, setFileSystem] = useState<FileSystem>({
    "/": { type: "directory", children: ["home", "etc", "var", "usr"] },
    "/home": { type: "directory", children: ["user", "admin", "guest"] },
    "/home/user": { type: "directory", children: ["README.md", "documents", "downloads"] },
    "/home/user/documents": { type: "directory", children: ["projeto.txt", "notas.md"] },
    "/home/user/downloads": { type: "directory", children: [] },
    "/home/admin": { type: "directory", children: ["config.conf"] },
    "/home/guest": { type: "directory", children: [] },
    "/etc": { type: "directory", children: ["passwd", "hosts", "fstab"] },
    "/var": { type: "directory", children: ["log", "www"] },
    "/var/log": { type: "directory", children: ["system.log", "error.log"] },
    "/var/www": { type: "directory", children: ["index.html"] },
    "/usr": { type: "directory", children: ["bin", "lib"] },
    "/usr/bin": { type: "directory", children: [] },
    "/usr/lib": { type: "directory", children: [] },

    // Arquivos
    "/home/user/README.md": {
      type: "file",
      content: `# Terminal Web

Um terminal simulado no navegador.

## Comandos Disponíveis
Digite "help" para ver os comandos disponíveis.

## Navegação
Use "cd" para navegar entre diretórios.
Use "ls" para listar arquivos e pastas.

## Usuários
Use "su [usuario]" para trocar de usuário.
Usuários disponíveis: user, root, admin, guest`,
    },
    "/home/user/documents/projeto.txt": {
      type: "file",
      content: `Projeto Terminal Web

Este é um projeto de terminal simulado.
Funcionalidades:
- Sistema de usuários
- Sistema de arquivos
- Comandos administrativos
- Navegação entre diretórios`,
    },
    "/home/user/documents/notas.md": {
      type: "file",
      content: `# Minhas Notas

## Lista de Tarefas
- [x] Implementar sistema de usuários
- [x] Adicionar navegação de pastas
- [ ] Adicionar mais comandos
- [ ] Melhorar interface`,
    },
    "/home/admin/config.conf": {
      type: "file",
      content: `# Configuração do Sistema
server_port=8080
debug_mode=true
max_users=100
log_level=info`,
    },
    "/etc/passwd": {
      type: "file",
      content: `root:x:0:0:root:/root:/bin/bash
user:x:1000:1000:User:/home/user:/bin/bash
admin:x:1001:1001:Admin:/home/admin:/bin/bash
guest:x:1002:1002:Guest:/home/guest:/bin/bash`,
    },
    "/etc/hosts": {
      type: "file",
      content: `127.0.0.1	localhost
127.0.1.1	terminal-web
::1		localhost ip6-localhost ip6-loopback`,
    },
    "/var/log/system.log": {
      type: "file",
      content: `[2024-01-15 10:30:15] Sistema iniciado
[2024-01-15 10:30:16] Usuário 'user' logado
[2024-01-15 10:35:22] Comando 'ls' executado
[2024-01-15 10:36:45] Usuário mudou para 'root'`,
    },
    "/var/www/index.html": {
      type: "file",
      content: `<!DOCTYPE html>
<html>
<head>
    <title>Terminal Web</title>
</head>
<body>
    <h1>Bem-vindo ao Terminal Web</h1>
    <p>Este é um terminal simulado no navegador.</p>
</body>
</html>`,
    },
  })

  const getCurrentUser = () => users[currentUser]

  const getAvailableCommands = () => {
    const user = getCurrentUser()
    return user ? user.commands : []
  }

  const hasCommand = (command: string) => {
    return getAvailableCommands().includes(command)
  }

  const resolvePath = (path: string) => {
    if (path.startsWith("/")) {
      return path
    }
    if (path === "..") {
      const parts = currentPath.split("/").filter((p) => p)
      parts.pop()
      return "/" + parts.join("/") || "/"
    }
    if (path === ".") {
      return currentPath
    }
    return currentPath === "/" ? `/${path}` : `${currentPath}/${path}`
  }

  const executeCommand = (input: string) => {
    const trimmedInput = input.trim()
    if (!trimmedInput) return

    // Se estamos aguardando senha
    if (awaitingPassword) {
      const targetUser = users[awaitingPassword]
      if (targetUser && targetUser.password === trimmedInput) {
        setCurrentUser(awaitingPassword)
        setCurrentPath(awaitingPassword === "root" ? "/root" : `/home/${awaitingPassword}`)
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

    // Adiciona comando ao histórico
    setCommandHistory((prev) => [...prev, trimmedInput])
    setHistoryIndex(-1)

    // Adiciona linha do comando
    const prompt = getCurrentUser()?.isAdmin ? "#" : "$"
    const newLines: TerminalLine[] = [{ type: "command", content: `${prompt} ${trimmedInput}` }]

    const [command, ...args] = trimmedInput.split(" ")

    // Verifica se o usuário tem permissão para o comando
    if (!hasCommand(command.toLowerCase())) {
      newLines.push({ type: "error", content: `Comando não encontrado ou sem permissão: ${command}` })
      setLines((prev) => [...prev, ...newLines])
      return
    }

    try {
      switch (command.toLowerCase()) {
        case "help":
          const availableCommands = getAvailableCommands()
          newLines.push({ type: "output", content: `Comandos disponíveis para ${currentUser}:` })

          // Comandos básicos
          const basicCommands = [
            "help",
            "clear",
            "whoami",
            "date",
            "echo",
            "calc",
            "pwd",
            "ls",
            "cd",
            "mkdir",
            "cat",
            "neofetch",
            "su",
          ]
          const userBasicCommands = availableCommands.filter((cmd) => basicCommands.includes(cmd))
          if (userBasicCommands.length > 0) {
            newLines.push({ type: "output", content: "" })
            newLines.push({ type: "output", content: "COMANDOS BÁSICOS:" })
            userBasicCommands.forEach((cmd) => {
              switch (cmd) {
                case "help":
                  newLines.push({ type: "output", content: "  help          - Mostra esta mensagem de ajuda" })
                  break
                case "clear":
                  newLines.push({ type: "output", content: "  clear         - Limpa o terminal" })
                  break
                case "whoami":
                  newLines.push({ type: "output", content: "  whoami        - Mostra usuário atual" })
                  break
                case "date":
                  newLines.push({ type: "output", content: "  date          - Mostra data e hora atual" })
                  break
                case "echo":
                  newLines.push({ type: "output", content: "  echo [texto]  - Repete o texto digitado" })
                  break
                case "calc":
                  newLines.push({ type: "output", content: "  calc [expr]   - Calculadora simples" })
                  break
                case "pwd":
                  newLines.push({ type: "output", content: "  pwd           - Mostra diretório atual" })
                  break
                case "ls":
                  newLines.push({ type: "output", content: "  ls [pasta]    - Lista arquivos do diretório" })
                  break
                case "cd":
                  newLines.push({ type: "output", content: "  cd [pasta]    - Navega para diretório" })
                  break
                case "mkdir":
                  newLines.push({ type: "output", content: "  mkdir [nome]  - Cria diretório" })
                  break
                case "cat":
                  newLines.push({ type: "output", content: "  cat [arquivo] - Mostra conteúdo do arquivo" })
                  break
                case "neofetch":
                  newLines.push({ type: "output", content: "  neofetch      - Mostra informações do sistema" })
                  break
                case "su":
                  newLines.push({ type: "output", content: "  su [usuario]  - Muda para outro usuário" })
                  break
              }
            })
          }

          // Comandos administrativos
          const adminCommands = [
            "iptables",
            "ufw",
            "systemctl",
            "netstat",
            "ps",
            "top",
            "df",
            "free",
            "useradd",
            "passwd",
            "exit",
          ]
          const userAdminCommands = availableCommands.filter((cmd) => adminCommands.includes(cmd))
          if (userAdminCommands.length > 0) {
            newLines.push({ type: "output", content: "" })
            newLines.push({ type: "output", content: "COMANDOS ADMINISTRATIVOS:" })
            userAdminCommands.forEach((cmd) => {
              switch (cmd) {
                case "exit":
                  newLines.push({ type: "output", content: "  exit          - Sair do usuário atual" })
                  break
                case "iptables":
                  newLines.push({ type: "output", content: "  iptables      - Gerenciar firewall iptables" })
                  break
                case "ufw":
                  newLines.push({ type: "output", content: "  ufw           - Gerenciar firewall UFW" })
                  break
                case "systemctl":
                  newLines.push({ type: "output", content: "  systemctl     - Controlar serviços do sistema" })
                  break
                case "netstat":
                  newLines.push({ type: "output", content: "  netstat       - Mostrar conexões de rede" })
                  break
                case "ps":
                  newLines.push({ type: "output", content: "  ps            - Listar processos" })
                  break
                case "top":
                  newLines.push({ type: "output", content: "  top           - Monitor de processos" })
                  break
                case "df":
                  newLines.push({ type: "output", content: "  df            - Mostrar uso do disco" })
                  break
                case "free":
                  newLines.push({ type: "output", content: "  free          - Mostrar uso da memória" })
                  break
                case "useradd":
                  newLines.push({ type: "output", content: "  useradd       - Adicionar usuário" })
                  break
                case "passwd":
                  newLines.push({ type: "output", content: "  passwd        - Alterar senha" })
                  break
              }
            })
          }
          break

        case "clear":
          setLines([])
          return

        case "whoami":
          newLines.push({ type: "output", content: currentUser })
          break

        case "date":
          newLines.push({ type: "output", content: new Date().toLocaleString("pt-BR") })
          break

        case "pwd":
          newLines.push({ type: "output", content: currentPath })
          break

        case "ls":
          const targetPath = args[0] ? resolvePath(args[0]) : currentPath
          const targetDir = fileSystem[targetPath]

          if (!targetDir) {
            newLines.push({ type: "error", content: `ls: ${args[0] || currentPath}: Diretório não encontrado` })
          } else if (targetDir.type !== "directory") {
            newLines.push({ type: "error", content: `ls: ${args[0] || currentPath}: Não é um diretório` })
          } else {
            if (targetDir.children && targetDir.children.length > 0) {
              targetDir.children.forEach((child) => {
                const childPath = targetPath === "/" ? `/${child}` : `${targetPath}/${child}`
                const childItem = fileSystem[childPath]
                const prefix = childItem?.type === "directory" ? "d" : "-"
                const permissions = childItem?.type === "directory" ? "rwxr-xr-x" : "rw-r--r--"
                const size = childItem?.type === "directory" ? "4096" : childItem?.content?.length || "0"
                const date = new Date().toLocaleDateString("pt-BR")
                newLines.push({
                  type: "output",
                  content: `${prefix}${permissions}  1 ${currentUser} ${currentUser} ${size.padStart(8)} ${date} ${child}`,
                })
              })
            } else {
              newLines.push({ type: "output", content: "Diretório vazio" })
            }
          }
          break

        case "cd":
          const newPath = args[0] ? resolvePath(args[0]) : `/home/${currentUser}`
          const newDir = fileSystem[newPath]

          if (!newDir) {
            newLines.push({ type: "error", content: `cd: ${args[0]}: Diretório não encontrado` })
          } else if (newDir.type !== "directory") {
            newLines.push({ type: "error", content: `cd: ${args[0]}: Não é um diretório` })
          } else {
            setCurrentPath(newPath)
          }
          break

        case "mkdir":
          if (!args[0]) {
            newLines.push({ type: "error", content: "mkdir: faltando nome do diretório" })
          } else {
            const newDirPath = resolvePath(args[0])
            if (fileSystem[newDirPath]) {
              newLines.push({ type: "error", content: `mkdir: ${args[0]}: Arquivo ou diretório já existe` })
            } else {
              setFileSystem((prev) => ({
                ...prev,
                [newDirPath]: { type: "directory", children: [] },
                [currentPath]: {
                  ...prev[currentPath],
                  children: [...(prev[currentPath]?.children || []), args[0]],
                },
              }))
              newLines.push({ type: "output", content: `Diretório '${args[0]}' criado` })
            }
          }
          break

        case "cat":
          if (!args[0]) {
            newLines.push({ type: "error", content: "cat: faltando nome do arquivo" })
          } else {
            const filePath = resolvePath(args[0])
            const file = fileSystem[filePath]

            if (!file) {
              newLines.push({ type: "error", content: `cat: ${args[0]}: Arquivo não encontrado` })
            } else if (file.type !== "file") {
              newLines.push({ type: "error", content: `cat: ${args[0]}: É um diretório` })
            } else {
              const content = file.content || ""
              content.split("\n").forEach((line) => {
                newLines.push({ type: "output", content: line })
              })
            }
          }
          break

        case "su":
          const targetUser = args[0] || "root"
          if (!users[targetUser]) {
            newLines.push({ type: "error", content: `su: usuário '${targetUser}' não existe` })
            newLines.push({ type: "output", content: "Usuários disponíveis: " + Object.keys(users).join(", ") })
          } else if (users[targetUser].hasPassword) {
            newLines.push({ type: "output", content: `Senha para ${targetUser}:` })
            setAwaitingPassword(targetUser)
          } else {
            setCurrentUser(targetUser)
            setCurrentPath(targetUser === "root" ? "/root" : `/home/${targetUser}`)
            newLines.push({ type: "output", content: `Mudando para usuário ${targetUser}...` })
            newLines.push({ type: "output", content: `Bem-vindo, ${targetUser}!` })
          }
          break

        case "exit":
          if (currentUser !== "user") {
            setCurrentUser("user")
            setCurrentPath("/home/user")
            newLines.push({ type: "output", content: "Saindo do usuário atual..." })
            newLines.push({ type: "output", content: "Voltando para usuário 'user'" })
          } else {
            newLines.push({ type: "error", content: "exit: já está no usuário padrão" })
          }
          break

        case "echo":
          newLines.push({ type: "output", content: args.join(" ") })
          break

        case "calc":
          try {
            const expression = args.join(" ")
            if (/^[0-9+\-*/().\s]+$/.test(expression)) {
              const result = eval(expression)
              newLines.push({ type: "output", content: `${expression} = ${result}` })
            } else {
              newLines.push({ type: "error", content: "Erro: Expressão inválida" })
            }
          } catch (e) {
            newLines.push({ type: "error", content: "Erro: Não foi possível calcular a expressão" })
          }
          break

        case "neofetch":
          newLines.push(
            { type: "output", content: "                   -`                    " + currentUser + "@terminal-web" },
            { type: "output", content: "                  .o+`                   ─────────────────────" },
            { type: "output", content: "                 `ooo/                   OS: Web Terminal 1.0" },
            { type: "output", content: "                `+oooo:                  Host: Browser Engine" },
            { type: "output", content: "               `+oooooo:                 Kernel: JavaScript V8" },
            {
              type: "output",
              content: "               -+oooooo+:                Uptime: " + Math.floor(Math.random() * 100) + " min",
            },
            { type: "output", content: "             `/:-:++oooo+:               Shell: WebShell 1.0" },
            { type: "output", content: "            `/++++/+++++++:              Terminal: terminal-web" },
            { type: "output", content: "           `/++++++++++++++:             CPU: Browser Thread" },
            {
              type: "output",
              content:
                "          `/+++ooooooooo+++/`            Memory: " + Math.floor(Math.random() * 1000) + "MB / 2048MB",
            },
            {
              type: "output",
              content:
                "         ./ooosssso++osssssso+`          Resolution: " + window.innerWidth + "x" + window.innerHeight,
            },
            { type: "output", content: "        .oossssso-````/ossssss+`         Theme: Matrix Green" },
            { type: "output", content: "       -osssssso.      :ssssssso.        User: " + currentUser },
            { type: "output", content: "      :osssssss/        osssso+++.       Path: " + currentPath },
            { type: "output", content: "     /ossssssss/        +ssssooo/-       " },
            { type: "output", content: "   `/ossssso+/:-        -:/+osssso+-     " },
            { type: "output", content: "  `+sso+:-`                 `.-/+oso:    " },
            { type: "output", content: " `++:.                           `-/+/   " },
            { type: "output", content: " .`                                 `/   " },
          )
          break

        // Comandos administrativos
        case "iptables":
          newLines.push(
            { type: "output", content: "Chain INPUT (policy ACCEPT)" },
            { type: "output", content: "target     prot opt source               destination" },
            {
              type: "output",
              content: "ACCEPT     all  --  anywhere             anywhere             ctstate RELATED,ESTABLISHED",
            },
            { type: "output", content: "ACCEPT     all  --  anywhere             anywhere" },
            { type: "output", content: "INPUT_direct  all  --  anywhere             anywhere" },
            {
              type: "output",
              content: "DROP       all  --  anywhere             anywhere             ctstate INVALID",
            },
            {
              type: "output",
              content: "REJECT     all  --  anywhere             anywhere             reject-with icmp-host-prohibited",
            },
          )
          break

        case "ufw":
          newLines.push(
            { type: "output", content: "Status: active" },
            { type: "output", content: "" },
            { type: "output", content: "To                         Action      From" },
            { type: "output", content: "--                         ------      ----" },
            { type: "output", content: "22/tcp                     ALLOW       Anywhere" },
            { type: "output", content: "80/tcp                     ALLOW       Anywhere" },
            { type: "output", content: "443/tcp                    ALLOW       Anywhere" },
          )
          break

        case "systemctl":
          newLines.push(
            { type: "output", content: "UNIT                               LOAD   ACTIVE SUB     DESCRIPTION" },
            { type: "output", content: "-.mount                            loaded active mounted Root Mount" },
            { type: "output", content: "boot.mount                         loaded active mounted /boot" },
            {
              type: "output",
              content: "dev-hugepages.mount                loaded active mounted Huge Pages File System",
            },
            { type: "output", content: "proc.mount                         loaded active mounted /proc" },
          )
          break

        case "netstat":
          newLines.push(
            { type: "output", content: "Conexões de Internet Ativas" },
            { type: "output", content: "Proto Recv-Q Send-Q Endereço Local          Endereço Remoto         Estado" },
            { type: "output", content: "tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN" },
            { type: "output", content: "tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN" },
            { type: "output", content: "tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN" },
          )
          break

        case "ps":
          newLines.push(
            { type: "output", content: "  PID TTY          TIME CMD" },
            { type: "output", content: "    1 ?        00:00:01 systemd" },
            { type: "output", content: "    2 ?        00:00:00 kthreadd" },
            { type: "output", content: " 1234 pts/0    00:00:00 bash" },
            { type: "output", content: " 1337 pts/0    00:00:00 terminal-web" },
          )
          break

        case "top":
          newLines.push(
            { type: "output", content: "top - " + new Date().toLocaleTimeString() + " up 1 day,  2:34,  1 user" },
            { type: "output", content: "Tasks: 123 total,   1 running, 122 sleeping" },
            { type: "output", content: "%Cpu(s):  2.3 us,  1.2 sy,  0.0 ni, 96.2 id" },
            { type: "output", content: "MiB Mem :   2048.0 total,    512.3 free,    768.2 used" },
            { type: "output", content: "" },
            { type: "output", content: "  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND" },
            { type: "output", content: "    1 root      20   0  169364  13616   8844 S   0.0   0.7   0:01.23 systemd" },
            {
              type: "output",
              content:
                " 1337 " + currentUser + "      20   0   12345   4567   2345 R   1.2   0.2   0:00.45 terminal-web",
            },
          )
          break

        case "df":
          newLines.push(
            { type: "output", content: "Sist. Arq.      1K-blocos    Usado Disponível Uso% Montado em" },
            { type: "output", content: "/dev/sda1        20971520  8388608  11534336  43% /" },
            { type: "output", content: "tmpfs             1048576        0   1048576   0% /dev/shm" },
            { type: "output", content: "/dev/sda2         5242880   524288   4456448  11% /home" },
          )
          break

        case "free":
          newLines.push(
            {
              type: "output",
              content: "               total        used        free      shared  buff/cache   available",
            },
            {
              type: "output",
              content: "Mem:         2097152      786432      524288       12288      786432     1234567",
            },
            { type: "output", content: "Swap:        1048576           0     1048576" },
          )
          break

        default:
          newLines.push({ type: "error", content: `Comando não encontrado: ${command}` })
      }
    } catch (error) {
      newLines.push({ type: "error", content: "Erro interno do terminal" })
    }

    setLines((prev) => [...prev, ...newLines])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
  }

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [lines])

  const prompt = getCurrentUser()?.isAdmin ? "#" : "$"
  const promptColor = getCurrentUser()?.isAdmin ? "text-red-400" : "text-green-300"

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
        <span className={`${promptColor} mr-2`}>
          {currentUser}@terminal-web:{currentPath.replace(`/home/${currentUser}`, "~")}
          {prompt}
        </span>
        <Input
          ref={inputRef}
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          type={awaitingPassword ? "password" : "text"}
          className="bg-transparent border-none text-green-400 font-mono focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto shadow-none"
          placeholder={awaitingPassword ? "Digite a senha..." : "Digite um comando..."}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      <div className="mt-2 text-xs text-green-600 opacity-70">
        Use ↑/↓ para navegar no histórico | Usuário: {currentUser} | Pasta: {currentPath}
      </div>
    </div>
  )
}
