import { CONTATO } from './contato';

describe('contato da equipe', () => {
  it('o WhatsApp abre a conversa no wa.me com o número exibido', () => {
    const url = new URL(CONTATO.whatsapp);
    const digitosExibidos = CONTATO.whatsappExibicao.replace(/\D/g, '');
    expect(url.origin).toBe('https://wa.me');
    expect(url.pathname).toBe(`/55${digitosExibidos}`);
  });

  it('a mensagem do WhatsApp já vem escrita', () => {
    expect(new URL(CONTATO.whatsapp).searchParams.get('text')).toBe('Quero o +party no meu bar');
  });

  it('o link de e-mail vai para o e-mail exibido', () => {
    const url = new URL(CONTATO.emailLink);
    expect(url.protocol).toBe('mailto:');
    expect(url.pathname).toBe(CONTATO.email);
  });
});
