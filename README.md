# Pennysheet

A personal finance tracking application that connects to your bank accounts via the [Enable Banking API](https://enablebanking.com/).

Link to the architecture design docs: https://triluu03.github.io/pennysheet/

## Event-sourcing Design

flowchart LR

    %% Style definitions
    classDef commands fill:#3b82f6,stroke:#1d4ed8,color:#fff
    classDef services fill:#ec4899,stroke:#be185d,color:#fff
    classDef data fill:#3b82f6,stroke:#1d4ed8,color:#fff
    classDef events fill:#f97316,stroke:#c2410c,color:#fff

    %% Nodes
    RecordTransaction_0_0_1>"Record Transaction (0.0.1)"]:::commands
    CoreAggregate_0_0_1[["Core Aggregate (0.0.1)"]]:::services
    CategorizeTransaction_0_0_1>"Categorize Transaction (0.0.1)"]:::commands
    TagTransaction_0_0_1>"Tag Transaction (0.0.1)"]:::commands
    UpdateTransactionNote_0_0_1>"Update Transaction Note (0.0.1)"]:::commands
    CreateBudget_0_0_1>"Create Budget (0.0.1)"]:::commands
    UpdateBudget_0_0_1>"Update Budget (0.0.1)"]:::commands
    DeleteBudget_0_0_1>"Delete Budget (0.0.1)"]:::commands
    ImportTransactions_0_0_1>"Import Transactions (0.0.1)"]:::commands
    CoreEventStore_0_0_1[("Core Event Store")]:::data
    TransactionRecorded_0_0_1>"Transaction Recorded (0.0.1)"]:::events
    TransactionCategorized_0_0_1>"Transaction Categorized (0.0.1)"]:::events
    TransactionTagged_0_0_1>"Transaction Tagged (0.0.1)"]:::events
    TransactionNoteUpdated_0_0_1>"Transaction Note Updated (0.0.1)"]:::events
    BudgetCreated_0_0_1>"Budget Created (0.0.1)"]:::events
    BudgetUpdated_0_0_1>"Budget Updated (0.0.1)"]:::events
    BudgetDeleted_0_0_1>"Budget Deleted (0.0.1)"]:::events
    BudgetReached_0_0_1>"Budget Reached (0.0.1)"]:::events
    CoreNotifier_0_0_1[["Core Notifier (0.0.1)"]]:::services
    BudgetExceeded_0_0_1>"Budget Exceeded (0.0.1)"]:::events
    ImportTransactionsRequested_0_0_1>"Import Transactions Requested (0.0.1)"]:::events
    EnableBankingAPIGateway_0_0_1[["Enable Banking API Gateway (0.0.1)"]]:::services
    CoreEventInjector_0_0_1[["Core Event Injector (0.0.1)"]]:::services
    TransactionImportCompleted_0_0_1>"Transaction Import Completed (0.0.1)"]:::events
    TransactionImportFailed_0_0_1>"Transaction Import Failed (0.0.1)"]:::events
    CoreProjector_0_0_1[["Core Projector (0.0.1)"]]:::services
    TransactionView_0_0_1[("Transaction View")]:::data
    BudgetView_0_0_1[("Budget View")]:::data
    DashboardView_0_0_1[("Dashboard View")]:::data

    %% Edges
    RecordTransaction_0_0_1 -->|"accepts"| CoreAggregate_0_0_1
    CategorizeTransaction_0_0_1 -->|"accepts"| CoreAggregate_0_0_1
    TagTransaction_0_0_1 -->|"accepts"| CoreAggregate_0_0_1
    UpdateTransactionNote_0_0_1 -->|"accepts"| CoreAggregate_0_0_1
    CreateBudget_0_0_1 -->|"accepts"| CoreAggregate_0_0_1
    UpdateBudget_0_0_1 -->|"accepts"| CoreAggregate_0_0_1
    DeleteBudget_0_0_1 -->|"accepts"| CoreAggregate_0_0_1
    ImportTransactions_0_0_1 -->|"accepts"| CoreAggregate_0_0_1
    CoreAggregate_0_0_1 -->|"writes to   (postgres)"| CoreEventStore_0_0_1
    CoreAggregate_0_0_1 -->|"publishes  event"| TransactionRecorded_0_0_1
    CoreAggregate_0_0_1 -->|"publishes  event"| TransactionCategorized_0_0_1
    CoreAggregate_0_0_1 -->|"publishes  event"| TransactionTagged_0_0_1
    CoreAggregate_0_0_1 -->|"publishes  event"| TransactionNoteUpdated_0_0_1
    CoreAggregate_0_0_1 -->|"publishes  event"| BudgetCreated_0_0_1
    CoreAggregate_0_0_1 -->|"publishes  event"| BudgetUpdated_0_0_1
    CoreAggregate_0_0_1 -->|"publishes  event"| BudgetDeleted_0_0_1
    CoreAggregate_0_0_1 -->|"publishes  event"| BudgetReached_0_0_1
    BudgetReached_0_0_1 -->|"subscribed by"| CoreNotifier_0_0_1
    CoreAggregate_0_0_1 -->|"publishes  event"| BudgetExceeded_0_0_1
    BudgetExceeded_0_0_1 -->|"subscribed by"| CoreNotifier_0_0_1
    CoreAggregate_0_0_1 -->|"publishes  event"| ImportTransactionsRequested_0_0_1
    ImportTransactionsRequested_0_0_1 -->|"subscribed by"| EnableBankingAPIGateway_0_0_1
    CoreEventInjector_0_0_1 -->|"writes to   (postgres)"| CoreEventStore_0_0_1
    CoreEventInjector_0_0_1 -->|"publishes  event"| TransactionImportCompleted_0_0_1
    CoreEventInjector_0_0_1 -->|"publishes  event"| TransactionImportFailed_0_0_1
    CoreProjector_0_0_1 -->|"writes to   (postgres)"| TransactionView_0_0_1
    CoreProjector_0_0_1 -->|"writes to   (postgres)"| BudgetView_0_0_1
    CoreProjector_0_0_1 -->|"writes to   (postgres)"| DashboardView_0_0_1
    CoreEventStore_0_0_1 -->|"reads from   (postgres)"| CoreProjector_0_0_1

## Project Structure

```
pennysheet/
├── pennysheet-backend/   # Axum REST API server
├── pennysheet-cli/       # Command-line interface
├── pennysheet-frontend/  # Web frontend
└── pennysheet-catalog/   # Documentation
```

