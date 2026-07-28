# SEO — como o site é indexado e o que falta preencher

Este documento descreve o que já está implementado, o que precisa ser
configurado uma única vez e quais informações ainda faltam para o site
ranquear melhor.

---

## 1. Variáveis de ambiente

Acrescente ao `.env`:

```env
# Obrigatória. Todas as URLs canônicas, o sitemap, o Open Graph e o JSON-LD
# derivam daqui. Sem barra no fim.
NEXT_PUBLIC_SITE_URL="https://marciliobarbosacorretor.com.br"

# Verificação de propriedade do domínio. Cole o código que o Search Console e o
# Bing Webmaster Tools fornecem no método "tag HTML".
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=""
NEXT_PUBLIC_BING_SITE_VERIFICATION=""

# IndexNow. Qualquer string entre 8 e 128 caracteres hexadecimais gerada por
# você (ex.: saída de `openssl rand -hex 16`). Serve como senha que prova ao
# buscador que o site é seu.
INDEXNOW_KEY=""
```

Esta outra **já existe** no projeto e é usada pelos comandos mais adiante:

```env
# Senha das rotas de escrita: /api/imovel, /api/upload, /api/leads, /api/stats,
# /api/user, /api/ai/generate e /api/indexnow. É a mesma que o app mobile usa
# para cadastrar imóvel — se o app cadastra hoje, ela já está configurada.
API_PASSWORD=""
```

Todas ficam nas variáveis de ambiente do Railway. Nenhuma vai para o
repositório: `.env*` está no `.gitignore`, e é assim que deve continuar — quem
tivesse acesso ao código poderia cadastrar e apagar imóveis.

`NEXT_PUBLIC_SITE_URL` precisa existir **no build e no runtime**: ela entra no
HTML gerado.

---

## 2. Cadastro nas ferramentas de webmaster (fazer uma vez)

| Ferramenta | Para quê | Onde |
|---|---|---|
| Google Search Console | Ver o que indexou, pedir indexação, acompanhar posições | search.google.com/search-console |
| Bing Webmaster Tools | Alimenta Bing, DuckDuckGo, Ecosia e Yahoo | bing.com/webmasters |
| Perfil da Empresa no Google | Aparecer no mapa e no painel lateral | business.google.com |

Passos:

1. Adicione a propriedade `https://marciliobarbosacorretor.com.br`.
2. Verifique com o código nas variáveis acima e faça um novo deploy.
3. Envie o sitemap: `https://marciliobarbosacorretor.com.br/sitemap.xml`.

**Sobre o DuckDuckGo:** ele não tem envio próprio nem robô de indexação de
conteúdo — o índice dele vem do Bing. Então indexar no DuckDuckGo é, na
prática, indexar no Bing. Isso já acontece automaticamente pelo IndexNow (ver
abaixo) e pelo sitemap enviado ao Bing Webmaster Tools.

O **Perfil da Empresa no Google** é o maior ganho isolado que ainda falta, e não
é código: para busca local ("corretor de imóveis em Corumbá"), o painel do mapa
aparece acima dos resultados normais. O site já declara o corretor como
`RealEstateAgent` em JSON-LD, o que ajuda o Google a casar o site com o perfil —
mas o perfil precisa existir.

---

## 3. IndexNow (Bing, DuckDuckGo, Yandex, Yep)

É um protocolo aberto: em vez de esperar o robô do buscador passar pelo site
(o que pode levar dias ou semanas), o site avisa que uma página mudou. Um único
envio notifica Bing, DuckDuckGo, Yandex, Seznam, Naver e Yep de uma vez.

A chave (`INDEXNOW_KEY`) funciona como senha: o site publica a chave num
arquivo de texto, e o buscador baixa esse arquivo para conferir que quem
notificou realmente controla o domínio. Ela precisa ter de 8 a 128 caracteres
entre `a-z`, `A-Z`, `0-9` e hífen.

Funcionamento neste site:

- A chave é servida em dois lugares: `/indexnow-key.txt` (caminho fixo, enviado
  no campo `keyLocation` de cada notificação) e `/{chave}.txt` na raiz, que é a
  forma recomendada pela especificação.
- Toda vez que um imóvel é criado, editado ou removido pela API
  (`/api/imovel`), o site notifica o IndexNow com as URLs afetadas.
- Para reenviar o site inteiro (primeira publicação, troca de domínio, ou
  quando a chave foi configurada depois do acervo já estar no ar):

