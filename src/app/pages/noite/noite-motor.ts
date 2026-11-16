/**
 * O que faz a landing da noite se mexer: o relógio, as listas que esticam com
 * a lotação, o caixa do bar, o trilho de pedidos e a troca entre os dois lados
 * (quem sai e quem tem bar).
 *
 * Tudo acontece dentro do Shadow DOM do componente, por isso cada busca parte
 * de `root` e não de `document`. `ligarNoite` devolve uma função que desliga
 * timers e listeners quando o componente sai da tela.
 *
 * Os bares, os produtos e os números são de exemplo.
 */

type Lado = 'cli' | 'bar';

interface Curva {
  /** Começa a encher (minutos depois das 18h). */
  a: number;
  /** Fica cheio. */
  b: number;
  /** Começa a esvaziar. */
  c: number;
  /** Termina. */
  d: number;
}

interface Bar extends Curva {
  n: string;
  max: number;
  lo: number;
}

interface Produto extends Curva {
  n: string;
  r: number;
  cum: number[];
}

/** Bares de exemplo. Os nomes são fictícios, os mesmos da demonstração do app. */
export const BARES_EXEMPLO: readonly Bar[] = [
  { n: "Bar D'20", a: 0, b: 150, c: 400, d: 540, max: 86, lo: 12 },
  { n: 'Tropicália', a: 30, b: 210, c: 420, d: 560, max: 72, lo: 8 },
  { n: 'Skyline Rooftop', a: 60, b: 240, c: 470, d: 600, max: 93, lo: 6 },
  { n: 'Quintal', a: 90, b: 270, c: 450, d: 590, max: 64, lo: 8 },
  { n: 'Garagem 27', a: 150, b: 320, c: 520, d: 640, max: 88, lo: 4 },
  { n: 'Neon Club', a: 210, b: 390, c: 570, d: 700, max: 97, lo: 3 },
];

const ease = (x: number) => {
  x = Math.max(0, Math.min(1, x));
  return x * x * (3 - 2 * x);
};

