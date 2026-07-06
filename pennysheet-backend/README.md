# Pennysheet Backend

An event-sourcing system exposed as a REST API built in Axum.

The core event-sourcing logic is built from scratch without any external crates. Hence, there are certainly rooms for improvements and refactorings.

## Project Structure

```
pennysheet-backend/
├── domain/     # Event-sourcing domain components (e.g: commands, events, aggregates, etc).
├── gateway/    # Module to work with external services, mainly Enable Banking API in this case.
├── infra/      # Integration with a PostgreSQL database (e.g: event store, projections, etc).
└── src/        # Axum REST API.
```

