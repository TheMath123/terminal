import type { TerminalLine } from '@/types/terminal';

export const executeHelpCommand = (
  availableCommands: string[],
  currentUser: string,
): TerminalLine[] => {
  const newLines: TerminalLine[] = [];

  newLines.push({
    type: 'output',
    content: `Comandos disponíveis para ${currentUser}:`,
  });
  newLines.push({ type: 'output', content: '' });
  newLines.push({ type: 'output', content: 'COMANDOS BÁSICOS:' });

  const basicCommands = [
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
    'cat',
    'play',
    'neofetch',
    'su',
    'find',
    'exit',
  ];
  const userBasicCommands = availableCommands.filter((cmd) =>
    basicCommands.includes(cmd),
  );

  const descriptions: { [key: string]: string } = {
    help: '  help          - Mostra esta mensagem de ajuda',
    clear: '  clear         - Limpa o terminal',
    whoami: '  whoami        - Mostra usuário atual',
    date: '  date          - Mostra data e hora atual',
    echo: '  echo [texto]  - Repete o texto digitado',
    calc: '  calc [expr]   - Calculadora simples',
    pwd: '  pwd           - Mostra diretório atual',
    ls: '  ls [pasta]    - Lista arquivos do diretório',
    cd: '  cd [pasta]    - Navega para diretório',
    mkdir: '  mkdir [nome]  - Cria diretório',
    cat: '  cat [arquivo] - Mostra conteúdo do arquivo',
    play: '  play [arquivo] - Executar arquivos de mídia',
    neofetch: '  neofetch      - Mostra informações do sistema',
    su: '  su [usuario]  - Muda para outro usuário',
    find: '  find [nome]   - Busca arquivos e diretórios',
  };

  userBasicCommands.forEach((cmd) => {
    if (descriptions[cmd]) {
      newLines.push({ type: 'output', content: descriptions[cmd] });
    }
  });

  const adminCommands = ['iptables', 'ufw', 'systemctl', 'netstat', 'ps'];
  const userAdminCommands = availableCommands.filter((cmd) =>
    adminCommands.includes(cmd),
  );

  if (userAdminCommands.length > 0) {
    newLines.push({ type: 'output', content: '' });
    newLines.push({ type: 'output', content: 'COMANDOS ADMINISTRATIVOS:' });

    const adminDescriptions: { [key: string]: string } = {
      exit: '  exit          - Sair do usuário atual',
      iptables: '  iptables      - Gerenciar firewall iptables',
      ufw: '  ufw           - Gerenciar firewall UFW',
      ps: '  ps            - Listar processos',
    };

    userAdminCommands.forEach((cmd) => {
      if (adminDescriptions[cmd]) {
        newLines.push({ type: 'output', content: adminDescriptions[cmd] });
      }
    });
  }

  return newLines;
};
