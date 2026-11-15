/**
 * Como falar com a equipe do +party: o WhatsApp de quem atende os bares e o
 * e-mail do projeto.
 *
 * Fica tudo aqui, como os endereços do app em `destinos.ts`. Se o número ou o
 * e-mail mudarem, troca-se só a linha deles.
 */

/** Número de quem atende, só dígitos, com o 55 do Brasil e o DDD. */
const WHATSAPP_NUMERO = '5515999999999';

/** Mensagem que já aparece escrita quando o dono do bar abre a conversa. */
const WHATSAPP_MENSAGEM = 'Quero o +party no meu bar';

export const CONTATO = {
  /** O número como aparece na tela. */
  whatsappExibicao: '(15) 99999-9999',
  /** Abre a conversa no WhatsApp com a mensagem pronta. */
  whatsapp: `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(WHATSAPP_MENSAGEM)}`,
  email: 'technomind.pp@gmail.com',
  /** Abre o e-mail com o assunto preenchido. */
  emailLink: `mailto:technomind.pp@gmail.com?subject=${encodeURIComponent('Contato pelo site do +party')}`,
} as const;
