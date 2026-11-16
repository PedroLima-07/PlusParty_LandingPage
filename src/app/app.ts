import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { SiteHeader } from './shared/site-header';
import { SiteFooter } from './shared/site-footer';

/** A página inicial tem menu e rodapé próprios; as outras usam os do site. */
const ehPaginaInicial = (url: string) => url.split(/[?#]/)[0] === '/';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteHeader, SiteFooter],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);

  protected readonly paginaInicial = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => ehPaginaInicial(e.urlAfterRedirects)),
    ),
    { initialValue: ehPaginaInicial(this.router.url) },
  );
}
