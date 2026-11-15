import { APP_URL, DESTINOS } from './destinos';

describe('destinos do app', () => {
  it('o endereço do app é https e não termina em barra', () => {
    expect(APP_URL.startsWith('https://')).toBe(true);
    expect(APP_URL.endsWith('/')).toBe(false);
  });

  it('todo destino é um endereço válido dentro do app', () => {
    for (const endereco of Object.values(DESTINOS)) {
      expect(new URL(endereco).origin).toBe(APP_URL);
    }
  });

  it('"Criar conta" abre o login no modo cadastro', () => {
    const url = new URL(DESTINOS.criarConta);
    expect(url.pathname).toBe('/login');
    expect(url.searchParams.get('modo')).toBe('cadastro');
  });

  it('"Entrar" abre o login sem escolher modo', () => {
    const url = new URL(DESTINOS.entrar);
    expect(url.pathname).toBe('/login');
    expect(url.search).toBe('');
  });

  it('"Descobrir" abre a lista de bares', () => {
    expect(new URL(DESTINOS.descobrir).pathname).toBe('/cliente/discovery');
  });
});
