# Projeto Teste

Aplicação full-stack para autenticação, cadastro de usuários, painel administrativo, gerenciamento de produtos e persistência de preferências do usuário, como tema e último login.

## Stack principal

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express
- Banco de dados: PostgreSQL com Prisma
- Autenticação: bcryptjs
- UI e animações: CSS customizado, React Icons e transições visuais

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
├── tsconfig.app.json
├── tsconfig.node.json
├── eslint.config.js
├── .gitignore
├── README.md
└── index.html
```

## Requisitos

- Node.js 18+
- npm
- PostgreSQL configurado e acessível
- URL válida para conexão do Prisma

## Instalação

1. Clone o repositório:

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

4. Volte para a raiz do projeto:

```bash
cd ..
```

## Configuração do ambiente

Crie um arquivo `.env` dentro da pasta `backTeste` com a URL do banco PostgreSQL:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
```

Exemplo:

```env
DATABASE_URL="postgresql://postgres:senha@ep-exemplo.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

> Esse arquivo não deve ser enviado para o GitHub.

## Como rodar o projeto

### Backend

Dentro de `backTeste`:

```bash
npm run dev
```

A API fica disponível em:

```bash
http://localhost:3000
```

### Frontend

Na raiz do projeto:

```bash
npm run dev
```

A interface da aplicação fica disponível em:

```bash
http://localhost:5173
```

## Prisma

Se for a primeira vez ou depois de alterar o schema do banco, execute:

```bash
cd backTeste
npx prisma migrate dev
npx prisma generate
```

Esses comandos aplicam as migrações e geram o cliente Prisma atualizado.

## Build de produção

Na raiz do projeto:

```bash
npm run build
```

## Funcionalidades principais

- login com validação de e-mail e senha
- logout com animação e transição visual
- lembrar último login salvo no banco
- tema escuro e claro persistido por usuário
- painel administrativo para usuários e produtos
- cadastro e listagem de produtos
- upload de imagem em base64 com suporte de payload maior no backend

## Observações importantes

- O backend e o frontend precisam rodar ao mesmo tempo durante o uso da aplicação.
- O admin pode ser criado automaticamente pela lógica da aplicação, se ainda não existir.
- O tema e o último usuário são persistidos no banco, não no localStorage.
- Credenciais e URLs do banco devem permanecer apenas no ambiente local.

## Segurança

- Variáveis de ambiente ficam em `.env`.
- Arquivos sensíveis e temporários são ignorados pelo `.gitignore`.
- Não compartilhe credenciais de banco, senhas ou tokens em repositórios públicos.
