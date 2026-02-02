# Luna Frontend

## Important Setup Requirement

This repository is designed to be run via Docker Compose located in the `core` repository. It must be placed in a folder alongside the `core` repository.

**Required Directory Structure:**

```
workspace/
├── core/           # Backend repository (contains docker-compose.yml)
└── ui/             # This repository (Frontend)
```

To start the full application (Frontend + Backend), navigate to the `core` directory and run:

```bash
docker-compose up -d --build
```

## 🚀 Features

- **Authentication & Authorization** - Login, register
- **Secret Management** - Create, view, and delete encrypted secrets
- **Vault Management** - Initialize, unseal, and seal the cryptographic vault (admin)
- **Session Management** - View and revoke active login sessions
- **Modern UI** - Clean, responsive interface built with Tailwind CSS
- **Type Safety** - Full TypeScript support with strong typing
- **State Management** - Redux Toolkit with RTK Query for API calls

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Backend services running:
  - Security Service (port 8001)
  - Server Service (port 8000)
  - Storage Service (port 8002)

## 🛠️ Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🎨 Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **RTK Query** - Data fetching and caching
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## 🔒 Authentication Flow

1. User registers or logs in via Security Service (port 8001)
2. Receives JWT access token + refresh token
3. Tokens stored in localStorage
4. All API requests include `Authorization: Bearer <token>` header
5. Access token auto-refreshed when expired

## 🔧 Configuration

### API Endpoints

The Vite dev server is configured to proxy API requests:

- `/auth/*` → `http://localhost:8001` (Security Service)
- `/api/*` → `http://localhost:8000` (Server Service)

To change backend URLs, edit `vite.config.ts`
