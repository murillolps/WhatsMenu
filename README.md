# WhatsMenu — Gestão de Pedidos

Sistema de gestão de pedidos para pequena empresa: cadastro de clientes e produtos, criação e acompanhamento de pedidos.

- **Backend:** AdonisJS 6 + Lucid ORM + VineJS (`backend/`)
- **Banco:** MySQL 8 (via Docker) — SQLite opcional
- **Frontend:** Angular 20 (`frontend/`)

## Como rodar

Pré-requisitos: Node.js 20+ e Docker (ou um MySQL local).

### 1. Banco de dados

```bash
docker compose up -d
```

Sobe um MySQL 8 em `localhost:3306` (usuário `root`, senha `root`, banco `whatsmenu`).

### 2. Backend (porta 3333)

```bash
cd backend
npm install
cp .env.example .env
node ace generate:key
node ace migration:run
npm run dev
```

> Sem Docker/MySQL? Defina `DB_CONNECTION=sqlite` no `.env` — o banco é criado em `backend/tmp/db.sqlite3`.

### 3. Frontend (porta 4200)

```bash
cd frontend
npm install
npm start
```

Acesse http://localhost:4200.

### Testes automatizados (backend)

```bash
cd backend
npm test
```

Os testes funcionais cobrem as regras de negócio abaixo e rodam em SQLite (`.env.test`), sem precisar do MySQL.

## Fluxo

Produtos → cadastrar produto · Clientes → cadastrar cliente · Pedidos → **Novo pedido** (selecionar cliente, adicionar/remover produtos, ver total calculado pelo backend, finalizar) → abrir o pedido na listagem → alterar status.

## Regras de negócio e onde estão

| Regra | Implementação |
|---|---|
| Pedido exige cliente | `createOrderValidator` + `OrderService.create` (cliente precisa existir) |
| Pedido exige ao menos 1 item | `orderItemsSchema.minLength(1)` + `OrderService.priceItems` |
| Quantidade mínima 1 | `quantity: min(1)` + checagem no service |
| Produto inativo não entra em novos pedidos | `OrderService.priceItems`; pedidos antigos não são afetados |
| Total sempre calculado no backend | `OrderService.priceItems` (em centavos, para evitar erro de ponto flutuante); o frontend nunca envia total |
| Preço histórico | `order_items.unit_price` é copiado de `products.price` na criação e nunca recalculado |
| Máquina de estados | `app/enums/order_status.ts` — `Pendente → Em preparação → Pronto → Finalizado`; `Cancelado` a partir de qualquer estado não final |
| Cancelado é final | `OrderService.changeStatus` rejeita qualquer transição a partir de `canceled` |

Decisões:

- **Finalizado** também é estado final (não pode ser cancelado depois de entregue).
- O mesmo produto enviado em linhas diferentes é agrupado em um único item com as quantidades somadas.
- Violações de regra retornam **422** no mesmo formato dos erros de validação: `{ "errors": [{ "message": "..." }] }`. Registros inexistentes retornam **404**.
- A API expõe `nextStatuses` em cada pedido, para o frontend mostrar apenas as transições válidas (o backend valida novamente).

## API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/clients` | Lista clientes |
| POST | `/clients` | Cadastra cliente `{ name, phone }` |
| GET/PUT | `/clients/:id` | Consulta / edita cliente |
| GET | `/products` | Lista produtos |
| POST | `/products` | Cadastra produto `{ name, price }` |
| GET/PUT | `/products/:id` | Consulta / edita produto |
| PATCH | `/products/:id/activate` | Ativa produto |
| PATCH | `/products/:id/deactivate` | Desativa produto |
| GET | `/orders` | Lista pedidos (com cliente) |
| POST | `/orders` | Cria pedido `{ clientId, items: [{ productId, quantity }] }` |
| POST | `/orders/quote` | Calcula itens e total sem criar o pedido `{ items }` |
| GET | `/orders/:id` | Consulta pedido (cliente, itens e produtos) |
| PATCH | `/orders/:id/status` | Altera status `{ status }` |

Status: `pending`, `preparing`, `ready`, `finished`, `canceled`.

## Estrutura

```
backend/
  app/
    controllers/   # HTTP: recebe, valida e delega
    services/      # OrderService: regras de negócio do pedido
    models/        # Client, Product, Order, OrderItem (Lucid)
    enums/         # OrderStatus + máquina de estados
    validators/    # Schemas VineJS
    exceptions/    # BusinessRuleException (422) e handler global
    utils/         # Helpers monetários (centavos)
  database/migrations/
  tests/functional/
frontend/src/app/
  core/            # Tipos da API, serviços HTTP, tratamento de erro
  features/        # clients/, products/, orders/ (listas e formulários)
```
