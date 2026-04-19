# todo-domain

This package marks the shared domain layer for the cross-platform todos product.

Responsibilities:

- Todo entities and DTOs
- Validation rules and normalization helpers
- Shared repository interfaces for auth and task persistence

The concrete domain code currently lives in [`packages/utils`](../utils/README.md) from task `1.2`. This workspace now reserves the stable home for that logic so later tasks can migrate or expand it without changing the overall package layout.
