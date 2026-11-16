import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CONTATO } from '../../config/contato';
import { DESTINOS } from '../../config/destinos';
import { BARES_EXEMPLO, hhmm, lotacao, plato } from './noite-motor';
import { Noite } from './noite';

describe('motor da noite', () => {
  it('converte minutos depois das 18h em horário', () => {
    expect(hhmm(0)).toBe('18:00');
    expect(hhmm(340)).toBe('23:40');
    expect(hhmm(390)).toBe('00:30');
    expect(hhmm(600)).toBe('04:00');
  });

  it('o bar sobe, fica cheio por horas e depois esvazia', () => {
    const curva = { a: 0, b: 100, c: 300, d: 400 };
    expect(plato(curva, 0)).toBe(0);
    expect(plato(curva, 100)).toBe(1);
    expect(plato(curva, 200)).toBe(1);
    expect(plato(curva, 300)).toBe(1);
    expect(plato(curva, 400)).toBe(0);
  });

  it('a lotação fica entre 0% e 100% a noite toda', () => {
    for (const bar of BARES_EXEMPLO) {
      for (let t = 0; t <= 600; t += 5) {
        const p = lotacao(bar, t);
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThanOrEqual(100);
      }
    }
  });
});

describe('página inicial', () => {
  async function montar() {
    await TestBed.configureTestingModule({ imports: [Noite], providers: [provideRouter([])] }).compileComponents();
    const fixture = TestBed.createComponent(Noite);
    fixture.detectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const root = host.shadowRoot as ShadowRoot;
    return { fixture, host, root };
  }

  it('abre no lado de quem sai', async () => {
    const { host, fixture } = await montar();
    expect(host.dataset['lado']).toBe('cli');
    fixture.destroy();
  });

  it('o seletor troca para o lado do bar e volta', async () => {
    const { host, root, fixture } = await montar();
    const [cli, bar] = Array.from(root.querySelectorAll<HTMLButtonElement>('.tn-seg button'));

    bar.click();
    expect(host.dataset['lado']).toBe('bar');
    expect(bar.getAttribute('aria-pressed')).toBe('true');
    expect(cli.getAttribute('aria-pressed')).toBe('false');

    cli.click();
    expect(host.dataset['lado']).toBe('cli');
    fixture.destroy();
  });

  it('"Entrar" leva ao login do app e o WhatsApp usa o contato configurado', async () => {
    const { root, fixture } = await montar();
    const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('a'));
    expect(links.find((a) => a.textContent?.trim() === 'Entrar')?.getAttribute('href')).toBe(DESTINOS.entrar);
    expect(links.find((a) => a.textContent?.trim() === 'Chamar no WhatsApp')?.getAttribute('href')).toBe(CONTATO.whatsapp);
    fixture.destroy();
  });

  it('o trilho de pedidos começa com pedidos nas três colunas', async () => {
    const { root, fixture } = await montar();
    const cols = Array.from(root.querySelectorAll('#rail .col'));
    expect(cols.map((c) => c.querySelectorAll('li').length)).toEqual([2, 2, 1]);
    fixture.destroy();
  });
});
