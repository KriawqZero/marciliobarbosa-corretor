# Plano de simplificação, redesign e performance — site público

Documento de diagnóstico e plano. **Nada foi implementado nesta sessão**: não houve alteração de código, schema, banco, mídia ou deploy. O único arquivo criado é este.

Data do diagnóstico: 27/07/2026.
Alvo medido: `https://marciliobarbosacorretor.com.br` (produção, Railway edge `mia1`), branch `master` em `a9d891c`.

---

## 0. Como ler este documento (medido × estimado × pendente)

Todo número aqui está marcado:

- **[M]** — medido nesta sessão, com ferramenta e método descritos na seção 2.
- **[E]** — estimado por extrapolação a partir de amostra medida. A base da extrapolação está sempre explícita.
- **[P]** — pendente: depende de dado de produção que não tenho (Core Web Vitals de campo, custo de infra, volume de acesso real) ou de decisão sua.

Não há número neste documento que eu não consiga reproduzir com os comandos da seção 2.

---

## 1. Resumo executivo

O site não está feio e lento pelo mesmo motivo. São quatro problemas separados, e tratá-los como um só é o que faria o redesign errar o alvo.

**1. O vídeo do hero é 79% do peso da home e não entrega nada.** [M]
A home transfere 2.137 KB em 49 requisições. O domínio próprio responde por **457 KB em 25 requisições**; o iframe do YouTube e seu ecossistema (`youtube-nocookie`, `googlevideo`, `ytimg`, `fonts.gstatic`) respondem por **1.690 KB em 25 requisições**, sendo 585 KB só de stream de vídeo. No screenshot mobile, o player do YouTube vaza os próprios controles por cima do texto do hero. No desktop, em uma das capturas o vídeo nem carregou — o visitante viu o gradiente de fallback. Ou seja: o item mais caro da página é também o menos confiável.

**2. A home não mostra nenhum imóvel.** [M]
`featured = 0` no banco hoje, então `FeaturedProperties` retorna `null` e a seção "Imóveis em Destaque" simplesmente não existe na página. A palavra "Destaque" aparece **zero vezes** no HTML de produção. Um visitante que chega na home vê: hero com vídeo → 6 cards de categoria → 2 oportunidades comerciais (um restaurante e uma área comercial) → cidades → foto do corretor → CTA. **Nenhuma casa.** O produto principal do site está ausente da página principal.

**3. As fotos são verticais e a interface é horizontal.** [M]
Em amostra de 10 imagens reais do MinIO, **7 são 3060×4080 (retrato de celular)**. A galeria do detalhe renderiza `aspect-video` (16:9) com `object-cover` — isto é, descarta ~70% da foto e frequentemente mostra uma fatia sem informação (teto, parede). Somado a isso, a janela de miniaturas é `THUMBNAIL_WINDOW = 2`: um imóvel com 13 fotos exibe duas miniaturas por vez. A página cujo trabalho é vender pela foto é a que trata pior a foto.

**4. Ingestão sem normalização, entrega já otimizada — e o problema está na ingestão.** [M]
A hipótese do briefing se confirma parcialmente e precisa ser corrigida num ponto importante: **a entrega já está otimizada**. O `/_next/image` converte para WebP e serve 44 KB em `w=640`, 68 KB em `w=828`. As imagens não são o gargalo de download. O problema real está a montante: 257 imagens amostradas somam **210,9 MB** no MinIO (média 840 KB, p90 1,95 MB, máximo 3,56 MB), 111 delas acima de 1 MB. O `sharp` está no projeto mas só é usado para ler dimensões (`getImageDimensions`) — o buffer original vai íntegro para o bucket. Isso não pesa no visitante; pesa em armazenamento, em custo de otimização a frio e em risco operacional.

**5. Nada é cacheado. Todas as páginas públicas são `no-store`.** [M]
`/`, `/imoveis`, `/imoveis/[categoria]` e `/imovel/[slug]` respondem todas com `cache-control: private, no-cache, no-store, max-age=0, must-revalidate`. Cada visita executa queries no Postgres. O TTFB medido daqui é **410–425 ms** (home: 550 ms no Lighthouse), com ~123 ms só de conexão até Miami. E não há uma única chamada de `revalidatePath`/`revalidateTag` no repositório — o que significa que hoje o cache não existe, mas também que ligá-lo exige criar a invalidação junto.

**Efeito combinado, medido:** Lighthouse mobile (throttling simulado) na home: **performance 0,80 · LCP 3,1 s · CLS 0,172 · SI 6,0 s · TTI 5,3 s**. Listagem: 0,87 · LCP 3,7 s. Detalhe: 0,89 · LCP 3,4 s.

### Achados de correção imediata encontrados no caminho

Não são "redesign", são defeitos:

| Achado | Onde | Impacto |
|---|---|---|
| `tel:` gera `+67996294660` (falta o 55) | `footer.tsx:101`, `property-contact-box.tsx:38`, `contact-section.tsx:33` | Link de telefone quebrado em 3 lugares [M] |
| Formulário de contato sem botão e sem ação; texto "será ativado em breve" | `contato/page.tsx` | `/api/leads` **não tem POST** — só GET autenticado. A tabela `Lead` não tem via de entrada [M] |
| `favicon.ico` de 182 KB com `cache-control: public, max-age=0` | `public/favicon.ico` | Rebaixado a cada navegação [M] |
| `priceNote` renderizado em verde sobre gradiente escuro no card | `property-card.tsx:60` (`text-green-700`) | Ilegível; e o conteúdo gerado ("Valor: R$ 560.000,00") duplica o preço logo acima [M] |
| Foto do corretor com `priority` dentro de bloco `hidden lg:block` | `property-contact-box.tsx:26` | 33 KB baixados no mobile para imagem nunca exibida [M] |
| Primeiro card da listagem sem `priority`/`fetchPriority` | `property-card.tsx` | LCP da listagem depende de descoberta tardia — 3,7 s [M] |
| Fallback de capa aponta para foto de estoque do Unsplash | `api/imovel/route.ts:131` | Imóvel real ilustrado com casa genérica de banco de imagens |
| `'use server'` no topo de `data/services/properties.ts` | Arquivo inteiro | Todas as funções de leitura viram Server Actions com endpoint público |
| 5,8 MB de `.eps` + 2,5 MB de `.jpg`/`.png` de marca em `public/` | `public/LogoMarcilioBarbosaCorretor/` | Vai para a imagem de deploy; nada disso é servido ao visitante [M] |

---

## 2. Metodologia (para reprodução)

Tudo abaixo rodou contra **produção, em leitura**. Nenhuma escrita, nenhum deploy, nenhum acesso ao banco.

| O que | Ferramenta | Comando/base |
|---|---|---|
| Core Web Vitals de laboratório | Lighthouse 12.x + Chrome headless | `lighthouse <url> --preset=perf --form-factor=mobile --screenEmulation.mobile --throttling-method=simulate` |
| Waterfall e peso por host | Lighthouse `network-requests`, agrupado por host | JSON do run acima |
| TTFB / cabeçalhos | `curl -w '%{time_starttransfer}'`, `curl -sI` | 4 rotas públicas |
| Auditoria visual | Chrome headless `--screenshot`, 412×N (mobile) e 1440×N (desktop) | home, listagem, detalhe, sobre, contato |
| Inventário de mídia | `sitemap.xml` → 12 páginas de imóvel → 257 URLs distintas de `media.*` → `HEAD` em cada | amostra de 12 dos 43 imóveis |
| Dimensões/EXIF/formato | `sharp().metadata()` sobre 10 imagens baixadas ao acaso | amostra aleatória do conjunto acima |
| Simulação de pipeline | `sharp` local: rotate → resize → jpeg/webp/avif | mesmas 10 imagens |
| Contrato do app | Leitura de `lib/api.ts` e `lib/types.ts` em `/mnt/Files/Projetos/app-marciliobarbosa-corretor` | somente leitura |

**Limites honestos desta medição:**

- Lighthouse com `throttling-method=simulate` é laboratório. Não é Core Web Vitals de campo. **[P]** Não há RUM/CrUX disponível — não sei o p75 real dos visitantes de Corumbá.
- A amostra de mídia cobre 12 de 43 imóveis (28%). Extrapolações estão marcadas **[E]**.
- Rodei o Lighthouse a partir de uma conexão brasileira; o `time_connect` de 123 ms até Miami é real, mas a variabilidade de rede móvel local não foi medida.
- Não consegui usar a extensão de navegador (não conectada), então a auditoria visual é por screenshot de página inteira em headless, não por interação. Estados de hover, foco e o comportamento do lightbox foram lidos no código, não observados.

---

## 3. Mapa da jornada atual e pontos de confusão

### 3.1 Rotas públicas

```
/                       home
/imoveis                catálogo (12/página, filtros por query)
/imoveis/[categoria]    10 categorias: venda, aluguel, casas, terrenos,
                        apartamentos, comercial, rural, corumba, ladario,
                        oportunidades
/imovel/[slug]          detalhe
/sobre                  institucional
/contato                canais + formulário morto
/sitemap.xml, /robots.txt
```

### 3.2 Inventário real do catálogo [M]

Contagem de cards renderizados por categoria em produção (limite de página = 12):

| Categoria | Cards | Observação |
|---|---|---|
| venda | ≥12 | |
| casas | ≥12 | |
| terrenos | ≥12 | |
| corumba | ≥12 | 43 imóveis, segundo o próprio bloco "Cidades Atendidas" |
| comercial | 4 | |
| rural | 2 | |
| oportunidades | 2 | |
| **aluguel** | **1** | Item de nível 1 no menu |
| **ladario** | **1** | Metade do bloco "Cidades Atendidas" |
| **apartamentos** | **0** | Card na home + item de menu que leva a página vazia |

Isso é o dado mais importante para a arquitetura de informação: **o catálogo é essencialmente "casas e terrenos à venda em Corumbá"**, e a navegação atual finge um portfólio equilibrado em 10 eixos. O visitante clica em "Apartamentos" na home e cai numa página vazia com um estado vazio genérico. Isso não é um problema de CSS.

### 3.3 Pontos de confusão por página

**Home — mobile** (`412×4200`, screenshot)

