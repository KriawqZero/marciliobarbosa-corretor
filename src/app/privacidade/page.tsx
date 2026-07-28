import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/layout/container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import {
  BROKER_CRECI,
  BROKER_EMAIL,
  BROKER_NAME,
  BROKER_PHONE_DISPLAY,
} from '@/lib/constants'
import { buildMetadata } from '@/lib/metadata'

export const metadata: Metadata = buildMetadata({
  path: '/privacidade',
  title: { absolute: `Política de Privacidade — ${BROKER_NAME}` },
  description: `Como ${BROKER_NAME} coleta, usa e guarda os dados de quem entra em contato pelo site, pelo WhatsApp ou pelo telefone, conforme a LGPD.`,
  alternates: { canonical: '/privacidade' },
})

/// Página institucional exigida antes de o formulário de contato entrar no ar.
///
/// Coletar nome, telefone e mensagem é tratamento de dado pessoal: a LGPD pede
/// que a finalidade, a base legal e o canal de exercício de direitos estejam
/// declarados antes da coleta, não depois. O texto descreve exatamente o que o
/// site faz hoje — nada de cláusula genérica sobre prática que não existe aqui.
export default function PrivacidadePage() {
  return (
    <section className="py-8 lg:py-12">
      <Container>
        <Breadcrumbs items={[{ label: 'Política de Privacidade' }]} />

        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-bold text-cinza-900 sm:text-3xl">
            Política de Privacidade
          </h1>
          <p className="mt-2 text-sm text-cinza-600">
            Última atualização: 28 de julho de 2026
          </p>

          <div className="mt-8 space-y-8 leading-relaxed text-cinza-600">
            <div>
              <h2 className="mb-3 text-xl font-bold text-cinza-900">
                Quem trata os seus dados
              </h2>
              <p>
                {BROKER_NAME}, corretor de imóveis inscrito no {BROKER_CRECI},
                atuando em Corumbá-MS e Ladário-MS. É ele quem decide como os
                dados enviados por este site são usados — o que a LGPD chama de{' '}
                <strong className="text-cinza-900">controlador</strong>.
              </p>
              <p className="mt-3">
                Contato para qualquer assunto desta página:{' '}
                <a
                  className="font-medium text-azul-escuro underline underline-offset-4"
                  href={`mailto:${BROKER_EMAIL}`}
                >
                  {BROKER_EMAIL}
                </a>{' '}
                ou {BROKER_PHONE_DISPLAY}.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-cinza-900">
                Quais dados são coletados
              </h2>
              <p>
                Somente os que você mesmo digita ou envia ao entrar em contato:
              </p>
              <ul className="mt-3 space-y-2 pl-5">
                <li className="list-disc">
                  <strong className="text-cinza-900">Nome, telefone e mensagem</strong>,
                  quando você preenche o formulário da página de contato.
                </li>
                <li className="list-disc">
                  <strong className="text-cinza-900">Número de WhatsApp e conteúdo da conversa</strong>,
                  quando você clica em um dos botões de WhatsApp. Essa conversa
                  acontece dentro do WhatsApp e segue também as regras dele.
                </li>
                <li className="list-disc">
                  <strong className="text-cinza-900">Qual imóvel motivou o contato</strong>,
                  quando o botão parte de um anúncio específico.
                </li>
              </ul>
              <p className="mt-3">
                O site{' '}
                <strong className="text-cinza-900">
                  não usa cookies de rastreamento, não tem pixel de rede social
                  e não faz perfil de navegação
                </strong>
                . Navegar pelo catálogo sem entrar em contato não gera nenhum
                registro pessoal.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-cinza-900">
                Para que servem
              </h2>
              <p>
                Exclusivamente para responder você e conduzir a negociação do
                imóvel: retornar o contato, enviar opções que combinem com o que
                você procura, agendar visita e acompanhar a documentação.
              </p>
              <p className="mt-3">
                Seus dados{' '}
                <strong className="text-cinza-900">
                  não são vendidos, alugados nem repassados para lista de
                  terceiros
                </strong>
                . São compartilhados apenas quando a própria negociação exige —
                com o proprietário do imóvel, com o banco em caso de
                financiamento, ou com o cartório na lavratura — e sempre no
                mínimo necessário.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-cinza-900">
                Com que base legal
              </h2>
              <p>
                O tratamento se apoia no artigo 7º da Lei 13.709/2018 (LGPD):
              </p>
              <ul className="mt-3 space-y-2 pl-5">
                <li className="list-disc">
                  <strong className="text-cinza-900">Inciso V</strong> — execução
                  de contrato ou de procedimentos preliminares a pedido do
                  titular. É o caso de quem procura o corretor para comprar,
                  vender ou alugar.
                </li>
                <li className="list-disc">
                  <strong className="text-cinza-900">Inciso I</strong> —
                  consentimento, quando você envia uma mensagem apenas para
                  receber informação, sem negociação em curso.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-cinza-900">
                Por quanto tempo ficam guardados
              </h2>
              <ul className="mt-3 space-y-2 pl-5">
                <li className="list-disc">
                  Contato que não virou negociação:{' '}
                  <strong className="text-cinza-900">até 12 meses</strong>, e
                  então é apagado.
                </li>
                <li className="list-disc">
                  Negociação concluída:{' '}
                  <strong className="text-cinza-900">5 anos</strong>, prazo em
                  que a documentação da transação pode ser exigida.
                </li>
                <li className="list-disc">
                  A qualquer momento você pode pedir a exclusão antes desses
                  prazos, salvo o que a lei obrigue a manter.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-cinza-900">
                Seus direitos
              </h2>
              <p>
                O artigo 18 da LGPD garante que você peça, a qualquer momento e
                sem custo: confirmação de que existe tratamento, acesso aos
                dados, correção do que estiver errado, anonimização ou exclusão,
                portabilidade, informação sobre com quem foram compartilhados, e
                revogação do consentimento.
              </p>
              <p className="mt-3">
                Basta escrever para{' '}
                <a
                  className="font-medium text-azul-escuro underline underline-offset-4"
                  href={`mailto:${BROKER_EMAIL}`}
                >
                  {BROKER_EMAIL}
                </a>
                . O prazo de resposta é de até 15 dias.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-cinza-900">
                Segurança e serviços de terceiros
              </h2>
              <p>
                O site trafega inteiramente em HTTPS e os dados ficam em
                servidor de acesso restrito ao corretor. Dois serviços externos
                participam da operação: a{' '}
                <strong className="text-cinza-900">hospedagem</strong>, que
                mantém o site e o banco de dados no ar, e o{' '}
                <strong className="text-cinza-900">WhatsApp</strong>, quando a
                conversa acontece por lá.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-cinza-900">
                Mudanças nesta política
              </h2>
              <p>
                Se algo aqui mudar, a data no topo da página é atualizada.
                Alteração que afete de forma relevante o uso dos seus dados será
                avisada pelo canal em que você entrou em contato.
              </p>
            </div>

            <div className="rounded-xl border border-cinza-200 bg-cinza-50 p-6">
              <p className="text-sm">
                Dúvida sobre esta política ou sobre os seus dados?{' '}
                <Link
                  href="/contato"
                  className="font-semibold text-azul-escuro underline underline-offset-4"
                >
                  Fale comigo
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
