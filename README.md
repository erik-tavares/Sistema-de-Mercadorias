# Projeto Teste

Aplicação full-stack com frontend em React + TypeScript + Vite e backend em Node.js + Express + Prisma + PostgreSQL.

## Tecnologias

- Frontend: React, TypeScript, Vite
- Backend: Node.js, Express
- Banco: PostgreSQL com Prisma
- Autenticação: bcryptjs
- UI: React Icons + CSS customizado

## Estrutura do projeto

```bash
.
├── backTeste/
│   ├── prisma/
│   ├── src/
│   ├── .env
│   ├── package.json
│   └── ...
├── src/
├── public/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .gitignore
└── README.md
```

## Requisitos

- Node.js 18+
- npm
- Banco PostgreSQL configurado

## Instalação

1. Clone o projeto e acesse a pasta raiz:

```bash
git clone <url-do-repositorio>
cd projetoteste
```

2. Instale as dependências do frontend:

```bash
npm install
```

3. Instale as dependências do backend:

```bash
cd backTeste
npm install
```

## Configuração do ambiente

Crie o arquivo `.env` dentro da pasta `backTeste` com a URL do banco PostgreSQL:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
```

Exemplo:

```env
DATABASE_URL="postgresql://postgres:senha@ep-exemplo.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

> Esse arquivo não deve ser enviado para o GitHub.

## Inicialização do backend

Dentro de `backTeste`:

```bash
npm run dev
```

O backend será iniciado em:

```bash
http://localhost:3000
```

## Inicialização do frontend

Na raiz do projeto:

```bash
npm run dev
```

O frontend será iniciado em:

```bash
http://localhost:5173
```

## Prisma

Se for a primeira vez ou após alterar o schema:

```bash
cd backTeste
npx prisma migrate dev
npx prisma generate
```

## Build de produção

Frontend:

```bash
npm run build
```

## Observações

- O backend e o frontend precisam estar rodando simultaneamente.
- O admin é criado automaticamente ao iniciar a aplicação, se ainda não existir.
- As credenciais e URLs do banco ficam em variáveis de ambiente e não devem ser expostas publicamente.
