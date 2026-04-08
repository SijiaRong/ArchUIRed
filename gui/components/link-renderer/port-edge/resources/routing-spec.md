# Port Edge Routing Specification

## Outgoing Port Edge

The **source** is a submodule of the focused module. The edge exits through the primary card's output port handle in the port section.

```
Source handle: port-{subUuid}-out  (on the primary card's port section, right edge)
Target handle: default left-edge handle on the external reference card
```

## Incoming Port Edge

The **target** is a submodule of the focused module. The edge arrives at the primary card's input port handle in the port section.

```
Source handle: default right-edge handle on the external reference card
Target handle: port-{subUuid}-in  (on the primary card's port section, left edge)
```

## Visual Properties

Port edges use the same stroke style and arrowhead as direct edges. Relation label and tooltip behavior are identical. The port indicator circle at the port handle end is the visual distinction.

## Figma Node

- **Component:** `Edge/LinkEdge/DependsOn` (same component as direct edge — routing is the differentiator)
- **File key:** `beEbYQhz9LBLHrAj2eGyft`