1. O hero ocupa ~1.100 px de altura: rótulo, H1 de 3 linhas, parágrafo de 4 linhas, dois botões, e um painel branco com 4 selects + botão dourado. Nada disso é um imóvel.
2. **Os controles do player do YouTube aparecem sobre o texto**, entre "Falar no WhatsApp" e "Conheça o corretor". Visualmente parece um bug, e é.
3. Dois CTAs concorrentes no hero (WhatsApp verde + "Conheça o corretor" fantasma) e um terceiro dourado logo abaixo ("Ver imóveis"). Três destinos, três cores, nenhuma hierarquia.
4. "Busque por categoria": 6 cards de ícone, 2 colunas, ~640 px de altura. Dois deles (Apartamentos, Aluguel) levam a 0 e 1 resultado.
5. Salto direto de "Busque por categoria" para "Oportunidades Especiais". A seção de destaques não existe. O visitante nunca vê uma casa na home.
6. "Oportunidades Especiais" mostra um restaurante e uma área comercial — os dois imóveis menos representativos do catálogo — em cards grandes de dois blocos com WhatsApp verde + "Ver detalhes" azul cada.
7. "Cidades Atendidas": dois cards de peso visual idêntico, "43 imóveis disponíveis" e "1 imóvel disponível".
8. Botão flutuante de WhatsApp sobreposto ao conteúdo o tempo todo, e um quarto CTA de WhatsApp na seção final.

**Home — desktop** (`1440×4200`)

9. Vídeo não carregou nesta captura: hero é um retângulo azul com muito espaço morto abaixo do painel de busca.
10. Os 6 cards de categoria viram uma fileira de retângulos de ~140 px com ícone minúsculo e texto de 10 px. Ocupam a largura toda para dizer muito pouco.
11. A foto institucional é uma selfie com óculos escuros à beira de uma piscina. É também a **imagem de Open Graph padrão do site** (`DEFAULT_SOCIAL_IMAGE = '/marcilio.jpg'`): é isso que aparece quando alguém compartilha a home no WhatsApp. Isso é uma decisão de conteúdo, não de código, mas afeta diretamente o objetivo "confiar no corretor".

**Listagem — mobile**

12. Cinco selects empilhados (finalidade, tipo, quartos, cidade, ordem), todos em estado "Todos", sem contagem de resultados, sem chips de filtro ativo, sem campo de busca por texto — apesar de `PropertyFilter.search` existir e estar implementado no serviço.
13. Sem "43 imóveis encontrados". O visitante não sabe o tamanho do conjunto nem se o filtro fez algo.
14. Card: badge "Venda" repetido em 100% dos cards de uma listagem 100% de venda — ruído puro.
15. `priceNote` renderizado logo abaixo do preço, em verde, sobre o gradiente preto: **ilegível**, e o texto é redundante ("R$ 560.000" / "Valor: R$ 560.000,00").
16. Um card por linha com imagem 4:3 grande → 12 imóveis exigem ~10 telas de rolagem.

**Detalhe — mobile** (é a pior página)

17. Breadcrumb consome duas linhas com o título completo.
18. Barra "Compartilhar:" com WhatsApp, Facebook, X e copiar-link **antes da galeria**. Ação de baixo valor em posição de alto valor; Facebook e X são irrelevantes para esse público.
19. Galeria: imagem 16:9 recortando foto 3:4 → mostra uma fatia frequentemente inútil. Abaixo, **duas miniaturas** com setas de navegação. Um imóvel com 13 fotos comunica "tem 2 fotos".
20. `priceNote`: "Valor estimado: R$ 780.000,00" logo abaixo de "R$ 780.000". Redundância gerada pela IA de cadastro.
21. Descrição: parágrafo único de ~15 linhas no mobile, sem estrutura, terminando com "entre em contato com o corretor Marcilio Barbosa pelo WhatsApp" — texto de IA falando com o leitor sobre a própria página.
22. Tags em chips cinza-claro ("casa, alto padrão, piscina, dom bosco, corumba, varanda gourmet, garagem"): parecem saída de debug e repetem o que já está no título e nas características.
23. Bloco "Localização" repete bairro e cidade pela terceira vez na mesma página. Sem mapa, sem referência.
24. "Imóveis Semelhantes": 3 cards grandes. A query é `OR: [citySlug, type]` — então uma casa de alto padrão em Corumbá é "semelhante" a um prédio comercial em Ladário. Não é semelhança, é preenchimento.
25. Barra fixa verde de WhatsApp no rodapé **mais** o botão flutuante circular de WhatsApp logo acima dela. Dois WhatsApps empilhados no mesmo canto.

**Contato**

26. Formulário com Nome, Telefone, Mensagem, **sem botão de envio**, com o aviso "O formulário será ativado em breve". É uma página que promete e não cumpre. Como `/api/leads` só tem GET, não há nada por trás.

**Sobre**

27. Página razoável e honesta, mas isolada: não leva a nenhum imóvel, e o CTA final é o mesmo bloco genérico da home.

### 3.4 Origem medida do CLS 0,172 [M]

No HTML de produção, a ordem dos headings é: hero → "Busque por categoria" → "Corretor Marcilio Barbosa" → "Procurando algo específico?" → "Cidades Atendidas" → "Oportunidades Especiais". Ou seja, as seções `async` (`CitySection`, `SpecialOpportunities`, `FeaturedProperties`) chegam por streaming **depois** das seções estáticas e são inseridas acima delas, sem altura reservada. Cada uma que chega empurra o resto da página. O CLS não vem de imagem sem dimensão — vem de composição assíncrona sem reserva de espaço.

---

## 4. Separação do diagnóstico

Manter estas quatro listas separadas é o que evita "arrumar o CSS" achando que se está arrumando a performance.

### 4.1 Problemas visuais (estética/consistência)

- Três cores de acento competindo sem regra (dourado, azul-médio, verde WhatsApp) + vermelho de status + verde de `priceNote`.
- `SectionHeading` centralizado com traço dourado repetido em toda seção → ritmo previsível, cara de template.
- Textura de ruído SVG no `body` (`globals.css:37`) que não é percebida e existe só como custo.
- Densidade: `py-16 lg:py-24` em todas as seções, `mb-10 lg:mb-14` em todo heading. Muito ar entre pouco conteúdo.
- Fraunces (serif) aplicado indiscriminadamente a `h1..h6` via seletor global, inclusive em títulos de card de 16 px, onde a serifa piora a legibilidade.
- Contraste: `priceNote` verde sobre gradiente escuro (card) reprova em WCAG AA. `text-white/60`, `text-white/70` em vários lugares do hero e das cidades ficam no limite.
- Ícones SVG inline duplicados em 8+ arquivos (o path do WhatsApp aparece 5 vezes no código).

### 4.2 Problemas de UX/arquitetura de informação

- **A home não cumpre a promessa da própria navegação**: sem imóveis, sem contagem, sem caminho curto para o catálogo real.
- Navegação de 6 itens no topo, sendo 2 (`/imoveis/venda`, `/imoveis/aluguel`) subconjuntos redundantes de `/imoveis`, e um deles com 1 resultado.
- 10 categorias com peso igual para um catálogo assimétrico (0 a 43 itens).
- Busca sem contagem, sem chips de estado, sem busca textual, sem "limpar filtros".
- Galeria que subrepresenta o acervo de fotos — o ativo mais valioso do site.
- Formulário de contato morto.
- Dois CTAs de WhatsApp sobrepostos no detalhe mobile.
- "Semelhantes" que não são semelhantes.
- Nenhum sinal de credibilidade além do texto: CRECI aparece só em `/sobre`; não há endereço, horário, nem prova social.

### 4.3 Problemas arquiteturais

- `'use server'` no topo de `src/data/services/properties.ts` transforma todas as funções de leitura em Server Actions com endpoint HTTP público. `getPropertyBySlug` retorna imóvel em qualquer status. Não é vazamento grave hoje, mas é superfície desnecessária e provavelmente não intencional.
- Nenhuma invalidação de cache no repositório: zero ocorrências de `revalidatePath`/`revalidateTag`. Combinado com `no-store` em tudo, o resultado atual "funciona" porque nada é cacheado — mas isso trava a evolução.
- `PrismaClient` instanciado em três módulos separados (`data/services/properties.ts`, `api/imovel/route.ts`, `api/leads/route.ts`), sem singleton. Em dev com HMR isso vaza conexões; em produção multiplica pools.
- `api/imovel/route.ts` com 754 linhas concentra validação, slug, storage (`moveObject`), regra de capa e serialização. É a peça que o app mobile depende e a mais difícil de mexer com segurança.
- Storage: `uploadToMinIO` recebe buffer cru; não há camada de normalização entre "arquivo recebido" e "objeto persistido".
- `README.md` afirma "Utilização de `sharp` para otimização em tempo de execução e upload" e descreve uma pasta `/admin` que não existe no repositório. A documentação descreve um sistema diferente do que está no disco.

### 4.4 Gargalos medidos (e o que **não** é gargalo)

**É gargalo:**

| Item | Medição |
|---|---|
| YouTube no hero | 1.690 KB / 25 req / 79% do peso da home [M] |
| Ausência de cache HTTP | `no-store` em 4/4 rotas; TTFB 410–550 ms [M] |
| Streaming sem reserva de altura | CLS 0,172 [M] |
| LCP da listagem sem prioridade | LCP 3,7 s com imagem de 148,7 KB [M] |
| Originais não normalizados no bucket | 210,9 MB em 257 imagens; p90 1,95 MB [M] |
| `favicon.ico` 182 KB, `max-age=0` | rebaixado por navegação [M] |
| AVIF desligado | otimizador responde WebP mesmo com `Accept: image/avif` [M] |

**Não é gargalo (e não deve ser tratado como se fosse):**

- **Entrega de imagem.** O `/_next/image` já serve WebP: 44 KB @640, 68 KB @828, 98 KB @1080. Total de imagem na home: 189 KB em 7 requisições. [M]
- **JavaScript próprio.** 197 KB comprimidos em 9 chunks na home; TBT 20–60 ms nas três páginas. [M] Não há problema de interatividade.
- **Fontes.** 84 KB para Inter + Fraunces auto-hospedadas com `display: swap` e preload. Há ganho possível (~48 KB se Fraunces cair), mas é otimização de terceira ordem.
- **Estáticos.** `_next/static` já vem com `max-age=31536000, immutable`. [M]

---

## 5. Arquitetura de informação proposta

Princípio único: **cada página tem um trabalho e uma ação primária.** O resto é subordinado ou sai.