```bash
curl -X POST https://marciliobarbosacorretor.com.br/api/indexnow \
  -H "Authorization: Bearer COLE_AQUI_A_API_PASSWORD"
```

O valor é o da variável `API_PASSWORD` no Railway (ver seção 1). Cole o valor
literal entre aspas simples — **não** use `$API_PASSWORD`: essa sintaxe só
funciona se a variável estiver exportada no seu terminal, e senão o shell troca
por vazio antes do curl rodar, mandando `Bearer` sem senha nenhuma.

Se der erro, a resposta diz qual dos casos é:

| Resposta | O que fazer |
|---|---|
| `Falta o cabeçalho de autorização` | Faltou o `-H "Authorization: ..."` |
| `O cabeçalho chegou sem senha depois de "Bearer"` | É o `$VAR` vazio — cole o valor literal |
| `Senha incorreta` | Confira a `API_PASSWORD` no Railway |
| `API_PASSWORD não está configurada no servidor` (503) | A variável não chegou ao runtime; defina e faça novo deploy |
| `{"ok": true}` | Aceito |

**Teste rápido, sem senha:** abra `/indexnow-key.txt` no navegador. Se mostrar a
chave, as variáveis chegaram ao servidor. Se der 404, a `INDEXNOW_KEY` não está
no runtime — normalmente falta um redeploy depois de adicionar as variáveis.

A resposta traz `status`:

| Código | Significado |
|---|---|
| 200 | URLs recebidas |
| 202 | Recebidas, validação da chave pendente |
| 400 | Formato inválido |
| 403 | Chave inválida (arquivo não encontrado, ou chave não confere) |
| 422 | URLs não pertencem ao domínio, ou chave fora do formato |
| 429 | Envios demais — esperar |

O Google **não** participa do IndexNow. Lá a atualização continua vindo do
sitemap e do Search Console.

---

## 4. Informações que ainda faltam

Estas ficam em `src/lib/constants.ts`. Cada campo vazio é simplesmente omitido
do JSON-LD — schema com campo inventado é pior que schema incompleto, porque o
buscador trata como dado errado.

| Constante | Situação |
|---|---|
| `BROKER_POSTAL_CODE` | ✅ `79311-030` |
| `BROKER_LATITUDE` / `BROKER_LONGITUDE` | ✅ `-19.0249553` / `-57.6424487` |
| `BROKER_SOCIAL_PROFILES` | ✅ Facebook e Instagram |
| `BROKER_OPENING_HOURS` | ✅ Seg–sex 07:00–17:00, sáb 07:00–12:00 |
| `BROKER_FOUNDING_YEAR` | ✅ `2016` |
| `BROKER_STREET_ADDRESS` | ✅ Rua Marechal Antônio Maria Coelho, 3213 |

Todos os campos da ficha de negócio local estão preenchidos.

### Falta também no conteúdo

1. **Fotos com legenda descritiva.** O campo `alt` de cada imagem já vai para o
   sitemap de imagens. "Fachada da casa com garagem para 2 carros" rende busca;
   "IMG_2043" não rende nada.

2. **Bairro preenchido sempre que possível.** Bairro é o termo mais buscado
   depois da cidade ("casa no Centro de Corumbá") e entra no title, na descrição
   e no JSON-LD. O site já se protege quando falta (ver abaixo), mas o imóvel
   sem bairro simplesmente não disputa essas buscas.

3. **Descrição longa de verdade em cada imóvel.** Quando `longDescription` fica
   igual à curta, a página do imóvel tem pouco texto próprio e compete mal.

4. **O formulário de `/contato` não envia nada.** Ele mostra "será ativado em
   breve". Já existe `POST /api/leads`; ligar os dois fecha uma lacuna que hoje
   é um caminho morto para quem prefere formulário a WhatsApp.

5. **Páginas por bairro.** Hoje há páginas por cidade, por tipo e por
   combinação. Os bairros com acervo recorrente renderiam páginas próprias com
   busca ainda mais específica. Vale quando houver volume de imóveis suficiente
   para a página não nascer vazia.

---

## 4.1. Bairro: o que o site faz sozinho

O cadastro grava `"A definir"` quando o bairro não é informado. Isso é rótulo de
ausência, não um bairro — e antes vazava para o Google: o título do resultado
saía como *"Casa à venda em A definir, Corumbá-MS"*.

Três coisas passaram a acontecer sem intervenção:

