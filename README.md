# Portal de Solicitações Internas 🚀

Sistema completo para gestão de solicitações internas (chamados) desenvolvido com Node.js, Express, TypeScript, PostgreSQL e React (Vite) + Tailwind CSS.

---

## 🌐 Acesso ao Ambiente de Produção

A aplicação está hospedada e operacional em ambiente de nuvem:

- **Frontend (Vercel):** [https://portal-solicitacoes.vercel.app](https://portal-solicitacoes.vercel.app) *(substitua pela sua URL final)*
- **Backend API (Render):** [https://portal-api.onrender.com/api/health](https://portal-api.onrender.com/api/health) *(substitua pela sua URL final)*

### 🔑 Credenciais de Produção:
- **Admin:** `admin@empresa.com` | **Senha:** `Senha@123`
- **Solicitante:** `joao.silva@empresa.com` | **Senha:** `Senha@123`

---

## 🛠️ Stack Tecnológica

- **Backend:** Node.js, Express, TypeScript, Zod, JWT, Bcrypt, `pg` (PostgreSQL Driver).
- **Banco de Dados:** PostgreSQL 15+.
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Axios, React Router DOM v6.
- **Infraestrutura e Testes:** Docker, Docker Compose, Jest, GitHub Actions (CI/CD).

---

## 📋 Pré-requisitos

Para rodar a aplicação localmente, você precisará de:

- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)
- *(Opcional para execução sem Docker)* Node.js 20+ e PostgreSQL 15+ instalados localmente.

---

## 🚀 Como Executar com Docker Compose (Recomendado)

1. **Clone o repositório:**
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd teste_morgan
   ```

2. **Crie os arquivos de ambiente (se necessário):**
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. **Inicie os containers com Docker Compose:**
   ```bash
   docker-compose up --build
   ```

4. **Acesse as aplicações no navegador:**
   - **Frontend:** [http://localhost:5173](http://localhost:5173)
   - **Backend API (Healthcheck):** [http://localhost:3000/api/health](http://localhost:3000/api/health)
   - **PostgreSQL:** `localhost:5432`

---

## 🔑 Credenciais para Teste (Seed Inicial)

O banco de dados é populado automaticamente na inicialização com o script de seed:

| Perfil | E-mail | Senha | Permissões |
|---|---|---|---|
| **Usuário Solicitante** | `joao.silva@empresa.com` | `Senha@123` | Criar, visualizar, editar/excluir próprias solicitações 'Abertas'. |
| **Administrador** | `admin@empresa.com` | `Senha@123` | Acesso total + Alterar status de qualquer solicitação. |

---

## 💻 Como Executar Localmente sem Docker

### 1. Configurar o Banco de Dados (PostgreSQL)
Crie um banco de dados chamado `portal_solicitacoes` e execute o script SQL contido em `database/init.sql`.

### 2. Backend
```bash
cd backend
npm install
npm run seed     # Popula os usuários de teste
npm run dev      # Inicia a API em http://localhost:3000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev      # Inicia o frontend em http://localhost:5173
```

---

## 🧪 Executando os Testes Automatizados (Backend)

No diretório `./backend`:

```bash
# Executa a suíte de testes unitários do Jest
npm test

# Executa os testes com relatório de cobertura de código
npm run test:coverage
```

---

## 📄 Memorial Técnico

O escopo detalhado de arquitetura, justificativas de escolha tecnológica, implementação de SOLID e benefícios de escalabilidade com Docker/CI/CD estão descritos no arquivo [`MEMORIAL_TECNICO.md`](./MEMORIAL_TECNICO.md).
