---
name: Plano Frontend Imobiliária
overview: Planejamento completo do frontend público de um site imobiliário local para Marcilio Barbosa, corretor em Corumbá-MS e Ladário-MS, usando Next.js 16.2 App Router com SSR, preparado para integração futura com backend interno.
todos:
  - id: fase-1
    content: "Fase 1: Fundacao do projeto (config, tipos, mocks, services, layout raiz)"
    status: completed
  - id: fase-2
    content: "Fase 2: Layout base (Header, Footer, Container, Button, Badge, WhatsApp flutuante)"
    status: completed
  - id: fase-3
    content: "Fase 3: Home page completa (Hero, categorias, destaques, oportunidades, CTA)"
    status: completed
  - id: fase-4
    content: "Fase 4: Listagem de imoveis (grid, filtros, busca, categorias, empty state)"
    status: completed
  - id: fase-5
    content: "Fase 5: Pagina de detalhe do imovel (galeria, features, contato sticky, relacionados)"
    status: completed
  - id: fase-6
    content: "Fase 6: Paginas institucionais (Sobre, Contato, 404)"
    status: completed
  - id: fase-7
    content: "Fase 7: SEO e metadata (generateMetadata, JSON-LD, sitemap, robots, Open Graph)"
    status: completed
  - id: fase-8
    content: "Fase 8: Refinamento (responsividade, acessibilidade, performance, polish)"
    status: completed
isProject: false
---

# Plano Arquitetural — Site Marcilio Barbosa Corretor de Imóveis

---

## 1. Visao Geral da Arquitetura

### Stack Confirmada

- **Next.js 16.2** com App Router (Turbopack por padrao)
- **React 19.2** com Server Components como padrao
- **TypeScript 5** (strict mode)
- **Tailwind CSS 4** via PostCSS
- **pnpm** como gerenciador de pacotes

### Principios Arquiteturais

1. **Server Components por padrao** — toda pagina e componente e Server Component a menos que precise de interatividade no cliente
2. **Client Components somente quando necessario** — galeria de fotos com swipe, filtros interativos, menu mobile toggle, scroll-to-top
3. **Camada de dados isolada** — o frontend nunca acessa dados diretamente; sempre passa por uma camada `services/` que hoje le mocks e amanha le banco/API interna
4. **Tipagem centralizada** — todas as interfaces vivem em `types/`, compartilhadas entre frontend e futuro backend
5. **Sem dependencia de estado global** — nao usar Redux/Zustand; usar searchParams para filtros e server components para dados

### Estrategia de Integracao Futura

```
Frontend (pages) → services/ → mocks/     (FASE ATUAL)
Frontend (pages) → services/ → db/actions  (FASE FUTURA)
```

A camada `services/` funciona como contrato. Cada funcao retorna tipos bem definidos. Quando o backend for implementado, basta trocar a implementacao interna dos services sem tocar nos componentes.

### Quando usar Server vs Client Components


| Cenario                       | Tipo             |
| ----------------------------- | ---------------- |
| Listagem de imoveis           | Server Component |
| Detalhe do imovel             | Server Component |
| Header (versao desktop)       | Server Component |
| Footer                        | Server Component |
| Metadata/SEO                  | Server Component |
| Cards de imovel               | Server Component |
| Menu mobile (toggle)          | Client Component |
| Galeria de fotos (swipe/zoom) | Client Component |
| Filtros interativos           | Client Component |
| Botao WhatsApp sticky         | Client Component |
| Scroll-to-top                 | Client Component |
| Search bar com debounce       | Client Component |
| Botoes de compartilhar social | Client Component |


---

## 2. Mapa de Paginas

### Paginas Principais


| Rota                   | Pagina            | Objetivo                          | Conteudo Principal                                                                        |
| ---------------------- | ----------------- | --------------------------------- | ----------------------------------------------------------------------------------------- |
| `/`                    | Home              | Porta de entrada, vitrine         | Hero, busca, destaques, categorias, CTA                                                   |
| `/imoveis`             | Todos os Imoveis  | Listagem completa com filtros     | Grid de cards, filtros, ordenacao                                                         |
| `/imoveis/[categoria]` | Listagem Filtrada | Pagina por categoria              | Listagem filtrada por venda/aluguel/casas/terrenos/apartamentos/comercial/corumba/ladario |
| `/imovel/[slug]`       | Detalhe do Imovel | Apresentacao completa de 1 imovel | Galeria, dados, descricao, CTA, relacionados                                              |
| `/sobre`               | Institucional     | Quem e o corretor, confianca      | Texto, foto, valores, historia regional                                                   |
| `/contato`             | Contato           | Canal direto                      | WhatsApp, telefone, email, formulario simples                                             |


### Categorias aceitas em `/imoveis/[categoria]`

- `venda` — imoveis a venda
- `aluguel` — imoveis para alugar
- `casas` — somente casas
- `terrenos` — somente terrenos
- `apartamentos` — somente apartamentos
- `comercial` — comercios e oportunidades especiais
- `rural` — areas rurais
- `corumba` — imoveis em Corumba
- `ladario` — imoveis em Ladario
- `oportunidades` — imoveis com flag de oportunidade especial

### Paginas Auxiliares (v1 ou v2)


| Rota                                           | Objetivo                            |
| ---------------------------------------------- | ----------------------------------- |
| `/imoveis/[categoria]` com `corumba`/`ladario` | SEO local por cidade                |
| `/404`                                         | Pagina nao encontrada personalizada |


---

## 3. Taxonomia e Modelo de Conteudo

### Interface Principal — `Property`

```typescript
interface Property {
  id: string
  slug: string
  title: string
  purpose: 'venda' | 'aluguel'
  type: 'casa' | 'apartamento' | 'terreno' | 'rural' | 'comercial'
  city: 'Corumbá' | 'Ladário'
  citySlug: 'corumba' | 'ladario'
  neighborhood: string
  price: number
  priceSuffix?: string         // '/mês' para aluguel
  priceNote?: string           // 'Aceita financiamento', 'Consulte'
  shortDescription: string
  longDescription: string
  bedrooms?: number | null
  bathrooms?: number | null
  parkingSpaces?: number | null
  totalArea: number            // m² total do terreno/area
  builtArea?: number | null    // m² construidos
  coverImage: string
  gallery: PropertyImage[]
  featured: boolean
  specialOpportunity: boolean
  tags: string[]
  status: 'disponivel' | 'reservado' | 'vendido' | 'alugado'
  whatsappMessage: string      // mensagem pre-pronta
  createdAt: string
  updatedAt: string
}

interface PropertyImage {
  src: string
  alt: string
  width: number
  height: number
}

type PropertyPurpose = Property['purpose']
type PropertyType = Property['type']
type PropertyCity = Property['city']
type PropertyStatus = Property['status']
```

### Tipos auxiliares

```typescript
interface PropertyFilter {
  purpose?: PropertyPurpose
  type?: PropertyType
  citySlug?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  featured?: boolean
  specialOpportunity?: boolean
  status?: PropertyStatus
}

interface CategoryMeta {
  slug: string
  title: string
  description: string
  filter: PropertyFilter
}
```

### Mapeamento de categorias