**1. Imóvel sem bairro não anuncia bairro.** Título, descrição, palavras-chave,
JSON-LD, cards e a página do imóvel caem para a cidade quando o bairro não
existe. O anúncio fica com menos alcance, mas nunca com texto quebrado.

**2. A grafia é unificada na gravação.** Digitar `CENTRO`, `centro` ou
`  Centro  ` grava `Centro` se esse bairro já existir no acervo — a comparação
ignora acento, caixa e espaço extra. Sem isso, "Nova Corumbá" e "nova corumba"
virariam dois bairros: o resumo das páginas listaria os dois e a busca por
bairro encontraria metade dos imóveis. A primeira vez que um bairro é digitado
define a grafia; as próximas seguem.

**3. `GET /api/bairros` devolve os bairros já usados**, opcionalmente filtrados
por `?cidade=corumba` ou `?cidade=ladario`. Serve para o app mobile mostrar uma
lista para tocar em vez de um campo para digitar. A lista sai do próprio banco —
nenhum nome inventado — e melhora sozinha conforme o acervo cresce.

```bash
curl "https://marciliobarbosacorretor.com.br/api/bairros?cidade=corumba"
# {"cidade":"corumba","total":4,"neighborhoods":["Centro","Cristo Redentor",...]}
```

O passo que ainda depende do app: trocar o campo de texto por um seletor
alimentado por esse endpoint, com opção de digitar um bairro novo.

---

## 4.1.1. Vídeo do hero — decisão tomada, não pendência

O embed do YouTube no fundo da home responde por ~1,6 MB dos 2,4 MB que a
página baixa no celular. Uma auditoria externa pediu para removê-lo ou trocá-lo
por um facade com botão de play.

**Fica como está, por decisão do dono do site:** o vídeo é um dos poucos
elementos que dão identidade visual à página, e isso não se mede em bytes.

Se em algum momento o custo passar a doer, as alternativas em ordem de menor
impacto visual são: (1) manter o vídeo só em desktop, deixando o gradiente — que
já é o fallback — no celular; (2) trocar o vídeo por uma imagem estática do
Pantanal em telas pequenas; (3) facade com clique. Nenhuma delas deve ser
aplicada sem combinar antes.

Mitigações que já existem e devem ser preservadas: o iframe só monta depois do
primeiro paint (`requestIdleCallback`), não monta quando o visitante pede menos
animação (`prefers-reduced-motion`) nem quando o navegador declara economia de
dados (`saveData`), e só aparece depois que o player confirma que está tocando.

---

## 4.2. Fora do código — só o dono resolve

| O quê | Por quê |
|---|---|
| **Domínio `www`** | `www.marciliobarbosacorretor.com.br` responde **404 da Vercel** (`x-vercel-error: DEPLOYMENT_NOT_FOUND`). É um CNAME órfão apontando para um deploy que não existe mais; o site real está no Railway. Todo link externo, cartão de visita ou citação com `www` perde 100% do tráfego e não transfere autoridade. Remover o CNAME no provedor de DNS e criar 301 de `www` para o domínio sem `www`. |
| **Perfil da Empresa no Google** | Maior alavanca de busca local que existe e não é código. Configurar como *service-area business* (Corumbá e Ladário), categoria "Corretor de imóveis", NAP idêntico ao site. Depois: colar a URL do perfil em `BROKER_SOCIAL_PROFILES` para entrar no `sameAs`. |
| **Avaliações** | Enviar o link de avaliação por WhatsApp após cada negócio fechado. Cadência constante pesa mais que volume de uma vez. |
| **Brotli** | O servidor entrega gzip mesmo quando o navegador aceita `br`. É configuração de hospedagem. |

### ⚠️ Endereço no JSON-LD

O site declara `Rua Marechal Antônio Maria Coelho, 3213, Corumbá-MS, 79311-030`
no JSON-LD, mas **nenhuma página exibe esse endereço ao visitante**. Se for
endereço residencial, vale decidir conscientemente se deve ficar público — o
JSON-LD é lido por qualquer robô, e o Perfil da Empresa tornaria isso ainda
mais visível. Alternativa: manter só cidade, estado e CEP (basta esvaziar
`BROKER_STREET_ADDRESS`) e configurar o GBP como negócio de área de
atendimento, sem endereço exibido.

---

## 5. O que já está implementado

