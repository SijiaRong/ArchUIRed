# Canvas Drilled — Transitions

| Trigger | Target State |
|---------|-------------|
| Single-click a node on the new canvas | `node-selected` |
| Double-click a node | `drilled` (recurse deeper) |
| Click back arrow or breadcrumb parent | `idle` (at the parent canvas) |
| Press `Escape` or `Backspace` (no node selected) | `idle` (at the parent canvas) |
| Click a breadcrumb crumb N levels up | `idle` (at that canvas depth) |
