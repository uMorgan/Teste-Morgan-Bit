# Memorial Técnico de Desenvolvimento

## 1. Justificativa da Stack Tecnológica

### Node.js com Express e TypeScript
- **Node.js (Event Loop & I/O não-bloqueante):** Escolhido pela alta eficiência no manuseio de operações assíncronas concorrentes de E/S (leitura e escrita em banco de dados), consumindo memória de forma otimizada sob carga.
- **Express.js:** Framework minimalista e comprovado que proporciona controle total sobre a esteira de middlewares (autenticação JWT, tratamento global de erros, segurança com Helmet e CORS).
- **TypeScript (Tipagem Estrita):** Garante segurança em tempo de compilação, elimina classes inteiras de erros de execução (`TypeError`, `undefined is not a function`), atua como documentação viva do código e melhora substancialmente a experiência de refatoração em equipes.

### PostgreSQL
- **Banco Relacional Clássico:** Escolhido devido à natureza dos dados de solicitações internas, que exigem consistência **ACID**, garantia de integridade referencial por chaves estrangeiras (`FOREIGN KEY ON DELETE CASCADE`) e restrições de domínio (`CHECK constraints`).
- **Performance de Consultas:** Suporta a criação de índices B-Tree estratégicos para filtragem por categoria, status, datas e busca textual com `ILIKE`, além de permitir agregação direta via `COUNT(CASE WHEN...)` no banco, reduzindo o tráfego de rede e o uso de CPU na aplicação.

### React (Vite) + Tailwind CSS
- **Vite:** Build tool extremamente veloz baseado em ES modules nativos em desenvolvimento e Rollup para produção, garantindo HMR (Hot Module Replacement) instantâneo.
- **React 18 (Arquitetura Componentizada & Hooks):** Facilita a separação de responsabilidades no cliente, o controle de estado global via Context API (`AuthContext`, `ToastContext`) e o consumo de APIs assíncronas com tratamento de concorrência (`AbortController`).
- **Tailwind CSS:** Framework de utilitários que permite estilização rápida, consistente e 100% responsiva (Mobile-First) sem sair do contexto do componente, resultando em um bundle CSS otimizado e purgado para produção.

---

## 2. Arquitetura em Camadas (Clean Architecture & SOLID)

O projeto foi estruturado seguindo rigorosamente a separação de responsabilidades em camadas desacopladas:

```
src/
├── config/        # Variáveis de ambiente com validação Zod e Pool PostgreSQL
├── models/        # Entidades e contratos de domínio
├── providers/     # Abstrações de serviços externos (JWT e Bcrypt por trás de interfaces)
├── repositories/  # Camada de Persistência (SQL 100% parametrizado contra SQL Injection)
├── services/      # Regras de Negócio e validações de domínio
├── controllers/   # Camada HTTP (validação de payload via Zod e status HTTP)
├── middlewares/   # Interceptadores (JWT Auth, Role Auth, Global Error Handling)
├── routes/        # Mapeamento de endpoints RESTful
└── container.ts   # Composition Root (Inversão e Injeção de Dependências)
```

### Princípios SOLID Aplicados
1. **Single Responsibility Principle (SRP):** Cada classe/módulo possui uma única razão para mudar. Repositórios lidam apenas com SQL; Services tratam apenas de regras de negócio; Controllers gerenciam apenas requisições/respostas HTTP.
2. **Open/Closed Principle (OCP):** Erros de aplicação estendem a classe base `AppError`, permitindo adicionar novos tipos de erro sem alterar o `error.middleware.ts`.
3. **Liskov Substitution Principle (LSP):** O repositório depende de uma interface `Queryable`, permitindo substituir o Pool do `pg` por clientes de transação ou mocks sem quebrar o repositório.
4. **Interface Segregation Principle (ISP):** As interfaces `IUserRepository`, `IServiceRequestRepository` e `IDashboardRepository` expõem apenas os métodos estritamente necessários para seus respectivos serviços.
5. **Dependency Inversion Principle (DIP):** Os serviços recebem suas dependências (`Repository`, `HashProvider`, `TokenProvider`) via construtor como interfaces, e a instanciação é centralizada no `container.ts` (Composition Root).

---

## 3. Benefícios do Docker e CI/CD para Escalabilidade e Manutenção

### Docker & Docker Compose
- **Paridade de Ambientes:** Garante que o sistema funcione da mesma forma na máquina do desenvolvedor, em homologação e em produção, eliminando o clássico problema "na minha máquina funciona".
- **Multi-Stage Builds:** O `Dockerfile` do backend separa o ambiente de desenvolvimento (com `tsx watch`) do ambiente de produção (imagem enxuta baseada em Alpine, sem dependências de desenvolvimento e executando com usuário não-root por segurança).
- **Orquestração de Dependências:** O `docker-compose.yml` gerencia o ciclo de vida do PostgreSQL, Backend e Frontend, utilizando `healthcheck` (`pg_isready`) para garantir a ordem correta de inicialização dos serviços.

### CI/CD e Orquestração Cloud (GitHub Actions, Render & Vercel)
- **Garantia Contínua de Qualidade:** A cada `push` ou `pull request`, a esteira do GitHub Actions executa automaticamente a verificação de tipos TypeScript (`typecheck`), os testes unitários automatizados com Jest no backend e a compilação do frontend.
- **Orquestração Cloud & Alta Disponibilidade:** Enquanto o Docker e o Docker Compose garantem o isolamento e a paridade total de ambientes no desenvolvimento local, a infraestrutura de produção foi desenhada aproveitando o modelo PaaS (Platform as a Service) do Render.com para o Backend Node.js e o PostgreSQL gerenciado, integrada à Edge Network global da Vercel para entrega ultra-rápida do Frontend React. Essa arquitetura desacoplada possibilita deploy contínuo automatizado (CD) a cada push na branch principal, escalabilidade horizontal independente entre as camadas e alta disponibilidade com custo operacional reduzido.
