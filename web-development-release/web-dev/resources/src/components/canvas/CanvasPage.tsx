import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react'
import type { Connection, Edge, Node, NodeMouseHandler, OnNodesChange } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useCanvasStore } from '../../store/canvas'
import { saveLayout, addLink, createModule } from '../../filesystem/writeOps'
import type { ArchModule, ModuleLink, ProjectIndexEntry } from '../../types'
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
import { DetailPanel } from './DetailPanel'
import s from './CanvasPage.module.css'

const NODE_TYPES = { moduleNode: ModuleNode, externalStubNode: ExternalStubNode }
const EDGE_TYPES = { linkEdge: LinkEdge }

const CHILD_GRID_X = 700
const CHILD_GRID_Y = 120
const CHILD_GRID_W = 260
const CHILD_GRID_H = 190
const EXTERNAL_LEFT_X = 42
const EXTERNAL_RIGHT_X = 1180
const EXTERNAL_Y = 120
const EXTERNAL_GAP = 168

const ACCENT_COUNT = 6

interface CanvasPageProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

function placeholderEntry(uuid: string): ProjectIndexEntry {
  return {
    uuid,
    path: '',
    parentPath: null,
    name: 'Unknown module',
    description: 'This module UUID is not currently resolvable in the project index.',
    submodules: {},
    links: [],
  }
}

function accentIndexFromUuid(uuid: string): number {
  const slice = uuid.slice(0, 2) || '00'
  return Number.parseInt(slice, 16) % ACCENT_COUNT
}

function relationColor(relation?: string): string {
  switch (relation) {
    case 'depends-on':
      return 'var(--edge-depends-on)'
    case 'implements':
      return 'var(--edge-implements)'
    case 'extends':
      return 'var(--edge-extends)'
    case 'references':
      return 'var(--edge-references)'
    case 'related-to':
    default:
      return 'var(--edge-related-to)'
  }
}

function realUuid(nodeId: string): string {
  return nodeId.startsWith('ext-') ? nodeId.slice(4) : nodeId
}

function autoChildPosition(index: number, total: number): { x: number; y: number } {
  const cols = total > 4 ? 2 : 1
  const col = index % cols
  const row = Math.floor(index / cols)
  return {
    x: CHILD_GRID_X + col * CHILD_GRID_W,
    y: CHILD_GRID_Y + row * CHILD_GRID_H + (col % 2) * 26,
  }
}

function autoExternalPosition(index: number, side: 'left' | 'right'): { x: number; y: number } {
  return {
    x: side === 'left' ? EXTERNAL_LEFT_X : EXTERNAL_RIGHT_X,
    y: EXTERNAL_Y + index * EXTERNAL_GAP,
  }
}

