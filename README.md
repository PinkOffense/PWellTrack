# PWellTrack

**Pet Wellness Tracker / Rastreador de Saude Pet**

A full-stack mobile + web application for tracking your pet's health, feeding, hydration, vaccines, medications, events, and symptoms.

Um aplicativo full-stack (mobile + web) para rastrear a saude do seu pet: alimentacao, hidratacao, vacinas, remedios, eventos e sintomas.

---

## Tech Stack / Tecnologias

| Layer | Technology |
|-------|-----------|
| **Frontend** | React Native + Expo (TypeScript), web support via React Native for Web |
| **Backend** | Python + FastAPI |
| **ORM** | SQLAlchemy (async) |
| **Auth** | JWT (python-jose + passlib/bcrypt) |
| **Database** | SQLite (local dev), PostgreSQL (production) |
| **Migrations** | Alembic |

---

## Project Structure / Estrutura do Projeto

```
PWellTrack/
├── backend/              # FastAPI REST API
│   ├── app/
│   │   ├── core/         # Config, database, security
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   └── routers/      # API route handlers
│   ├── alembic/          # Database migrations
│   ├── requirements.txt
│   └── .env.example
├── app/                  # Expo React Native app
│   ├── src/
│   │   ├── api/          # API client, types, endpoints
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # Auth context
│   │   ├── navigation/   # Stack + Tab navigators
│   │   ├── screens/      # All app screens
│   │   └── theme/        # Colors, spacing, typography
│   ├── App.tsx
│   └── package.json
└── README.md
```

---

## Getting Started / Comecando

### Prerequisites / Pre-requisitos

- **Python 3.11+**
- **Node.js 18+** and npm
- (Optional) PostgreSQL for production / (Opcional) PostgreSQL para producao

---

### 1. Backend Setup / Configuracao do Backend

```bash
cd backend

# Create virtual environment (recommended)
# Criar ambiente virtual (recomendado)
python -m venv venv
source venv/bin/activate   # Linux/macOS
# venv\Scripts\activate    # Windows

# Install dependencies / Instalar dependencias
pip install -r requirements.txt

# Copy environment config / Copiar configuracao
cp .env.example .env
# Edit .env with your settings / Edite .env com suas configuracoes
```

#### Environment Variables / Variaveis de Ambiente

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite+aiosqlite:///./pwelltrack.db` | Database connection URL |
| `SECRET_KEY` | `change-me-in-production...` | JWT signing secret |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `10080` (7 days) | Token expiration |

**For PostgreSQL / Para PostgreSQL:**
```
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/pwelltrack
```

#### Run Migrations / Rodar Migracoes

```bash
# Generate initial migration / Gerar migracao inicial
alembic revision --autogenerate -m "initial"

# Apply migrations / Aplicar migracoes
alembic upgrade head
```

> Note: For local development with SQLite, the app auto-creates tables on startup, so migrations are optional.
>
> Nota: Para desenvolvimento local com SQLite, o app cria as tabelas automaticamente, entao migracoes sao opcionais.

#### Start the Server / Iniciar o Servidor

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at: **http://localhost:8000/docs**

Documentacao da API disponivel em: **http://localhost:8000/docs**

---

### 2. Frontend Setup / Configuracao do Frontend

```bash
cd app

# Install dependencies / Instalar dependencias
npm install --legacy-peer-deps
```

#### Running / Executando

```bash
# Web (browser) / Web (navegador)
npm run web

# Android emulator or device / Emulador Android ou dispositivo
npm run android

# iOS simulator (macOS only) / Simulador iOS (apenas macOS)
npm run ios

# Start Expo dev server (choose platform interactively)
# Iniciar servidor dev Expo (escolha plataforma interativamente)
npm start
```

#### API Configuration / Configuracao da API

The API base URL is set automatically in `src/api/config.ts`:
- **Web/iOS**: `http://localhost:8000`
- **Android emulator**: `http://10.0.2.2:8000`

To use a remote backend, edit `src/api/config.ts`.

Para usar um backend remoto, edite `src/api/config.ts`.

---

## API Endpoints / Endpoints da API

### Auth / Autenticacao
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register / Cadastrar |
| POST | `/auth/login` | Login / Entrar |
| GET | `/auth/me` | Current user / Usuario atual |

### Pets
| Method | Path | Description |
|--------|------|-------------|
| GET | `/pets/` | List pets / Listar pets |
| POST | `/pets/` | Create pet / Criar pet |
| GET | `/pets/{id}` | Get pet / Obter pet |
| PUT | `/pets/{id}` | Update pet / Atualizar pet |
| DELETE | `/pets/{id}` | Delete pet / Deletar pet |
| GET | `/pets/{id}/today` | Today's dashboard / Painel de hoje |

### Health Data / Dados de Saude
| Resource | GET (list) | POST (create) | PUT (update) |
|----------|-----------|--------------|-------------|
| Feeding | `/pets/{id}/feeding` | `/pets/{id}/feeding` | — |
| Water | `/pets/{id}/water` | `/pets/{id}/water` | — |
| Vaccines | `/pets/{id}/vaccines` | `/pets/{id}/vaccines` | `/vaccines/{id}` |
| Medications | `/pets/{id}/medications` | `/pets/{id}/medications` | `/medications/{id}` |
| Events | `/pets/{id}/events` | `/pets/{id}/events` | — |
| Symptoms | `/pets/{id}/symptoms` | `/pets/{id}/symptoms` | — |

---

## App Screens / Telas do App

- **Login / Register** — Authentication with JWT
- **Pet List** — View all your pets
- **Pet Dashboard** — Today's feeding/water progress, upcoming events, active medications
- **Feeding** — Log food intake / Registrar alimentacao
- **Water** — Log hydration / Registrar hidratacao
- **Vaccines** — Track vaccination history / Historico de vacinas
- **Medications** — Manage medications / Gerenciar remedios
- **Events** — Vet visits, grooming, etc. / Consultas, banho, etc.
- **Symptoms** — Record health symptoms / Registrar sintomas

---

## License / Licenca

See [LICENSE](./LICENSE) for details.