| Página | Trabalho | Ação primária | Ação secundária |
|---|---|---|---|
| Home | Provar que há imóveis reais e levar à busca | Ver imóveis (catálogo/filtro) | WhatsApp |
| Listagem | Reduzir o conjunto sem atrito | Abrir um imóvel | Ajustar filtro |
| Detalhe | Convencer pela foto e pelo dado | WhatsApp sobre **este** imóvel | Ver mais fotos |
| Sobre | Dar confiança | Ver imóveis | WhatsApp |
| Contato | Abrir conversa | WhatsApp | Formulário (funcional) ou telefone |

### 5.1 Home — de 7 seções para 5

**Sai:** grade de 6 categorias, seção "Cidades Atendidas", seção institucional completa, CTA final duplicado, vídeo de fundo.
**Entra:** imóveis reais logo abaixo do hero.

```
1. Hero compacto        H1 + subtítulo curto + busca (3 campos) + chips
                        de atalho com contagem real
2. Imóveis              6 cards. Se houver `featured`, usa featured;
                        senão, os 6 mais recentes disponíveis.
                        Nunca uma home sem imóvel.
3. Oportunidades        0–2 itens, formato editorial, só se existirem
4. Corretor             faixa horizontal enxuta: foto, nome, CRECI,
                        1 frase, link para /sobre
5. Rodapé              navegação + contato + CRECI
```

O bloco "Cidades Atendidas" vira **dois chips com contagem** dentro da busca do hero (`Corumbá (43)`, `Ladário (1)`). O mesmo dado, um décimo do espaço, e a assimetria deixa de ser um constrangimento de layout.

A grade de categorias vira **chips de tipo, gerados a partir da contagem real, ocultando os vazios**. Se não há apartamento, não existe chip de apartamento. Isso resolve o problema de página vazia na origem, sem código de tratamento de erro.

### 5.2 Busca e filtros

Mantém `searchParams` como fonte da verdade (a decisão do `AGENTS.md` está certa e não muda). O que muda é a superfície:

- **Uma linha, três campos**: Finalidade · Tipo · Cidade. Quartos e faixa de preço entram num "Mais filtros" recolhível.
- **Campo de busca por texto**, ligando no `PropertyFilter.search` que já existe e já está implementado no serviço mas não tem UI.
- **Contagem sempre visível**: "43 imóveis" / "3 imóveis com estes filtros".
- **Chips de filtro ativo removíveis** + "Limpar tudo". O estado atual (5 selects dizendo "Todos") não comunica nada.
- Ordenação vira um controle discreto à direita da contagem, não um sexto select na mesma fileira.
- No mobile, filtros ficam num painel acionado por um botão "Filtrar (2)" — não empilhados ocupando a primeira tela inteira.

### 5.3 Detalhe

Reordenação, com a foto assumindo o papel que ela já tem no negócio:

```
breadcrumb curto (Imóveis › Casas › título truncado)
GALERIA — primeira coisa abaixo do breadcrumb, altura generosa,
          proporção que respeita foto vertical, contador "1/13"
título · bairro, cidade · badges (só as informativas)
PREÇO + CTA WhatsApp     ← bloco único, sticky no mobile
características (grid compacto)
descrição (com quebra em parágrafos)
localização (bairro + referência; mapa é decisão futura)
compartilhar (discreto, no fim)
semelhantes (3, com regra de semelhança mais estreita)
```

Mudanças que precisam ser explicitadas:

- **Barra de compartilhar sai do topo** e vira um controle discreto no fim. WhatsApp e "copiar link" ficam; Facebook e X saem.
- **Um único CTA fixo** no mobile. O botão flutuante global (`WhatsAppCTA`) é ocultado na rota de detalhe, porque ali já existe a barra fixa contextual — que é melhor, porque leva a mensagem do imóvel.
- **`priceNote` só renderiza se não for redundante com o preço.** Regra simples de exibição no componente + correção do prompt de geração.

---

## 6. Wireframes textuais

### 6.1 Home — mobile (375–412 px)

```
┌───────────────────────────────────────────┐
│ [MB]                              [☰]     │  header 56px, sólido
├───────────────────────────────────────────┤
│                                           │
│  CORUMBÁ E LADÁRIO · MS                   │  eyebrow 12px dourado
│                                           │
│  Imóveis em Corumbá                       │  H1 32px, 2 linhas máx
│  e Ladário                                │
│                                           │
│  43 imóveis disponíveis. Atendimento       │  16px, 1–2 linhas
│  direto com o corretor.                   │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │ [Comprar ▾] [Cidade ▾]             │  │  busca: 2 selects
│  │ [ Buscar imóvel               🔍 ]  │  │  + campo texto
│  │              ┌──────────────────┐   │  │
│  │              │   VER IMÓVEIS    │   │  │  CTA PRIMÁRIO
│  │              └──────────────────┘   │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  Casas (28) · Terrenos (12) · Comercial(4)│  chips, só não-vazios
│                                           │
├───────────────────────────────────────────┤  fim do hero ~560px
│                                           │
│  Imóveis disponíveis           Ver todos →│  H2 esquerda + link
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │ ███████████ FOTO 4:3 ███████████    │  │  LCP: priority
│  │                                     │  │
│  │              R$ 430.000             │  │  preço sobre a foto,
│  └─────────────────────────────────────┘  │  chapa sólida (não
│  Casa no bairro Popular Nova              │  gradiente), AA ok
│  Corumbá · Popular Nova                   │
│  2 qts · 2 ban · 87 m²                    │
│                                           │
│  [ … mais 5 cards … ]                     │
│                                           │
│           ┌──────────────────┐            │
│           │  VER OS 43 IMÓVEIS│           │  CTA secundário
│           └──────────────────┘            │
├───────────────────────────────────────────┤
│  Oportunidades                            │  só se existir
│  ┌─────────────────────────────────────┐  │
│  │ ██ FOTO ██  │ Restaurante à venda   │  │  card editorial,
│  │             │ R$ 580.000            │  │  1 CTA (Ver detalhes)
│  └─────────────────────────────────────┘  │
├───────────────────────────────────────────┤
│  ┌───┐  Marcilio Barbosa                  │  faixa enxuta
│  │foto│ CRECI/MS 17.159                   │  ~140px de altura
│  └───┘  Corretor em Corumbá e Ladário     │
│         Conheça o corretor →              │
├───────────────────────────────────────────┤
│  RODAPÉ                                   │
└───────────────────────────────────────────┘
                                    [ 💬 ]     FAB WhatsApp
```

Hero atual: ~1.100 px até o primeiro conteúdo de catálogo. Hero proposto: **primeiro imóvel visível por volta de 600 px** — cerca de uma rolagem e meia mais cedo.

### 6.2 Home — desktop (≥1024 px)

```
┌────────────────────────────────────────────────────────────────┐
│ [LOGO]      Imóveis  Sobre  Contato            [ 💬 WhatsApp ] │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│   CORUMBÁ E LADÁRIO · MS         ┌──────────────────────────┐  │
│                                  │ ENCONTRE SEU IMÓVEL      │  │
│   Imóveis em Corumbá             │ [Comprar ▾] [Cidade ▾]   │  │
│   e Ladário                      │ [Tipo    ▾]              │  │
│                                  │ [ buscar…            🔍] │  │
│   43 imóveis disponíveis.        │ ┌──────────────────────┐ │  │
│   Atendimento direto com         │ │     VER IMÓVEIS      │ │  │
│   o corretor.                    │ └──────────────────────┘ │  │
│                                  └──────────────────────────┘  │
│   Casas (28) · Terrenos (12) · Comercial (4) · Rural (2)       │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  Imóveis disponíveis                              Ver todos →  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │  card    │  │  card    │  │  card    │   grid 3 col          │
│  └──────────┘  └──────────┘  └──────────┘                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  └──────────┘  └──────────┘  └──────────┘                      │
├────────────────────────────────────────────────────────────────┤
│  Oportunidades                                                 │
│  ┌────────────────┬─────────────────────────────────────────┐  │
│  │   FOTO 4:3     │  Restaurante à venda …  R$ 580.000       │  │
│  └────────────────┴─────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  ┌────┐ Marcilio Barbosa · CRECI/MS 17.159    Conheça →        │
│  └────┘ Corretor em Corumbá e Ladário                          │
├────────────────────────────────────────────────────────────────┤
│  RODAPÉ                                                        │
└────────────────────────────────────────────────────────────────┘
```

**Fundo do hero:** imagem estática única, tratada (ver seção 11). Sem vídeo, sem iframe, sem terceiro.

### 6.3 Listagem — mobile

```
┌───────────────────────────────────────────┐
│ Início › Imóveis                          │
│                                           │
│ Imóveis em Corumbá e Ladário              │  H1
│                                           │
│ ┌───────────────────────────────────────┐ │
│ │ 🔍 Buscar por bairro, título…         │ │
│ └───────────────────────────────────────┘ │
│ [ Filtrar (2) ⚙ ]        [ Recentes ▾ ]   │  painel + ordenação
│                                           │
│ 【Casas ✕】【Corumbá ✕】      Limpar tudo  │  chips ativos
│                                           │
│ 12 de 28 imóveis                          │  contagem SEMPRE
├───────────────────────────────────────────┤
│ ┌───────────────────────────────────────┐ │
│ │ ██████████ FOTO 4:3 ██████████        │ │  1º card: priority
│ │                          ┌──────────┐ │ │
│ │                          │R$ 430.000│ │ │  chapa sólida
│ └──────────────────────────┴──────────┘ │ │
│ Casa de alto padrão no Popular Nova       │  16px, 2 linhas
│ Corumbá · Popular Nova                    │  14px cinza
│ 2 qts · 2 ban · 87 m²                     │  13px
│ ─────────────────────────────────────────  │
│ [ … 11 cards … ]                          │
├───────────────────────────────────────────┤
│      ‹ Anterior   1 [2] 3   Próxima ›     │
└───────────────────────────────────────────┘
```

Badge de finalidade **só aparece quando o conjunto é misto**. Numa listagem 100% venda, ela some.

### 6.4 Detalhe — mobile (a maior mudança)

