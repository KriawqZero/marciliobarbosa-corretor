import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/metadata'

/// Robôs de buscadores com IA. Vale liberar explicitamente: hoje uma parte das
/// buscas por "corretor em Corumbá" acontece dentro de assistentes, e a resposta
/// deles só cita quem o robô conseguiu ler.
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Bingbot',
  'DuckDuckBot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        /// A API é superfície de dados, não de leitura: indexá-la geraria
        /// resultados em JSON competindo com as páginas reais do imóvel.
        /// `/_next/static` fica liberado — bloquear CSS/JS faz o Google
        /// renderizar a página quebrada e avaliar mal a experiência móvel.
        disallow: ['/api/'],
      },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: ['/api/'],
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