```typescript
const CATEGORIES: Record<string, CategoryMeta> = {
  venda: {
    slug: 'venda',
    title: 'Imóveis à Venda',
    description: 'Casas, terrenos e apartamentos à venda em Corumbá e Ladário',
    filter: { purpose: 'venda' }
  },
  aluguel: {
    slug: 'aluguel',
    title: 'Imóveis para Alugar',
    description: 'Imóveis disponíveis para aluguel em Corumbá e Ladário',
    filter: { purpose: 'aluguel' }
  },
  casas: {
    slug: 'casas',
    title: 'Casas',
    description: 'Casas disponíveis em Corumbá e Ladário',
    filter: { type: 'casa' }
  },
  terrenos: {
    slug: 'terrenos',
    title: 'Terrenos',
    description: 'Terrenos à venda em Corumbá e Ladário',
    filter: { type: 'terreno' }
  },
  apartamentos: {
    slug: 'apartamentos',
    title: 'Apartamentos',
    description: 'Apartamentos disponíveis em Corumbá e Ladário',
    filter: { type: 'apartamento' }
  },
  comercial: {
    slug: 'comercial',
    title: 'Imóveis Comerciais',
    description: 'Pontos comerciais e oportunidades de negócio',
    filter: { type: 'comercial' }
  },
  rural: {
    slug: 'rural',
    title: 'Áreas Rurais',
    description: 'Chácaras, sítios e áreas rurais na região',
    filter: { type: 'rural' }
  },
  corumba: {
    slug: 'corumba',
    title: 'Imóveis em Corumbá',
    description: 'Todos os imóveis disponíveis em Corumbá-MS',
    filter: { citySlug: 'corumba' }
  },
  ladario: {
    slug: 'ladario',
    title: 'Imóveis em Ladário',
    description: 'Todos os imóveis disponíveis em Ladário-MS',
    filter: { citySlug: 'ladario' }
  },
  oportunidades: {
    slug: 'oportunidades',
    title: 'Oportunidades Especiais',
    description: 'Oportunidades únicas de negócio na região',
    filter: { specialOpportunity: true }
  }
}
```

---

## 4. Estrategia de Roteamento

### Estrutura de Rotas no App Router

```
app/
  page.tsx                        → /
  imoveis/
    page.tsx                      → /imoveis
    [categoria]/
      page.tsx                    → /imoveis/venda, /imoveis/casas, etc.
  imovel/
    [slug]/
      page.tsx                    → /imovel/casa-3-quartos-centro-corumba
  sobre/
    page.tsx                      → /sobre
  contato/
    page.tsx                      → /contato
  not-found.tsx                   → 404 personalizado
  layout.tsx                      → Layout raiz
```

### Justificativa

- `**/imoveis` e `/imoveis/[categoria]**`: URL plana e limpa. A categoria e um segmento unico que serve tanto para tipo (casas, terrenos) quanto para finalidade (venda, aluguel) e cidade (corumba, ladario). Evita rotas profundas demais como `/imoveis/venda/casas/corumba` que sao ruins para UX e SEO.
- `**/imovel/[slug]**` (singular): diferencia claramente a pagina de detalhe da listagem. O slug contem informacoes uteis para SEO, ex: `casa-3-quartos-centro-corumba`.
- **Filtros adicionais via `searchParams`**: dentro de `/imoveis` e `/imoveis/[categoria]`, refinamentos extras (faixa de preco, quartos) sao feitos via query params: `/imoveis/venda?quartos=3&preco_max=400000`.
- **Sem aninhamento de filtros na URL**: evita explosao combinatoria de rotas e simplifica o roteamento.
- **Validacao de categoria**: o `[categoria]` valida contra a lista de categorias conhecidas. Categoria invalida retorna `notFound()`.

### Geracao de Slugs

Padrao: `{tipo}-{bedrooms}quartos-{bairro-slug}-{cidade-slug}`
Exemplos:

- `casa-3-quartos-centro-corumba`
- `terreno-360m2-nova-corumba`
- `apartamento-2-quartos-cristo-redentor-corumba`
- `ponto-comercial-centro-corumba`

---

## 5. SEO e Conteudo Server-Side

### Metadata Dinamica por Pagina

Cada pagina exporta `generateMetadata()` (async, conforme Next.js 16):

- **Home**: titulo geral, descricao com cidades, Open Graph com imagem de capa
- **Listagem `/imoveis`**: "Imóveis em Corumbá e Ladário | Marcilio Barbosa"
- **Categoria `/imoveis/[categoria]`**: titulo dinamico baseado na categoria, descricao especifica
- **Detalhe `/imovel/[slug]`**: titulo do imovel, preco, cidade, imagem de capa como og:image
- **Sobre**: "Sobre Marcilio Barbosa | Corretor de Imóveis"
- **Contato**: "Entre em Contato | Marcilio Barbosa Imóveis"

### Structured Data (JSON-LD)

- **Home**: `RealEstateAgent` schema com dados do corretor
- **Detalhe do imovel**: `RealEstateListing` schema com preco, endereco, fotos
- **Paginas de cidade**: `LocalBusiness` com area de atuacao

### Open Graph e Rich Previews Sociais

Cada pagina gera tags OG completas para previews ricos em WhatsApp, Facebook, Twitter/X e outras redes:

- `og:title` — titulo do imovel + preco formatado (ex: "Casa 3 quartos no Centro | R$ 380.000")
- `og:description` — `shortDescription` do imovel
- `og:image` — `coverImage` do imovel (1200x630 ideal; crop automatico se necessario)
- `og:image:width` e `og:image:height` — dimensoes explicitas para pre-render correto
- `og:image:alt` — descricao textual da imagem
- `og:url` — URL canonica absoluta do imovel
- `og:type` — `website` para paginas gerais, `article` para imovel individual
- `og:site_name` — "Marcilio Barbosa Imóveis"
- `og:locale` — `pt_BR`

**Twitter Card tags**:

- `twitter:card` — `summary_large_image` (para mostrar imagem grande)
- `twitter:title`, `twitter:description`, `twitter:image` — espelhando OG

**Resultado no WhatsApp**: quando alguem envia o link de um imovel no WhatsApp, o preview mostra automaticamente a foto de capa, o titulo com preco e a descricao curta. Isso e crucial para a conversao, ja que a maioria dos compartilhamentos entre interessados acontece via WhatsApp.

**URL base para OG**: configurar `NEXT_PUBLIC_SITE_URL` em `.env` (ex: `https://marciliobarbosa.com.br`) para gerar URLs absolutas. Em dev, usar `http://localhost:3000`.

### SEO Local

- Tags `geo.region`, `geo.placename` para Corumba-MS e Ladario-MS
- Paginas de cidade como landing pages SEO (`/imoveis/corumba`, `/imoveis/ladario`)
- Descricoes que mencionam bairros e cidades explicitamente
- `lang="pt-BR"` no HTML

### Sitemap e robots.txt

- Gerar `sitemap.xml` dinamico via `app/sitemap.ts` listando todas as paginas e imoveis
- `robots.txt` via `app/robots.ts`

### Performance

- Server Components eliminam JS desnecessario no cliente
- Imagens com `next/image` e `priority` para above-the-fold
- `loading.tsx` em rotas principais para streaming SSR

---

## 6. Design System Leve

### Paleta de Cores

```
--azul-escuro:    #1B3A5C    → cor primaria (confianca, seriedade)
--azul-medio:     #2C5F8A    → hover, links
--dourado:        #C9973B    → destaques, badges "oportunidade"
--dourado-claro:  #F5E6C8    → fundo de badges
--verde:          #2D6A4F    → status "disponivel"
--vermelho:       #B91C1C    → status "vendido/reservado"
--cinza-900:      #1A1A1A    → texto principal
--cinza-600:      #6B7280    → texto secundario
--cinza-200:      #E5E7EB    → bordas
--cinza-50:       #F9FAFB    → fundo alternado
--branco:         #FFFFFF    → fundo principal
```

### Tipografia

- **Familia**: Inter (via Google Fonts ou next/font)
- **Headings**: Inter 600/700, tracking tight
- **Body**: Inter 400, 16px base
- **Small/captions**: Inter 400, 14px
- **Preco**: Inter 700, tamanho destacado

