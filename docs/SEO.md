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

Já implementado. Funcionamento:

- A chave é servida em `/indexnow-key.txt`.
- Toda vez que um imóvel é criado, editado ou removido pela API
  (`/api/imovel`), o site notifica o IndexNow com as URLs afetadas.
- Para reenviar o site inteiro (primeira publicação, troca de domínio, ou
  quando a chave foi configurada depois do acervo já estar no ar):

```bash
curl -X POST https://marciliobarbosacorretor.com.br/api/indexnow \
  -H "Authorization: Bearer $API_PASSWORD"
```

A resposta traz `status`. `200` ou `202` significa aceito; `403` é chave
inválida; `422` é host que não bate com a chave.

O Google **não** participa do IndexNow. Lá a atualização continua vindo do
sitemap e do Search Console.

---

## 4. Informações que ainda faltam

Estas ficam em `src/lib/constants.ts`. Cada campo vazio é simplesmente omitido
do JSON-LD — schema com campo inventado é pior que schema incompleto, porque o
buscador trata como dado errado.

| Constante | O que é | Por que importa |
|---|---|---|
| `BROKER_STREET_ADDRESS` | Endereço do escritório/atendimento | Sem endereço, o Google não consegue tratar o negócio como local e não mostra no mapa |
| `BROKER_POSTAL_CODE` | CEP desse endereço | Idem |
| `BROKER_LATITUDE` / `BROKER_LONGITUDE` | Coordenadas do escritório | Melhora buscas do tipo "corretor perto de mim" |
| `BROKER_SOCIAL_PROFILES` | Instagram, Facebook, YouTube, perfil do Google | É por `sameAs` que o buscador confirma que site e perfis são a mesma pessoa — um dos sinais mais fortes de identidade |
| `BROKER_OPENING_HOURS` | Horário de atendimento | Aparece direto no resultado ("Aberto agora") |
| `BROKER_FOUNDING_YEAR` | Ano em que começou a atuar | Sinal de tempo de atuação |

Se o atendimento não tem endereço fixo, deixe `BROKER_STREET_ADDRESS` vazio —
é melhor que um endereço aproximado.

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