/** Minutos depois das 18h para "hh:mm". */
export function hhmm(t: number): string {
  const m = (18 * 60 + t) % 1440;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h < 10 ? '0' : ''}${h}:${mm < 10 ? '0' : ''}${mm}`;
}

/** Quanto da lotação máxima o bar tem no minuto t: sobe, fica cheio, esvazia. */
export function plato(o: Curva, t: number): number {
  if (t <= o.b) return ease((t - o.a) / (o.b - o.a));
  if (t <= o.c) return 1;
  return 1 - ease((t - o.c) / (o.d - o.c));
}

/** Lotação do bar em porcentagem, com uma oscilação pequena enquanto está cheio. */
export function lotacao(b: Bar, t: number): number {
  const wob = t > b.b && t < b.c ? Math.sin((t + b.a) / 23) * 3 : 0;
  return Math.round(b.lo + (b.max - b.lo) * plato(b, t) + wob);
}

const rotulo = (p: number) => (p >= 70 ? 'Cheio' : p >= 40 ? 'Enchendo' : 'Tranquilo');
const brl = (n: number) => 'R$ ' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

function agoraNaNoite(): number {
  const d = new Date();
  const m = d.getHours() * 60 + d.getMinutes();
  const t = m >= 1080 ? m - 1080 : m + 360;
  return t >= 0 && t <= 600 ? Math.round(t / 5) * 5 : 340;
}

const CEU: [number, number[]][] = [
  [0, [240, 112, 48]],
  [100, [176, 38, 74]],
  [220, [86, 22, 120]],
  [340, [27, 20, 100]],
  [480, [8, 9, 38]],
  [560, [52, 74, 120]],
  [600, [196, 214, 236]],
];

function ceu(t: number): number[] {
  for (let i = 1; i < CEU.length; i++) {
    if (t <= CEU[i][0]) {
      const [ta, ca] = CEU[i - 1];
      const [tb, cb] = CEU[i];
      const f = (t - ta) / (tb - ta);
      return ca.map((v, j) => Math.round(v + (cb[j] - v) * f));
    }
  }
  return CEU[CEU.length - 1][1];
}

const NUM = ['Nenhum bar cheio', 'Um bar cheio', 'Dois bares cheios', 'Três bares cheios', 'Quatro bares cheios'];

const ITENS = [
  ['2 chope', '1 porção de fritas'],
  ['1 caipirinha', '1 gin tônica'],
  ['3 long neck'],
  ['1 porção de calabresa', '2 chope'],
  ['2 gin tônica', '1 água'],
  ['1 caipirinha de morango'],
  ['4 chope', '1 isca de frango'],
];

export function ligarNoite(root: ShadowRoot, host: HTMLElement): () => void {
  const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = <T extends HTMLElement = HTMLElement>(id: string) => root.getElementById(id) as T;
  const desligar: (() => void)[] = [];
  const ouvir = (alvo: EventTarget, tipo: string, fn: EventListener, opt?: AddEventListenerOptions) => {
    alvo.addEventListener(tipo, fn, opt);
    desligar.push(() => alvo.removeEventListener(tipo, fn, opt));
  };
  const rolarAte = (el: Element | null) => el?.scrollIntoView?.({ behavior: reduce ? 'auto' : 'smooth' });

  /* Relógio */
  const k1bares = BARES_EXEMPLO.filter((_, i) => i !== 3 && i !== 1);
  const k1list = $('k1list');
  k1list.innerHTML = k1bares
    .map((b) => `<li><span class="k1-n">${b.n}</span><span class="k1-st"></span><span class="k1-m"><i></i></span></li>`)
    .join('');

  /* Lista viva */
  const k4list = $('k4list');
  k4list.innerHTML = BARES_EXEMPLO.map((b) => `<li><span class="k4-name">${b.n}</span><span class="k4-pct"></span></li>`).join('');

  /* Caixa: o Skyline Rooftop de exemplo, visto por dentro */
  const casa = BARES_EXEMPLO[2];
  const acumulado = [0];
  for (let i = 5; i <= 600; i += 5) acumulado.push(acumulado[acumulado.length - 1] + plato(casa, i) * 124);

  /* O que sai */
  const produtos: Produto[] = [
    { n: 'Chope', a: 0, b: 120, c: 420, d: 600, r: 1.0, cum: [] },
    { n: 'Porção de fritas', a: 20, b: 150, c: 300, d: 480, r: 0.62, cum: [] },
    { n: 'Caipirinha', a: 90, b: 240, c: 480, d: 620, r: 0.7, cum: [] },
    { n: 'Long neck', a: 120, b: 300, c: 520, d: 640, r: 0.78, cum: [] },
    { n: 'Gin tônica', a: 210, b: 360, c: 540, d: 660, r: 0.66, cum: [] },
    { n: 'Água', a: 240, b: 450, c: 580, d: 680, r: 0.4, cum: [] },
  ];
  produtos.forEach((p) => {
    p.cum = [0];
    for (let i = 5; i <= 600; i += 5) p.cum.push(p.cum[p.cum.length - 1] + p.r * plato(p, i) * 2.1);
  });
  const b3list = $('b3list');
  b3list.innerHTML = produtos.map((p) => `<li><span class="b3-name">${p.n}</span><span class="b3-q"></span></li>`).join('');

  const nr = $<HTMLInputElement>('nr');
  const relogio = $('relogio');
  const caixa = $('caixa');

  function desenhar() {
    const t = +nr.value;
    const T = hhmm(t);
    const c = ceu(t);
    const lum = 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
    $('nt').textContent = T;
    nr.setAttribute('aria-valuetext', T);
    [relogio, caixa].forEach((s) => {
      s.style.setProperty('--bg', `rgb(${c.join(',')})`);
      s.style.setProperty('--fg', lum > 150 ? '#120d1f' : '#ffffff');
    });
    $('k1clock').textContent = T;

    let cheios = 0;
    k1bares.forEach((b, i) => {
      const p = lotacao(b, t);
      const li = k1list.children[i] as HTMLElement;
      if (p >= 70) cheios++;
      li.children[1].textContent = `${rotulo(p)}, ${p}%`;
      (li.querySelector('i') as HTMLElement).style.width = p + '%';
    });
    $('k1say').textContent =
      NUM[cheios] + (cheios === 0 ? (t < 200 ? ' ainda. Dá tempo de escolher a mesa.' : ' a essa hora.') : ' agora em Sorocaba.');

    BARES_EXEMPLO.forEach((b, i) => {
      const p = lotacao(b, t);
      const li = k4list.children[i] as HTMLElement;
      (li.firstElementChild as HTMLElement).style.fontVariationSettings = `"wdth" ${Math.round(50 + p)}, "wght" ${Math.round(140 + p * 7.6)}`;
      (li.lastElementChild as HTMLElement).textContent = p + '%';
      li.classList.toggle('full', p >= 70);
    });

    const f = plato(casa, t);
    $('b1money').textContent = brl(Math.round(acumulado[t / 5] / 10) * 10);
    $('b1say').textContent = `vendidos até as ${T}. Você não espera fechar o caixa para saber.`;
    $('b1c').textContent = String(Math.round(2 + f * 44 + Math.sin(t / 19) * 2 * f));
    $('b1p').textContent = String(Math.max(0, Math.round(f * 6 + Math.sin(t / 11) * 2 * f)));
    $('b1l').textContent = lotacao(casa, t) + '%';

    const q = produtos.map((p) => Math.round(p.cum[t / 5]));
    const mx = Math.max(...q, 1);
    produtos.forEach((_, i) => {
      const g = q[i] / mx;
      const li = b3list.children[i] as HTMLElement;
      (li.firstElementChild as HTMLElement).style.fontVariationSettings = `"wdth" ${Math.round(50 + g * 100)}, "wght" ${Math.round(140 + g * 760)}`;
      (li.lastElementChild as HTMLElement).textContent = q[i] + (q[i] === 1 ? ' vendido' : ' vendidos');
      li.classList.toggle('top1', q[i] === mx && mx > 1);
    });
  }

  /* Barra da noite: roda sozinha, pausa quando a pessoa mexe */
  let rodando = !reduce;
  let timer: ReturnType<typeof setInterval> | undefined;
  const np = $('np');
  function rodar(on: boolean) {
    rodando = on;
    np.textContent = on ? 'Pausar' : 'Rodar a noite';
    clearInterval(timer);
    if (on) {
      timer = setInterval(() => {
        let v = +nr.value + 5;
        if (v > 600) v = 0;
        nr.value = String(v);
        desenhar();
      }, 420);
    }
  }
  ouvir(np, 'click', () => rodar(!rodando));
  ouvir(nr, 'input', () => {
    rodar(false);
    desenhar();
  });
  nr.value = String(agoraNaNoite());
  desenhar();
  rodar(rodando);
  desligar.push(() => clearInterval(timer));

  /* Comanda: data e hora de agora */
  {
    const d = new Date();
    const z = (n: number) => (n < 10 ? '0' : '') + n;
    $('rcpWhen').textContent = `Sorocaba, ${z(d.getDate())}/${z(d.getMonth() + 1)}, ${z(d.getHours())}:${z(d.getMinutes())}`;
  }

  /* Cartaz: cada linha ocupa a largura toda */
  function ajustar() {
    root.querySelectorAll<HTMLElement>('#cartaz .fit').forEach((el) => {
      const box = el.parentElement as HTMLElement;
      const cs = getComputedStyle(box);
      const w = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      if (!(w > 0)) return;
      el.style.fontSize = '100px';
      el.style.display = 'inline-block';
      const tw = el.offsetWidth;
      el.style.display = '';
      if (tw > 0) el.style.fontSize = Math.max(28, Math.floor(((100 * w) / tw) * 0.985)) + 'px';
    });
  }
  ouvir(window, 'resize', ajustar);
  ajustar();
  document.fonts?.load?.('100px Anton').then(ajustar, ajustar);

  /* Trilho de pedidos */
  const cols = Array.from(root.querySelectorAll<HTMLElement>('#rail .col'));
  let seq = 41;
  const contar = () => cols.forEach((c) => ((c.querySelector('.n') as HTMLElement).textContent = String(c.querySelectorAll('li').length)));
  function colocar(li: HTMLLIElement, s: number) {
    const b = li.firstElementChild as HTMLButtonElement;
    b.dataset['s'] = String(s);
    (b.querySelector('em') as HTMLElement).textContent = s === 0 ? 'Começar preparo' : s === 1 ? 'Marcar como pronto' : '';
    b.style.animation = 'none';
    void b.offsetWidth;
    b.style.animation = '';
    const ul = cols[s].querySelector('ul') as HTMLUListElement;
    ul.insertBefore(li, ul.firstChild);
    while (cols[2].querySelectorAll('li').length > 3) (cols[2].querySelector('ul') as HTMLUListElement).lastElementChild?.remove();
    contar();
  }
  function pedido(etapa: number) {
    const it = ITENS[seq % ITENS.length];
    const mesa = 3 + ((seq * 7) % 19);
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tk';
    b.innerHTML = `<strong><span>Mesa ${mesa}</span><span>nº ${seq++}</span></strong>${it.join('<br>')}<em></em>`;
    li.appendChild(b);
    colocar(li, etapa);
  }
  ouvir($('rail'), 'click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('.tk');
    if (!b) return;
    const s = +(b.dataset['s'] ?? 0);
    if (s < 2) colocar(b.parentElement as HTMLLIElement, s + 1);
  });
  pedido(2);
  pedido(1);
  pedido(1);
  pedido(0);
  pedido(0);
  if (!reduce) {
    const novos = setInterval(() => {
      if (cols[0].querySelectorAll('li').length < 3) pedido(0);
    }, 4200);
    desligar.push(() => clearInterval(novos));
  }

  /* Links internos: rolam até a parte, sem passar pelo roteador */
  root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) =>
    ouvir(a, 'click', (e) => {
      e.preventDefault();
      const alvo = a.dataset['go'];
      if (alvo) rolarAte($(alvo));
    }),
  );

  /* Os dois lados: quem sai e quem tem bar */
  function lado(l: Lado, manter = false) {
    host.dataset['lado'] = l;
    root.querySelectorAll<HTMLButtonElement>('.tn-seg button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset['ladoGo'] === l)));
    if (!manter) {
      try {
        window.scrollTo(0, 0);
      } catch {
        /* ambiente sem rolagem, como nos testes */
      }
    }
    if (l === 'cli') ajustar();
    try {
      history.replaceState(history.state, '', l === 'bar' ? '#bares' : location.pathname + location.search);
    } catch {
      /* sem histórico disponível */
    }
  }
  root.querySelectorAll<HTMLElement>('[data-lado-go]').forEach((el) =>
    ouvir(el, 'click', (e) => {
      e.preventDefault();
      lado(el.dataset['ladoGo'] as Lado);
    }),
  );
  lado(location.hash === '#bares' ? 'bar' : 'cli', true);

  return () => desligar.forEach((fn) => fn());
}