**Rastreamento e descoberta**
- `robots.txt` com `/api/` bloqueado e robôs de IA liberados explicitamente
- `sitemap.xml` dinâmico com sitemap de imagens embutido
- `feed.xml` (RSS) dos imóveis recentes, declarado no `<head>`
- IndexNow automático a cada mudança de imóvel
- `manifest.webmanifest`

**Status HTTP correto (soft 404)**
- Imóvel removido ou URL digitada errada responde **404 de verdade**, não 200.
  Antes o site mostrava a tela "Página não encontrada" mas afirmava 200 OK, e o
  buscador indexava cada URL errada como página válida. A causa eram os
  arquivos `loading.tsx` dessas rotas: ao enviar o esqueleto imediatamente, o
  status ficava travado em 200 antes de o código descobrir que o imóvel não
  existia.
- Categoria inexistente é barrada em `src/middleware.ts`, que roda antes do
  envio da resposta. A página de categoria lê filtros da URL, então é sempre
  dinâmica e não conseguiria corrigir o status por conta própria.

**Controle de indexação**
- `max-image-preview:large` em todo o site — é o que faz o Google exibir a foto
  grande ao lado do resultado, em vez da miniatura
- URL canônica em toda página, com a paginação apontando para si mesma
- Páginas filtradas e ordenadas marcadas como `noindex, follow`, para o robô
  gastar a cota nas páginas de imóvel e não em combinações de filtro
- Imóvel vendido ou alugado sai do índice automaticamente

**Dados estruturados (JSON-LD)**
- `RealEstateAgent` + `WebSite` no site inteiro, com `@id` estável
- `BreadcrumbList` em toda página com trilha
- `RealEstateListing` completo no imóvel: oferta, disponibilidade, endereço,
  coordenadas, metragem, quartos, banheiros, vagas, comodidades e galeria
- `CollectionPage` + `ItemList` nas páginas de catálogo
- `AboutPage` + `Person` e `ContactPage`

**Páginas de busca combinada**
- 15 páginas para as buscas que as pessoas realmente digitam: "casas à venda em
  Corumbá MS", "terrenos à venda em Corumbá", "imóveis para alugar em Ladário".
  Antes essas combinações existiam só como filtro na URL, que é marcado como
  não-indexável de propósito.
- Definidas em `COMBOS`, em `src/lib/constants.ts`. Cada uma vira uma categoria
  normal: entra no sitemap, na trilha e nos dados estruturados sem código novo.
  Para criar outra, basta acrescentar uma entrada.
- **Combinação sem nenhum imóvel não é indexada.** A página continua no ar com
  o convite para chamar no WhatsApp, mas não se apresenta ao buscador e fica
  fora do sitemap — página de catálogo vazia atrai visita que sai na hora, e
  isso derruba a página. Cadastrou o primeiro imóvel do perfil, ela se liga
  sozinha.
- Cada página abre com um resumo gerado do acervo real ("5 imóveis disponíveis
  em Corumbá-MS, de R$ 95.000 a R$ 750.000, nos bairros Centro, ..."), que é o
  que impede páginas parecidas de terem texto idêntico.
- Bloco "Buscas relacionadas" no rodapé de cada categoria e "Buscas mais
  procuradas" em `/imoveis`: as páginas novas não estão no menu, e página que
  nenhuma outra referencia é lida como pouco importante.

**Desempenho e cache**
- Fichas de imóvel servidas do cache (`s-maxage=600`), em vez de `no-store` a
  cada visita. Detalhe que custou medição: `revalidate` sozinho **não** liga o
  ISR numa rota com parâmetro dinâmico — é preciso declarar
  `generateStaticParams`. Devolvendo lista vazia, a rota entra no pipeline
  estático sem pré-renderizar nada no build, então o build segue rodando sem
  banco.
- `/imoveis/[categoria]` continua dinâmica: ela lê filtros da URL
  (`searchParams`), e isso impede o cache de página. O cache de dados
  (`unstable_cache`) já cobre a parte cara.

**Segurança e conformidade**
- `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy` e `Permissions-Policy` na origem.
- `/privacidade` publicada, linkada no rodapé e ao lado do formulário de
  contato. Sem ela, ativar o formulário seria coletar dado pessoal sem base
  legal declarada.

**Conteúdo**
- Titles e descrições por categoria, escritos na forma como a busca local é
  digitada
- Title do imóvel com tipo, finalidade, bairro, cidade e preço
- Links internos da página do imóvel para a cidade e o tipo correspondentes
- Página 404 com atalhos, em vez de beco sem saída