function buildGraph(
  currentModule: ArchModule,
  projectIndex: Record<string, ProjectIndexEntry>,
  selectedUuid: string | null,
): { nodes: Node[]; edges: Edge[] } {
  const visibleIds = new Set<string>([currentModule.uuid, ...currentModule.children.map(child => child.uuid)])
  const externalNodes = new Map<string, {
    entry: ProjectIndexEntry
    relationLabels: Set<string>
    side: 'left' | 'right'
  }>()
  const seenEdges = new Set<string>()
  const edges: Edge[] = []

  function ensureExternal(uuid: string, side: 'left' | 'right', relation?: string) {
    if (visibleIds.has(uuid)) return
    const meta = externalNodes.get(uuid) ?? {
      entry: projectIndex[uuid] ?? placeholderEntry(uuid),
      relationLabels: new Set<string>(),
      side,
    }
    if (side === 'left') meta.side = 'left'
    if (relation) meta.relationLabels.add(relation)
    externalNodes.set(uuid, meta)
  }

  for (const source of Object.values(projectIndex)) {
    for (const link of source.links) {
      const sourceVisible = visibleIds.has(source.uuid)
      const targetVisible = visibleIds.has(link.uuid)
      if (!sourceVisible && !targetVisible) continue

      const sourceId = sourceVisible ? source.uuid : `ext-${source.uuid}`
      const targetId = targetVisible ? link.uuid : `ext-${link.uuid}`
      if (sourceId === targetId) continue

      if (!sourceVisible) ensureExternal(source.uuid, 'left', link.relation)
      if (!targetVisible) ensureExternal(link.uuid, 'right', link.relation)

      const edgeKey = `${sourceId}|${targetId}|${link.relation ?? 'related-to'}|${link.description ?? ''}`
      if (seenEdges.has(edgeKey)) continue
      seenEdges.add(edgeKey)

      const stroke = relationColor(link.relation)
      edges.push({
        id: edgeKey,
        source: sourceId,
        target: targetId,
        type: 'linkEdge',
        data: { relation: link.relation },
        markerEnd: { type: MarkerType.ArrowClosed, color: stroke, width: 14, height: 14 },
        style: { stroke },
      } satisfies Edge)
    }
  }

  const primaryEntry = projectIndex[currentModule.uuid] ?? {
    uuid: currentModule.uuid,
    path: currentModule.path,
    parentPath: null,
    name: currentModule.name,
    description: currentModule.description,
    submodules: currentModule.submodules,
    links: currentModule.links,
  }

  const nodes: Node[] = [
    {
      id: currentModule.uuid,
      type: 'moduleNode',
      position: currentModule.layout[currentModule.uuid] ?? { x: 320, y: 230 },
      draggable: false,
      data: {
        entry: primaryEntry,
        variant: 'primary',
        submoduleCount: currentModule.children.length,
        linkCount: currentModule.links.length,
        accentIndex: accentIndexFromUuid(currentModule.uuid),
      } satisfies ModuleNodeData,
      selected: selectedUuid === currentModule.uuid,
    },
    ...currentModule.children.map((child, index) => {
      const entry = projectIndex[child.uuid] ?? {
        uuid: child.uuid,
        path: child.path,
        parentPath: currentModule.path,
        name: child.name,
        description: child.description,
        submodules: {},
        links: child.links,
      }

      return {
        id: child.uuid,
        type: 'moduleNode',
        position: currentModule.layout[child.uuid] ?? autoChildPosition(index, currentModule.children.length),
        data: {
          entry,
          variant: 'child',
          submoduleCount: child.submoduleCount,
          linkCount: child.links.length,
          accentIndex: accentIndexFromUuid(child.uuid),
        } satisfies ModuleNodeData,
        selected: selectedUuid === child.uuid,
      } satisfies Node
    }),
  ]

  const leftNodes = Array.from(externalNodes.values()).filter(item => item.side === 'left')
  const rightNodes = Array.from(externalNodes.values()).filter(item => item.side === 'right')

  const orderedExternals = [
    ...leftNodes.map((item, index) => ({ ...item, index })),
    ...rightNodes.map((item, index) => ({ ...item, index })),
  ]

  for (const item of orderedExternals) {
    const id = `ext-${item.entry.uuid}`
    const position = currentModule.layout[id] ?? autoExternalPosition(item.index, item.side)
    nodes.push({
      id,
      type: 'externalStubNode',
      position,
      data: {
        entry: item.entry,
        relationLabels: Array.from(item.relationLabels),
        accentIndex: accentIndexFromUuid(item.entry.uuid),
        side: item.side,
      } satisfies ExternalStubNodeData,
      selected: selectedUuid === item.entry.uuid,
    } satisfies Node)
  }

  return { nodes, edges }
}

