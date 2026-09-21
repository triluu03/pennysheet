# Pennysheet

A personal finance tracking application that connects to your bank accounts via the [Enable Banking API](https://enablebanking.com/).

Link to the architecture design docs: https://triluu03.github.io/pennysheet/

## Project Structure

```
pennysheet/
├── pennysheet-auth/      # Flask App for Enable Banking authentication
├── pennysheet-backend/   # Axum REST API server based on event-sourcing
├── pennysheet-frontend/  # React client
└── pennysheet-catalog/   # Documentation based on Event catalog
```

For more information of each module, check its corresponding README.md.

## Environment Variables

Each module reads its configuration from environment files. Actual `.env*` files are git-ignored, so you must create them locally before running the project. The tracked `.env.example` files serve as templates.

### Root — backend configuration (`pennysheet-backend`)

The backend loads `.env-dev.local` (debug builds) or `.env-prod.local` (release builds) from the repository root, using [`dotenvy`](https://crates.io/crates/dotenvy). Start from [`.env.example`](./.env.example):

| Variable             | Description                                           |
| -------------------- | ----------------------------------------------------- |
| `DATABASE_URL`       | PostgreSQL connection URL (without the database name) |
| `DB_NAME`            | Name of the application database                      |
| `APP_ID`             | Enable Banking application ID                         |
| `PRIVATE_KEY`        | Enable Banking RSA private key (PEM format)           |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token used for notifications             |
| `TELEGRAM_CHAT_ID`   | Target Telegram chat ID for notifications             |

### Frontend (`pennysheet-frontend`)

The React client reads Vite environment files. Use `pennysheet-frontend/.env.development` for local dev and `.env.production` for builds (template: [`.env.example`](./pennysheet-frontend/.env.example)).

```
# pennysheet-frontend/.env.development
VITE_PENNYSHEET_BACKEND_URL='http://localhost:3000/api'
```

### Auth service (`pennysheet-auth`)

The Flask app loads a `.env` file from within `pennysheet-auth/` via [`python-dotenv`](https://pypi.org/project/python-dotenv/). For local/sandbox use it reads `SANDBOX_APP_ID` and `SANDBOX_PRIVATE_KEY`; for the deployed production flow it reads `PRODUCTION_APP_ID` and `PRODUCTION_PRIVATE_KEY`.

```
# pennysheet-auth/.env
SANDBOX_APP_ID=your-sandbox-app-id
SANDBOX_PRIVATE_KEY='-----BEGIN PRIVATE KEY-----...'
```

### Catalog (`pennysheet-catalog`)

Optional — Event Catalog reads `pennysheet-catalog/.env` for a scale license key and/or an OpenAI API key. Neither is required to build the catalog documentation.

## Event-sourcing Design Preview

<img width="2557" height="1289" alt="Core domain design" src="https://github.com/user-attachments/assets/138158b1-f2fb-482b-a95b-30eb1554094a" />
