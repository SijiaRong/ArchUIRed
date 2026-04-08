# Link Renderer — External Stub Spec (Deprecated)

This spec describes the previous external stub implementation. External stubs have been **replaced by external reference cards** in the primary-card rendering model.

## Previous Design

External stubs were compact React Flow nodes rendered when a link crossed the current canvas boundary. They showed a directional icon (↗ or ↙) and the target/source module name.

## Current Status

Every cross-boundary link now materializes as a full **external reference card** showing the module's complete name and a dimmed UUID. External reference cards are draggable, positionable, and support navigation on double-click.

See `module-node/README.md` for the external reference card specification.

This spec is retained for historical reference only.
