
# QuoteFlow CRM SaaS

QuoteFlow é uma aplicação SaaS B2B para gerenciamento de clientes, geração de orçamentos em PDF com integração GPT e cobrança de assinatura mensal via Stripe.

## Tecnologias

- Frontend: React 18 + TypeScript + Tailwind CSS (shadcn/ui)
- Backend: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- Pagamentos: Stripe Checkout/Portal

## Funcionalidades

- **Autenticação** com Supabase (email + magic link)
- **Gerenciamento de Clientes** (cadastro, listagem, edição)
- **Geração de Orçamentos** (inclusive com ajuda da IA)
- **Exportação de PDF** via Edge Function
- **CRM Kanban** para acompanhamento de leads
- **Stripe Integração** para assinatura mensal
- **Registro de Atividades** de todas as ações importantes

## Configuração do Ambiente

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase

# Para desenvolvimento local de Edge Functions
SUPABASE_URL=sua_url_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
STRIPE_SECRET_KEY=sua_chave_secreta_do_stripe
STRIPE_WEBHOOK_SECRET=seu_webhook_secret_do_stripe
```

### Banco de Dados

1. Execute a migração inicial para criar todas as tabelas e políticas de segurança:

```bash
supabase db push migrations/001_init.sql
```

2. Certifique-se que as tabelas e políticas foram criadas corretamente.

3. Verifique se os estágios do CRM foram criados (Novo, Enviado, Negociação, Fechado-Ganho, Fechado-Perdido).

### Edge Functions

Implante as Edge Functions para o Supabase:

```bash
supabase functions deploy stripe-webhook
supabase functions deploy generate-quote-pdf
supabase functions deploy create-checkout
supabase functions deploy check-subscription
supabase functions deploy customer-portal
```

### Configuração do Stripe

1. Crie uma conta no [Stripe](https://stripe.com) se ainda não tiver.
2. No painel do Stripe, crie um produto "Premium-Mensal" com preço recorrente.
3. Copie o ID do preço (price_id) e atualize o arquivo `supabase/functions/create-checkout/index.ts` com o ID correto.
4. Configure webhooks no Stripe para apontar para sua Edge Function:
   - URL: `https://[PROJECT_REF].supabase.co/functions/v1/stripe-webhook`
   - Eventos para ouvir: `customer.subscription.*`, `invoice.paid`, `invoice.payment_failed`

## Desenvolvimento

```bash
# Instalar dependências
pnpm install

# Iniciar servidor de desenvolvimento
pnpm dev
```

## Deploy

### Vercel

1. Conecte este repositório ao Vercel.
2. Configure as variáveis de ambiente necessárias.
3. Deploy!

```bash
vercel --prod
```

## Estrutura do Projeto

- `src/` - Código fonte frontend
  - `components/` - Componentes React reutilizáveis
  - `lib/` - Utilitários, hooks, e configurações
  - `pages/` - Páginas da aplicação
- `supabase/functions/` - Edge Functions do Supabase
- `database/migrations/` - Migrações SQL

## Licença

Este projeto é licenciado sob a licença MIT.