```
┌───────────────────────────────────────────┐
│ Início › Imóveis › Casas                  │  sem o título completo
├───────────────────────────────────────────┤
│ ┌───────────────────────────────────────┐ │
│ │                                       │ │
│ │        FOTO PRINCIPAL                 │ │  proporção 4:5 no
│ │        (respeita retrato)             │ │  mobile; priority;
│ │                                       │ │  altura ~440–500px
│ │                                       │ │
│ │  ‹                              1/13 ›│ │  swipe + contador
│ └───────────────────────────────────────┘ │
│ ▪▪▪▪▪▪▪▪▪▪▪▪▪  (13 pontos/tira rolável)   │  TODAS as fotos
├───────────────────────────────────────────┤
│ 【Oportunidade】                           │  só badges com valor
│ Casa de alto padrão com piscina           │  H1 24px
│ Corumbá · Dom Bosco                       │
│                                           │
│ R$ 780.000                                │  32px, azul
│ Aceita financiamento                      │  só se ≠ do preço
│                                           │
│ ┌───────────────────────────────────────┐ │
│ │  💬  FALAR SOBRE ESTE IMÓVEL          │ │  CTA primário
│ └───────────────────────────────────────┘ │  (sticky ao rolar)
│ ☎ (67) 99629-4660                         │  secundário, texto
├───────────────────────────────────────────┤
│ 3 quartos · 3 banheiros · 2 vagas · 144 m²│  linha compacta,
│                                           │  não 5 caixas
├───────────────────────────────────────────┤
│ Sobre o imóvel                            │
│ Parágrafo 1 …                             │  quebrado, 3–4 linhas
│                                           │  por bloco
│ Parágrafo 2 …                             │
├───────────────────────────────────────────┤
│ Localização                               │
│ Dom Bosco, Corumbá — MS                   │
├───────────────────────────────────────────┤
│ Compartilhar  [💬] [🔗]                    │  discreto, 2 opções
├───────────────────────────────────────────┤
│ Outras casas em Corumbá                   │  título honesto
│ ┌────────┐ ┌────────┐   ← carrossel        │  não 3 cards cheios
│ └────────┘ └────────┘                      │
└───────────────────────────────────────────┘
[ 💬  Falar sobre este imóvel ]                barra fixa única
                                               (FAB global oculto)
```

### 6.5 Detalhe — desktop

```
┌──────────────────────────────────────────────────────────────┐
│ Início › Imóveis › Casas                                     │
├───────────────────────────────────────┬──────────────────────┤
│ ┌───────────────────────────────────┐ │ ┌──────────────────┐ │
│ │                                   │ │ │ R$ 780.000       │ │
│ │      FOTO PRINCIPAL 3:2           │ │ │ Aceita financ.   │ │
│ │      (clique = lightbox)          │ │ │                  │ │
│ │                            1/13 › │ │ │ ┌──────────────┐ │ │
│ └───────────────────────────────────┘ │ │ │ 💬 FALAR      │ │ │
│ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪   (tira rolável)      │ │ │   SOBRE ESTE │ │ │
│                                       │ │ │   IMÓVEL     │ │ │
│ Casa de alto padrão com piscina       │ │ └──────────────┘ │ │
│ Corumbá · Dom Bosco                   │ │ ☎ (67) 99629-4660│ │
│                                       │ │ ─────────────────│ │
│ 3 qts · 3 ban · 2 vagas · 144 m²      │ │ ┌──┐ Marcilio    │ │
│                                       │ │ │  │ CRECI 17.159│ │
│ Sobre o imóvel …                      │ │ └──┘             │ │
│                                       │ └──────────────────┘ │
│ Localização · Compartilhar            │        (sticky)      │
├───────────────────────────────────────┴──────────────────────┤
│ Outras casas em Corumbá   [card] [card] [card]               │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. Direção visual

O alvo é **claro, local, confiável, editorial sem excesso**. Traduzindo em regras verificáveis:

### 7.1 Cor — de 5 acentos para 2

| Papel | Token | Uso permitido |
|---|---|---|
| Marca / estrutura | `azul-escuro #1B3A5C` | header sólido, rodapé, preço, botão primário, hero |
| Apoio | `azul-medio #2C5F8A` | links, foco, hover, estados |
| Acento raro | `dourado #C9973B` | **só** badge "Oportunidade" e o eyebrow do hero. Nada mais. |
| Ação de conversa | `whatsapp #25D366` | **só** botões que abrem o WhatsApp. Nunca decoração. |
| Neutros | `cinza-900/600/200/50` | texto, bordas, superfícies |

**Sai:** `--color-verde` como cor de texto do `priceNote` (vira `cinza-600`), `--color-vermelho` fora de badge de status, o gradiente dourado da `SectionHeading`, os blobs `blur-2xl/3xl` decorativos em `city-section` e `cta-section`, a textura de ruído no `body`.

Regra de contraste: todo texto sobre foto vai sobre **chapa sólida ou superfície com opacidade ≥ 0,72**, nunca sobre gradiente. Isso resolve o `priceNote` ilegível e a legibilidade dos preços em fotos claras.

### 7.2 Tipografia

Decisão a tomar (seção 16, pergunta 3). Duas opções coerentes:

**A — Duas famílias, uso disciplinado (recomendada).** Fraunces **apenas** em `h1` e `h2` de seção, pesos 600 e 700, com `axes` restrito. Inter em todo o resto, inclusive títulos de card. Remove o seletor global `h1..h6 { font-family: var(--font-heading) }` do `globals.css`, que hoje serifa até `h3` de 16 px.
Custo: mantém os 84 KB de fonte medidos.

**B — Uma família.** Só Inter, com peso e tracking fazendo a hierarquia.
Ganho medido: **−48 KB** e uma requisição a menos. Perda: o site fica visualmente mais próximo de qualquer template.

Escala (mobile → desktop):

```
H1        30 → 44px   /  line-height 1.1  /  tracking -0.02em
H2        24 → 32px   /  1.2   /  -0.01em
Título card 16 → 17px /  1.35  /  peso 600
Preço     28 → 34px   /  1.0   /  peso 700, tabular-nums
Corpo     16px fixo   /  1.6
Meta      14px        /  1.4   /  cinza-600
Rótulo    12px        /  uppercase, tracking 0.08em
```

`tabular-nums` no preço evita o pulo de largura entre "R$ 70.000" e "R$ 780.000" em grade.

### 7.3 Grid, espaçamento e densidade

- Container: `max-w-6xl` (1152 px) com padding 20 px no mobile, 32 px acima de `lg`. Hoje o conteúdo se espalha demais no desktop.
- Escala de espaço: `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64`. Só isso.
- **Espaço entre seções: 48 px mobile / 80 px desktop** (hoje: 64/96). Redução de ~25% no comprimento total das páginas sem apertar nada.
- Heading de seção **alinhado à esquerda** com link de ação à direita na mesma linha. O padrão centralizado com traço dourado sai.
- Grade de cards: 1 col < 640 px · 2 col 640–1024 · 3 col ≥ 1024. Gap 16/24.

### 7.4 Cards

```
- raio 12px, borda 1px cinza-200, sem sombra em repouso
- hover: sombra média + borda azul-medio. Sem translate/scale.
- foto 4:3 com object-cover
- preço em chapa sólida branca com texto azul-escuro,
  canto inferior esquerdo da foto (não faixa gradiente)
- badge só quando informa algo (Oportunidade; Finalidade
  apenas em listagem mista; Status quando ≠ disponível)
- título 2 linhas com clamp · localidade · linha de atributos
```

O `hover:-translate-y-1` atual em cards e categorias custa repaint em listas longas e não comunica nada além do que a sombra já comunica.

### 7.5 Imagens na interface

| Contexto | Proporção | Motivo |
|---|---|---|
| Card (listagem, home, semelhantes) | 4:3 | funciona com foto de celular vertical e horizontal, e é o padrão que o olho já espera em imobiliário |
| Galeria — mobile | 4:5 | **respeita a foto vertical**, que é a maioria medida (7/10) |
| Galeria — desktop | 3:2 | aproveita a largura sem recorte agressivo |
| Oportunidade (editorial) | 4:3 mobile / 1:1 desktop | |
| Lightbox | `object-contain` | vê a foto inteira, sem recorte |

Regra: **`object-cover` só em card**. Onde a foto é o conteúdo (galeria aberta, lightbox), nunca se recorta.

### 7.6 Estados interativos

- Foco: `outline 2px azul-medio, offset 2px` — já existe em `globals.css` e deve ser mantido.
- Hover em link: sublinhado com `underline-offset-4`, não só troca de cor.
- Loading da galeria: reservar a caixa com a proporção correta e usar `blurDataURL`/placeholder de cor média. O spinner atual sobre imagem a 40% de opacidade chama mais atenção para a espera do que a espera merece.
- Skeleton de listagem: manter (`PropertyGridSkeleton` está correto), mas alinhar a proporção ao card novo.
- Alvos de toque ≥ 44×44 px. As setas de miniatura hoje têm 32 px e `tabIndex={-1}` — inacessíveis por teclado.
- `prefers-reduced-motion`: remover translate/scale, manter transição de cor.

---

## 8. O que remover, juntar, reduzir ou adiar

### Remover

| Item | Justificativa |
|---|---|
| `HeroVideoBackground` + CSS `.hero-youtube-*` | 1.690 KB / 25 req de terceiro; player vazando controles sobre o texto; não carregou de forma consistente [M] |
| Grade de 6 categorias na home | 2 das 6 levam a 0 e 1 resultado; ~640 px de altura no mobile para pouca informação |
| Seção "Cidades Atendidas" | Vira 2 chips com contagem no hero |
| `CTASection` na home | Quarto CTA de WhatsApp na mesma página |
| Textura de ruído no `body` | Não é percebida |
| Botões Facebook e X em `ShareButtons` | Público local usa WhatsApp; 2 SVGs a menos |
| `hover:-translate-y-1` | Custo de repaint sem ganho de comunicação |
| `.eps` (5,8 MB), `.ai` (493 KB) e `Logo Fundo Sólido *.jpg` (2,5 MB) de `public/` | Nunca servidos; só engordam a imagem de deploy [M] |
| `NAV_LINKS` "Venda" e "Aluguel" | Redundantes com `/imoveis`; "Aluguel" tem 1 item |
| `priority` da foto do corretor em `PropertyContactBox` | Bloco é `hidden lg:block`; 33 KB desperdiçados no mobile [M] |

### Juntar

- Seção institucional da home + `/sobre`: a home fica com uma faixa de 3 linhas; o conteúdo vive em `/sobre`.
- `HeroFilterPanel` e `FilterBar`: hoje são dois componentes com listas de opções duplicadas. Vira um `PropertySearch` com variante `hero` e `bar`.
- Ícones SVG repetidos (WhatsApp aparece 5×, casa 3×, cama/banho 2×) num módulo `components/ui/icons.tsx`.
- Barra fixa de WhatsApp do detalhe + FAB global: **um só por rota**.

