# Pulse CRM — Protótipo

CRM inteligente para priorização de leads pós-reunião. O vendedor envia um único
áudio com suas percepções após a reunião; o áudio (+ ata + dados dos leads) é
enviado a um workflow n8n, que devolve um novo ranking (score, temperatura,
prioridade, justificativa e próxima ação) para cada lead envolvido.

## Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS v4
- **Backend/Banco**: Supabase (Postgres, Auth, Storage) — opcional no protótipo
- **Automação/IA**: n8n via Webhook (transcrição, comparação e classificação ficam 100% no n8n)

## Rodando o protótipo

```bash
npm install
npm run dev
```

Sem nenhuma variável de ambiente configurada, o app roda inteiramente sobre
dados mockados: autenticação simulada (qualquer e-mail/senha) e **MOCK MODE**
para a análise de reunião (uma resposta de IA sintética é gerada ~1s após
clicar em "Analisar reunião").

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha o que for necessário:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_N8N_ANALYZE_MEETING_WEBHOOK=
VITE_USE_EDGE_FUNCTION_PROXY=false
```

- Sem `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`: auth e dados ficam mockados.
- Sem `VITE_N8N_ANALYZE_MEETING_WEBHOOK`: análise de reunião roda em MOCK MODE.
- `VITE_USE_EDGE_FUNCTION_PROXY=true` (com Supabase configurado): a chamada ao
  n8n passa pela Edge Function em `supabase/functions/analyze-meeting`, para
  não expor a URL do webhook no navegador.

## Banco de dados

O schema completo (`profiles`, `leads`, `meetings`, `meeting_leads`,
`lead_analysis`, `lead_history`, RLS por usuário e bucket de storage para
áudio) está em `supabase/migrations/0001_init.sql`.

## Arquitetura

```
src/
  components/   # UI reutilizável, organizada por domínio (leads, meetings, pipeline, dashboard, layout, ui)
  pages/        # Telas roteadas
  services/     # crmService (abstração de CRM) + n8n (integração externa)
  hooks/        # Hooks de dados (useLeads, useMeetings, useMeetingAnalysis...)
  store/        # Zustand store — backend em memória do protótipo
  types/        # Lead, Meeting, LeadAnalysis, LeadHistory, N8n*, Profile
  integrations/ # Cliente Supabase + mapeamento de linhas <-> tipos
  data/         # Dados mockados (15 leads, 5 reuniões)
supabase/
  migrations/   # SQL do schema
  functions/    # Edge Function (proxy para o n8n)
```

`CRMService` (em `src/services/crmService.ts`) é a única porta de entrada que
as telas usam para ler/escrever leads e reuniões. Hoje ela resolve para
`mockCrmService` (memória) ou `supabaseCrmService` (Postgres real), sem que
nenhuma tela precise saber qual. Isso deixa o caminho aberto para, no futuro,
trocar ou sincronizar o CRM interno com HubSpot, Pipedrive, RD Station ou
Salesforce sem tocar em regra de negócio.
