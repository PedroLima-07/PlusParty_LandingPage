import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DESTINOS } from '../../config/destinos';
import { Revela } from '../../shared/revela';

@Component({
  selector: 'app-planos-cliente',
  imports: [RouterLink, Revela],
  templateUrl: './planos-cliente.html',
  styleUrl: './planos-cliente.scss',
})
export class PlanosCliente {
  protected readonly destinos = DESTINOS;

  /** Só o que o app já faz hoje. Função nova entra aqui quando existir. */
  readonly itens = [
    'Veja os bares e as promoções antes de sair de casa',
    'Abra a comanda pelo celular ao chegar',
    'Peça sem ir ao balcão',
    'Acompanhe o pedido e o total da conta',
    'Pague só o que recebeu',
  ];
}