### Reduzir

- Padding vertical de seção: 64/96 → 48/80.
- `SectionHeading`: sem traço, alinhado à esquerda, subtítulo opcional (hoje toda seção tem um subtítulo genérico).
- `PropertyFeatures`: de 5 caixas em grade para uma linha compacta no mobile.
- Descrição: quebrada em parágrafos na renderização (o texto vem como bloco único do banco).
- Tags: máximo 4 visíveis, estilo discreto — ou removidas, se você concordar que hoje não informam nada além do título.
- Breadcrumb do detalhe: sem o título completo.

### Adiar (não fazer agora)

- Mapa no detalhe (Google Maps/Leaflet adiciona terceiro; resolver depois que o peso estiver controlado).
- Página de bairro para SEO (`/imoveis/corumba/dom-bosco`) — vale, mas só com catálogo maior.
- Favoritos, comparador, alerta por e-mail — não há demanda demonstrada.
- Variantes de imagem pré-geradas no upload (opção B da seção 10): só se o custo de otimização a frio virar gargalo medido.
- Modo escuro.

---

## 9. Plano técnico de imagens

### 9.1 Como está hoje (medido)

```
App (expo-image-picker, quality 0.85, sem resize)
      │  arquivo 3060×4080, 0,2–3,6 MB
      ▼
POST /api/upload   valida MIME (jpeg/png/webp) e tamanho (≤10 MB)
      │            sharp().metadata()  ← só lê width/height
      ▼
uploadToMinIO(buffer original)  →  properties/temp/{tempId}/{arquivo}
      │
      ▼  POST /api/imovel
moveObject temp → properties/{propertyId}/{arquivo}
PropertyImage { src, alt, width, height, sortOrder }
coverImageUrl = src da primeira imagem
      │
      ▼
media.marciliobarbosacorretor.com.br (Cloudflare → MinIO)
   cache-control: max-age=14400
      │
      ▼
/_next/image?url=…&w=…&q=75  (Railway, sharp)
   → WebP · 44 KB @640 · 68 KB @828 · 98 KB @1080
   cache-control: public, max-age=14400, must-revalidate
```

**Inventário medido** (12 de 43 imóveis, 257 imagens):

| Métrica | Valor |
|---|---|
| Total no bucket (amostra) | 210,9 MB [M] |
| Média por imagem | 840 KB [M] |
| Mediana | 339 KB [M] |
| p90 | 1,95 MB [M] |
| Máximo | 3,56 MB [M] |
| Acima de 1 MB | 111 de 257 (43%) [M] |
| Formatos | 255 JPEG, 2 PNG (PNG média 2,4 MB) [M] |
| Dimensão dominante | 3060×4080 (7 de 10 na amostra de metadados) [M] |
| EXIF orientation | `1` em 10/10 — o app já normaliza rotação [M] |
| EXIF + ICC retidos | ~940 B + 456 B por arquivo [M] |
| **Extrapolação para 43 imóveis** | ~920 imagens, ~755 MB [E] |

### 9.2 A distinção que precisa ficar explícita

**Guardar em alta qualidade ≠ entregar o original.** São duas decisões separadas:

- **Entrega**: já está resolvida hoje. O `next/image` nunca entrega o original — ele redimensiona e converte. Nenhum visitante baixou 3,5 MB. Isso continua assim.
- **Armazenamento**: hoje guardamos o arquivo cru do celular. A questão é se 3060×4080 é o *master* certo. Não é. Um master de **2560 px no lado maior** é indistinguível do original em qualquer uso deste projeto (tela, WhatsApp, impressão A4), e custa 70% menos.

Portanto o plano **não** é "comprimir para o visitante" — é **normalizar o que entra**, mantendo um master de qualidade de arquivo, e deixar a entrega onde já está.

### 9.3 Pipeline de normalização proposto (na ingestão)

Em `POST /api/upload`, entre "recebeu buffer" e "envia ao MinIO":

```
1. sharp(buffer)
2. .rotate()                       aplica EXIF orientation e zera o campo
3. .resize({ width: 2560, height: 2560,
             fit: 'inside', withoutEnlargement: true })
4. formato de saída:
     - entrada JPEG/PNG/WebP → JPEG progressivo, quality 82, mozjpeg,
       chromaSubsampling 4:2:0
     - motivo: um master universalmente legível, que o next/image
       reconverte para WebP/AVIF na entrega
5. .withMetadata({ icc: 'srgb' })  descarta EXIF (GPS incluso),
                                    preserva perfil de cor
6. extensão da chave passa a ser sempre .jpg
7. width/height gravados no banco = dimensões PÓS-resize
```

**Resultado medido na amostra de 10 imagens (12,30 MB de originais):**

| Saída | Total | Redução |
|---|---|---|
| JPEG 2560px q82 mozjpeg (**master proposto**) | 3,69 MB | **−70%** [M] |
| JPEG 1920px q80 | 2,38 MB | −81% [M] |
| WebP 1920px q74 | 1,63 MB | −87% [M] |
| AVIF 1920px q52 | 1,20 MB | −90% [M] |

Extrapolando para o acervo: **~755 MB → ~225 MB**, economia de ~530 MB. [E]

Escolhi 2560 px e não 1920 px de propósito: 2560 preserva margem para lightbox em tela grande e para uso futuro (impressão, material do corretor), e ainda entrega 70% de economia. 1920 economiza mais, mas fecha portas por 1,3 MB de diferença no acervo inteiro.

### 9.4 Guardar o original?

**Recomendação: não guardar por padrão.** Motivos: o app é a única fonte de upload, o corretor mantém as fotos no celular, e o master de 2560 px cobre todos os usos previstos. Guardar o original triplica o armazenamento por um cenário hipotético.

**Se você quiser preservar mesmo assim** (é uma decisão legítima, ver pergunta 5), a forma correta é:

```
properties/{propertyId}/{arquivo}.jpg           ← master 2560, servido
originals/{propertyId}/{arquivo}.orig           ← original, NUNCA servido
```

Prefixo separado, sem exposição pública, com política de expiração no MinIO (ex.: 180 dias). O que **não** se deve fazer é o que acontece hoje: guardar o original *e* apontar a URL pública para ele.

Durante a migração (seção 12) vou recomendar guardar os originais em `originals/` **de qualquer forma**, como rede de segurança, e decidir depois se apaga.

### 9.5 Miniaturas e variantes

Na opção recomendada, **não geramos variantes na ingestão**. O `next/image` já gera exatamente as larguras que o `sizes` pede, e serve WebP hoje / AVIF depois. Gerar variantes fixas duplicaria a responsabilidade.

O que **falta** é dizer ao `next/image` como se comportar:

```ts
// next.config.ts — proposta
images: {
  formats: ['image/avif', 'image/webp'],   // hoje: só webp (verificado)
  qualities: [70, 75, 85],
  minimumCacheTTL: 2592000,                // 30 dias
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2560],
  imageSizes: [96, 128, 256, 384],
  remotePatterns: [ /* remover images.unsplash.com */ ],
}
```

Detalhes de cada linha:

- **`formats` com AVIF**: verificado que o otimizador responde WebP mesmo com `Accept: image/avif` [M]. AVIF rende ~30–40% a menos que WebP na amostra. Contrapartida honesta: **AVIF é mais caro de codificar**, e o container Railway paga essa CPU na primeira requisição de cada variante. Com `minimumCacheTTL` de 30 dias e um catálogo de ~43 imóveis, isso acontece raramente — mas é preciso observar a latência da primeira requisição após deploy.
- **`minimumCacheTTL: 2592000`**: hoje o cache do otimizador expira em 4 h (herdado do `max-age` do Cloudflare). Fotos de imóvel não mudam; 30 dias elimina reotimização repetida.
- **`deviceSizes` sem 3840**: nenhum layout do site precisa de 3840 px. Remover evita que o lightbox (que hoje passa `width`/`height` intrínsecos sem `sizes`) puxe a maior variante possível.
- **Remover `images.unsplash.com`** junto com o `DEFAULT_COVER_IMAGE_URL` de estoque.

**Correção obrigatória no lightbox**: hoje ele usa `width={activeImage.width} height={activeImage.height}` sem `sizes`, o que faz o navegador escolher pela largura intrínseca (até 3840). Precisa de `sizes="90vw"` e, idealmente, `quality={85}`.

### 9.6 Cache e URLs

- URLs públicas **não mudam** na opção recomendada (ver seção 12).
- O `cache-control: max-age=14400` do Cloudflare sobre o MinIO pode subir para `max-age=31536000, immutable`, já que as chaves são únicas por upload (`nome-{timestamp36}{rand}.jpg`). Isso é configuração de regra no Cloudflare, que **já existe e já está em uso** — não é serviço novo.
- Erro de correção a observar: se a migração sobrescrever a mesma chave, o `immutable` passa a ser mentira. Ou se faz purge no Cloudflare após o backfill, ou se mantém 4 h durante a migração e sobe para 1 ano depois. Detalhado na seção 12.

### 9.7 Responsabilidades — quem faz o quê

| Camada | Responsabilidade | Não é responsabilidade |
|---|---|---|
| App mobile | Escolher fotos, ordem, alt | Redimensionar, comprimir |
| `POST /api/upload` | Validar, **normalizar**, gerar chave, persistir master, devolver `{url,width,height}` já pós-resize | Gerar variantes de entrega |
| `lib/storage.ts` | Falar com S3/MinIO + funções puras de imagem | Regra de negócio |
| MinIO + Cloudflare | Guardar e servir o master com cache longo | Redimensionar |
| `next/image` (Railway) | Larguras responsivas + WebP/AVIF + cache | Guardar |
| Componentes | `sizes` correto, proporção correta, `priority` no LCP | Saber de bucket ou de chave |

Hoje a linha "normalizar" não existe em lugar nenhum. É exatamente o buraco.

---

## 10. Opções de pipeline de mídia

### Opção A — Normalizar na ingestão, entregar com `next/image` (**recomendada**)

```
app → /api/upload → sharp(rotate, resize 2560, jpeg q82, strip EXIF)
    → MinIO (1 objeto por foto) → Cloudflare (cache longo)
    → /_next/image (WebP/AVIF, larguras do sizes) → navegador
```

**Prós**

