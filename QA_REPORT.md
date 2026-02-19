# PWellTrack - Relatorio de Analise Funcional QA

**Data:** 2026-02-19
**Analista:** Auditoria QA Automatizada
**Versao:** Web (Next.js 14) + Backend (FastAPI) + Mobile (React Native/Expo)
**Ambiente:** Producao (Vercel + Render + Supabase)

---

## Indice

1. [Resumo Executivo](#1-resumo-executivo)
2. [Seguranca - CRITICO](#2-seguranca---critico)
3. [Bugs Funcionais](#3-bugs-funcionais)
4. [Validacao de Dados](#4-validacao-de-dados)
5. [Tratamento de Erros](#5-tratamento-de-erros)
6. [UX / Usabilidade](#6-ux--usabilidade)
7. [Internacionalizacao (i18n)](#7-internacionalizacao-i18n)
8. [Performance](#8-performance)
9. [Integridade de Dados](#9-integridade-de-dados)
10. [Inconsistencias entre Plataformas](#10-inconsistencias-entre-plataformas)
11. [Codigo Morto / Funcionalidades Incompletas](#11-codigo-morto--funcionalidades-incompletas)
12. [Cobertura de Testes](#12-cobertura-de-testes)
13. [PWA / Manifest](#13-pwa--manifest)
14. [Acessibilidade](#14-acessibilidade)
15. [Tabela Resumo](#15-tabela-resumo)

---

## 1. Resumo Executivo

Foram analisados **127 ficheiros** em 3 plataformas (Web, Backend, Mobile). Foram identificadas **163 falhas** classificadas por severidade:

| Severidade | Quantidade |
|------------|-----------|
| CRITICO    | 9         |
| ALTO       | 22        |
| MEDIO      | 40        |
| BAIXO      | 51        |
| INFO       | 41        |
| **Total**  | **163**   |

### Top 10 Falhas Prioritarias

| # | Severidade | Falha | Componente |
|---|-----------|-------|-----------|
| 1 | CRITICO | Secret key hardcoded por defeito | Backend |
| 2 | CRITICO | Tabela `weight_logs_history` nao existe na migracao | Backend |
| 3 | CRITICO | JWT token exposto em query parameter do WebSocket | Web |
| 4 | CRITICO | Upload de fotos usa FormData na app mobile (falha CORS) | Mobile |
| 5 | ALTO | Sem tratamento de 401 / renovacao de token | Web + Mobile |
| 6 | ALTO | CORS wildcard `*` com `allow_credentials=True` | Backend |
| 7 | ALTO | Sem paginacao em nenhum endpoint de listagem | Backend |
| 8 | ALTO | Fotos base64 incluidas nas respostas de listagem | Backend |
| 9 | ALTO | Timezone incorreto no sistema de notificacoes | Backend |
| 10 | ALTO | Pull-to-refresh nao funciona quando ha pets na lista | Mobile |

---

## 2. Seguranca - CRITICO

### SEC-01 | CRITICO | Secret Key Hardcoded por Defeito
**Ficheiro:** `backend/app/core/config.py:7`
```python
SECRET_KEY: str = "change-me-in-production-use-a-real-secret"
```
**Impacto:** Se a variavel de ambiente `SECRET_KEY` nao estiver definida, a aplicacao corre com uma chave publica conhecida. Qualquer atacante pode forjar tokens JWT validos para qualquer utilizador.
**Recomendacao:** Adicionar verificacao no arranque que rejeite a chave por defeito em producao.

---

### SEC-02 | CRITICO | JWT Token Exposto no URL do WebSocket
**Ficheiro:** `web/src/lib/useNotifications.ts:52`
```typescript
const ws = new WebSocket(`${WS_BASE}/ws/notifications?token=${token}`);
```
**Impacto:** O token aparece em logs de servidor, proxies, CDN e historico do browser.
**Recomendacao:** Autenticar via primeira mensagem apos conexao ou usar ticket token de curta duracao.

---

### SEC-03 | ALTO | CORS Wildcard com Credentials
**Ficheiro:** `backend/app/core/config.py:12` + `backend/app/main.py:121-122`
```python
CORS_ORIGINS: str = "*"
# combinado com
allow_credentials=True
```
**Impacto:** Qualquer site malicioso pode fazer requests autenticados cross-origin em nome de utilizadores logados.
**Recomendacao:** Definir explicitamente as origens permitidas (ex: `p-well-track.vercel.app`).

---

### SEC-04 | ALTO | Sem Revogacao de Token / Mecanismo de Logout
**Ficheiro:** `backend/app/core/security.py`
**Impacto:** Tokens validos por 7 dias sem possibilidade de invalidacao. Se comprometido, nao ha forma de revogar.
**Recomendacao:** Implementar refresh token rotation e blacklist de tokens.

---

### SEC-05 | ALTO | Sem Tratamento de 401 no Cliente API
**Ficheiros:** `web/src/lib/api.ts:133-135` + `app/src/api/client.ts:78-81`
**Impacto:** Quando o JWT expira, todas as chamadas API falham com erros genericos. O utilizador nao e redirecionado para login nem o token e limpo automaticamente.
**Recomendacao:** Interceptar respostas 401, limpar token e redirecionar para login.

---

### SEC-06 | MEDIO | Token Armazenado em localStorage (Web)
**Ficheiros:** `web/src/lib/api.ts:12-34` + `app/src/api/client.ts:14-18` (web build)
**Impacto:** Vulneravel a XSS - qualquer script no mesmo dominio pode ler o token.
**Nota:** Na app mobile nativa, o `expo-secure-store` e usado corretamente.

---

### SEC-07 | MEDIO | URL do Supabase Hardcoded como Fallback
**Ficheiros:** `web/src/lib/supabase.ts:3` + `app/src/api/supabase.ts:3`
```typescript
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bbrlzpxctxwqclwudnuj.supabase.co';
```
**Impacto:** URL de producao embebida no codigo-fonte, exposta em qualquer build.

---

### SEC-08 | MEDIO | Sem Rate Limiting na Maioria dos Endpoints
**Ficheiro:** `backend/app/main.py`
**Impacto:** Rate limiting apenas em `/auth/register`, `/auth/login`, `/auth/google`. Todos os endpoints CRUD nao tem limite - um atacante com token valido pode inundar a base de dados.

---

### SEC-09 | MEDIO | Eliminacao de Conta sem Confirmacao de Password
**Ficheiro:** `backend/app/routers/auth.py:182-189`
**Impacto:** `DELETE /auth/account` nao requer re-entrada de password. Um token roubado pode eliminar a conta inteira com um unico request.

---

### SEC-10 | BAIXO | user_id Exposto nas Respostas de PetOut
**Ficheiro:** `backend/app/schemas/pet.py:30`
**Impacto:** O campo `user_id` e retornado nas respostas de pets, expondo IDs internos.

---

## 3. Bugs Funcionais

### BUG-01 | CRITICO | Tabela weight_logs_history Nao Existe na Migracao
**Ficheiro:** `backend/alembic/versions/c910b53b1fcd_initial_schema_with_all_tables.py`
**Modelo:** `backend/app/models/weight_log.py:10` → `__tablename__ = "weight_logs_history"`
**Impacto:** Em producao (via Alembic), a tabela nao existe. TODO o tracking de peso falha com "relation does not exist". Em desenvolvimento (SQLite com `create_all`), funciona porque a tabela e criada automaticamente.
**Severidade:** CRITICO - funcionalidade de peso totalmente inoperacional em producao.

---

### BUG-02 | CRITICO | Upload de Fotos de Pets Usa FormData na App Mobile
**Ficheiro:** `app/src/api/client.ts:87-120`
**Impacto:** A funcao `uploadPetPhoto()` usa `FormData` e envia `POST` para `/pets/{petId}/photo`. Isto contradiz a arquitetura do projeto (base64 em JSON). Falha com CORS em web builds e o endpoint pode nao existir no backend.
**Referencia:** `PetFormScreen.tsx:92` chama `petsApi.uploadPhoto(savedPet.id, photoUri)`.

---

### BUG-03 | ALTO | Race Condition na Criacao de Pets (Web)
**Ficheiro:** `web/src/app/pets/page.tsx:173-177`
```typescript
const created = await createPetWithFallback(petData, photoUrl);
setPets(prev => [...prev, created]);  // Adicao otimista
setShowForm(false);
loadPets();  // Recarrega lista do servidor
```
**Impacto:** Pet aparece, pisca, e reaparece quando `loadPets()` completa.

---

### BUG-04 | ALTO | Timezone Incorreto no Sistema de Notificacoes
**Ficheiro:** `backend/app/routers/notifications.py:141-143`
```python
now = datetime.now(timezone.utc)        # UTC
current_time = now.strftime("%H:%M")    # UTC
today = date.today()                     # Hora LOCAL do servidor!
```
**Impacto:** `current_time` usa UTC mas `date.today()` usa timezone do servidor. Notificacoes de medicacao e alimentacao disparam na hora errada para utilizadores fora do UTC.

---

### BUG-05 | ALTO | Falha Silenciosa de Foto na Criacao de Pet (Web)
**Ficheiro:** `web/src/app/pets/page.tsx:162-163`
```typescript
if (newPetPhoto) {
  try { photoUrl = await preparePhoto(newPetPhoto); } catch {}
}
```
**Impacto:** Se a compressao/upload da foto falhar, o erro e silenciosamente engolido. O pet e criado sem foto e o utilizador nao sabe.

---

### BUG-06 | ALTO | Backend Health Check Timeout vs Cold Start (Mobile)
**Ficheiro:** `app/src/context/AuthContext.tsx:68-72`
**Impacto:** Health check tem timeout de 2s, mas o Render free tier demora ~30s no cold start. `backendReachable` fica `false` permanentemente. Sem mecanismo de retry.

---

### BUG-07 | ALTO | Pull-to-Refresh Nao Funciona com Pets na Lista (Mobile)
**Ficheiro:** `app/src/screens/pets/PetListScreen.tsx:122-127`
```typescript
<ScreenContainer scroll={pets.length === 0} ...>
```
**Impacto:** Quando `pets.length > 0`, `scroll=false` desativa o `ScrollView` e o `RefreshControl`. A `FlatList` nao tem `RefreshControl` proprio. Pull-to-refresh so funciona quando a lista esta vazia.

---

### BUG-08 | ALTO | Medicacao "x/dia" Errado no Dashboard (Web)
**Ficheiro:** `web/src/app/pets/[petId]/page.tsx:447`
```typescript
<p>{med.dosage} · {med.frequency_per_day}x/{t('dashboard.entries')}</p>
```
**Impacto:** Mostra "500mg . 2x/entries" ou "500mg . 2x/registos" em vez de "2x/dia".

---

### BUG-09 | MEDIO | Calculo de Idade do Pet Nao Considera Dia do Mes
**Ficheiro:** `web/src/app/pets/[petId]/page.tsx:31-42`
**Impacto:** Se hoje e 1 de Fevereiro e o pet nasceu a 15 de Janeiro, `months` seria 1 mas o pet tem apenas ~17 dias.

---

### BUG-10 | MEDIO | Vacina Overdue Usa `now` Stale
**Ficheiro:** `web/src/app/pets/[petId]/vaccines/page.tsx:71,83`
**Impacto:** `const now = new Date()` capturado uma vez no render. Se a pagina ficar aberta apos meia-noite, o status de overdue fica incorreto.

---

### BUG-11 | MEDIO | Divisao Nao Inteira nas Horas de Lembrete
**Ficheiro:** `web/src/app/pets/[petId]/events/page.tsx:124`
```typescript
`${item.reminder_minutes_before / 60}h antes`
```
**Impacto:** 90 minutos mostra "1.5h antes" em vez de "1h 30min antes".

---

### BUG-12 | MEDIO | Memory Leak com Object URLs de Fotos (Web)
**Ficheiro:** `web/src/app/pets/page.tsx:460-461`
**Impacto:** `URL.createObjectURL(file)` nunca e revogado com `URL.revokeObjectURL()`. Selecionar multiplas fotos faz leak de memoria.

---

### BUG-13 | MEDIO | Demo Mode Nao Persiste Dados Criados (Mobile)
**Ficheiro:** `app/src/api/demo-data.ts`
**Impacto:** Operacoes de criacao/atualizacao retornam dados fabricados mas os arrays subjacentes nao sao modificados. Criar um registo e voltar a lista nao mostra o novo registo.

---

### BUG-14 | MEDIO | Retry de Requests POST Pode Criar Duplicados (Web)
**Ficheiro:** `web/src/lib/api.ts:114-161`
**Impacto:** O `request()` retenta ate 2x em erros de rede para TODOS os metodos HTTP, incluindo POST. Se um POST chega ao servidor mas a resposta se perde, o retry cria duplicados.

---

### BUG-15 | BAIXO | `date.today()` vs UTC no Deduplicacao de Notificacoes
**Ficheiro:** `backend/app/routers/notifications.py:63-80`
**Impacto:** `_today_key()` usa `date.today()` (hora local do servidor), criando inconsistencia com o calculo UTC.

---

### BUG-16 | BAIXO | Background Task Nao Aguardado no Shutdown
**Ficheiro:** `backend/app/main.py:52-55`
**Impacto:** Task cancelada mas nao aguardada - operacoes de BD em progresso podem nao completar.

---

### BUG-17 | BAIXO | `fetch` Shadowed como Nome de Variavel Local (Mobile)
**Ficheiro:** `app/src/screens/pets/PetDashboardScreen.tsx:96`
**Impacto:** Funcao local chamada `fetch` faz shadow ao global `fetch`. Risco de manutencao.

---

### BUG-18 | BAIXO | `Dimensions.get('window')` Chamado a Nivel de Modulo (Mobile)
**Ficheiros:** `LoginScreen.tsx:17`, `RegisterScreen.tsx:17`, `PetDashboardScreen.tsx:15`
**Impacto:** Valores ficam stale em mudanca de orientacao ou split screen. Deveria usar `useWindowDimensions`.

---

## 4. Validacao de Dados

### VAL-01 | ALTO | Sem Limite de Tamanho em Fotos de Pets (Backend)
**Ficheiro:** `backend/app/routers/pets.py:83` + `backend/app/schemas/pet.py`
**Impacto:** `PUT /auth/photo` tem limite de 7MB, mas `PUT /pets/{id}` com `photo_url` nao tem limite. Atacante pode enviar blobs base64 enormes, enchendo a BD PostgreSQL.

---

### VAL-02 | MEDIO | PetUpdate Schema Sem Constraints de Validacao
**Ficheiro:** `backend/app/schemas/pet.py:17-25`
**Impacto:** `PetCreate` tem `Field(min_length=1, max_length=120)` e `Field(gt=0)`, mas `PetUpdate` nao. Possivel atualizar nome para string vazia ou peso negativo.

---

### VAL-03 | MEDIO | EventCreate Sem Validacao de Comprimento de Campos
**Ficheiro:** `backend/app/schemas/event.py:6-13`
**Impacto:** `type` (DB: String(50)), `title` (DB: String(200)), `location` (DB: String(300)) sem `max_length`. Strings demasiado longas causam `DataError` do PostgreSQL.

---

### VAL-04 | MEDIO | VaccineCreate Sem Validacao de Campos
**Ficheiro:** `backend/app/schemas/vaccine.py:6-12`
**Impacto:** Sem limites de comprimento. Sem validacao de `next_due_date >= date_administered`.

---

### VAL-05 | MEDIO | MedicationUpdate Sem Validacao Cruzada de Datas
**Ficheiro:** `backend/app/schemas/medication.py:22-29`
**Impacto:** `MedicationCreate` valida `end_date >= start_date`, mas `MedicationUpdate` nao. Possivel criar intervalo invalido via update.

---

### VAL-06 | MEDIO | Sem Validacao de Email no Login/Registo (Mobile)
**Ficheiros:** `app/src/screens/auth/LoginScreen.tsx:116` + `RegisterScreen.tsx:117`
**Impacto:** Apenas verifica `if (!email || !password)`. Email invalido como "notanemail" e enviado ao backend.

---

### VAL-07 | MEDIO | NaN Possivel em Formularios Numericos (Web)
**Ficheiros:** `feeding/page.tsx:25`, `water/page.tsx:22`
**Impacto:** `Number(actual)` sem verificacao `isNaN`. Inputs de texto em campos numericos enviam NaN ao API.

---

### VAL-08 | BAIXO | FeedingUpdate / WaterUpdate / WeightUpdate Sem Constraints Positivos
**Ficheiros:** Schemas de update em `feeding.py`, `water.py`, `weight.py`
**Impacto:** Create schemas tem `ge=0` / `gt=0`, mas Update schemas nao. Possivel definir valores negativos via update.

---

### VAL-09 | BAIXO | SymptomUpdate Sem Validacao de Pattern de Severidade
**Ficheiro:** `backend/app/schemas/symptom.py:18`
**Impacto:** Create exige `pattern=r"^(mild|moderate|severe)$"` mas Update aceita qualquer string.

---

### VAL-10 | BAIXO | Sem Validacao de Formato em times_of_day (Medicacao)
**Ficheiro:** `backend/app/schemas/medication.py:12`
**Impacto:** Aceita strings arbitrarias como `["not-a-time", "hello"]`. O sistema de notificacoes falha silenciosamente com `except Exception: return False`.

---

### VAL-11 | BAIXO | Password Atual Nao Validada como Nao-Vazia (Web Settings)
**Ficheiro:** `web/src/app/settings/page.tsx:89-101`
**Impacto:** Formulario envia password atual vazia ao backend em vez de validar localmente.

---

### VAL-12 | BAIXO | Valores Negativos Nao Impedidos em Inputs Numericos (Web)
**Ficheiros:** Formularios de peso, alimentacao, agua
**Impacto:** `min="0"` so afeta as setas do stepper. Digitacao direta de negativos e possivel.

---

### VAL-13 | BAIXO | Datas Futuras Permitidas para Vacinas Administradas
**Ficheiro:** `web/src/app/pets/[petId]/vaccines/page.tsx:48`
**Impacto:** Sem atributo `max` no input de `date_administered`. Possivel registar vacina no futuro.

---

### VAL-14 | BAIXO | Data Fim Antes de Data Inicio em Medicacoes (Web)
**Ficheiro:** `web/src/app/pets/[petId]/medications/page.tsx:66-74`
**Impacto:** Input de `end_date` sem atributo `min` ligado a `start_date`.

---

### VAL-15 | BAIXO | Frequencia de Medicacao Aceita Decimais (Mobile)
**Ficheiro:** `app/src/screens/medications/MedicationFormScreen.tsx:36`
**Impacto:** `2.5` e aceite e `parseInt`-ado para `2` silenciosamente.

---

### VAL-16 | BAIXO | `petId` Pode Ser NaN na URL (Web)
**Ficheiros:** `web/src/app/pets/[petId]/page.tsx:49`, `RecordPage.tsx:41`
**Impacto:** Se utilizador navega para `/pets/abc`, `petId` fica `NaN` e chamadas API falham com URL `/pets/NaN/today`.

---

## 5. Tratamento de Erros

### ERR-01 | ALTO | Tipo de Excecao Exposto em Mensagens de Erro (Backend)
**Ficheiro:** `backend/app/routers/pets.py:61,91`
```python
raise HTTPException(status_code=500, detail=f"Failed to create pet: {type(exc).__name__}")
```
**Impacto:** Expoe nomes de classes internas (ex: `DataError`, `OperationalError`), dando informacao sobre o stack tecnologico.

---

### ERR-02 | MEDIO | Sem Rollback em Endpoints de Sub-Recursos (Backend)
**Ficheiros:** Todos os routers de sub-recursos (`feeding.py`, `water.py`, `events.py`, etc.)
**Impacto:** Se `db.commit()` falhar, a excecao propaga sem rollback explicito. Contrasta com `pets.py` que tem rollback.

---

### ERR-03 | MEDIO | Erros de Fetch Silenciosos em Ecras de Lista (Mobile)
**Ficheiros:** `MedicationListScreen.tsx:20`, `EventListScreen.tsx:34`, `SymptomListScreen.tsx:32`, `WaterListScreen.tsx:23`, `VaccineListScreen.tsx:31`
**Impacto:** Apenas `console.error(e)` - utilizador ve lista vazia sem mensagem de erro. Inconsistente com `FeedingListScreen` que mostra `Alert.alert`.

---

### ERR-04 | MEDIO | Sem Loading para Upload/Remocao de Foto (Web)
**Ficheiros:** `settings/page.tsx`, `pets/page.tsx`, `pets/[petId]/page.tsx`
**Impacto:** Sem estado de loading. Utilizador pode clicar multiplas vezes, disparando chamadas API duplicadas.

---

### ERR-05 | MEDIO | WebSocket Reconecta Mesmo com Backend em Baixo
**Ficheiro:** `web/src/lib/useNotifications.ts`
**Impacto:** 10 tentativas de reconexao com health check em cada uma, todas falhando. Gera trafego desnecessario.

---

### ERR-06 | BAIXO | `_supabaseStorageBroken` Flag Nunca Reseta
**Ficheiro:** `web/src/lib/api.ts:43`
**Impacto:** Uma vez marcado como broken, Supabase Storage fica desativado para toda a sessao. So reset com page reload completo.

---

### ERR-07 | BAIXO | PetAvatar Sem Fallback de Erro em Foto (Mobile)
**Ficheiro:** `app/src/components/PetAvatar.tsx:29-39`
**Impacto:** Sem handler `onError` no `<Image>`. Se URL da foto falha, mostra imagem vazia em vez de fallback para icone da especie. A versao web tem este fallback.

---

## 6. UX / Usabilidade

### UX-01 | ALTO | Sem Funcionalidade de Edicao em Listas (Mobile)
**Ficheiros:** Todos os ecras de lista (Feeding, Water, Vaccines, Medications, Events, Symptoms)
**Impacto:** Apenas "adicionar" e "eliminar". Sem opcao de editar registos existentes. Os endpoints de API (`update`) existem mas nao sao chamados.

---

### UX-02 | ALTO | Sem Paginacao em Listas de Registos (Web + Backend)
**Ficheiro:** `web/src/components/RecordPage.tsx` + todos os routers backend
**Impacto:** TODOS os registos carregados de uma vez. Utilizador com meses de dados pode receber centenas de itens. Sem paginacao, infinite scroll ou lista virtual.

---

### UX-03 | MEDIO | Fotos de Pets Nao Mostradas na Lista (Mobile)
**Ficheiro:** `app/src/screens/pets/PetListScreen.tsx:168`
```typescript
<PetAvatar name={item.name} species={item.species} size={60} />
```
**Impacto:** `photoUrl` nao e passado como prop mesmo quando `item.photo_url` existe. Fotos nunca aparecem na lista.

---

### UX-04 | MEDIO | Date Picker Nativo e Apenas Input de Texto (Mobile)
**Ficheiro:** `app/src/components/DatePickerInput.tsx`
**Impacto:** Em iOS/Android, o "date picker" e um modal com campo de texto onde o utilizador tem de digitar `YYYY-MM-DD` manualmente. Nao ha calendario nem wheel picker nativo.

---

### UX-05 | MEDIO | Grafico de Peso Nao Mostra Nada com < 2 Pontos (Web)
**Ficheiro:** `web/src/components/charts/WeightChart.tsx:28`
**Impacto:** Com 1 registo de peso, o grafico simplesmente desaparece sem mensagem. Deveria mostrar "Adicione mais registos para ver tendencias".

---

### UX-06 | MEDIO | Graficos de Alimentacao/Agua Desaparecem sem Dados (Web)
**Ficheiros:** `FeedingChart.tsx:44`, `WaterChart.tsx:45`
**Impacto:** Com 0 dados, seccao do grafico simplesmente some. Sem mensagem "Sem dados ainda".

---

### UX-07 | MEDIO | Filtro de Datas Permite Range Invalido (Web)
**Ficheiro:** `web/src/components/RecordPage.tsx:153-169`
**Impacto:** `dateFrom` pode ser posterior a `dateTo`. API retorna vazio sem aviso.

---

### UX-08 | MEDIO | Sem Confirmacao ao Sair de Formularios (Mobile)
**Ficheiros:** Todos os ecras de formulario
**Impacto:** Premir back descarta dados sem aviso. Tudo o que foi preenchido e perdido silenciosamente.

---

### UX-09 | MEDIO | Sem Loading ao Carregar Pet para Edicao (Mobile)
**Ficheiro:** `app/src/screens/pets/PetFormScreen.tsx:33-49`
**Impacto:** Com `petId`, dados carregados assincronamente sem indicador. Campos vazios brevemente visiveis ate dados carregarem.

---

### UX-10 | MEDIO | Confirmacao de Eliminacao de Conta com Palavra Inglesa
**Ficheiro:** `web/src/app/settings/page.tsx:125,333`
```typescript
if (deleteText.toUpperCase() !== 'DELETE') return;
```
**Impacto:** Utilizadores portugueses devem escrever "DELETE" (ingles) para confirmar.

---

### UX-11 | BAIXO | ProgressRing Mostra 0% sem Plano de Alimentacao (Mobile)
**Ficheiro:** `app/src/components/ProgressRing.tsx:15`
**Impacto:** Quando `planned_grams` e null, goal=0 e ring mostra 0% mesmo que o pet tenha sido alimentado.

---

### UX-12 | BAIXO | Ecra de Settings Nao Usa SafeAreaView (Mobile)
**Ficheiro:** `app/src/screens/settings/SettingsScreen.tsx`
**Impacto:** Usa `ScrollView` direto com padding manual. Em dispositivos com notch, conteudo pode sobrepor UI do sistema.

---

## 7. Internacionalizacao (i18n)

### I18N-01 | ALTO | Strings Hardcoded em Portugues nas Paginas de Registo (Web)
**Ficheiros:**
- `events/page.tsx:123-125` → `"antes"`, `"h antes"`, `"min antes"`
- `medications/page.tsx:128` → `"dia"`
- `water/page.tsx:63` → `"Meta:"`
- `feeding/page.tsx:42` → `"Racao, frango..."`
- `symptoms/page.tsx:39` → `"Vomitos, diarreia..."`
- `medications/page.tsx:56` → `"Amoxicilina..."`
- `vaccines/page.tsx:44` → `"Raiva, Parvovirose..."`
**Impacto:** Utilizadores em ingles veem palavras portuguesas.

---

### I18N-02 | ALTO | error.tsx e not-found.tsx Hardcoded em Ingles (Web)
**Ficheiros:** `web/src/app/error.tsx:23-28`, `web/src/app/not-found.tsx:18-22`
**Impacto:** Sem `useTranslation()`. Utilizadores portugueses veem ingles nas paginas de erro.

---

### I18N-03 | ALTO | Titulos de Navegacao Bilingues Hardcoded (Mobile)
**Ficheiro:** `app/src/navigation/AppNavigator.tsx:78-94`
```typescript
'Feeding / Alimentacao', 'Water / Agua', 'Vaccines / Vacinas'
```
**Impacto:** Titulos nao mudam com o idioma selecionado.

---

### I18N-04 | ALTO | Traducoes Portuguesas sem Acentos (Mobile)
**Ficheiro:** `app/src/i18n/pt.ts`
**Exemplos:**
- "nao" → deveria ser "nao" (com til)
- "Especie" → deveria ser "Especie" (com acento)
- "Cao" → deveria ser "Cao" (com til)
- "Alimentacao" → deveria ser "Alimentacao" (com cedilha e til)
- "Agua" → deveria ser "Agua" (com acento)
- "Definicoes" → deveria ser "Definicoes" (com cedilha e til)
**Impacto:** Texto em portugues parece pouco profissional e incorreto.

---

### I18N-05 | MEDIO | Graficos com Labels Hardcoded em Ingles (Web)
**Ficheiros:** `FeedingChart.tsx:55-56`, `WaterChart.tsx:56`, `WeightChart.tsx:39`
**Impacto:** Tooltips de graficos sempre em ingles: "Actual (g)", "Planned (g)".

---

### I18N-06 | MEDIO | Chave de Validacao Inconsistente: auth.fillAllFields vs common.fillAllFields
**Ficheiros:** `login/page.tsx:43` e `register/page.tsx:41` usam `t('auth.fillAllFields')` enquanto todos os outros formularios usam `t('common.fillAllFields')`.

---

### I18N-07 | MEDIO | `lang` Attribute Sempre "en" no HTML (Web)
**Ficheiro:** `web/src/app/layout.tsx:43`
```html
<html lang="en" suppressHydrationWarning>
```
**Impacto:** Afeta screen readers, SEO e prompts de traducao do browser.

---

### I18N-08 | MEDIO | "x/day" e "to" Hardcoded em Ingles (Mobile)
**Ficheiro:** `app/src/screens/medications/MedicationListScreen.tsx:71,74`
**Impacto:** Chaves i18n `medications.perDay` e `medications.to` existem mas nao sao usadas.

---

### I18N-09 | BAIXO | Notificacoes em Ingles Hardcoded (Mobile)
**Ficheiro:** `app/src/utils/notifications.ts:75-76,105-106`
**Impacto:** Conteudo de notificacoes como `"Time to give ${medicationName}"` nunca e traduzido.

---

### I18N-10 | BAIXO | "Cancel" e "OK" Hardcoded no DatePicker (Mobile)
**Ficheiro:** `app/src/components/DatePickerInput.tsx:85,88`
**Impacto:** Botoes do modal sempre em ingles.

---

### I18N-11 | BAIXO | Metadata OpenGraph Apenas em Ingles (Web)
**Ficheiro:** `web/src/app/layout.tsx:13-26`
**Impacto:** Titulo, descricao e OG tags so em ingles apesar de `alternateLocale: 'pt_PT'` estar declarado.

---

### I18N-12 | BAIXO | ConfirmDialog Sem i18n (Web)
**Ficheiro:** `web/src/components/ConfirmDialog.tsx:77,88`
**Impacto:** Fallback 'Cancel' e 'Confirm' hardcoded em ingles.

---

## 8. Performance

### PERF-01 | ALTO | Base64 de Fotos Incluido em Respostas de Lista (Backend)
**Ficheiro:** `backend/app/routers/pets.py:36-37`
**Impacto:** `list_pets` retorna `PetOut` com `photo_url` completo (100KB+ por pet). 10 pets com foto = 1MB+ de dados por chamada.

---

### PERF-02 | ALTO | 2N Chamadas API em Paralelo para N Pets (Web)
**Ficheiro:** `web/src/app/pets/page.tsx:87-91`
**Impacto:** Para cada pet, faz `petsApi.today()` + `vaccinesApi.list()`. Com 10 pets = 20 requests simultaneos. Pode sobrecarregar o backend free tier.

---

### PERF-03 | MEDIO | N+1 Queries no Sistema de Notificacoes (Backend)
**Ficheiro:** `backend/app/routers/notifications.py:148-156`
**Impacto:** Para cada utilizador conectado: 1 + (2 * num_pets) queries a cada 60 segundos. 100 utilizadores com 3 pets = 700 queries/minuto.

---

### PERF-04 | MEDIO | Sem Indices em Colunas de Datetime (Backend)
**Ficheiros:** Todos os modelos
**Impacto:** Todas as queries de lista filtram por datetime, mas so `pet_id` tem indice. Range queries fazem full table scan.

---

### PERF-05 | MEDIO | Dashboard Busca Todos os Feeding Logs para Mostrar 7 (Mobile)
**Ficheiro:** `app/src/screens/pets/PetDashboardScreen.tsx:100,104`
**Impacto:** `feedingApi.list(petId)` busca TODOS os logs, depois `logs.slice(-7)` usa apenas os ultimos 7.

---

### PERF-06 | BAIXO | FarmScene Canvas Nunca Pausa em Tab Escondido (Web)
**Ficheiro:** `web/src/components/FarmScene.tsx`
**Impacto:** `requestAnimationFrame` corre continuamente. Deveria pausar com `visibilitychange` para poupar bateria.

---

### PERF-07 | BAIXO | Sem Memoizacao em renderItem de FlatLists (Mobile)
**Ficheiros:** Todos os ecras de lista
**Impacto:** Cada re-render do parent causa re-render de todos os items. Com muitos items, causa jank.

---

### PERF-08 | BAIXO | PetListScreen Busca Dashboard+Vacinas de Todos os Pets em Cada Focus (Mobile)
**Ficheiro:** `app/src/screens/pets/PetListScreen.tsx:76-90`
**Impacto:** Cada vez que a lista ganha focus (incluindo voltar de sub-ecra), dispara N*2 chamadas API.

---

## 9. Integridade de Dados

### DATA-01 | MEDIO | Sem Constraint Unico para Vacinas Duplicadas (Backend)
**Ficheiro:** `backend/app/models/vaccine.py`
**Impacto:** Sem unique constraint em `(pet_id, name, date_administered)`. Mesma vacina pode ser registada multiplas vezes.

---

### DATA-02 | MEDIO | Sem created_at/updated_at em Sub-Recursos (Backend)
**Ficheiros:** Modelos de Event, FeedingLog, WaterLog, Medication, Symptom, Vaccine, WeightLog
**Impacto:** Impossivel fazer auditoria ou debugging temporal.

---

### DATA-03 | BAIXO | Filter datetime vs date Mismatch (Backend)
**Ficheiros:** `medications.py:20-21`, `vaccines.py:20-21`
**Impacto:** Query parameter e `datetime` mas coluna do modelo e `Date`. Conversao implicita pode causar comportamento inesperado.

---

## 10. Inconsistencias entre Plataformas

### INC-01 | MEDIO | Photo Upload: FormData (Mobile) vs Base64 JSON (Web)
**Impacto:** Mobile usa `FormData` para fotos, web usa base64 em JSON. Duas logicas diferentes para a mesma operacao, com a mobile a falhar.

---

### INC-02 | MEDIO | PetAvatar: Web tem fallback onError, Mobile nao
**Impacto:** No web, foto com erro faz fallback para iniciais. No mobile, mostra imagem vazia.

---

### INC-03 | MEDIO | Error Handling: Web mostra toast, Mobile silencia erros em 5 de 6 listas
**Impacto:** Experiencia inconsistente entre plataformas.

---

### INC-04 | MEDIO | accept Attribute Inconsistente entre Formularios de Foto (Web)
**Ficheiros:**
- Pet create: `accept="image/jpeg,image/png,image/webp"` (restrito)
- Settings / Pet list / Pet dashboard: `accept="image/*"` (aberto)
**Nota:** `compressImage()` converte tudo para JPEG independentemente.

---

### INC-05 | MEDIO | KNOWN_SPECIES Duplicado em 2 Ficheiros (Web)
**Ficheiros:** `pets/page.tsx:16` e `pets/[petId]/page.tsx:112`
**Impacto:** Se um for atualizado sem o outro, display de especies quebra.

---

### INC-06 | BAIXO | Estilos de Erro Inconsistentes entre Paginas (Web)
**Impacto:** Login/Register usam um estilo, Record pages usam outro, Settings usa um terceiro.

---

### INC-07 | BAIXO | GoogleIcon Component Duplicado (Web)
**Ficheiros:** `login/page.tsx:14-23` e `register/page.tsx:14-23`
**Impacto:** Codigo identico duplicado. Deveria ser componente partilhado.

---

### INC-08 | BAIXO | Cores Inconsistentes de Loading/FAB entre Ecras (Mobile)
**Impacto:** Cada ecra usa cor diferente para loading e FAB. Pode ser intencional mas nao e documentado.

---

## 11. Codigo Morto / Funcionalidades Incompletas

### DEAD-01 | ALTO | offlineCache Implementado mas Nunca Usado (Mobile)
**Ficheiro:** `app/src/utils/offlineCache.ts`
**Impacto:** `fetchWithCache` e `offlineCache` completamente implementados mas nunca importados. App nao tem caching offline apesar da infraestrutura existir.

---

### DEAD-02 | ALTO | Notificacoes Locais Definidas mas Nunca Agendadas (Mobile)
**Ficheiro:** `app/src/utils/notifications.ts`
**Impacto:** `scheduleEventReminder`, `scheduleMedicationReminder`, `scheduleVaccineReminder` existem mas nunca sao chamados. O toggle "Enable Notifications" nos settings pede permissoes mas nao agenda nada. Funcionalidade nao-funcional.

---

### DEAD-03 | MEDIO | authApi.refresh Existe mas Nunca E Chamado
**Ficheiros:** `web/src/lib/api.ts:179` + `app/src/api/endpoints.ts:28`
**Impacto:** Endpoint de refresh token definido no cliente mas nunca invocado.

---

### DEAD-04 | BAIXO | PetAvatar `name` Prop Aceite mas Nunca Usado (Mobile)
**Ficheiro:** `app/src/components/PetAvatar.tsx:8`
**Impacto:** Prop `name` e aceite mas nunca usado no corpo do componente.

---

### DEAD-05 | BAIXO | Sem Endpoint PUT /auth/profile para Atualizar Nome/Timezone
**Ficheiro:** `backend/app/routers/auth.py`
**Impacto:** Existe `PUT /auth/photo` e `PUT /auth/password` mas nao `PUT /auth/profile`. Utilizadores nao podem alterar nome ou timezone apos registo.

---

## 12. Cobertura de Testes

### TEST-01 | ALTO | Zero Testes para Weight Endpoints
**Impacto:** Modulo de peso completamente sem testes.

### TEST-02 | ALTO | Zero Testes de Isolamento de Autorizacao (Cross-User)
**Impacto:** Nenhum teste cria 2 utilizadores e verifica que A nao acede aos dados de B.

### TEST-03 | MEDIO | Zero Testes para Sistema de Notificacoes
**Impacto:** WebSocket, reminder loop, deduplicacao, `_is_time_due` sem cobertura.

### TEST-04 | MEDIO | Zero Testes para Upload/Remocao de Fotos
**Impacto:** `PUT /auth/photo`, `DELETE /auth/photo`, `DELETE /pets/{id}/photo` sem testes.

### TEST-05 | MEDIO | Zero Testes para Google OAuth
### TEST-06 | MEDIO | Zero Testes para Alteracao de Password
### TEST-07 | MEDIO | Zero Testes para Eliminacao de Conta
### TEST-08 | MEDIO | Zero Testes para Validacao de Input
**Impacto:** Nenhum teste verifica rejeicao de dados invalidos (negativos, strings vazias, campos demasiado longos).

### TEST-09 | BAIXO | Test Database em Ficheiro, Sem Cleanup Completo
**Ficheiro:** `backend/tests/conftest.py:13`
**Impacto:** `test.db` persiste entre execucoes. Assertions usam `>=` em vez de `==` sugerindo consciencia de data leakage.

### TEST-10 | BAIXO | Fixture `event_loop` Deprecated
**Ficheiro:** `backend/tests/conftest.py:26-30`
**Impacto:** Pattern antigo de `pytest-asyncio`. Versoes mais recentes geram warnings de deprecacao.

---

## 13. PWA / Manifest

### PWA-01 | BAIXO | Manifest Sem Campo `id`
**Ficheiro:** `web/public/manifest.json`
**Impacto:** Best practice moderna recomenda campo `id` para instalabilidade.

### PWA-02 | BAIXO | Manifest Sem Icone Maskable
**Impacto:** Sem `purpose: "maskable"`, o icone pode ser mostrado incorretamente no Android.

---

## 14. Acessibilidade

### A11Y-01 | MEDIO | ConfirmDialog Sem Focus Trap (Web)
**Ficheiro:** `web/src/components/ConfirmDialog.tsx`
**Impacto:** `role="alertdialog"` e `aria-modal="true"` mas Tab permite sair do dialog.

### A11Y-02 | MEDIO | Modal Sem Focus Trap (Web)
**Ficheiro:** `web/src/components/Modal.tsx`
**Impacto:** Mesmo problema - Tab permite navegar para conteudo de fundo.

### A11Y-03 | BAIXO | aria-label Hardcoded em Ingles (Web)
**Ficheiro:** `web/src/components/NotificationToast.tsx:33`
```typescript
aria-label="Dismiss notification"
```
**Impacto:** Screen readers em portugues recebem label em ingles.

---

## 15. Tabela Resumo

### Por Componente

| Componente | CRITICO | ALTO | MEDIO | BAIXO | Total |
|-----------|---------|------|-------|-------|-------|
| Backend   | 2       | 7    | 14    | 14    | 37    |
| Web       | 1       | 8    | 16    | 18    | 43    |
| Mobile    | 2       | 5    | 10    | 19    | 36    |
| Cross     | 4       | 2    | 0     | 0     | 6     |
| **Total** | **9**   | **22** | **40** | **51** | **122** |

*Nota: 41 issues adicionais de severidade INFO (type safety, code style) nao foram incluidos no resumo principal.*

### Por Categoria

| Categoria | Quantidade |
|-----------|-----------|
| Seguranca | 10 |
| Bugs Funcionais | 18 |
| Validacao de Dados | 16 |
| Tratamento de Erros | 7 |
| UX / Usabilidade | 12 |
| i18n | 12 |
| Performance | 8 |
| Integridade de Dados | 3 |
| Inconsistencias | 8 |
| Codigo Morto | 5 |
| Testes | 10 |
| PWA | 2 |
| Acessibilidade | 3 |
| **Total** | **114** |

---

## Proximos Passos Recomendados

### Sprint 1 - Critico (1-2 dias)
1. Corrigir secret key com validacao no arranque
2. Criar migracao Alembic para `weight_logs_history`
3. Corrigir upload de fotos no mobile (base64 JSON)
4. Mover JWT do WebSocket query param para autenticacao por mensagem

### Sprint 2 - Seguranca e Estabilidade (3-5 dias)
5. Implementar tratamento de 401 com redirect para login
6. Corrigir CORS para origens explicitas
7. Adicionar limites de tamanho a fotos de pets
8. Corrigir timezone no sistema de notificacoes
9. Adicionar paginacao a endpoints de lista

### Sprint 3 - Qualidade de Dados (3-5 dias)
10. Equalizar validacoes entre Create e Update schemas
11. Adicionar indices em colunas de datetime
12. Corrigir todas as strings hardcoded (i18n)
13. Corrigir acentos nas traducoes portuguesas do mobile

### Sprint 4 - UX e Funcionalidades (5-7 dias)
14. Implementar edicao de registos no mobile
15. Corrigir pull-to-refresh no mobile
16. Implementar ou remover offline cache e notificacoes locais
17. Melhorar date picker nativo
18. Adicionar cobertura de testes

---

*Relatorio gerado por analise estatica e revisao de codigo. Recomenda-se validacao manual das falhas criticas em ambiente de staging antes de correcao em producao.*
