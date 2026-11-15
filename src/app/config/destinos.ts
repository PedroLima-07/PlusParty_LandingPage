/**
 * Para onde a landing manda quem clica: os endereços do app do +party.
 *
 * Fica tudo aqui para nenhum componente escrever URL à mão. Se o domínio do
 * app mudar, troca-se só `APP_URL`; se uma rota do app mudar, só a linha dela.
 *
 * Os caminhos vêm de `src/app/app.routes.ts` do repositório do app
 * (Startup-PlusParty). Todos abrem sem login, exceto o que o próprio app
 * protege depois.
 */
export const APP_URL = 'https://plusparty.app.br';

export const DESTINOS = {
  /** Lista de bares com lotação, filtros e mapa. Abre sem conta. */
  descobrir: `${APP_URL}/cliente/discovery`,
  /** Tela de login já no modo "Cadastre-se". */
  criarConta: `${APP_URL}/login?modo=cadastro`,
  /** Tela de login. Quem já tem sessão é levado para a própria área. */
  entrar: `${APP_URL}/login`,
} as const;

export type Destino = keyof typeof DESTINOS;
