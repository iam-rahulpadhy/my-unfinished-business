# MY UNFINISHED BUSINESS — $MUB

> *Everything but the living.*

A premium, cinematic personal accountability platform modeled as a live stock ticker. Your discipline drives the price.

---

## Stack

| Layer | Technology |
|---|---|
| **Backend** | Java 21, Spring Boot 3.3, Spring Security (JWT), JPA/Hibernate |
| **Database** | PostgreSQL 16 |
| **Frontend** | React 18, Vite, Tailwind CSS v3, Framer Motion, TradingView lightweight-charts |
| **Auth** | JWT (JJWT 0.12.x), BCrypt |
| **DevOps** | Docker, Docker Compose |

---

## Quick Start (Docker)

```bash
# 1. Clone
git clone <repo> && cd myunfinishedbusiness

# 2. (Optional) Change JWT secret in docker-compose.yml
#    Look for: CHANGE_THIS_TO_A_STRONG_512BIT_SECRET_BEFORE_PRODUCTION

# 3. Start everything
docker-compose up --build

# Services:
#   Frontend  →  http://localhost:5173
#   Backend   →  http://localhost:8080
#   pgAdmin   →  http://localhost:5050  (admin@mub.local / admin)
```

---

## Local Development

### Backend
```bash
# Requires: Java 21, Maven 3.9+, local PostgreSQL running
cd backend
./mvnw spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
# Proxies /api/* → http://localhost:8080
```

---

## API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Get JWT token |

### Ledger (protected)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/ledger` | Get all entries |
| GET | `/api/ledger/{id}` | Get single entry |
| POST | `/api/ledger` | Create entry |
| PUT | `/api/ledger/{id}` | Update entry |
| DELETE | `/api/ledger/{id}` | Delete entry |

### Stock (protected)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/stock/summary` | Price, % change, 7-day SMA, ATH/ATL |
| GET | `/api/stock/chart?range=1W\|1M\|ALL` | Chart time-series data |

---

## Project Structure

```
myunfinishedbusiness/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/com/mub/myunfinishedbusiness/
│       ├── entity/          # User, DailyLedger
│       ├── repository/      # JPA repositories
│       ├── dto/             # Request/Response DTOs
│       ├── service/         # AuthService, LedgerService
│       ├── controller/      # AuthController, LedgerController, StockController
│       ├── security/        # JWT, Spring Security config
│       └── exception/       # Global exception handler
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    └── src/
        ├── api/             # Axios services
        ├── components/      # Navbar, StockChart, PriceHeader, etc.
        ├── hooks/           # React Query hooks
        ├── pages/           # Dashboard, Ledger, Login
        ├── store/           # Zustand auth store
        └── types/           # TypeScript interfaces
```

---

*$MUB — The market never lies.*
