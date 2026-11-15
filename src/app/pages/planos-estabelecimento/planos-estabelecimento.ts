import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONTATO } from '../../config/contato';
import { Revela } from '../../shared/revela';

interface PlanoBar {
  nome: string;
  /** Etiqueta em destaque no topo do cartão. Só o plano principal tem. */
  selo?: string;
  gratis: string;
  preco: string;
  resumo: string;
  cta: string;
}

@Component({
  selector: 'app-planos-estabelecimento',
  imports: [RouterLink, Revela],
  templateUrl: './planos-estabelecimento.html',
  styleUrl: './planos-estabelecimento.scss',
})
export class PlanosEstabelecimento {
  protected readonly contato = CONTATO;

  /** Valores do plano de venda de nov/2026. Os dois planos têm o mesmo sistema. */
  readonly planos: PlanoBar[] = [
    {
      nome: 'Fundador',
      selo: '10 primeiros bares',
      gratis: '60 dias grátis',
      preco: 'R$ 149',
      resumo:
        'Travado por 12 meses. A gente monta o seu cardápio e fica com você na primeira noite.',
      cta: 'Quero ser bar fundador',
    },
    {
      nome: 'Salão',
      gratis: '30 dias grátis',
      preco: 'R$ 299',
      resumo: 'O mesmo sistema completo, do 11º bar em diante.',
      cta: 'Falar com a equipe',
    },
  ];

  /** Só o que o sistema já faz hoje. Função nova entra aqui quando existir. */
  readonly itens = [
    'Comandas sem limite',
    'Tela de pedidos para bar e cozinha',
    'Cardápio que você mesmo edita',
    'Movimento da noite com alertas',
    'Resultados por período',
    'Equipe por convite',
    'Promoções e perfil do bar',
  ];

  readonly perguntas = [
    {
      p: 'Tem taxa por pedido ou por cliente?',
      r: 'Não. É um valor fixo por mês, com 10 ou com 1.000 comandas.',
    },
    {
      p: 'Preciso comprar equipamento?',
      r: 'Não. Funciona no celular da equipe e do cliente.',
    },
    {
      p: 'E se eu não gostar?',
      r: 'Cancela quando quiser, sem multa. No período grátis você não paga nada.',
    },
    {
      p: 'O dinheiro das vendas passa por vocês?',
      r: 'Não. O cliente paga no caixa do bar, como hoje.',
    },
    {
      p: 'Meu cliente paga alguma coisa?',
      r: 'Nunca.',
    },
  ];
}
