# Pennysheet

A personal finance tracking application that connects to your bank accounts via the [Enable Banking API](https://enablebanking.com/).

Link to the architecture design docs: https://triluu03.github.io/pennysheet/

## Project Structure

```
pennysheet/
├── pennysheet-backend/   # Axum REST API server based on event-sourcing
├── pennysheet-frontend/  # React client
└── pennysheet-catalog/   # Documentation based on Event catalog
```

## Event-sourcing Design Preview
<img width="2555" height="1288" alt="Core domain architecture" src="https://github.com/user-attachments/assets/70f5f758-8ac1-4bb1-9644-b075cb42e4bb" />
