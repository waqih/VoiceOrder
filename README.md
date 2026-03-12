# VoiceOrder AI

AI-powered phone assistant for restaurants, cafes, and clinics. Takes food orders, books appointments, and answers FAQs over phone calls using voice AI.

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Dashboard   │     │    Server    │     │    Agent     │
│  (Next.js)    │────▶│  (FastAPI)   │◀────│  (LiveKit)   │
│  :3000        │     │  :8000       │     │              │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                     ┌──────┴───────┐
                     │  PostgreSQL  │     ┌──────────────┐
                     │  :5432       │     │    Redis     │
                     └──────────────┘     │    :6379     │
                                          └──────────────┘
```

- **Agent** — LiveKit voice pipeline with Deepgram STT, GPT-4.1 LLM, Cartesia/ElevenLabs TTS
- **Server** — FastAPI REST API with SQLAlchemy async, Alembic migrations, Redis caching
- **Dashboard** — Next.js 16 with shadcn/ui for business management

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [Git](https://git-scm.com/)
- [pnpm](https://pnpm.io/) (for dashboard development outside Docker)

## Quick Start

```bash
# Clone and configure
git clone <repo-url> && cd VoiceOrder
cp .env.example .env

# Build and start all services
make up

# Run database migrations
make db-upgrade

# Verify
curl http://localhost:8000/health    # {"status": "healthy"}
open http://localhost:3000            # Dashboard
open http://localhost:8000/docs       # API docs (Swagger)
```

## Development

```bash
make up          # Start all services (postgres, redis, server, agent, dashboard)
make down        # Stop all services
make build       # Rebuild Docker images
make logs        # Tail logs from all services
make lint        # Run linters (ruff + eslint)
make test        # Run tests
```

### Database Migrations

```bash
make db-migrate msg="add new table"   # Generate a new migration
make db-upgrade                        # Apply pending migrations
make db-downgrade                      # Rollback last migration
```

### Service Shells

```bash
make server-shell      # Shell into the server container
make agent-shell       # Shell into the agent container
make dashboard-shell   # Shell into the dashboard container
```

## Project Structure

```
VoiceOrder/
├── agent/                  # LiveKit voice agent (Python)
│   ├── src/voiceorder_agent/
│   ├── pyproject.toml
│   └── Dockerfile
├── server/                 # FastAPI backend (Python)
│   ├── src/voiceorder_server/
│   │   ├── models/         # SQLAlchemy models (11 tables)
│   │   ├── config.py       # Pydantic settings
│   │   ├── database.py     # Async engine + session
│   │   └── main.py         # FastAPI app
│   ├── alembic/            # Database migrations
│   ├── pyproject.toml
│   └── Dockerfile
├── dashboard/              # Next.js frontend
│   ├── src/app/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── Makefile
└── .env.example
```

## Documents

- [Market Research](MARKET_RESEARCH.md)
- [Software Requirements Specification](SRS.md)
- [Cost Analysis](COST_ANALYSIS.md)
