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
  -H "Authorization: Bearer $API_PASSWORD"
```

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
| `BROKER_POSTAL_CODE` | ✅ `79304-070` |
| `BROKER_LATITUDE` / `BROKER_LONGITUDE` | ✅ `-19.0249553` / `-57.6424487` |
| `BROKER_SOCIAL_PROFILES` | ✅ Facebook e Instagram |
| `BROKER_OPENING_HOURS` | ✅ Segunda a sexta, 07:00–17:00 — **confirmar se atende sábado** |
| `BROKER_FOUNDING_YEAR` | ✅ `2016` |
| `BROKER_STREET_ADDRESS` | ⬜ **Falta:** logradouro e número |

**Sobre o logradouro:** as coordenadas caem na Rua Marechal Antônio Maria
Coelho, bairro Cristo Redentor, em Corumbá. Falta o número. Enquanto estiver em
branco, o site declara cidade, estado e CEP — o que já situa o negócio na
região — e omite a rua, porque meio endereço faz o buscador tentar casar com um
ponto no mapa e errar.

Vale conferir o CEP: `79304-070` e o bairro Cristo Redentor não parecem bater
(a base pública de endereços aponta `79311-030` para aquele trecho da rua).

### Falta também no conteúdo

1. **Fotos com legenda descritiva.** O campo `alt` de cada imagem já vai para o
   sitemap de imagens. "Fachada da casa com garagem para 2 carros" rende busca;
   "IMG_2043" não rende nada.

2. **Bairro sempre preenchido.** Hoje o cadastro aceita `"A definir"` como
   padrão. Bairro é o termo mais buscado depois da cidade ("casa no Centro de
   Corumbá"), e entra no title, na descrição e no JSON-LD.

3. **Descrição longa de verdade em cada imóvel.** Quando `longDescription` fica
   igual à curta, a página do imóvel tem pouco texto próprio e compete mal.

4. **O formulário de `/contato` não envia nada.** Ele mostra "será ativado em
   breve". Já existe `POST /api/leads`; ligar os dois fecha uma lacuna que hoje
   é um caminho morto para quem prefere formulário a WhatsApp.

5. **Páginas por bairro.** Hoje há páginas por cidade e por tipo. Os bairros com
   acervo recorrente (Centro, Popular, Nova Corumbá, Cristo Redentor) renderiam
   páginas próprias com busca bem mais específica. Vale quando houver volume de
   imóveis suficiente para a página não nascer vazia.

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

**Conteúdo**
- Titles e descrições por categoria, escritos na forma como a busca local é
  digitada
- Title do imóvel com tipo, finalidade, bairro, cidade e preço
- Links internos da página do imóvel para a cidade e o tipo correspondentes
- Página 404 com atalhos, em vez de beco sem saída