export function CanvasPage({ theme, onToggleTheme }: CanvasPageProps) {
  const currentModule = useCanvasStore(s => s.currentModule)
  const projectIndex  = useCanvasStore(s => s.projectIndex)
  const adapter       = useCanvasStore(s => s.adapter)
  const navigate      = useCanvasStore(s => s.navigate)
  const reload        = useCanvasStore(s => s.reload)
  const loading       = useCanvasStore(s => s.loading)
  const error         = useCanvasStore(s => s.error)
  const setError      = useCanvasStore(s => s.setError)

  const [selectedUuid, setSelectedUuid] = useState<string | null>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; items: MenuItem[] } | null>(null)
  const [showNewModule, setShowNewModule] = useState(false)
  const [showPalette, setShowPalette] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!currentModule) return
    const next = buildGraph(currentModule, projectIndex, selectedUuid)
    setNodes(next.nodes)
    setEdges(next.edges)
  }, [currentModule, projectIndex, selectedUuid, setNodes, setEdges])

  const handleNodesChange: OnNodesChange = useCallback((changes) => {
    onNodesChange(changes)
    if (!currentModule) return
    const hasDrag = changes.some(change => change.type === 'position' && change.dragging === false)
    if (!hasDrag) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      setNodes(current => {
        const layout: Record<string, { x: number; y: number }> = {}
        for (const node of current) layout[node.id] = node.position
        saveLayout(adapter, currentModule.uuid, layout).catch(console.error)
        return current
      })
    }, 500)
  }, [currentModule, adapter, onNodesChange, setNodes])

  const handleNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedUuid(realUuid(node.id))
  }, [])

  const handleNodeDoubleClick: NodeMouseHandler = useCallback(async (_event, node) => {
    const uuid = realUuid(node.id)
    const entry = projectIndex[uuid]
    if (!entry?.path) return
    await navigate(entry.path)
    setSelectedUuid(uuid)
  }, [navigate, projectIndex])

  const handleNodeContextMenu: NodeMouseHandler = useCallback((event, node) => {
    event.preventDefault()
    const uuid = realUuid(node.id)
    const entry = projectIndex[uuid]
    const items: MenuItem[] = []

    if (entry?.path) {
      items.push({ id: 'open', label: 'Open module', icon: '>', action: () => { void navigate(entry.path); setSelectedUuid(uuid) } })
    }

    if (uuid === currentModule?.uuid) {
      items.push(
        { id: 'new-child', label: 'New child module', icon: '+', action: () => setShowNewModule(true) },
        { id: 'reload', label: 'Reload workspace', icon: 'R', action: () => void reload() },
      )
    }

    if (items.length > 0) {
      setCtxMenu({ x: event.clientX, y: event.clientY, items })
    }
  }, [currentModule?.uuid, navigate, projectIndex, reload])

  const onConnect = useCallback(async (connection: Connection) => {
    if (!connection.source || !connection.target) return
    const sourceUuid = realUuid(connection.source)
    const targetUuid = realUuid(connection.target)
    const sourceEntry = projectIndex[sourceUuid]
    if (!sourceEntry?.path) return

    const link: ModuleLink = { uuid: targetUuid, relation: 'related-to' }
    try {
      await addLink(adapter, sourceEntry.path, link)
      await reload()
      setSelectedUuid(sourceUuid)
    } catch (e) {
      setError(String(e))
    }
  }, [adapter, projectIndex, reload, setError])

  async function handleCreateModule(folderName: string, name: string, description: string) {
    if (!currentModule) return
    setShowNewModule(false)
    try {
      await createModule(adapter, currentModule.path, folderName, name, description)
      await reload()
      setSelectedUuid(currentModule.uuid)
    } catch (e) {
      setError(String(e))
    }
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setShowPalette(value => !value)
      }
      if (event.key === 'Escape') {
        setShowPalette(false)
        setCtxMenu(null)
        setSelectedUuid(null)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const commands = useMemo<Command[]>(() => {
    const list: Command[] = [
      { id: 'new-module', label: 'New child module', icon: '+', action: () => setShowNewModule(true) },
      { id: 'reload', label: 'Reload workspace', icon: 'R', hint: 'Reload current module', action: () => reload() },
      { id: 'toggle-theme', label: theme === 'light' ? 'Switch to dark' : 'Switch to light', icon: 'T', action: onToggleTheme },
    ]

    if (currentModule?.children) {
      for (const child of currentModule.children) {
        list.push({
          id: `nav-${child.uuid}`,
          label: child.name,
          hint: 'Open module',
          icon: '>',
          action: () => { void navigate(child.path); setSelectedUuid(child.uuid) },
        })
      }
    }

    return list
  }, [currentModule, navigate, onToggleTheme, reload, theme])

  const selectedEntry = selectedUuid ? (projectIndex[selectedUuid] ?? placeholderEntry(selectedUuid)) : null
  const selectionAccent = selectedUuid ? accentIndexFromUuid(selectedUuid) : accentIndexFromUuid(currentModule?.uuid ?? '00000000')
  const externalCount = nodes.filter(node => node.type === 'externalStubNode').length

  const workspaceTitle = currentModule?.name ?? 'Open a workspace'
  const workspaceDescription = currentModule?.description || 'Pick a local ArchUI project to step into the graph.'

  return (
    <div className={s.wrap}>
      <Breadcrumb />
      <div className={s.canvas}>
        <div className={s.canvasIntro}>
          <div className={s.kicker}>Deep Honey Workspace</div>
          <h1>{workspaceTitle}</h1>
          <p>{workspaceDescription}</p>
        </div>

        <div className={s.toolbar}>
          <button className={s.toolBtn} onClick={() => setShowNewModule(true)}>New child</button>
          <button className={s.toolBtn} onClick={() => reload()}>Reload</button>
          <button className={s.toolBtn} onClick={onToggleTheme}>{theme === 'light' ? 'Dark mode' : 'Light mode'}</button>
          <button className={s.toolBtn} onClick={() => setShowPalette(true)}>Command menu</button>
        </div>

        <div className={s.workspaceMeta}>
          <div className={s.metricCard}>
            <span className={s.metricLabel}>Submodules</span>
            <strong>{currentModule?.children.length ?? 0}</strong>
          </div>
          <div className={s.metricCard}>
            <span className={s.metricLabel}>Visible externals</span>
            <strong>{externalCount}</strong>
          </div>
          <div className={s.metricCard}>
            <span className={s.metricLabel}>Theme</span>
            <strong>{theme}</strong>
          </div>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          onNodeDoubleClick={handleNodeDoubleClick}
          onNodeContextMenu={handleNodeContextMenu}
          onPaneClick={() => { setCtxMenu(null); setSelectedUuid(null) }}
          nodeTypes={NODE_TYPES}
          edgeTypes={EDGE_TYPES}
          fitView
          fitViewOptions={{ padding: 0.16, maxZoom: 1.15 }}
          minZoom={0.28}
          maxZoom={2.2}
          deleteKeyCode="Delete"
          proOptions={{ hideAttribution: true }}
          className={s.flow}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="var(--canvas-dot)" />
          <Controls showInteractive={false} className={s.controls} />
          <MiniMap
            nodeColor={node => node.type === 'moduleNode' ? 'var(--node-bg)' : 'var(--surface-panel)'}
            maskColor="var(--overlay-dim)"
            style={{ background: 'var(--surface-overlay)', border: '1px solid var(--line-default)' }}
          />
        </ReactFlow>

        {!selectedEntry && (
          <div className={s.selectionHint}>
            <strong>Click a card to inspect it.</strong>
            <span>Double-click any visible module to drill into that workspace.</span>
          </div>
        )}

        {selectedEntry && currentModule && (
          <DetailPanel
            entry={selectedEntry}
            currentModuleUuid={currentModule.uuid}
            projectIndex={projectIndex}
            accentIndex={selectionAccent}
            onNavigate={(path, uuid) => {
              void navigate(path)
              setSelectedUuid(uuid)
            }}
            onClose={() => setSelectedUuid(null)}
          />
        )}

        {loading && <div className={s.loading}>Loading workspace…</div>}

        {!loading && currentModule && currentModule.children.length === 0 && (
          <div className={s.emptyHint}>
            <h3>No submodules yet</h3>
            <p>Create the first child module to start composing this workspace.</p>
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
