import type { TerminalLine } from "@/types/terminal"

export const executeHelpCommand = (availableCommands: string[], currentUser: string): TerminalLine[] => {
  const newLines: TerminalLine[] = []

  newLines.push({ type: "output", content: `Comandos disponíveis para ${currentUser}:` })
  newLines.push({ type: "output", content: "" })
  newLines.push({ type: "output", content: "COMANDOS BÁSICOS:" })

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
    "find",
    "tree",
  ]
  const userBasicCommands = availableCommands.filter((cmd) => basicCommands.includes(cmd))

  const descriptions: { [key: string]: string } = {
    help: "  help          - Mostra esta mensagem de ajuda",
    clear: "  clear         - Limpa o terminal",
    whoami: "  whoami        - Mostra usuário atual",
    date: "  date          - Mostra data e hora atual",
    echo: "  echo [texto]  - Repete o texto digitado",
    calc: "  calc [expr]   - Calculadora simples",
    pwd: "  pwd           - Mostra diretório atual",
    ls: "  ls [pasta]    - Lista arquivos do diretório",
    cd: "  cd [pasta]    - Navega para diretório",
    mkdir: "  mkdir [nome]  - Cria diretório",
    cat: "  cat [arquivo] - Mostra conteúdo do arquivo",
    neofetch: "  neofetch      - Mostra informações do sistema",
    su: "  su [usuario]  - Muda para outro usuário",
    find: "  find [nome]   - Busca arquivos e diretórios",
    tree: "  tree          - Mostra estrutura em árvore",
  }

  userBasicCommands.forEach((cmd) => {
    if (descriptions[cmd]) {
      newLines.push({ type: "output", content: descriptions[cmd] })
    }
  })

  const adminCommands = [
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
  ]
  const userAdminCommands = availableCommands.filter((cmd) => adminCommands.includes(cmd))

  if (userAdminCommands.length > 0) {
    newLines.push({ type: "output", content: "" })
    newLines.push({ type: "output", content: "COMANDOS ADMINISTRATIVOS:" })

    const adminDescriptions: { [key: string]: string } = {
      exit: "  exit          - Sair do usuário atual",
      iptables: "  iptables      - Gerenciar firewall iptables",
      ufw: "  ufw           - Gerenciar firewall UFW",
      systemctl: "  systemctl     - Controlar serviços do sistema",
      netstat: "  netstat       - Mostrar conexões de rede",
      ps: "  ps            - Listar processos",
      top: "  top           - Monitor de processos",
      df: "  df            - Mostrar uso do disco",
      free: "  free          - Mostrar uso da memória",
      useradd: "  useradd       - Adicionar usuário",
      passwd: "  passwd        - Alterar senha",
    }

    userAdminCommands.forEach((cmd) => {
      if (adminDescriptions[cmd]) {
        newLines.push({ type: "output", content: adminDescriptions[cmd] })
      }
    })
  }

  return newLines
}

export const executeEchoCommand = (args: string[]): TerminalLine[] => {
  return [{ type: "output", content: args.join(" ") }]
}

export const executeWhoamiCommand = (currentUser: string): TerminalLine[] => {
  return [{ type: "output", content: currentUser }]
}

export const executeDateCommand = (): TerminalLine[] => {
  return [{ type: "output", content: new Date().toLocaleString("pt-BR") }]
}

export const executePwdCommand = (currentPath: string): TerminalLine[] => {
  return [{ type: "output", content: currentPath }]
}

export const executeCalcCommand = (args: string[]): TerminalLine[] => {
  try {
    const expression = args.join(" ")
    if (/^[0-9+\-*/().\s]+$/.test(expression)) {
      const result = eval(expression)
      return [{ type: "output", content: `${expression} = ${result}` }]
    } else {
      return [{ type: "error", content: "Erro: Expressão inválida" }]
    }
  } catch (e) {
    return [{ type: "error", content: "Erro: Não foi possível calcular a expressão" }]
  }
}
