import { Component, DestroyRef, ElementRef, ViewEncapsulation, afterNextRender, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONTATO } from '../../config/contato';
import { DESTINOS } from '../../config/destinos';
import { ligarNoite } from './noite-motor';

/**
 * Página inicial: a noite de Sorocaba, com um lado para quem sai e outro para
 * quem tem bar. O seletor no topo troca de lado; a barra de baixo é a hora da
 * noite e muda todas as partes ao mesmo tempo.
 *
 * Usa Shadow DOM porque tem identidade visual própria: o design system de
 * styles.scss não entra aqui, e o CSS daqui não vaza para as outras páginas.
 */
@Component({
  selector: 'app-noite',
  imports: [RouterLink],
  templateUrl: './noite.html',
  styleUrl: './noite.css',
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class Noite {
  protected readonly destinos = DESTINOS;
  protected readonly contato = CONTATO;

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (!host.shadowRoot) return;
      const desligar = ligarNoite(host.shadowRoot, host);
      destroyRef.onDestroy(desligar);
    });
  }
}
