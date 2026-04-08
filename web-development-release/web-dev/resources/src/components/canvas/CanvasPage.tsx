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
import { ContextMenu } from '../ui/ContextMenu'
import type { MenuItem } from '../ui/ContextMenu'
import { NewModuleDialog } from '../ui/NewModuleDialog'
import { CommandPalette } from '../ui/CommandPalette'
import type { Command } from '../ui/CommandPalette'
import { ModuleNode } from './ModuleNode'
import type { ModuleNodeData } from './ModuleNode'
import { ExternalStubNode } from './ExternalStubNode'
import type { ExternalStubNodeData } from './ExternalStubNode'
import { LinkEdge } from './LinkEdge'
import s from './CanvasPage.module.css'

const NODE_TYPES = { moduleNode: ModuleNode, externalStubNode: ExternalStubNode }
const EDGE_TYPES = { linkEdge: LinkEdge }

const GRID_W = 240
const GRID_H = 170

function autoLayout(children: ChildModule[]): Record<string, { x: number; y: number }> {
  const cols = Math.max(1, Math.ceil(Math.sqrt(children.length)))
  return Object.fromEntries(
    children.map((c, i) => [
      c.uuid,
      { x: (i % cols) * GRID_W + 40, y: Math.floor(i / cols) * GRID_H + 40 },
    ])
  )
}

function buildNodes(
  children: ChildModule[],
  layout: Record<string, { x: number; y: number }>,
  externalLinks: ModuleLink[],
  childUuidSet: Set<string>,
): Node[] {
  const positions = Object.keys(layout).length > 0 ? layout : autoLayout(children)

  const moduleNodes: Node[] = children.map(child => ({
    id: child.uuid,
    type: 'moduleNode',
    position: positions[child.uuid] ?? { x: 0, y: 0 },
    data: {
      child,
      submoduleCount: 0, // loaded lazily
    } satisfies ModuleNodeData,
  }))

  // External stubs for links pointing outside current children
  let stubX = (children.length > 0 ? Math.ceil(Math.sqrt(children.length)) : 1) * GRID_W + 100
  const externalNodes: Node[] = externalLinks
    .filter(link => !childUuidSet.has(link.uuid))
    .map(link => {
      const x = stubX
      stubX += 200
      return {
        id: `stub-${link.uuid}`,
        type: 'externalStubNode',
        position: layout[`stub-${link.uuid}`] ?? { x, y: 40 },
        data: {
          uuid: link.uuid,
          relation: link.relation,
          label: link.description,
        } satisfies ExternalStubNodeData,
      }
    })

  return [...moduleNodes, ...externalNodes]
}

function buildEdges(links: ModuleLink[], childUuidSet: Set<string>, sourceId: string): Edge[] {
  return links.map(link => {
    const targetId = childUuidSet.has(link.uuid) ? link.uuid : `stub-${link.uuid}`
    return {
      id: `edge-${link.uuid}`,
      source: sourceId,
      target: targetId,
      type: 'linkEdge',
      data: { relation: link.relation },
      markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12 },
    } satisfies Edge
  })
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
  const [ctxMenu, setCtxMenu]  = useState<{ x: number; y: number; items: MenuItem[] } | null>(null)
  const [showNewModule, setShowNewModule] = useState(false)
  const [showPalette, setShowPalette]     = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Rebuild graph when module changes
  useEffect(() => {
    if (!currentModule) return
    const childUuidSet = new Set(currentModule.children.map(c => c.uuid))
    const newNodes = buildNodes(
      currentModule.children,
      currentModule.layout,
      currentModule.links,
      childUuidSet,
    )
    const newEdges = buildEdges(currentModule.links, childUuidSet, currentModule.uuid)
    setNodes(newNodes)
    setEdges(newEdges)
  }, [currentModule, setNodes, setEdges])

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

  // Double-click a node → navigate in
  const handleNodeDoubleClick: NodeMouseHandler = useCallback((_e, node) => {
    if (node.type === 'moduleNode') {
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
      <Breadcrumb />
      <div className={s.canvas} style={{ position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDoubleClick={handleNodeDoubleClick}
          onNodeContextMenu={handleNodeContextMenu}
          onPaneClick={() => setCtxMenu(null)}
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

        {/* Toolbar */}
        <div className={s.toolbar}>
          <button className={s.toolBtn} onClick={() => setShowNewModule(true)}>＋ Module</button>
          <button className={s.toolBtn} onClick={() => reload()}>↺ Reload</button>
          <button className={s.toolBtn} onClick={toggleTheme} title="Toggle light/dark mode">
            {theme === 'dark' ? '☀ Light' : '☾ Dark'}
          </button>
          <button className={s.toolBtn} onClick={() => setShowPalette(true)}>⌘K</button>
        </div>

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
