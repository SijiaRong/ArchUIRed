import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react'
import type { Node, Edge, Connection, NodeMouseHandler, OnNodesChange } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useCanvasStore } from '../../store/canvas'
import { saveLayout, addLink, createModule } from '../../filesystem/writeOps'
import type { ChildModule, ModuleLink } from '../../types'
import { Breadcrumb } from '../nav/Breadcrumb'
import { StatusBar } from '../nav/StatusBar'
import { ContextMenu } from '../ui/ContextMenu'
import type { MenuItem } from '../ui/ContextMenu'
import { NewModuleDialog } from '../ui/NewModuleDialog'
import { CommandPalette } from '../ui/CommandPalette'
import type { Command } from '../ui/CommandPalette'
import { ModuleNode } from './ModuleNode'
import type { ModuleNodeData, ResolvedLink } from './ModuleNode'
import { LinkEdge } from './LinkEdge'
import { DetailPanel } from './DetailPanel'
import s from './CanvasPage.module.css'

const NODE_TYPES = { moduleNode: ModuleNode }
const EDGE_TYPES = { linkEdge: LinkEdge }

const GRID_W = 240
const H_GAP  = 60   // horizontal gap between columns
const V_GAP  = 40   // vertical gap between rows in same column

/** Card height formula: header(36) + uuid-row(28) + body(52) + optional port section */
function cardHeight(child: ChildModule): number {
  return 116 + (child.links.length > 0 ? 1 + child.links.length * 28 : 0)
}

/** Arrange children in columns, advancing Y cursor by actual card height to prevent overlap */
function autoLayout(children: ChildModule[]): Record<string, { x: number; y: number }> {
  const cols = Math.max(1, Math.ceil(Math.sqrt(children.length)))
  const colY = Array<number>(cols).fill(40)
  return Object.fromEntries(children.map((child, i) => {
    const col = i % cols
    const pos = { x: col * (GRID_W + H_GAP) + 40, y: colY[col] }
    colY[col] += cardHeight(child) + V_GAP
    return [child.uuid, pos]
  }))
}

interface Rect { x: number; y: number; w: number; h: number }
function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}
function hasOverlap(layout: Record<string, { x: number; y: number }>, children: ChildModule[]): boolean {
  const rects = children
    .filter(c => layout[c.uuid])
    .map(c => ({ ...layout[c.uuid], w: GRID_W, h: cardHeight(c) }))
  for (let i = 0; i < rects.length; i++)
    for (let j = i + 1; j < rects.length; j++)
      if (rectsOverlap(rects[i], rects[j])) return true
  return false
}

function buildNodes(
  children: ChildModule[],
  layout: Record<string, { x: number; y: number }>,
): Node[] {
  const positions = Object.keys(layout).length > 0 ? layout : autoLayout(children)

  // UUID → name map for resolving port row labels
  const childByUuid = new Map(children.map(c => [c.uuid, c]))

  return children.map(child => {
    const resolvedLinks: ResolvedLink[] = child.links.map(link => ({
      uuid: link.uuid,
      relation: link.relation,
      description: link.description,
      targetName: childByUuid.get(link.uuid)?.name,  // resolved if sibling; undefined for cross-level
    }))
    return {
      id: child.uuid,
      type: 'moduleNode',
      position: positions[child.uuid] ?? { x: 0, y: 0 },
      data: {
        child,
        submoduleCount: child.submodules.length,
        resolvedLinks,
      } satisfies ModuleNodeData,
    }
  })
}

// Edges are only drawn between siblings — cross-level links are omitted (visible in detail panel)
function buildEdges(children: ChildModule[], childUuidSet: Set<string>): Edge[] {
  const edges: Edge[] = []
  for (const child of children) {
    for (const link of child.links) {
      if (!childUuidSet.has(link.uuid)) continue  // skip cross-level links
      edges.push({
        id: `edge-${child.uuid}-${link.uuid}`,
        source: child.uuid,
        target: link.uuid,
        sourceHandle: link.fromPortId ? `port-${link.uuid}` : undefined,
        type: 'linkEdge',
        data: { relation: link.relation },
        markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12 },
      } satisfies Edge)
    }
  }
  return edges
}