- Uma única peça nova: a função de normalização no upload. ~40 linhas.
- **Contrato inalterado**: `UploadResponse { url, width, height, tempId, filename }` continua idêntico. O app mobile não muda uma linha.
- `PropertyImage` inalterado. Sem migração de schema.
- URLs públicas inalteradas → OG, links compartilhados no WhatsApp e o app continuam válidos.
- Ganho medido de 70% em armazenamento e redução proporcional do custo de otimização a frio.
- Reversível: se der errado, remove-se a normalização e volta ao comportamento atual.

**Contras**

- O `next/image` continua no caminho crítico: primeira requisição de cada variante paga CPU do container Railway.
- Cache do otimizador vive no filesystem do container. **[P] Preciso confirmar se há volume persistente no Railway** — se não houver, todo deploy zera o cache de imagem e as primeiras visitas pagam reotimização.
- Não resolve sozinho o `no-store` das páginas (item separado, seção 13).

**Custo operacional:** praticamente zero. `sharp` já é dependência. Nenhum serviço novo, nenhuma conta nova, nenhum custo recorrente adicional.

**Esforço:** upload ~0,5 dia · `next.config` ~0,5 h · backfill ~1 dia (script + execução + verificação).

### Opção B — Variantes pré-geradas no upload, entrega direta pelo Cloudflare

```
app → /api/upload → sharp gera 3 variantes:
        thumb.webp  (480px)
        card.webp   (1024px)
        full.webp   (2048px)  + master.jpg (2560px)
    → MinIO → Cloudflare → <img srcset> direto, sem /_next/image
```

**Prós**

- Tira o otimizador do Next do caminho: zero CPU de imagem no container.
- 100% da entrega pelo Cloudflare, com `immutable` de 1 ano.
- Latência previsível: nunca há "primeira requisição cara".

**Contras**

- 4 objetos por foto em vez de 1. Com ~920 imagens, ~3.700 objetos. [E]
- **Exige mudança de contrato**: o banco precisa guardar as variantes (novo campo JSON em `PropertyImage` ou nova tabela) → migração de schema → o app mobile e a API `serializeProperty` precisam acompanhar. Isso contradiz "não quebrar o app".
- Perde o `sizes` automático do `next/image`; a escolha de variante passa a ser código nosso em cada componente.
- Backfill obrigatório e mais pesado (gera 4 arquivos por foto, não 1).
- WebP sem fallback JPEG exclui navegadores muito antigos; com fallback, são 7 objetos por foto.

**Custo operacional:** maior. Mais objetos, mais lógica espalhada, mais coisas para dar errado quando o corretor sobe 20 fotos de uma vez.

**Esforço:** ~3–4 dias, incluindo migração de schema e ajuste coordenado do app.

### Opção C (mencionada para descarte explícito) — Serviço de imagem gerenciado

Cloudflare Images, imgix, Cloudinary. **Não recomendo e não detalho**, porque a restrição do briefing é clara e está certa: a infraestrutura atual (MinIO + Cloudflare + `next/image` + `sharp`) já entrega WebP de 44 KB. Contratar serviço pago para resolver um problema que a stack atual resolve seria trocar custo recorrente por conveniência que não falta.

### Recomendação

**Opção A.** É a menor solução que resolve o problema real (ingestão sem normalização), não toca em schema, não toca no app, e é reversível. A Opção B é a evolução correta *se e somente se* aparecer evidência de que o otimizador do Next é gargalo — e essa evidência hoje não existe: o `x-nextjs-cache: HIT` responde em 400 ms de TTFB, dos quais ~123 ms são latência de rede até Miami. [M]

Critério objetivo para reconsiderar a B: se, depois da fase 1, o p75 de TTFB de `/_next/image` passar de 800 ms ou o uso de CPU do container ficar acima de 60% durante navegação normal.

---

## 11. O vídeo do hero

### Evidência

| Fato | Medição |
|---|---|
| Peso do ecossistema YouTube na home | 1.690 KB em 25 requisições [M] |
| Detalhamento | `youtube-nocookie` 15 req/1.005 KB · `googlevideo` 1 req/585 KB · `ytimg` 1/26 KB · `google.com` 1/23 KB · `fonts.gstatic` 4/51 KB (Roboto, puxado pelo player) [M] |
| Peso do site sem ele | 457 KB em 25 requisições [M] |
| Participação no total | 79% dos bytes, 51% das requisições [M] |
| Comportamento visual — mobile | Controles do player visíveis sobre o texto do hero [M, screenshot] |
| Comportamento visual — desktop | Em uma das capturas, não carregou: hero exibiu o gradiente de fallback [M, screenshot] |
| Terceiros carregados | Google/YouTube em todas as visitas à home, com cookies do domínio `youtube-nocookie` |

Vale registrar o que **não** é o problema: o vídeo não trava a página. O TBT medido é de 20 ms, o iframe tem `loading="lazy"` e só monta no cliente após o `useEffect` decidir o breakpoint. Ele não bloqueia interatividade — ele consome banda, adiciona 25 requisições, traz terceiros e às vezes aparece quebrado.

Também vale registrar o custo que o Lighthouse **não** captura: 585 KB é só o primeiro segmento. O vídeo está em `loop`, então ele continua baixando enquanto o visitante permanece na home. Num plano de dados pré-pago em Corumbá, isso é dinheiro do visitante. [E — o consumo contínuo não foi medido, apenas o da janela de carga.]

### Alternativas avaliadas

| Opção | Peso | Veredito |
|---|---|---|
| Manter como está | 1.690 KB | Não. Custa 79% da página para um elemento decorativo instável. |
| Facade (poster + clique para tocar) | ~60 KB inicial | Bom padrão **para vídeo que alguém quer ver**. Aqui é fundo decorativo — ninguém vai clicar em "tocar o fundo". |
| MP4/WebM auto-hospedado, 6–8 s, mudo, em loop | ~400–800 KB [E] | Elimina terceiros e o player quebrado, mas ainda é a coisa mais cara da página, ainda drena bateria, e mantém o hero alto num site onde a primeira tela deveria mostrar imóvel. |
| **Imagem estática tratada + vídeo movido para `/sobre`** | **~60–90 KB** [E] | **Recomendado.** |

### Recomendação

**Remover o vídeo do hero.** Substituir por uma imagem estática única de Corumbá/Pantanal (ou uma foto de imóvel bem enquadrada), servida por `next/image` com `priority`, em AVIF/WebP a ~60–90 KB, com overlay escuro sólido em vez de gradiente triplo.

**Reaproveitar o vídeo em `/sobre`**, com facade: pôster + botão "Assistir". Ali o vídeo tem função — apresentar o corretor a quem já demonstrou interesse — e o custo é pago só por quem escolhe pagar.

Racional em uma frase: o hero de um site de corretor local existe para dizer "aqui tem imóvel e tem gente de verdade atendendo", e 1,7 MB de player do YouTube não diz nenhuma das duas coisas.

**Se você discordar** e quiser movimento no hero (é uma decisão sua, ver pergunta 1), a versão defensável é: MP4 auto-hospedado, ≤ 6 s, ≤ 500 KB, 1280×720, mudo, `playsInline`, `preload="none"`, com pôster carregado primeiro, **desativado abaixo de 768 px** e sob `prefers-reduced-motion`. Isso corta os terceiros e mantém o peso mobile em zero — que é onde está o público.

---

## 12. Riscos de compatibilidade e estratégia de migração

### 12.1 Contrato consumido pelo app mobile (verificado, sem modificar o app)

Fonte: `/mnt/Files/Projetos/app-marciliobarbosa-corretor/lib/api.ts` e `lib/types.ts`.

| Endpoint | Uso no app | Sensível a quê |
|---|---|---|
| `GET /api/stats` | teste de conexão + dashboard | forma de `StatsResponse` |
| `GET /api/imovel?…` | lista e detalhe | `PaginatedPropertiesResponse`, `{ property }` |
| `POST/PUT/DELETE /api/imovel` | wizard de cadastro | `CreatePropertyPayload`, incluindo `images[]` |
| `POST /api/upload` | `PhotoPicker` | **`UploadResponse { url, width, height, tempId, filename }`** |
| `GET /api/leads` | aba de leads | `PaginatedLeadsResponse` |
| `POST /api/ai/generate` | geração de texto | `AIGenerateResponse` |

**O ponto de acoplamento crítico é `UploadResponse.width/height`.** O `PhotoPicker` guarda esses valores e os reenvia em `images[]`; eles vão para `PropertyImage.width/height`; o `next/image` usa isso para reservar espaço. Portanto:

> Se as dimensões do arquivo mudarem e o banco não for atualizado junto, o `aspect-ratio` fica errado e o site ganha CLS.

Na Opção A isso é tratado naturalmente: a normalização acontece **antes** de `getImageDimensions`, então a resposta já devolve as dimensões pós-resize. Nada muda no app, e o dado nasce correto.

Um detalhe a não esquecer: o app envia `filename` com extensão original (`.png`, `.jpeg`). Como a normalização passa a emitir sempre JPEG, a chave precisa ter extensão `.jpg`. O app não usa `filename` para nada além de repassar — mas `POST /api/imovel` usa a `src` para derivar `tempId` via `extractTempIdFromUrl` (regex `/\/temp\/([^/]+)\//`), que **não olha extensão**. Verificado: mudar a extensão é seguro. Ainda assim, entra na matriz de testes.

### 12.2 Riscos por área

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Dimensões novas sem atualizar banco → CLS e imagem distorcida | Média | Alto | Backfill atualiza `width`/`height` na mesma transação da sobrescrita |
| Sobrescrever chave com Cloudflare cacheado 4 h → mistura de versões | Alta | Baixo | Purge por prefixo após o lote, ou aceitar janela de 4 h |
| URL de OG mudar → prévias quebradas no WhatsApp de mensagens antigas | Baixa (na Opção A) | Alto | **Manter a mesma chave.** É a razão principal de não renomear |
| Perda de qualidade perceptível | Baixa | Médio | q82 em 2560 px; validação visual lado a lado antes de rodar o lote |
| Backfill interrompido no meio | Média | Baixo | Script idempotente com marcador de progresso; reexecutável |
| App enviando PNG grande | Certa (já acontece) | Baixo | Normalização converte para JPEG; nada muda no app |
| `POST /api/imovel` falha ao mover imagem e engole o erro (`catch` + `console.error`) | Já existe | Médio | Corrigir para reportar; fora do escopo de imagem, mas apareceu na leitura |
| Ligar cache de página sem invalidação → site mostrando imóvel vendido | Alta se feito errado | Alto | ISR **junto** com `revalidateTag` nas mutações de `/api/imovel`, na mesma entrega |

