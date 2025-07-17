import CryptoJS from 'crypto-js';
import type { CommandContext, TerminalLine } from '@/types/terminal';

export const executeEncodeCommand = (
  args: string[],
  _context: CommandContext,
): TerminalLine[] => {
  const lines: TerminalLine[] = [];

  if (args[0] === '-h' || args.length < 2) {
    lines.push({ type: 'output', content: `Comando: encode` });
    lines.push({ type: 'output', content: `Uso:` });
    lines.push({ type: 'output', content: `  encode aes <chave> <mensagem>` });
    lines.push({ type: 'output', content: `  encode md5 <mensagem>` });
    lines.push({ type: 'output', content: `  encode sha256 <mensagem>` });
    lines.push({ type: 'output', content: `Exemplos:` });
    lines.push({
      type: 'output',
      content: `  encode aes minhaSenha "mensagem secreta"`,
    });
    lines.push({ type: 'output', content: `  encode md5 "meu texto"` });
    lines.push({ type: 'output', content: `  encode sha256 "outro texto"` });
    return lines;
  }

  const [algorithm, ...rest] = args;

  try {
    switch (algorithm) {
      case 'aes': {
        const key = rest[0];
        const message = rest.slice(1).join(' ');
        const encrypted = CryptoJS.AES.encrypt(message, key).toString();
        lines.push({ type: 'output', content: `AES: ${encrypted}` });
        break;
      }
      case 'md5': {
        const message = rest.join(' ');
        const hash = CryptoJS.MD5(message).toString();
        lines.push({ type: 'output', content: `MD5: ${hash}` });
        break;
      }
      case 'sha256': {
        const message = rest.join(' ');
        const hash = CryptoJS.SHA256(message).toString();
        lines.push({ type: 'output', content: `SHA256: ${hash}` });
        break;
      }
      default:
        lines.push({
          type: 'error',
          content: `Algoritmo não suportado: ${algorithm}`,
        });
    }
  } catch {
    lines.push({ type: 'error', content: 'Erro ao codificar.' });
  }

  return lines;
};