function getTheme() {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
}

export function CanvasPage() {
  const currentModule   = useCanvasStore(s => s.currentModule)
  const adapter         = useCanvasStore(s => s.adapter)
  const navigate        = useCanvasStore(s => s.navigate)
  const reload          = useCanvasStore(s => s.reload)
  const loading         = useCanvasStore(s => s.loading)
  const error           = useCanvasStore(s => s.error)
  const setError        = useCanvasStore(s => s.setError)
  const [theme, setTheme] = useState<'dark' | 'light'>(getTheme)

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    setTheme(next)
  }

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [selectedCount, setSelectedCount] = useState(0)
  const [selectedUuid, setSelectedUuid] = useState<string | null>(null)
  const [ctxMenu, setCtxMenu]  = useState<{ x: number; y: number; items: MenuItem[] } | null>(null)
  const [showNewModule, setShowNewModule] = useState(false)
  const [showPalette, setShowPalette]     = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Rebuild graph when module changes; auto-correct overlapping layouts
  useEffect(() => {
    if (!currentModule) return
    setSelectedUuid(null)  // clear selection when navigating to a new level
    const { children, layout: savedLayout, uuid } = currentModule
    const childUuidSet = new Set(children.map(c => c.uuid))

    // Use saved layout unless it's empty or has overlaps (e.g. after cards gained port rows)
    const hasValidLayout = Object.keys(savedLayout).length > 0 && !hasOverlap(savedLayout, children)
    const layout = hasValidLayout ? savedLayout : autoLayout(children)
    if (!hasValidLayout && Object.keys(savedLayout).length > 0) {
      // Overlaps detected — persist corrected layout silently
      saveLayout(adapter, uuid, layout).catch(console.error)
    }

    setNodes(buildNodes(children, layout))
    setEdges(buildEdges(children, childUuidSet))
  }, [currentModule, adapter, setNodes, setEdges])

  // Persist layout after drag with debounce
  const handleNodesChange: OnNodesChange = useCallback((changes) => {
    onNodesChange(changes)
    if (!currentModule) return
    const hasDrag = changes.some(c => c.type === 'position' && c.dragging === false)
    if (!hasDrag) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      setNodes(current => {
        const layout: Record<string, { x: number; y: number }> = {}
        for (const n of current) layout[n.id] = n.position
        saveLayout(adapter, currentModule.uuid, layout).catch(console.error)
        return current
      })
    }, 600)
  }, [currentModule, adapter, onNodesChange, setNodes])

  // Double-click a node → navigate in (clear selection first)
  const handleNodeDoubleClick: NodeMouseHandler = useCallback((_e, node) => {
    if (node.type === 'moduleNode') {
      setSelectedUuid(null)
      const data = node.data as unknown as ModuleNodeData
      navigate(data.child.path)
    }
  }, [navigate])

  // Right-click a node → context menu
  const handleNodeContextMenu: NodeMouseHandler = useCallback((e, node) => {
    e.preventDefault()
    const items: MenuItem[] = []
    if (node.type === 'moduleNode') {
      const data = node.data as unknown as ModuleNodeData
      items.push(
        { id: 'open', label: 'Open', icon: '→', action: () => navigate(data.child.path) },
        { id: 'sep1', label: '', action: () => undefined },
        { id: 'new-child', label: 'New child module', icon: '＋', action: () => setShowNewModule(true) },
      )
    }
    if (items.length > 0) setCtxMenu({ x: e.clientX, y: e.clientY, items })
  }, [navigate])

  // Connect two nodes → add link in filesystem
  const onConnect = useCallback(async (connection: Connection) => {
    if (!currentModule) return
    // Find the source child module
    const sourceChild = currentModule.children.find(c => c.uuid === connection.source)
    const targetChild = currentModule.children.find(c => c.uuid === connection.target)
    if (!sourceChild || !targetChild) return
    const link: ModuleLink = { uuid: targetChild.uuid, relation: 'related-to' }
    try {
      await addLink(adapter, sourceChild.path, link)
      setEdges(eds => addEdge({
        ...connection,
        type: 'linkEdge',
        data: { relation: 'related-to' },
        markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12 },
      }, eds))
    } catch (e) {
      setError(String(e))
    }
  }, [currentModule, adapter, setEdges, setError])

  // Create new child module
  async function handleCreateModule(folderName: string, name: string, description: string) {
    if (!currentModule) return
    setShowNewModule(false)
    try {
      await createModule(adapter, currentModule.path, folderName, name, description)
      await reload()
    } catch (e) {
      setError(String(e))
    }
  }

  // Keyboard shortcut: Cmd/Ctrl+K → command palette
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setShowPalette(v => !v) }
      if (e.key === 'Escape') { setShowPalette(false); setCtxMenu(null) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const commands = useMemo<Command[]>(() => {
    const cmds: Command[] = [
      { id: 'new-module', label: 'New module', icon: '＋', action: () => setShowNewModule(true) },
      { id: 'reload', label: 'Reload', icon: '↺', hint: 'Reload current module', action: () => reload() },
    ]
    if (currentModule?.children) {
      for (const child of currentModule.children) {
        cmds.push({
          id: `nav-${child.uuid}`,
          label: child.name,
          hint: 'Navigate',
          icon: '→',
          action: () => navigate(child.path),
        })
      }
    }
    return cmds
  }, [currentModule, navigate, reload])

  if (!currentModule && !loading) return null

  return (
    <div className={s.wrap}>
      {/* Topbar — 48px */}
      <header className={s.topbar}>
        <span className={s.topbarLogo}>ArchUI</span>
        <Breadcrumb />
        <div className={s.topbarRight}>
          <button className={s.toolBtn} onClick={() => setShowNewModule(true)}>＋ Module</button>
          <button className={s.toolBtn} onClick={() => reload()}>↺ Reload</button>
          <button className={s.toolBtn} onClick={toggleTheme} title="Toggle light/dark mode">
            {theme === 'dark' ? '☀ Light' : '☾ Dark'}
          </button>
          <button className={s.toolBtn} onClick={() => setShowPalette(true)}>⌘K</button>
        </div>
      </header>

      <div className={s.canvas} style={{ position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDoubleClick={handleNodeDoubleClick}
          onNodeContextMenu={handleNodeContextMenu}
          onPaneClick={() => { setCtxMenu(null); setSelectedUuid(null) }}
          onSelectionChange={({ nodes: sel }) => {
            setSelectedCount(sel.length)
            const firstModule = sel.find(n => n.type === 'moduleNode')
            setSelectedUuid(firstModule ? (firstModule.data as unknown as ModuleNodeData).child.uuid : null)
          }}
          nodeTypes={NODE_TYPES}
          edgeTypes={EDGE_TYPES}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={3}
          deleteKeyCode="Delete"
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--color-canvas-dot)" />
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={() => 'var(--color-surface-default)'}
            maskColor="var(--color-minimap-mask)"
            style={{ background: 'var(--color-surface-raised)' }}
          />
        </ReactFlow>

        {loading && <div className={s.loading}>Loading…</div>}

        {!loading && currentModule && currentModule.children.length === 0 && (
          <div className={s.emptyHint}>
            <h3>No submodules yet</h3>
            <p>Click "＋ Module" to add the first child module.</p>
          </div>
        )}

        {error && (
          <div className={s.errorBanner} onClick={() => setError(null)}>
            {error}
          </div>
        )}
      </div>

      {/* Status bar — 36px */}
      <StatusBar selectedCount={selectedCount} />

      {/* Detail panel — slides in from right on selection */}
      <DetailPanel
        selectedUuid={selectedUuid}
        allModules={currentModule?.children ?? []}
        selectedIndex={currentModule?.children.findIndex(c => c.uuid === selectedUuid) ?? 0}
      />

      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          items={ctxMenu.items}
          onClose={() => setCtxMenu(null)}
        />
      )}

      {showNewModule && (
        <NewModuleDialog
          onConfirm={handleCreateModule}
          onCancel={() => setShowNewModule(false)}
        />
      )}

      {showPalette && (
        <CommandPalette
          commands={commands}
          onClose={() => setShowPalette(false)}
        />
      )}
    </div>
  )
}
