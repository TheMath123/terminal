import CryptoJS from 'crypto-js';
import type { CommandContext, TerminalLine } from '@/types/terminal';

export const executeDecodeCommand = (
  args: string[],
  _context: CommandContext,
): TerminalLine[] => {
  const lines: TerminalLine[] = [];

  if (args[0] === '-h' || args.length < 2) {
    lines.push({ type: 'output', content: `Comando: decode` });
    lines.push({ type: 'output', content: `Uso:` });
    lines.push({
      type: 'output',
      content: `  decode aes <chave> <mensagem criptografada>`,
    });
    lines.push({
      type: 'output',
      content: `  ⚠️ md5 e sha256 não podem ser descriptografados`,
    });
    lines.push({ type: 'output', content: `Exemplo:` });
    lines.push({
      type: 'output',
      content: `  decode aes minhaSenha U2FsdGVkX1...`,
    });
    return lines;
  }

  const [algorithm, ...rest] = args;

  try {
    switch (algorithm) {
      case 'aes': {
        const key = rest[0];
        const encrypted = rest.slice(1).join(' ');
        const bytes = CryptoJS.AES.decrypt(encrypted, key);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (!decrypted) throw new Error();
        lines.push({ type: 'output', content: `🔓 AES: ${decrypted}` });
        break;
      }
      case 'md5':
      case 'sha256':
        lines.push({
          type: 'error',
          content: `${algorithm.toUpperCase()} é um hash unidirecional e não pode ser revertido.`,
        });
        break;
      default:
        lines.push({
          type: 'error',
          content: `Algoritmo não suportado: ${algorithm}`,
        });
    }
  } catch {
    lines.push({
      type: 'error',
      content: 'Erro ao decodificar. Verifique a chave ou mensagem.',
    });
  }

  return lines;
};