### Espacamento

- Escala Tailwind padrao: 4, 6, 8, 12, 16, 20, 24
- Secoes da home: `py-16` mobile, `py-24` desktop
- Gap entre cards: `gap-6`
- Padding de container: `px-4` mobile, `px-6` tablet, `max-w-7xl mx-auto` desktop

### Cards de Imovel

- Foto de capa (aspect-ratio 4/3)
- Badge de finalidade (venda/aluguel) no canto superior
- Titulo truncado em 2 linhas
- Preco em destaque
- Icones discretos para quartos/banheiros/area
- Cidade + bairro em texto secundario
- Hover com leve elevacao de sombra

### Botoes

- **Primario**: fundo azul-escuro, texto branco, rounded-lg
- **WhatsApp**: fundo verde (#25D366), icone + texto
- **Secundario/outline**: borda azul, texto azul
- **Ghost**: sem borda, texto azul, hover com fundo

### Header

- Logo/nome a esquerda
- Navegacao simples: Inicio, Imoveis, Venda, Aluguel, Sobre, Contato
- Botao WhatsApp no canto direito (desktop)
- Menu hamburger no mobile
- Fundo branco com sombra sutil, sticky no topo

### Rodape

- Logo, nome do corretor
- Links rapidos
- Contato (telefone, WhatsApp, email)
- Cidades atendidas
- CRECI (se aplicavel)
- Fundo azul-escuro, texto claro

### Banners/Hero

- Imagem de fundo ou gradiente sobre azul-escuro
- Titulo grande e direto
- Subtitulo curto
- Campo de busca integrado ou CTA

---

## 7. Componentizacao

### Layout


| Componente    | Tipo                          | Responsabilidade                        |
| ------------- | ----------------------------- | --------------------------------------- |
| `Header`      | Server + Client (menu mobile) | Navegacao principal, logo, CTA WhatsApp |
| `MobileMenu`  | Client                        | Toggle do menu mobile                   |
| `Footer`      | Server                        | Links, contato, creditos                |
| `Container`   | Server                        | Wrapper de largura maxima               |
| `Breadcrumbs` | Server                        | Navegacao hierarquica                   |


### Imovel


| Componente            | Tipo   | Responsabilidade                               |
| --------------------- | ------ | ---------------------------------------------- |
| `PropertyCard`        | Server | Card de imovel na listagem                     |
| `PropertyGrid`        | Server | Grid responsivo de PropertyCards               |
| `PropertyGallery`     | Client | Galeria de fotos com navegacao/zoom            |
| `PropertyHero`        | Server | Secao principal do detalhe                     |
| `PropertyFeatures`    | Server | Lista de caracteristicas (quartos, area, etc.) |
| `PropertyDescription` | Server | Descricao longa do imovel                      |
| `PropertyBadge`       | Server | Badge de venda/aluguel/destaque                |
| `PropertyPrice`       | Server | Exibicao formatada do preco                    |
| `PropertyStatus`      | Server | Badge de status (disponivel/vendido)           |
| `RelatedProperties`   | Server | Imoveis semelhantes                            |


### Busca e Filtros


| Componente    | Tipo   | Responsabilidade                             |
| ------------- | ------ | -------------------------------------------- |
| `SearchBar`   | Client | Campo de busca com sugestoes                 |
| `FilterBar`   | Client | Filtros por tipo, finalidade, preco, quartos |
| `FilterChips` | Client | Tags de filtros ativos                       |
| `SortSelect`  | Client | Ordenacao (preco, mais recentes)             |


### Conversao


| Componente           | Tipo          | Responsabilidade                                            |
| -------------------- | ------------- | ----------------------------------------------------------- |
| `WhatsAppCTA`        | Client        | Botao flutuante de WhatsApp                                 |
| `WhatsAppButton`     | Server        | Botao inline com link direto                                |
| `ContactSection`     | Server        | Bloco de contato com telefone/WhatsApp/email                |
| `PropertyContactBox` | Server/Client | Box lateral fixo no detalhe com CTA                         |
| `ShareButtons`       | Client        | Botoes de compartilhar (WhatsApp, Facebook, X, copiar link) |


### Secoes da Home


| Componente             | Tipo   | Responsabilidade                            |
| ---------------------- | ------ | ------------------------------------------- |
| `HeroSection`          | Server | Banner principal com busca                  |
| `FeaturedProperties`   | Server | Carrossel/grid de destaques                 |
| `CategoryCards`        | Server | Cards de categorias (casas, terrenos, etc.) |
| `CitySection`          | Server | Bloco com cidades atendidas                 |
| `SpecialOpportunities` | Server | Bloco de oportunidades especiais            |
| `InstitutionalSection` | Server | Sobre o corretor resumido                   |
| `CTASection`           | Server | Chamada final para contato                  |


### UI Genericos


| Componente          | Tipo   | Responsabilidade                        |
| ------------------- | ------ | --------------------------------------- |
| `Button`            | Server | Botao reutilizavel com variantes        |
| `Badge`             | Server | Badge/tag generica                      |
| `EmptyState`        | Server | Estado vazio (nenhum imovel encontrado) |
| `LoadingSkeleton`   | Server | Skeleton para loading.tsx               |
| `ErrorBoundary`     | Client | Tratamento de erros de renderizacao     |
| `ImageWithFallback` | Client | Imagem com placeholder em caso de erro  |
| `SectionHeading`    | Server | Titulo de secao padronizado             |
| `IconFeature`       | Server | Icone + valor (ex: 3 quartos)           |


---

## 8. Estrategia de Dados

### Arquitetura da Camada de Dados

```
Componente (Server) → service function → data source
                                          ├── mocks (agora)
                                          └── db/api (futuro)
```

### Camada de Services (`src/data/services/`)

```typescript
// src/data/services/properties.ts

export async function getProperties(filter?: PropertyFilter): Promise<Property[]>
export async function getPropertyBySlug(slug: string): Promise<Property | null>
export async function getFeaturedProperties(): Promise<Property[]>
export async function getSpecialOpportunities(): Promise<Property[]>
export async function getRelatedProperties(property: Property, limit?: number): Promise<Property[]>
export async function getPropertyCategories(): Promise<CategoryMeta[]>
```

Hoje essas funcoes importam de `src/data/mocks/properties.ts` e filtram em memoria. Quando o backend for implementado, basta trocar a importacao interna para queries reais. A assinatura publica nao muda.

### Camada de Mocks (`src/data/mocks/`)

- `properties.ts` — array de Property com dados realistas, usando URLs reais do Unsplash como imagens mock (nao precisa baixar nada, funciona direto)

### Tipagens Compartilhadas (`src/types/`)

- `property.ts` — interfaces Property, PropertyFilter, CategoryMeta
- `index.ts` — re-exports

### Utilitarios (`src/lib/`)

- `format.ts` — formatacao de preco (`R$ 380.000`), area (`360 m²`)
- `utils.ts` — geracao de slug, validacao de categoria
- `whatsapp.ts` — geracao de links WhatsApp com mensagem
- `constants.ts` — telefone, CRECI, nome, redes sociais

### Fallbacks e Estados

- **Imagem ausente**: componente `ImageWithFallback` mostra placeholder generico de imovel
- **Estado vazio**: componente `EmptyState` com mensagem amigavel e CTA para WhatsApp
- **Erro de carregamento**: `error.tsx` por rota com mensagem e retry
- **Loading**: `loading.tsx` por rota com skeletons

### Migracao futura

A troca de mocks para backend real sera:

1. Implementar a camada de banco em `src/data/db/` ou `src/data/repositories/`
2. Alterar as funcoes em `src/data/services/` para chamar o banco em vez dos mocks
3. Nenhuma alteracao nos componentes ou pages

---

## 9. Mock de Dados

### Imovel 1 — Casa a venda em Corumba

```typescript
{
  id: '1',
  slug: 'casa-3-quartos-centro-corumba',
  title: 'Casa espaçosa com 3 quartos no Centro',
  purpose: 'venda',
  type: 'casa',
  city: 'Corumbá',
  citySlug: 'corumba',
  neighborhood: 'Centro',
  price: 380000,
  priceSuffix: undefined,
  priceNote: 'Aceita financiamento',
  shortDescription: 'Casa bem localizada no Centro de Corumbá, com 3 quartos, quintal amplo e garagem para 2 carros.',
  longDescription: 'Excelente casa no coração de Corumbá, próxima a comércios, escolas e serviços. Possui 3 quartos sendo 1 suíte, sala ampla, cozinha planejada, área de serviço coberta, quintal com churrasqueira e garagem para 2 veículos. Imóvel bem conservado, pronto para morar. Documentação em dia. Aceita financiamento bancário.',
  bedrooms: 3,
  bathrooms: 2,
  parkingSpaces: 2,
  totalArea: 300,
  builtArea: 180,
  coverImage: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&h=800&fit=crop&q=80',
  gallery: [
    { src: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&h=800&fit=crop&q=80', alt: 'Fachada da casa', width: 1200, height: 800 },
    { src: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=800&fit=crop&q=80', alt: 'Sala de estar', width: 1200, height: 800 },
    { src: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=800&fit=crop&q=80', alt: 'Cozinha planejada', width: 1200, height: 800 },
    { src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop&q=80', alt: 'Quintal com churrasqueira', width: 1200, height: 800 },
  ],
  featured: true,
  specialOpportunity: false,
  tags: ['financiamento', 'quintal', 'churrasqueira', 'suíte'],
  status: 'disponivel',
  whatsappMessage: 'Olá! Tenho interesse na casa de 3 quartos no Centro de Corumbá (Ref: 1). Podemos conversar?',
  createdAt: '2025-11-15',
  updatedAt: '2026-01-20',
}
```

### Imovel 2 — Casa para aluguel em Ladario

```typescript
{
  id: '2',
  slug: 'casa-2-quartos-popular-ladario-aluguel',
  title: 'Casa 2 quartos para alugar no Popular',
  purpose: 'aluguel',
  type: 'casa',
  city: 'Ladário',
  citySlug: 'ladario',
  neighborhood: 'Popular',
  price: 1200,
  priceSuffix: '/mês',
  priceNote: undefined,
  shortDescription: 'Casa simples e bem cuidada com 2 quartos em Ladário, ideal para família pequena.',
  longDescription: 'Casa para aluguel no bairro Popular em Ladário. Possui 2 quartos, sala, cozinha, banheiro e área de serviço. Imóvel em bom estado, rua tranquila, próximo a ponto de ônibus e mercados. Sem vaga de garagem coberta, mas com espaço frontal. Valor de aluguel R$ 1.200/mês. Sem fiador — aceita seguro fiança ou depósito caução.',
  bedrooms: 2,
  bathrooms: 1,
  parkingSpaces: 0,
  totalArea: 150,
  builtArea: 80,
  coverImage: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&h=800&fit=crop&q=80',
  gallery: [
    { src: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&h=800&fit=crop&q=80', alt: 'Fachada da casa', width: 1200, height: 800 },
    { src: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop&q=80', alt: 'Sala', width: 1200, height: 800 },
    { src: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&h=800&fit=crop&q=80', alt: 'Quarto principal', width: 1200, height: 800 },
  ],
  featured: false,
  specialOpportunity: false,
  tags: ['aluguel', 'sem fiador', 'família'],
  status: 'disponivel',
  whatsappMessage: 'Olá! Tenho interesse na casa para alugar no bairro Popular em Ladário (Ref: 2). Podemos conversar?',
  createdAt: '2026-01-10',
  updatedAt: '2026-02-05',
}
```

### Imovel 3 — Terreno a venda em Corumba

```typescript
{
  id: '3',
  slug: 'terreno-360m2-nova-corumba',
  title: 'Terreno 360m² no Nova Corumbá',
  purpose: 'venda',
  type: 'terreno',
  city: 'Corumbá',
  citySlug: 'corumba',
  neighborhood: 'Nova Corumbá',
  price: 95000,
  priceSuffix: undefined,
  priceNote: 'Aceita parcelamento direto',
  shortDescription: 'Terreno plano de 360m² em loteamento regularizado, pronto para construir.',
  longDescription: 'Terreno de 360m² (12x30) no loteamento Nova Corumbá, totalmente plano e pronto para construir. Loteamento com ruas abertas, água e energia disponíveis. Documentação regularizada. Ótima opção para quem quer construir a casa própria. Aceita parcelamento direto com o proprietário em até 24x. Região em crescimento com novos comércios e residências.',
  bedrooms: null,
  bathrooms: null,
  parkingSpaces: null,
  totalArea: 360,
  builtArea: null,
  coverImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop&q=80',
  gallery: [
    { src: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop&q=80', alt: 'Vista frontal do terreno', width: 1200, height: 800 },
    { src: 'https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=1200&h=800&fit=crop&q=80', alt: 'Vista lateral', width: 1200, height: 800 },
  ],
  featured: false,
  specialOpportunity: false,
  tags: ['terreno', 'plano', 'loteamento', 'parcelamento'],
  status: 'disponivel',
  whatsappMessage: 'Olá! Tenho interesse no terreno de 360m² no Nova Corumbá (Ref: 3). Podemos conversar?',
  createdAt: '2026-02-01',
  updatedAt: '2026-02-01',
}
```

### Imovel 4 — Apartamento em Corumba

```typescript
{
  id: '4',
  slug: 'apartamento-2-quartos-cristo-redentor-corumba',
  title: 'Apartamento 2 quartos no Cristo Redentor',
  purpose: 'venda',
  type: 'apartamento',
  city: 'Corumbá',
  citySlug: 'corumba',
  neighborhood: 'Cristo Redentor',
  price: 250000,
  priceSuffix: undefined,
  priceNote: 'Aceita financiamento pela Caixa',
  shortDescription: 'Apartamento no 2° andar com 2 quartos, varanda e vaga de garagem coberta.',
  longDescription: 'Apartamento bem localizado no bairro Cristo Redentor, 2° andar, com 2 quartos, sala com varanda, cozinha americana, banheiro social e área de serviço. Condomínio com portaria e vaga de garagem coberta. Próximo a supermercados e farmácias. Documentação pronta para financiamento pela Caixa Econômica. Condomínio de R$ 280/mês.',
  bedrooms: 2,
  bathrooms: 1,
  parkingSpaces: 1,
  totalArea: 65,
  builtArea: 58,
  coverImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=800&fit=crop&q=80',
  gallery: [
    { src: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=800&fit=crop&q=80', alt: 'Fachada do prédio', width: 1200, height: 800 },
    { src: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop&q=80', alt: 'Sala com varanda', width: 1200, height: 800 },
    { src: 'https://images.unsplash.com/photo-1484154218962-a197022541e9?w=1200&h=800&fit=crop&q=80', alt: 'Cozinha americana', width: 1200, height: 800 },
    { src: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&h=800&fit=crop&q=80', alt: 'Quarto principal', width: 1200, height: 800 },
  ],
  featured: true,
  specialOpportunity: false,
  tags: ['financiamento', 'varanda', 'garagem coberta', 'portaria'],
  status: 'disponivel',
  whatsappMessage: 'Olá! Tenho interesse no apartamento de 2 quartos no Cristo Redentor (Ref: 4). Podemos conversar?',
  createdAt: '2025-12-20',
  updatedAt: '2026-03-01',
}
```

### Imovel 5 — Ponto Comercial (Oportunidade Especial)

```typescript
{
  id: '5',
  slug: 'ponto-comercial-mercado-centro-corumba',
  title: 'Mercado completo em funcionamento no Centro',
  purpose: 'venda',
  type: 'comercial',
  city: 'Corumbá',
  citySlug: 'corumba',
  neighborhood: 'Centro',
  price: 750000,
  priceSuffix: undefined,
  priceNote: 'Inclui estoque e equipamentos',
  shortDescription: 'Mercado de bairro em pleno funcionamento, com clientela formada e estrutura completa.',
  longDescription: 'Oportunidade única: mercado de bairro no Centro de Corumbá, em funcionamento há mais de 15 anos, com clientela fiel e faturamento comprovado. Inclui imóvel próprio (terreno de 400m², área construída de 250m²), todos os equipamentos (freezers, gôndolas, balcões, caixa registradora), estoque inicial e ponto consolidado. Ideal para quem busca um negócio pronto para operar. Motivo da venda: aposentadoria do proprietário. Valor negociável para pagamento à vista.',
  bedrooms: null,
  bathrooms: 2,
  parkingSpaces: 3,
  totalArea: 400,
  builtArea: 250,
  coverImage: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200&h=800&fit=crop&q=80',
  gallery: [
    { src: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200&h=800&fit=crop&q=80', alt: 'Fachada do mercado', width: 1200, height: 800 },
    { src: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop&q=80', alt: 'Interior - área de vendas', width: 1200, height: 800 },
    { src: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=800&fit=crop&q=80', alt: 'Depósito', width: 1200, height: 800 },
    { src: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=1200&h=800&fit=crop&q=80', alt: 'Estacionamento', width: 1200, height: 800 },
  ],
  featured: true,
  specialOpportunity: true,
  tags: ['oportunidade', 'negócio pronto', 'ponto comercial', 'mercado'],
  status: 'disponivel',
  whatsappMessage: 'Olá! Tenho interesse no mercado à venda no Centro de Corumbá (Ref: 5). Gostaria de mais informações.',
  createdAt: '2026-01-05',
  updatedAt: '2026-03-10',
}
```

### Imovel 6 — Area Rural

```typescript
{
  id: '6',
  slug: 'area-rural-10-hectares-zona-rural-corumba',
  title: 'Área rural de 10 hectares com acesso por estrada',
  purpose: 'venda',
  type: 'rural',
  city: 'Corumbá',
  citySlug: 'corumba',
  neighborhood: 'Zona Rural - Estrada do Tamengo',
  price: 280000,
  priceSuffix: undefined,
  priceNote: 'Estuda propostas',
  shortDescription: 'Área rural de 10 hectares com pastagem formada e acesso por estrada cascalhada.',
  longDescription: 'Propriedade rural de 10 hectares (100.000 m²) localizada na região da Estrada do Tamengo, com acesso por estrada cascalhada em boas condições. Área com pastagem formada, cerca de arame, água de poço artesiano e energia elétrica disponível na divisa. Terreno levemente ondulado, sem alagamento. Ideal para pecuária de pequeno porte, chácara ou investimento. Documentação com georreferenciamento. Proprietário estuda propostas.',
  bedrooms: null,
  bathrooms: null,
  parkingSpaces: null,
  totalArea: 100000,
  builtArea: null,
  coverImage: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=1200&h=800&fit=crop&q=80',
  gallery: [
    { src: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=1200&h=800&fit=crop&q=80', alt: 'Vista geral da área', width: 1200, height: 800 },
    { src: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=800&fit=crop&q=80', alt: 'Pastagem formada', width: 1200, height: 800 },
  ],
  featured: false,
  specialOpportunity: false,
  tags: ['rural', 'pecuária', 'investimento', 'poço artesiano'],
  status: 'disponivel',
  whatsappMessage: 'Olá! Tenho interesse na área rural de 10 hectares na região do Tamengo (Ref: 6). Podemos conversar?',
  createdAt: '2026-02-15',
  updatedAt: '2026-02-15',
}
```

---

## 10. Plano da Home Page

### Estrutura em Blocos (de cima para baixo)

**Bloco 1 — Hero Principal**

- Fundo com gradiente escuro (azul-escuro) ou imagem de Corumba
- Titulo: "Imóveis em Corumbá e Ladário"
- Subtitulo: "Encontre seu imóvel com quem conhece a região"
- Campo de busca rapida (texto livre) com botao
- Ou CTA direto: "Ver imóveis" + "Falar no WhatsApp"

**Bloco 2 — Busca por Categorias**

- Grid de 4-6 cards compactos com icone e label
- Categorias: Casas, Apartamentos, Terrenos, Comercial, Aluguel, Areas Rurais
- Cada card linka para `/imoveis/[categoria]`

**Bloco 3 — Imoveis em Destaque**

- Titulo: "Destaques"
- Grid de 3 PropertyCards (desktop) / 1 coluna scroll (mobile)
- Mostra imoveis com `featured: true`
- Link "Ver todos" para `/imoveis`

**Bloco 4 — Oportunidades Especiais**

- Visivel apenas se houver imoveis com `specialOpportunity: true`
- Card maior/destacado com badge dourado "Oportunidade"
- Descricao mais detalhada
- CTA direto para WhatsApp

**Bloco 5 — Cidades Atendidas**

- Dois cards lado a lado: Corumba e Ladario
- Cada card com foto da cidade e contagem de imoveis
- Link para `/imoveis/corumba` e `/imoveis/ladario`

**Bloco 6 — Bloco Institucional**

- Foto do corretor (placeholder)
- Nome: Marcilio Barbosa
- Texto curto sobre experiencia e atuacao regional
- CTA: "Conheça mais" → `/sobre`

**Bloco 7 — CTA Final**

- Faixa azul-escuro
- "Procurando algo específico? Fale diretamente comigo."
- Botao WhatsApp grande

**Bloco 8 — Footer**

---

## 11. Plano da Pagina de Detalhe do Imovel

### Estrutura

**Topo**

- Breadcrumbs: Inicio > Imoveis > Venda > Casa 3 quartos no Centro
- Badge de finalidade (Venda / Aluguel)
- Badge de status (Disponivel / Reservado)

**Galeria**

- Imagem principal grande (desktop: 60-70% da largura)
- Thumbnails na lateral ou embaixo
- Swipe no mobile
- Lightbox/zoom ao clicar
- Fallback com placeholder se sem imagens
- Client Component

**Informacoes Principais**

- Titulo do imovel
- Cidade — Bairro
- Preco grande e destacado (com sufixo se aluguel)
- Nota de preco se houver (ex: "Aceita financiamento")
- Tags/badges relevantes

**Caracteristicas**

- Grid de icones: quartos, banheiros, vagas, area total, area construida
- Exibir somente campos que existem (ocultar null)

**Descricao**

- Descricao longa completa
- Paragrafos bem formatados

**Localizacao**

- Cidade e bairro em texto
- (Futuro v2: mapa embarcado)

**Box de Contato (sticky no desktop)**

- Lado direito, acompanha scroll
- Foto do corretor (pequena)
- Nome: Marcilio Barbosa
- Botao WhatsApp com mensagem pre-pronta do imovel
- Telefone
- No mobile: barra fixa no rodape com botao WhatsApp

**Imoveis Relacionados**

- 3-4 imoveis da mesma cidade ou tipo
- Grid de PropertyCards

**Compartilhamento Social**

- Botoes de compartilhar abaixo do titulo ou ao lado do preco
- Opcoes: WhatsApp, Facebook, Twitter/X, Copiar Link
- Ao compartilhar via WhatsApp, gera link direto `whatsapp://send?text=Veja este imóvel: TITULO - PRECO URL`
- Ao colar link em qualquer rede/chat, o preview mostra foto de capa, titulo com preco e descricao curta (via OG tags)
- Botao "Copiar link" com feedback visual ("Link copiado!")
- Client Component (`ShareButtons`)

**SEO**

- `generateMetadata` com titulo, descricao, preco e cidade
- `og:image` com foto de capa do imovel (URL absoluta)
- `og:title` formatado como "Casa 3 quartos no Centro | R$ 380.000 | Marcilio Barbosa"
- `og:description` com `shortDescription`
- `twitter:card` = `summary_large_image`
- JSON-LD `RealEstateListing`

---

## 12. Estrategia de Conversao

### CTA WhatsApp

- **Numero padrao**: configurado em `constants.ts`
- **Mensagem pre-pronta**: cada imovel tem `whatsappMessage` personalizado com referencia
- **Link**: `https://wa.me/55XXXXXXXXXXX?text=MENSAGEM_ENCODED`

### Pontos de Contato

1. **Header** (desktop): botao WhatsApp discreto no canto direito
2. **Hero da Home**: CTA "Falar no WhatsApp"
3. **Bloco de oportunidades**: CTA por imovel
4. **CTA final da Home**: faixa inteira
5. **Pagina de detalhe**: box lateral sticky (desktop) + barra fixa no rodape (mobile)
6. **Pagina de contato**: WhatsApp + telefone + formulario
7. **Footer**: link de WhatsApp em todas as paginas
8. **Botao flutuante**: canto inferior direito em TODAS as paginas (Client Component, icone verde)

### Reducao de Friccao

- Mensagem ja vem pronta — usuario so precisa enviar
- Nao exigir cadastro para nada
- Formulario de contato com poucos campos (nome, telefone, mensagem)
- Click-to-call no telefone (mobile)
- Sem popups irritantes

---

## 13. Responsividade

### Breakpoints (Tailwind padrao)

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### Decisoes por Componente


| Componente             | Mobile                    | Tablet             | Desktop                  |
| ---------------------- | ------------------------- | ------------------ | ------------------------ |
| Header                 | Hamburger + logo          | Navegacao compacta | Navegacao completa + CTA |
| PropertyGrid           | 1 coluna                  | 2 colunas          | 3 colunas                |
| PropertyCard           | Full width                | Adaptativo         | Fixo ~350px              |
| Galeria                | Swipe horizontal          | Swipe + thumbnails | Grid + lightbox          |
| FilterBar              | Drawer/modal              | Inline compacto    | Inline completo          |
| Hero                   | Texto + CTA empilhados    | Lado a lado        | Grande com busca         |
| Contato (detalhe)      | Barra fixa no rodape      | Barra fixa         | Box sticky lateral       |
| CTA WhatsApp flutuante | Icone 48px canto inferior | Icone 56px         | Icone 56px + texto       |
| Footer                 | Colunas empilhadas        | 2 colunas          | 4 colunas                |


### Imagens

- Usar `next/image` com `sizes` adequado por breakpoint
- Cover image dos cards: `sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"`
- Galeria principal: `sizes="(max-width: 768px) 100vw, 70vw"`
- Formato: WebP (automatico via next/image)
- Placeholder: `blur` com blurDataURL ou cor solida

---

## 14. Acessibilidade e Qualidade

### Acessibilidade

- Contraste minimo WCAG AA (4.5:1 para texto, 3:1 para elementos grandes)
- A paleta azul-escuro (#1B3A5C) sobre branco atende AA
- `alt` descritivo em todas as imagens de imovel
- Navegacao por teclado funcional (Tab, Enter, Escape)
- Focus ring visivel (`:focus-visible` com outline)
- Headings hierarquicos (h1 > h2 > h3, sem pular niveis)
- Landmarks semanticos: `<header>`, `<main>`, `<nav>`, `<footer>`, `<section>`
- `aria-label` em botoes de icone (WhatsApp, menu)
- `aria-current="page"` no link ativo da navegacao

### Performance

- Server Components eliminam bundle JS desnecessario
- `loading.tsx` para streaming e skeletons
- `next/image` com lazy loading automatico (exceto hero)
- Hero image com `priority={true}`
- Font loading com `next/font/google` (Inter)
- Minimal client-side JS
- Evitar bibliotecas pesadas — se precisar de carousel, usar solucao leve (Embla Carousel ~6KB)

### Qualidade

- TypeScript strict
- ESLint com config do Next.js
- Componentes pequenos e focados
- Sem logica de negocios nos componentes — toda logica nos services

---

## 15. Estrutura de Pastas

```
src/
├── app/
│   ├── layout.tsx                     # Layout raiz (html, body, font, metadata global)
│   ├── page.tsx                       # Home
│   ├── not-found.tsx                  # 404 personalizado
│   ├── loading.tsx                    # Loading da home
│   ├── sitemap.ts                     # Sitemap dinâmico
│   ├── robots.ts                      # robots.txt
│   ├── imoveis/
│   │   ├── page.tsx                   # /imoveis (listagem geral)
│   │   ├── loading.tsx
│   │   └── [categoria]/
│   │       ├── page.tsx               # /imoveis/venda, /imoveis/casas, etc.
│   │       └── loading.tsx
│   ├── imovel/
│   │   └── [slug]/
│   │       ├── page.tsx               # /imovel/casa-3-quartos-centro
│   │       └── loading.tsx
│   ├── sobre/
│   │   └── page.tsx                   # /sobre
│   ├── contato/
│   │   └── page.tsx                   # /contato
│   └── api/                           # FUTURO: route handlers
│       └── .gitkeep
├── components/
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── mobile-menu.tsx            # 'use client'
│   │   ├── footer.tsx
│   │   ├── container.tsx
│   │   └── breadcrumbs.tsx
│   ├── property/
│   │   ├── property-card.tsx
│   │   ├── property-grid.tsx
│   │   ├── property-gallery.tsx       # 'use client'
│   │   ├── property-hero.tsx
│   │   ├── property-features.tsx
│   │   ├── property-description.tsx
│   │   ├── property-badge.tsx
│   │   ├── property-price.tsx
│   │   ├── property-status.tsx
│   │   ├── property-contact-box.tsx
│   │   ├── share-buttons.tsx          # 'use client'
│   │   └── related-properties.tsx
│   ├── search/
│   │   ├── search-bar.tsx             # 'use client'
│   │   ├── filter-bar.tsx             # 'use client'
│   │   ├── filter-chips.tsx           # 'use client'
│   │   └── sort-select.tsx            # 'use client'
│   ├── sections/
│   │   ├── hero-section.tsx
│   │   ├── featured-properties.tsx
│   │   ├── category-cards.tsx
│   │   ├── city-section.tsx
│   │   ├── special-opportunities.tsx
│   │   ├── institutional-section.tsx
│   │   └── cta-section.tsx
│   ├── shared/
│   │   ├── whatsapp-cta.tsx           # 'use client' (floating)
│   │   ├── whatsapp-button.tsx
│   │   ├── contact-section.tsx
│   │   ├── image-with-fallback.tsx    # 'use client'
│   │   ├── empty-state.tsx
│   │   ├── loading-skeleton.tsx
│   │   ├── section-heading.tsx
│   │   └── icon-feature.tsx
│   └── ui/
│       ├── button.tsx
│       └── badge.tsx
├── data/
│   ├── mocks/
│   │   └── properties.ts             # Array de Property mockados
│   └── services/
│       └── properties.ts             # Funcoes de acesso a dados
├── lib/
│   ├── constants.ts                   # Telefone, nome, CRECI, etc.
│   ├── format.ts                      # Formatacao de preco, area
│   ├── utils.ts                       # Slug, validacoes
│   ├── whatsapp.ts                    # Geracao de links WhatsApp
│   ├── share.ts                       # Helpers de URLs de compartilhamento social
│   └── metadata.ts                    # Helpers de metadata/SEO
├── types/
│   ├── property.ts                    # Interfaces do imovel
│   └── index.ts                       # Re-exports
└── (futuro)
    ├── actions/                       # Server Actions
    ├── data/db/                       # Acesso a banco
    └── data/repositories/             # Repositorios
```

---

## 16. Estrategia de Implementacao em Fases

### Fase 1 — Fundacao (1-2 dias)

- Configurar `next.config.ts` (imagens com `remotePatterns` para `images.unsplash.com`, etc.)
- Configurar fonte Inter via `next/font/google`
- Configurar variaveis de cor no Tailwind 4 (CSS custom properties em `globals.css`)
- Criar `types/property.ts` com todas as interfaces
- Criar `lib/constants.ts` com dados do corretor
- Criar `lib/format.ts`, `lib/whatsapp.ts` e `lib/share.ts`
- Criar `.env` com `NEXT_PUBLIC_SITE_URL`
- Criar mocks completos em `data/mocks/properties.ts`
- Criar camada de services em `data/services/properties.ts`
- Atualizar `layout.tsx` com `lang="pt-BR"`, metadata global, font

### Fase 2 — Layout Base (1-2 dias)

- Implementar `Container`
- Implementar `Header` (desktop + mobile menu)
- Implementar `Footer`
- Implementar `Button` e `Badge`
- Implementar `WhatsAppCTA` (botao flutuante)
- Validar responsividade do layout base

### Fase 3 — Home Page (2-3 dias)

- Implementar `HeroSection`
- Implementar `CategoryCards`
- Implementar `PropertyCard`
- Implementar `FeaturedProperties`
- Implementar `SpecialOpportunities`
- Implementar `CitySection`
- Implementar `InstitutionalSection`
- Implementar `CTASection`
- Montar `page.tsx` da Home compondo as secoes
- Implementar `loading.tsx` da Home

### Fase 4 — Listagem de Imoveis (2-3 dias)

- Implementar `PropertyGrid`
- Implementar `FilterBar` e `FilterChips`
- Implementar `SortSelect`
- Implementar `EmptyState`
- Implementar `SearchBar`
- Implementar `Breadcrumbs`
- Montar `imoveis/page.tsx`
- Montar `imoveis/[categoria]/page.tsx` com validacao de categoria
- Implementar `loading.tsx` das listagens

### Fase 5 — Detalhe do Imovel (2-3 dias)

- Implementar `PropertyGallery` (Client Component com swipe)
- Implementar `PropertyHero`
- Implementar `PropertyFeatures`
- Implementar `PropertyDescription`
- Implementar `PropertyContactBox` (sticky)
- Implementar `RelatedProperties`
- Montar `imovel/[slug]/page.tsx`
- Implementar `loading.tsx` do detalhe

### Fase 6 — Paginas Institucionais (1 dia)

- Montar `sobre/page.tsx`
- Montar `contato/page.tsx`
- Implementar `ContactSection`
- Implementar `not-found.tsx`

### Fase 7 — SEO, Metadata e Compartilhamento Social (1-2 dias)

- Implementar `generateMetadata` em todas as paginas
- Criar helpers de metadata em `lib/metadata.ts`
- Adicionar JSON-LD (RealEstateAgent, RealEstateListing)
- Implementar `sitemap.ts`
- Implementar `robots.ts`
- Open Graph tags completas com `og:image`, `og:title`, `og:description` formatados
- Twitter Card tags (`summary_large_image`)
- Implementar `ShareButtons` (WhatsApp, Facebook, Twitter/X, Copiar Link)
- Adicionar `ShareButtons` na pagina de detalhe e opcionalmente nos cards
- Criar `lib/share.ts` com helpers de geracao de URLs de compartilhamento
- Configurar `NEXT_PUBLIC_SITE_URL` em `.env`
- Validar que preview do WhatsApp mostra foto + titulo + preco ao colar link

### Fase 8 — Refinamento (2-3 dias)

- Ajustar responsividade fino
- Testar acessibilidade (contraste, foco, teclado)
- Otimizar imagens e loading
- Ajustar spacings e tipografia
- Revisar estados vazios e fallbacks
- Teste em dispositivos reais
- Performance audit (Lighthouse)

---

## 17. Decisoes e Trade-offs

### Por que SSR/Server Components?

- SEO e crucial para imoveis — Google precisa indexar cada imovel
- Publico-alvo nao e tech-savvy — site precisa ser rapido mesmo em conexoes medianas
- Conteudo e essencialmente estatico por visita — nao ha razao para hidratar toda a pagina
- Menos JS = mais rapido = melhor UX

### Onde Client Components sao necessarios?

- **Galeria**: swipe, zoom, navegacao de fotos exige interatividade DOM
- **Menu mobile**: toggle de visibilidade
- **Filtros**: interacao com selects, inputs, chips
- **WhatsApp flutuante**: precisa detectar scroll para mostrar/esconder
- **ImageWithFallback**: precisa de `onError` handler

### Como evitar complexidade?

- Sem state management global (nada de Redux/Zustand)
- Filtros via searchParams (URL = source of truth)
- Sem ORM ou abstracoes demais na camada de dados
- Sem design system complexo — Tailwind utilitario + poucos componentes base
- Sem animacoes elaboradas — transicoes sutis com `transition` CSS

### Como nao acoplar ao futuro backend?

- Toda leitura de dados passa por funcoes em `data/services/`
- As funcoes retornam tipos bem definidos
- Os componentes nunca sabem se o dado vem de mock ou banco
- Quando o backend existir, so muda a implementacao interna dos services

### Performance vs Aparencia

- Fotos sao o foco — investir em `next/image` bem configurado
- Hero com `priority` para LCP
- Carousel/galeria com biblioteca leve (Embla ~6KB) em vez de pesadas (Swiper ~40KB)
- Fontes via `next/font` (sem flash de fonte)

---

## 18. Compartilhamento Social e Rich Previews

### Objetivo

Quando alguem copiar e colar um link de imovel no WhatsApp, Facebook, Twitter/X ou qualquer rede social, o preview deve mostrar automaticamente:

- Foto de capa do imovel (grande, em destaque)
- Titulo formatado com preco (ex: "Casa 3 quartos no Centro | R$ 380.000")
- Descricao curta do imovel
- URL limpa do site

Isso e fundamental para conversao porque a maioria dos leads imobiliarios sao compartilhados entre familiares e amigos via WhatsApp.

### Implementacao Tecnica — Open Graph

Cada pagina de imovel (`/imovel/[slug]`) gera metadata via `generateMetadata()`:

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const property = await getPropertyBySlug(slug)
  if (!property) return {}

  const price = formatPrice(property.price)
  const title = `${property.title} | ${price} | Marcilio Barbosa Imóveis`
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const url = `${siteUrl}/imovel/${property.slug}`

  return {
    title,
    description: property.shortDescription,
    openGraph: {
      title,
      description: property.shortDescription,
      url,
      siteName: 'Marcilio Barbosa Imóveis',
      locale: 'pt_BR',
      type: 'article',
      images: [{
        url: property.coverImage,
        width: 1200,
        height: 800,
        alt: property.title,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: property.shortDescription,
      images: [property.coverImage],
    },
  }
}
```

### Componente ShareButtons

Client Component com botoes de compartilhamento:

- **WhatsApp**: `https://wa.me/?text=Veja este imóvel: TITULO - PRECO URL`
- **Facebook**: `https://www.facebook.com/sharer/sharer.php?u=URL`
- **Twitter/X**: `https://twitter.com/intent/tweet?url=URL&text=TITULO - PRECO`
- **Copiar Link**: `navigator.clipboard.writeText(URL)` com feedback "Link copiado!"

Posicionamento: abaixo do titulo na pagina de detalhe. Icones pequenos e discretos, sem poluir o visual. Nao usar SDK do Facebook/Twitter — apenas links nativos (zero JS extra).

### Helper de Compartilhamento (`src/lib/share.ts`)

```typescript
export function getWhatsAppShareUrl(title: string, price: string, url: string): string
export function getFacebookShareUrl(url: string): string
export function getTwitterShareUrl(title: string, price: string, url: string): string
```

### Onde os botoes de share aparecem

1. **Pagina de detalhe do imovel** — abaixo do titulo/preco (sempre visivel)
2. **PropertyCard** — icone de compartilhar discreto no canto (hover only no desktop, sempre visivel no mobile)

### Requisitos para rich preview funcionar

- `coverImage` DEVE ser URL absoluta (Unsplash URLs ja sao absolutas)
- OG tags DEVEM estar no `<head>` do HTML (Next.js `generateMetadata` garante isso)
- Tamanho minimo de imagem para WhatsApp: 300x200px (as nossas sao 1200x800)
- Tamanho ideal para Facebook/Twitter: 1200x630 (1200x800 funciona bem, sera cortado automaticamente)
- Para testar: usar o [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) e o [Twitter Card Validator](https://cards-dev.twitter.com/validator)

---

## A) Arquitetura Recomendada — Resumo Visual

```
┌─────────────────────────────────────────────────────┐
│                    BROWSER                           │
├─────────────────────────────────────────────────────┤
│  Server Components (95% do site)                     │
│  ┌─────────┐ ┌──────────┐ ┌────────────┐           │
│  │  Home   │ │ Listagem │ │  Detalhe   │  ...       │
│  └────┬────┘ └────┬─────┘ └─────┬──────┘           │
│       │           │             │                    │
│  Client Islands (5%)                                 │
│  ┌──────┐ ┌────────┐ ┌─────────┐ ┌──────────┐      │
│  │Menu  │ │Filtros │ │Galeria  │ │WhatsApp  │      │
│  └──────┘ └────────┘ └─────────┘ └──────────┘      │
├─────────────────────────────────────────────────────┤
│  data/services/ (contrato estavel)                   │
│  ┌─────────────────────────────┐                     │
│  │  getProperties()            │                     │
│  │  getPropertyBySlug()        │                     │
│  │  getFeaturedProperties()    │                     │
│  └────────────┬────────────────┘                     │
│               │                                      │
│  ┌────────────▼────────────────┐                     │
│  │  data/mocks/ (AGORA)        │                     │
│  │  data/db/   (FUTURO)        │                     │
│  └─────────────────────────────┘                     │
├─────────────────────────────────────────────────────┤
│  types/ (compartilhado entre frontend e backend)     │
│  lib/ (utilitarios puros)                            │
└─────────────────────────────────────────────────────┘
```

---

## B) Maiores Riscos de Implementacao

1. **Imagens**: os mocks usam fotos reais do Unsplash que funcionam imediatamente, mas nao representam os imoveis reais. Quando o backend for implementado, as imagens precisarao ser trocadas por fotos reais. A estrutura ja esta pronta para isso — basta trocar as URLs nos dados.
2. **Galeria de fotos**: componente mais complexo do frontend (swipe, zoom, responsivo). Pode consumir tempo. Usar biblioteca testada (Embla Carousel).
3. **Filtros com searchParams**: manter sincronizacao entre URL e estado dos filtros pode gerar bugs sutis. Testar bem.
4. **SEO sem dados reais**: metadata dinamica so funcionara bem com dados reais. Os mocks devem ser realistas o suficiente para validar a estrutura.
5. **Next.js 16 breaking changes**: APIs assincronas (`await params`, `await searchParams`) precisam ser aplicadas consistentemente. Erro comum e esquecer o `await`.
6. **Performance de imagens**: configuracao incorreta de `next/image` (sizes, domains) pode prejudicar LCP. Testar com Lighthouse.

---

## C) O que Pode Ficar para Versao 2

- Mapa embarcado na pagina de detalhe (Google Maps / Leaflet)
- Sistema de favoritos (requer autenticacao)
- Comparacao de imoveis
- Formulario de contato com envio por email (requer backend)
- Blog / dicas imobiliarias
- Avaliacao de imovel online
- Tour virtual / video embarcado
- Notificacao de novos imoveis
- Area administrativa (CRUD de imoveis)
- Integracao com portais (OLX, ZAP, VivaReal)
- Analytics avancado
- PWA / push notifications
- Multi-idioma (espanhol para turistas do Pantanal)
- Paginas de bairros com descricao e imoveis
- Calculadora de financiamento

---

## D) Mock Completo

Veja secao 9 acima — 6 imoveis realistas cobrindo: casa venda, casa aluguel, terreno, apartamento, comercial e rural.

---

## E) Resumo Executivo

Site imobiliario local para Marcilio Barbosa, corretor em Corumba-MS e Ladario-MS. Frontend em **Next.js 16.2 com App Router**, priorizando **Server Components** para SEO e performance. Visual **limpo, sobrio e orientado a fotos**, com conversao via **WhatsApp**. Arquitetura **desacoplada** com camada de services que hoje le mocks e futuramente lera banco de dados, sem alterar componentes. **6 rotas principais** (home, listagem, listagem filtrada, detalhe, sobre, contato) com **10 categorias de filtro** por URL. Implementacao em **8 fases** estimadas em **12-17 dias uteis**.

---

## F) Checklist Pratica de Implementacao

- Configurar projeto base (font, tailwind, metadata global)
- Criar tipos TypeScript (Property, PropertyFilter, CategoryMeta)
- Criar constantes (dados do corretor, categorias)
- Criar utilitarios (formato de preco, links WhatsApp, slugs)
- Criar mocks de imoveis (6+ imoveis realistas)
- Criar camada de services (getProperties, getBySlug, etc.)
- Implementar Header responsivo (server + client menu)
- Implementar Footer
- Implementar Container e componentes UI base
- Implementar botao WhatsApp flutuante
- Implementar PropertyCard
- Implementar Home page completa (hero, destaques, categorias, CTA)
- Implementar pagina de listagem com filtros
- Implementar pagina de listagem por categoria
- Implementar pagina de detalhe do imovel com galeria
- Implementar pagina Sobre
- Implementar pagina Contato
- Implementar 404 personalizado
- Adicionar generateMetadata em todas as paginas
- Adicionar JSON-LD structured data
- Implementar sitemap.ts e robots.ts
- Implementar loading.tsx em todas as rotas
- Implementar estados vazios e fallbacks
- Testar responsividade (mobile, tablet, desktop)
- Testar acessibilidade (contraste, teclado, screen reader)
- Audit de performance (Lighthouse)
- Revisar e ajustar espacamentos e tipografia
- Implementar ShareButtons (WhatsApp, Facebook, Twitter/X, Copiar Link)
- Criar lib/share.ts com helpers de URLs de compartilhamento
- Configurar NEXT_PUBLIC_SITE_URL no .env
- Validar OG tags com Facebook Sharing Debugger
- Testar preview de link no WhatsApp (foto + titulo + preco)

