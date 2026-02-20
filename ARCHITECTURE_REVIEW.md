# PWellTrack — Revisão Arquitetural: Stack Atual vs Supabase + Python

## Stack Atual

| Camada | Tecnologia |
|--------|-----------|
| **Mobile** | React Native + Expo (TypeScript) |
| **Web** | Next.js 14 + Tailwind (TypeScript) |
| **Backend** | Python + FastAPI (async) |
| **ORM** | SQLAlchemy 2.0 (async) |
| **Auth** | JWT custom (PBKDF2 + HS256 manual) + Supabase OAuth (Google) |
| **Database** | SQLite (dev) / PostgreSQL via Supabase (prod) |
| **Realtime** | WebSocket custom (notificações de medicação/alimentação) |
| **Migrations** | Alembic |
| **Deploy** | Render (backend), Vercel (web) |

**Dimensão do código:** ~2800 linhas Python (backend), ~5200 linhas TypeScript (web), ~6200 linhas TypeScript (mobile) — 9 modelos, 10 routers.

---

## Comparação Detalhada

### 1. Autenticação

| | Stack Atual | Supabase Auth |
|---|---|---|
| **Implementação** | JWT manual (PBKDF2 + HS256 escritos à mão em `security.py`) | SDK pronto com email/password, Google, Apple, etc. |
| **Segurança** | Funcional mas frágil — JWT feito manualmente sem refresh tokens rotativos | Auditado, com refresh tokens, MFA, RLS |
| **Complexidade** | ~100 linhas de código crypto manual | 0 linhas — SDK faz tudo |
| **Veredito** | **Supabase Auth é objectivamente melhor.** O JWT manual é um risco desnecessário. |

### 2. Base de Dados & Queries

| | Stack Atual (SQLAlchemy) | Supabase PostgREST (sem backend) |
|---|---|---|
| **CRUD simples** | Funciona bem, mas é verboso (model + schema + router por entidade) | PostgREST auto-gera APIs a partir das tabelas |
| **Queries complexas** | Dashboard `pet_today` tem JOINs, aggregations, timezone logic — fácil em SQLAlchemy | Difícil/impossível via PostgREST. Precisaria de RPCs (stored procedures em SQL) |
| **Validação** | Pydantic schemas robustos | Só constraints da BD — validação no frontend |
| **Rate limiting** | slowapi integrado | Não nativo (precisaria de edge functions) |
| **Veredito** | **O FastAPI é melhor para a lógica de negócio que este projecto tem.** |

### 3. Realtime / Notificações

| | Stack Atual | Supabase Realtime |
|---|---|---|
| **Modelo** | WebSocket custom + background loop a cada 60s | Pub/sub baseado em changes da BD |
| **Funcionalidade** | Lembretes de medicação/alimentação baseados em horário do utilizador | Supabase Realtime notifica sobre INSERT/UPDATE/DELETE |
| **Adequação** | A lógica actual é **temporal** (verificar se são 8h, 13h, 19h) — não é trigger de BD | Supabase Realtime é event-driven (dados mudam → notifica). Não substitui lógica temporal. |
| **Veredito** | **Precisarias de manter lógica de servidor para os reminders.** Supabase Realtime não resolve este caso. |

### 4. Storage (Fotos)

| | Stack Atual | Supabase Storage |
|---|---|---|
| **Modelo** | Fotos guardadas como base64 data URIs directamente na BD | Ficheiros em bucket com URLs |
| **Problema actual** | Base64 na BD é ineficiente — aumenta o tamanho da BD e o payload de cada resposta | URLs são leves e CDN-friendly |
| **Veredito** | **Supabase Storage é claramente melhor para fotos.** É o ponto mais fraco da arquitectura actual. |

### 5. Custos & Hosting

| | Stack Atual | Supabase-only |
|---|---|---|
| **Backend** | Render Free (cold starts de ~30s) | Eliminado (PostgREST é built-in) |
| **BD** | Supabase Free (500MB, pausa após 1 semana inativo) | Mesmo |
| **Custo total** | $0 (free tier) | $0 (free tier) mas sem o cold start do Render |
| **Veredito** | Eliminar o servidor Render **eliminaria cold starts**, que é um problema real para UX. |

---

## Recomendação: Abordagem Híbrida

Não recomendamos eliminar o FastAPI completamente, nem manter tudo como está. A melhor abordagem é **migrar cirurgicamente** as partes onde Supabase é objectivamente superior:

| Componente | Acção | Razão |
|---|---|---|
| **Auth** | Migrar para Supabase Auth | Elimina ~200 linhas de código crypto manual. Ganha MFA, social login nativo, refresh tokens. |
| **Fotos** | Migrar para Supabase Storage | Base64 na BD é um anti-pattern. Storage + CDN resolve. |
| **CRUD simples** | Considerar PostgREST para operações simples | Feeding, water, symptoms — CRUDs puros sem lógica complexa. |
| **Dashboard/Notificações** | **Manter no FastAPI** | Lógica de agregação, timezones e reminders temporais precisa de servidor. |
| **Rate limiting** | **Manter no FastAPI** | slowapi já funciona, PostgREST não tem equivalente simples. |

### Porquê NÃO eliminar o FastAPI completamente

1. **`pet_today` dashboard** — Agrega dados de 4 tabelas com lógica de timezone. Em SQL puro/PostgREST, ficaria numa stored procedure complexa e difícil de manter.
2. **Sistema de notificações** — Background loop temporal que verifica horários de medicação. Supabase não tem cron/background jobs nativos.
3. **Validação** — Os Pydantic schemas são robustos. Perder isto para validar só no frontend é um downgrade.
4. **O backend já existe e funciona** — São apenas ~2800 linhas. Reescrever tudo não traz ganho proporcional ao esforço.

### Porquê NÃO manter tudo como está

1. **JWT manual é um risco de segurança** — `security.py` implementa JWT do zero. Qualquer bug é uma vulnerabilidade.
2. **Fotos base64 na BD** é um anti-pattern que vai degradar a performance à medida que cresce.
3. **Cold starts do Render** afectam a UX — mover auth e CRUD simples para Supabase reduz a dependência do servidor.

---

## Resumo

| Pergunta | Resposta |
|---|---|
| Ficaria melhor **100% Supabase** (sem Python)? | **Não.** Perderias controlo sobre lógica complexa (dashboard, notificações, validação). |
| Ficaria melhor com **mais Supabase**? | **Sim.** Auth e Storage são ganhos claros e imediatos. |
| Vale a pena reescrever tudo? | **Não.** O backend é pequeno e funcional. Migração cirúrgica é mais eficiente. |
| O Python/FastAPI é a escolha certa para o backend? | **Sim.** FastAPI async + SQLAlchemy é adequado para esta escala. |
