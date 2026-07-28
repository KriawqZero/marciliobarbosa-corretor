import { revalidatePath } from 'next/cache'
import { pingIndexNow } from './indexnow'

/// Rotas que mostram catálogo e por isso mudam sempre que um imóvel muda.
const CATALOG_PATHS = ['/', '/imoveis']

/// Chamado depois de criar, editar ou remover um imóvel.
///
/// Faz duas coisas que são a mesma preocupação vista de dois lados: limpa o
/// cache das páginas afetadas (para o visitante ver o imóvel novo agora) e
/// notifica o IndexNow (para o buscador vir buscar em vez de esperar o próximo
/// rastreamento). Sem a primeira parte, um imóvel cadastrado hoje podia
/// demorar para aparecer no site; sem a segunda, demorava para aparecer na
/// busca.
export async function revalidatePropertyRoutes(slugs: string[] = []) {
  const paths = [...CATALOG_PATHS]

  for (const path of CATALOG_PATHS) revalidatePath(path)

  /// As páginas de categoria são dinâmicas por parâmetro; revalidar o layout da
  /// rota inteira derruba o cache de todas as categorias de uma vez.
  revalidatePath('/imoveis/[categoria]', 'page')

  for (const slug of slugs) {
    if (!slug) continue
    const path = `/imovel/${slug}`
    revalidatePath(path)
    paths.push(path)
  }

  return pingIndexNow(paths)
}