### 12.3 Estratégia de migração das imagens existentes

Script único, fora do fluxo de request, idempotente:

```
para cada PropertyImage (ordenado por createdAt, em lotes de 25):
  1. HEAD na src → se já normalizada (marcador), pula
  2. GET do objeto
  3. backup → originals/{propertyId}/{arquivo}   (rede de segurança)
  4. sharp: rotate → resize 2560 inside → jpeg q82 mozjpeg → strip EXIF
  5. se novo >= 95% do original em bytes: mantém o original, marca e segue
     (imagens já pequenas não ganham nada e podem até piorar)
  6. PUT na MESMA CHAVE, mesmo Content-Type se .jpg;
     se a origem era .png/.webp → grava .jpg e ATUALIZA src no banco
  7. UPDATE PropertyImage { width, height, src? }
  8. se for a imagem de sortOrder 0 e src mudou → UPDATE Property.coverImageUrl
  9. registra em log: id, bytes antes/depois, dimensões antes/depois
após o lote completo:
 10. purge do Cloudflare por prefixo
 11. revalidatePath das rotas afetadas
```

Pontos que merecem atenção explícita:

- **Passo 6 é onde mora o trade-off.** Para os 255 JPEG (99% do acervo), a chave não muda → URL preservada → OG, links compartilhados e app intactos. Para os 2 PNG, a chave muda de `.png` para `.jpg` → **essas duas URLs quebram**. Alternativas: (a) aceitar (são 2 imagens, e a página do imóvel continua funcionando porque o banco é atualizado), ou (b) manter PNG como PNG apenas nesses casos. Recomendo (a), com verificação manual dos dois imóveis afetados.
- **Passo 5 evita regressão.** Na amostra, `img3` (1599×899, 523 KB) só cairia para 434 KB — e `img6` de 334 KB para 279 KB. Ganho pequeno com risco de perda visual: melhor pular.
- **Ordem de execução**: rodar primeiro em **um imóvel** de teste, conferir a página lado a lado com a versão anterior (screenshot antes/depois), e só então liberar o lote.
- **Reversão**: `originals/` guarda tudo. Reverter é copiar de volta e restaurar `width`/`height` do log.

**Impacto no app mobile durante e depois da migração: nenhum.** O app lê `gallery[].src` da API, que continua apontando para a mesma chave.

### 12.4 SEO e compartilhamento

O que **não pode** mudar, e não muda em nenhuma proposta deste documento:

- Slugs e as rotas `/`, `/imoveis`, `/imoveis/[categoria]`, `/imovel/[slug]`, `/sobre`, `/contato`.
- `generateMetadata` do detalhe, incluindo `robots.index` condicionado ao status.
- JSON-LD `RealEstateAgent` na home e `RealEstateListing` no detalhe.
- `sitemap.ts` e `robots.ts`.
- URLs de imagem de OG (essa é a razão de manter a chave na migração).

Dois pontos de SEO a **melhorar** de passagem, sem risco:

- `DEFAULT_SOCIAL_IMAGE` é a selfie do corretor, declarada como 1200×1200. Uma imagem de OG 1200×630 desenhada (foto + nome + CRECI + cidades) melhora a prévia no WhatsApp, que é o canal real de compartilhamento.
- `LISTINGS_SOCIAL_IMAGE = '/a.jpg'` (220 KB) é declarado como 1200×800 sem verificação de que a proporção bate.

---

## 13. Metas verificáveis

Todas medidas com o mesmo comando da seção 2, para permitir comparação direta. **São metas de laboratório**; o p75 de campo depende de instrumentação que hoje não existe **[P]**.

### 13.1 Home — mobile

| Métrica | Hoje [M] | Meta | Como se atinge |
|---|---|---|---|
| Peso total | 2.137 KB | **≤ 700 KB** | remoção do YouTube (−1.690 KB) + hero em imagem (+~80 KB) |
| Requisições | 49 | **≤ 28** | −25 de terceiro, +2 de imagem de card |
| Requisições de terceiro | 25 | **0** | nenhum terceiro na home |
| Bytes de terceiro | 1.690 KB | **0 KB** | idem |
| LCP | 3,1 s | **≤ 2,0 s** | hero estático com `priority`, ISR reduzindo TTFB |
| CLS | 0,172 | **≤ 0,05** | reserva de altura nas seções `async` |
| Speed Index | 6,0 s | **≤ 3,0 s** | consequência dos dois acima |
| TBT | 20 ms | **≤ 150 ms** | manter (já bom) |
| TTFB (Lighthouse) | 550 ms | **≤ 250 ms** | ISR + remover `force-dynamic` |
| Imagem LCP | n/d na home atual | **≤ 120 KB** | AVIF + `sizes` correto |
| Score de performance | 0,80 | **≥ 0,95** | |

### 13.2 Listagem — mobile (12 cards)

| Métrica | Hoje [M] | Meta |
|---|---|---|
| Peso total | 794 KB | **≤ 550 KB** |
| Bytes de imagem | 513 KB (10 img) | **≤ 300 KB** |
| Maior imagem | 148,7 KB | **≤ 70 KB** |
| LCP | 3,7 s | **≤ 2,2 s** |
| CLS | 0 | **manter 0** |
| Score | 0,87 | **≥ 0,95** |

### 13.3 Detalhe — mobile

| Métrica | Hoje [M] | Meta |
|---|---|---|
| Peso total | 680 KB | **≤ 600 KB** (com galeria maior, mas carga inicial menor) |
| Imagem LCP (1ª foto) | dentro dos 401 KB de imagem | **≤ 130 KB** |
| Fotos carregadas na 1ª tela | 3 (principal + 2 thumbs) | **≤ 4** (principal + 3 da tira), resto sob demanda |
| LCP | 3,4 s | **≤ 2,2 s** |
| CLS | 0 | **manter 0** |

### 13.4 Armazenamento e ingestão

| Métrica | Hoje [M/E] | Meta |
|---|---|---|
| Bucket (amostra de 257) | 210,9 MB [M] | **≤ 65 MB** (−70%) |
| Bucket (acervo completo) | ~755 MB [E] | **≤ 230 MB** [E] |
| Maior objeto | 3,56 MB [M] | **≤ 900 KB** |
| p90 | 1,95 MB [M] | **≤ 500 KB** |
| Objetos > 1 MB | 111 de 257 [M] | **0** |
| EXIF/GPS retido | sim [M] | **0** |

### 13.5 O que eu não vou prometer

- Número de Core Web Vitals de campo. Sem RUM, qualquer promessa de p75 seria invenção. **[P]** Recomendo instrumentar (`web-vitals` → endpoint próprio, ~2 KB) para ter a série real antes e depois.
- Posição no Google. As mudanças preservam e melhoram os sinais técnicos, mas ranqueamento depende de fatores fora deste plano.
- Taxa de conversão em WhatsApp. Sem medição atual de cliques, não há linha de base. Sugiro um evento simples de clique nos CTAs, gravado em `Lead` ou em log próprio.
- Ganho de LCP no primeiro acesso após deploy enquanto **[P]** a persistência do cache de imagem no Railway não estiver confirmada.

---

## 14. Plano de execução por fases

Cada fase é entregável e reversível de forma independente. Estimativas em dias de trabalho focado.

### Fase 0 — Correções sem discussão (~0,5 dia)

Defeitos, não decisões de design. Podem ir antes de tudo.

1. `tel:` com código do país nos 3 arquivos.
2. `favicon.ico`: gerar ≤ 15 KB (+ `icon.png`/`apple-icon.png` corretos).
3. Remover `priority` da foto do corretor em `PropertyContactBox`.
4. Limpar `public/`: `.eps`, `.ai` e os `Logo Fundo Sólido *.jpg` saem do repositório (arquivo de marca fica fora do `public/`).
5. `priceNote` do card: cor legível (`cinza-600` em chapa clara) + não renderizar quando redundante com o preço.
6. Remover `images.unsplash.com` do `next.config` e o `DEFAULT_COVER_IMAGE_URL` de estoque.

**Aceite:** Lighthouse não regride; `tel:` disca corretamente em Android e iOS; nenhuma capa de imóvel aponta para o Unsplash.

### Fase 1 — Quick wins de performance (~1 dia)

7. **Remover o `HeroVideoBackground`** e o CSS associado; hero passa a usar imagem estática com `priority`.
8. `next.config`: AVIF, `qualities`, `minimumCacheTTL` 30 dias, `deviceSizes` sem 3840.
9. `priority` + `fetchPriority="high"` no primeiro card de cada grade (home e listagem); `loading="lazy"` explícito no restante.
10. Corrigir o lightbox: `sizes="90vw"`, `quality={85}`.
11. Reservar altura das seções `async` da home (fallback de `Suspense` com a mesma altura do conteúdo) → ataca o CLS 0,172 diretamente.

**Aceite:** home mobile ≤ 700 KB, 0 requisições de terceiro, CLS ≤ 0,05, LCP ≤ 2,5 s.
**Reversão:** cada item é um commit isolado.

### Fase 2 — Estrutura visual e UX (~4–5 dias)

12. Tokens de cor e tipografia consolidados em `globals.css`; remoção do seletor global de serifa.
13. `PropertyCard` novo (proporção, preço em chapa, badges condicionais, hover sem translate).
14. Home reorganizada conforme seção 5.1, com fallback "6 mais recentes" quando não há `featured`.
15. `PropertySearch` unificado (hero + barra), com busca textual, contagem, chips de filtro ativo e painel mobile.
16. Detalhe reordenado conforme 6.4/6.5: galeria primeiro, proporção que respeita retrato, **tira com todas as fotos**, CTA único.
17. Um único CTA de WhatsApp por rota (FAB global oculto no detalhe).
18. `/contato`: **ou** implementar `POST /api/leads` com validação e anti-spam e ativar o formulário, **ou** remover o formulário. Não deixar prometendo.
19. `getRelatedProperties` com regra mais estreita (mesma cidade **e** mesmo tipo, com fallback por faixa de preço) e título honesto.

**Aceite:** revisão visual mobile e desktop nas 5 páginas; contraste AA em todo texto sobre foto; alvos de toque ≥ 44 px; navegação por teclado funcional na galeria.

### Fase 3 — Pipeline de ingestão (~1 dia)

