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

## Event-sourcing Design Preview
<img width="2557" height="1289" alt="Core domain design" src="https://github.com/user-attachments/assets/138158b1-f2fb-482b-a95b-30eb1554094a" />

