# Marcílio Barbosa – Corretor de Imóveis

Plataforma imobiliária full-stack focada em conversão local e SEO, desenvolvida sob medida para a operação de um corretor de imóveis em Corumbá-MS e Ladário-MS.

## Contexto do Projeto

Este projeto nasceu de uma necessidade real e muito próxima: foi desenvolvido sob medida para o meu pai, que também se chama Marcílio Barbosa e atua como corretor de imóveis. 

Como ele não é um usuário avançado de tecnologia, a plataforma foge da complexidade de um SaaS genérico ou de painéis confusos. O objetivo foi construir uma ferramenta de trabalho prática: apresentar os imóveis com alta qualidade visual, rankear bem no Google (SEO local) e converter visitantes em contatos no WhatsApp com o menor atrito possível.

A aplicação inclui tanto o site público, otimizado para o usuário final, quanto uma área administrativa focada em simplicidade extrema para o cadastro de imóveis.

## Arquitetura e Decisões Técnicas

Para garantir performance e SEO, o frontend e o backend coexistem no mesmo repositório, utilizando **Next.js (App Router)** com uma abordagem **Server-first (SSR)**.

- **Frontend Público:** Componentes renderizados no servidor por padrão. Client Components são usados cirurgicamente apenas onde há real necessidade de interatividade (ex: galerias de imagens, filtros interativos, menu mobile). Estilização via Tailwind CSS v4.
- **Backend Integrado:** Route Handlers (`app/api/`) para endpoints HTTP e Server Actions/Services para a lógica de negócio interna.
- **Banco de Dados:** **PostgreSQL** com **Prisma ORM** como fonte da verdade para dados de negócio (imóveis, categorias, metadados).
- **Armazenamento de Mídia:** **MinIO** (arquitetura compatível com S3) para armazenar fotos e arquivos originais, mantendo o banco de dados leve (armazenando apenas metadados e caminhos).
- **Processamento de Imagens:** Utilização de `sharp` para otimização em tempo de execução e upload.
- **Otimização de Conteúdo com IA:** Para contornar a dificuldade em escrever textos comerciais, integrei a API da OpenAI no processo de cadastro. Meu pai apenas insere os dados brutos (tamanho, quartos, bairro), e a inteligência artificial gera as descrições atrativas e os atributos técnicos prontos para publicação.

## Estrutura Principal

O repositório segue um modelo de separação clara de responsabilidades:

- `src/app/`: Rotas da aplicação (públicas como `/imoveis`, `/contato` e privadas na pasta `/admin`).
- `src/components/`: Componentes de UI isolados (exclusivos para renderização).
- `src/data/`: Camada de serviços e repositórios. Interações com o Prisma e o MinIO ficam restritas a este nível para não vazar lógica de infraestrutura nos componentes.
- `src/lib/`: Utilitários puros e integrações de terceiros.

## Como Executar Localmente

### Pré-requisitos
- Node.js 20+ ou pnpm (gerenciador oficial do projeto)
- PostgreSQL rodando localmente (ou via Docker)
- Instância do MinIO configurada

### Passo a passo

1. **Instale as dependências:**
```bash
pnpm install
```

2. **Configure as variáveis de ambiente:**
Crie um arquivo `.env` na raiz do projeto com base no escopo necessário:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_ACCESS_KEY="sua-key"
MINIO_SECRET_KEY="seu-secret"
MINIO_BUCKET="imoveis"
```

3. **Inicie o banco de dados:**
```bash
pnpm prisma generate
pnpm prisma db push
```
*(Opcionalmente, pode rodar o seed via `pnpm prisma db seed` caso esteja configurado)*

4. **Inicie o servidor de desenvolvimento:**
```bash
pnpm dev
```
Acesse `http://localhost:3000`.

## Aprendizados

O maior desafio (e acerto) deste projeto foi resistir à tentação de adotar o modelo SPA completo ou frameworks muito abstratos de CMS. Manter a renderização no servidor (SSR) simplificou imensamente a entrega de metadados dinâmicos para SEO e WhatsApp (Open Graph). A separação rígida entre a camada de apresentação (`components`) e a camada de acesso a dados (`services`) tem se provado essencial para permitir que o painel administrativo e o site público consumam a mesma lógica sem duplicação ou gargalos de segurança.