20. `lib/storage.ts` ganha `normalizeImage(buffer)` (função pura, testável).
21. `POST /api/upload` passa a normalizar antes de subir e de medir dimensões.
22. Regra de extensão `.jpg` na geração de chave.
23. Teste de ponta a ponta com o app real: subir 5 fotos, criar imóvel, conferir site.

**Aceite:** foto de 3 MB entra e vira objeto ≤ 900 KB; `UploadResponse` mantém a forma; app funciona sem alteração; imóvel novo renderiza com proporção correta.

### Fase 4 — Migração do acervo (~1 dia + observação)

24. Script de backfill (seção 12.3), idempotente, com log.
25. Execução em 1 imóvel → verificação visual → lote completo.
26. Purge no Cloudflare + `revalidatePath`.
27. Elevar `cache-control` do bucket para 1 ano após estabilizar.
28. Decisão sobre `originals/`: manter com expiração ou apagar.

**Aceite:** 0 objetos > 1 MB; `width`/`height` do banco batendo com os arquivos; nenhuma URL pública quebrada (varredura das 43 páginas + sitemap); prévia de OG funcionando no WhatsApp em 3 imóveis testados.

### Fase 5 — Cache e observabilidade (~1–1,5 dia)

29. Remover `force-dynamic`/`revalidate = 0` da home; adotar ISR com tags por entidade.
30. `revalidateTag`/`revalidatePath` nos handlers `POST`/`PUT`/`DELETE` de `/api/imovel` — **entregue junto com o item 29, nunca depois**.
31. Singleton do `PrismaClient`.
32. Retirar `'use server'` de `data/services/properties.ts` (as funções são chamadas por Server Components; não precisam ser Server Actions).
33. **[P]** Confirmar volume persistente no Railway para o cache do otimizador.
34. **[P]** Instrumentação leve de Web Vitals de campo + evento de clique em WhatsApp.

**Aceite:** páginas públicas respondem com `cache-control` cacheável; alterar um imóvel pelo app reflete no site em ≤ 60 s; TTFB de página cacheada ≤ 250 ms.

---

## 15. Backlog priorizado, critérios de aceite e matriz de testes

### P0 — bloqueadores (Fases 0 e 1)

| # | Item | Aceite |
|---|---|---|
| P0-1 | Remover vídeo do hero | 0 requisições para `*.youtube*`/`*.googlevideo*` no waterfall da home |
| P0-2 | Corrigir `tel:` | `href="tel:+5567996294660"` nos 3 componentes; testado em aparelho |
| P0-3 | Favicon ≤ 15 KB | `content-length` < 15.000 e `cache-control` com `max-age` longo |
| P0-4 | CLS da home | Lighthouse mobile CLS ≤ 0,05 |
| P0-5 | AVIF + cache do otimizador | `Accept: image/avif` retorna `content-type: image/avif`; `max-age` ≥ 2.592.000 |
| P0-6 | `priority` no 1º card | LCP da listagem ≤ 2,5 s |
| P0-7 | Home nunca sem imóvel | Com `featured = 0`, a home exibe 6 imóveis recentes |
| P0-8 | `priceNote` legível e não redundante | Contraste AA; texto que repete o preço não é exibido |
| P0-9 | Sem fallback do Unsplash | Nenhum `coverImageUrl` apontando para `images.unsplash.com` |

### P1 — estrutura (Fases 2 e 3)

| # | Item | Aceite |
|---|---|---|
| P1-1 | Galeria respeitando retrato + tira completa | Imóvel com 13 fotos permite acesso às 13 sem sair da página; foto 3:4 não é recortada a 16:9 |
| P1-2 | Home reorganizada | 5 seções; primeiro imóvel visível a ≤ 700 px no mobile |
| P1-3 | Busca unificada com contagem e chips | Contagem visível em toda listagem; filtro ativo removível; busca textual funcionando |
| P1-4 | Categorias vazias ocultas | `/imoveis/apartamentos` não é linkada enquanto tiver 0 itens |
| P1-5 | Um CTA de WhatsApp por rota | Nenhuma tela com dois botões de WhatsApp sobrepostos |
| P1-6 | Normalização no upload | Foto de 3 MB → objeto ≤ 900 KB; `UploadResponse` inalterado |
| P1-7 | Contato resolvido | Formulário envia e grava `Lead`, **ou** foi removido |
| P1-8 | Tokens de cor e tipografia | Dourado só em "Oportunidade" e eyebrow; verde só em WhatsApp |
| P1-9 | Semelhantes coerentes | Casa em Corumbá não sugere prédio comercial em Ladário |

### P2 — consolidação (Fases 4 e 5)

| # | Item | Aceite |
|---|---|---|
| P2-1 | Backfill do acervo | 0 objetos > 1 MB; nenhuma URL pública quebrada |
| P2-2 | ISR + invalidação | Alteração no app reflete no site em ≤ 60 s |
| P2-3 | Singleton do Prisma | Uma instância por processo |
| P2-4 | `'use server'` removido do serviço | Funções de leitura não expostas como Server Actions |
| P2-5 | Imagem de OG desenhada | Prévia no WhatsApp com nome, CRECI e cidades |
| P2-6 | Ícones centralizados | Path do WhatsApp em 1 arquivo, não em 5 |
| P2-7 | `README.md` corrigido | Sem menção a `/admin` inexistente nem a otimização com sharp que não acontece |
| P2-8 | Web Vitals de campo | Série p75 disponível para comparação |

### Matriz de testes

**Automatizável / verificável por comando**

| Teste | Comando | Critério |
|---|---|---|
| CWV mobile (3 páginas) | Lighthouse, config da seção 2 | metas da seção 13 |
| Zero terceiros na home | agrupar `network-requests` por host | só `marciliobarbosacorretor.com.br` |
| Formato de imagem | `curl -H 'Accept: image/avif' /_next/image?…` | `content-type: image/avif` |
| Cache de página | `curl -sI` nas 4 rotas | `cache-control` cacheável |
| Tamanho dos objetos | `HEAD` em todas as `src` do sitemap | nenhum > 1 MB |
| Dimensões do banco × arquivo | script comparando `PropertyImage` com `sharp().metadata()` | 100% de correspondência |
| Rotas vivas | `curl` em todas as URLs do `sitemap.xml` | 200 em todas |
| OG | validador do Facebook/WhatsApp em 3 imóveis | imagem e título corretos |
| Build e lint | `pnpm build && pnpm lint` | sem erro |

**Manual — obrigatório**

| Teste | Onde | Critério |
|---|---|---|
| Fluxo completo do app | Android real | subir 5 fotos → criar imóvel → aparece no site com proporção certa |
| Editar imóvel pelo app | Android real | alteração reflete no site após revalidação |
| Galeria com 13+ fotos | iOS Safari + Android Chrome | acesso a todas; swipe; lightbox; teclado |
| CTA de WhatsApp do detalhe | aparelho real | abre o WhatsApp com a mensagem do imóvel |
| Ligação | aparelho real | disca `+55 67 99629-4660` |
| Filtro que zera resultados | mobile | estado vazio claro com caminho de saída |
| Imóvel sem foto | mobile | placeholder decente, sem layout quebrado |
| Rede 4G ruim | throttling "Slow 4G" | primeira foto visível em ≤ 4 s |
| Leitor de tela | TalkBack/VoiceOver na listagem e no detalhe | ordem lógica; imagens com `alt` útil |
| Antes/depois do backfill | 3 imóveis, lado a lado | sem perda de qualidade perceptível |

---

## 16. Decisões que dependem de você ou do corretor

Em ordem de impacto no plano. As oito primeiras destravam a Fase 1.

**1. Vídeo do hero — confirma a remoção?**
Recomendo remover e reaproveitar em `/sobre` com pôster + clique. Evidência: 1.690 KB, 25 requisições de terceiro, player vazando controles no mobile, não carregou no desktop numa das capturas. Se a resposta for "o corretor gosta do vídeo", a versão defensável está no fim da seção 11 — mas ela é pior que a imagem estática em todos os eixos exceto gosto pessoal.

**2. A foto do corretor.**
A selfie de óculos escuros na piscina é hoje a imagem institucional **e** a imagem de Open Graph do site. Para um objetivo que é "confiar no corretor", uma foto em contexto de trabalho renderia mais. É decisão dele, não minha — mas é a mudança de maior impacto na percepção de confiança que não envolve uma linha de código.

**3. Tipografia — duas famílias ou uma?**
Opção A mantém Fraunces restrito a H1/H2 (mantém os 84 KB de fonte). Opção B usa só Inter (−48 KB, visual mais neutro). Recomendo A: o serif dá o "editorial" pedido, desde que disciplinado.

**4. Categorias vazias.**
"Apartamentos" tem 0 imóveis e "Aluguel" tem 1. Proponho **ocultar automaticamente** categorias vazias da navegação e da home. A alternativa é o corretor cadastrar imóveis nesses eixos. Qual dos dois?

**5. Guardar o original das fotos?**
Recomendo não guardar (master de 2560 px cobre todo uso previsto). Se preferir guardar, vai para `originals/`, nunca servido, com expiração. Isso muda a estimativa de armazenamento de ~230 MB para ~985 MB. [E]

**6. Formulário de contato — ativar ou remover?**
Hoje ele existe sem botão, com aviso de "em breve", e `/api/leads` não tem POST. Ativar custa ~0,5 dia (validação + anti-spam + gravação em `Lead`, que o app já lê). Remover custa 10 minutos. Não recomendo deixar como está.

**7. Featured: campo ou automático?**
A home hoje depende de `featured = true` e não há nenhum marcado. Proponho um fallback automático (6 mais recentes) **e** manter o campo para quando o corretor quiser destacar. Ele vai usar esse campo no app? Se não for usar, o fallback vira a regra única e o campo some da interface.

**8. Janela de manutenção para o backfill.**
São ~920 imagens, ~40 min de execução [E]. Nesse período convivem versões antigas e novas no cache do Cloudflare (4 h de `max-age`). Prefere rodar de madrugada com purge no fim, ou aceitar a janela de propagação?

**Verificações técnicas que preciso fazer antes da Fase 5 [P]:**

- Existe volume persistente no Railway para o cache do otimizador de imagem? Se não, todo deploy zera o cache e as primeiras visitas pagam reotimização — e isso muda a prioridade da Opção B da seção 10.
- Há acesso à API do Cloudflare para purge programático do bucket de mídia?
- Qual o custo atual de armazenamento MinIO? Se for irrelevante, a economia de 530 MB vale pelo tempo de otimização, não pela conta — e o argumento muda de tom.
