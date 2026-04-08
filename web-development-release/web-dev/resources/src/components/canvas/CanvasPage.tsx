import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
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
import { workspaceContent } from '../../generated/workspace-content.generated'
import { workspaceLayout } from '../../generated/workspace-layout.generated'
import { Breadcrumb } from '../nav/Breadcrumb'
import { StatusBar } from '../nav/StatusBar'
import { ContextMenu } from '../ui/ContextMenu'
import type { MenuItem } from '../ui/ContextMenu'
import { NewModuleDialog } from '../ui/NewModuleDialog'
import { CommandPalette } from '../ui/CommandPalette'
import type { Command } from '../ui/CommandPalette'
import { ModuleNode } from './ModuleNode'
import type { ModuleNodeData } from './ModuleNode'
import { LinkEdge } from './LinkEdge'
import { DetailPanel } from './DetailPanel'
import s from './CanvasPage.module.css'

const NODE_TYPES = { moduleNode: ModuleNode }
const EDGE_TYPES = { linkEdge: LinkEdge }

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
    name: workspaceContent.canvas.placeholder.unknownModuleName,
    description: workspaceContent.canvas.placeholder.unknownModuleDescription,
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
  const childGrid = workspaceLayout.canvas.graph.childGrid
  const cols = total > childGrid.twoColumnThreshold ? 2 : 1
  const col = index % cols
  const row = Math.floor(index / cols)
  return {
    x: childGrid.originX + col * childGrid.columnWidth,
    y: childGrid.originY + row * childGrid.rowHeight + (col % 2) * childGrid.staggerY,
  }
}

function buildGraph(
  currentModule: ArchModule,
  projectIndex: Record<string, ProjectIndexEntry>,
  selectedUuid: string | null,
): { nodes: Node[]; edges: Edge[] } {
  const visibleIds = new Set<string>([currentModule.uuid, ...currentModule.children.map(child => child.uuid)])
  const seenEdges = new Set<string>()
  const edges: Edge[] = []

  for (const source of Object.values(projectIndex)) {
    for (const link of source.links) {
      const sourceVisible = visibleIds.has(source.uuid)
      const targetVisible = visibleIds.has(link.uuid)
      if (!sourceVisible && !targetVisible) continue

      const sourceId = source.uuid
      const targetId = link.uuid
      if (sourceId === targetId) continue
      if (!sourceVisible || !targetVisible) continue

      const edgeRelation = link.relation ?? workspaceContent.linkRenderer.defaultRelation
      const edgeKey = `${sourceId}|${targetId}|${edgeRelation}|${link.description ?? ''}`
      if (seenEdges.has(edgeKey)) continue
      seenEdges.add(edgeKey)

      const stroke = relationColor(link.relation)
      edges.push({
        id: edgeKey,
        source: sourceId,
        target: targetId,
        type: 'linkEdge',
        data: { relation: edgeRelation },
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
      position: currentModule.layout[currentModule.uuid] ?? workspaceLayout.canvas.graph.primaryNode,
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

  return { nodes, edges }
}

export function CanvasPage({ theme, onToggleTheme }: CanvasPageProps) {
  const currentModule = useCanvasStore(s => s.currentModule)
  const projectIndex = useCanvasStore(s => s.projectIndex)
  const adapter = useCanvasStore(s => s.adapter)
  const navigate = useCanvasStore(s => s.navigate)
  const reload = useCanvasStore(s => s.reload)
  const loading = useCanvasStore(s => s.loading)
  const error = useCanvasStore(s => s.error)
  const setError = useCanvasStore(s => s.setError)

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
      items.push({
        id: 'open',
        label: workspaceContent.canvas.contextMenu.openModule,
        icon: '>',
        action: () => { void navigate(entry.path); setSelectedUuid(uuid) },
      })
    }

    if (uuid === currentModule?.uuid) {
      items.push(
        {
          id: 'new-child',
          label: workspaceContent.canvas.contextMenu.newChildModule,
          icon: '+',
          action: () => setShowNewModule(true),
        },
        {
          id: 'reload',
          label: workspaceContent.canvas.contextMenu.reloadWorkspace,
          icon: 'R',
          action: () => void reload(),
        },
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

    const link: ModuleLink = { uuid: targetUuid, relation: workspaceContent.linkRenderer.defaultRelation }
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

  const canvasContent = workspaceContent.canvas
  const themeToggleLabel = theme === 'light'
    ? canvasContent.toolbar.themeToggle.toDark
    : canvasContent.toolbar.themeToggle.toLight

  const commands = useMemo<Command[]>(() => {
    const list: Command[] = [
      {
        id: 'new-module',
        label: canvasContent.commands.newChildModule,
        icon: '+',
        action: () => setShowNewModule(true),
      },
      {
        id: 'reload',
        label: canvasContent.commands.reloadWorkspace,
        icon: 'R',
        hint: canvasContent.commands.reloadHint,
        action: () => reload(),
      },
      {
        id: 'toggle-theme',
        label: themeToggleLabel,
        icon: 'T',
        action: onToggleTheme,
      },
    ]

    if (currentModule?.children) {
      for (const child of currentModule.children) {
        list.push({
          id: `nav-${child.uuid}`,
          label: child.name,
          hint: canvasContent.commands.openModuleHint,
          icon: '>',
          action: () => { void navigate(child.path); setSelectedUuid(child.uuid) },
        })
      }
    }

    return list
  }, [canvasContent.commands, currentModule, navigate, onToggleTheme, reload, themeToggleLabel])

  const selectedEntry = selectedUuid ? (projectIndex[selectedUuid] ?? placeholderEntry(selectedUuid)) : null
  const selectionAccent = selectedUuid ? accentIndexFromUuid(selectedUuid) : accentIndexFromUuid(currentModule?.uuid ?? '00000000')
  const workspaceTitle = currentModule?.name ?? canvasContent.intro.emptyTitle
  const workspaceDescription = currentModule?.description || canvasContent.intro.emptyDescription
  const canvasLayoutVars = {
    ['--canvas-intro-top' as string]: `${workspaceLayout.canvas.overlays.intro.desktop.top}px`,
    ['--canvas-intro-left' as string]: `${workspaceLayout.canvas.overlays.intro.desktop.left}px`,
    ['--canvas-intro-max-width' as string]: `${workspaceLayout.canvas.overlays.intro.desktop.maxWidth}px`,
    ['--canvas-intro-tablet-max-width' as string]: `${workspaceLayout.canvas.overlays.intro.tablet.maxWidth}px`,
    ['--canvas-intro-mobile-top' as string]: `${workspaceLayout.canvas.overlays.intro.mobile.top}px`,
    ['--canvas-intro-mobile-left' as string]: `${workspaceLayout.canvas.overlays.intro.mobile.left}px`,
    ['--canvas-intro-mobile-right' as string]: `${workspaceLayout.canvas.overlays.intro.mobile.right}px`,
    ['--canvas-toolbar-top' as string]: `${workspaceLayout.canvas.overlays.toolbar.desktop.top}px`,
    ['--canvas-toolbar-right' as string]: `${workspaceLayout.canvas.overlays.toolbar.desktop.right}px`,
    ['--canvas-toolbar-mobile-top' as string]: `${workspaceLayout.canvas.overlays.toolbar.mobile.top}px`,
    ['--canvas-toolbar-mobile-left' as string]: `${workspaceLayout.canvas.overlays.toolbar.mobile.left}px`,
    ['--canvas-toolbar-mobile-right' as string]: `${workspaceLayout.canvas.overlays.toolbar.mobile.right}px`,
    ['--canvas-meta-top' as string]: `${workspaceLayout.canvas.overlays.workspaceMeta.desktop.top}px`,
    ['--canvas-meta-left' as string]: `${workspaceLayout.canvas.overlays.workspaceMeta.desktop.left}px`,
    ['--canvas-meta-tablet-top' as string]: `${workspaceLayout.canvas.overlays.workspaceMeta.tablet.top}px`,
    ['--canvas-meta-mobile-top' as string]: `${workspaceLayout.canvas.overlays.workspaceMeta.mobile.top}px`,
    ['--canvas-meta-mobile-left' as string]: `${workspaceLayout.canvas.overlays.workspaceMeta.mobile.left}px`,
    ['--canvas-selection-hint-right' as string]: `${workspaceLayout.canvas.overlays.selectionHint.desktop.right}px`,
    ['--canvas-selection-hint-bottom' as string]: `${workspaceLayout.canvas.overlays.selectionHint.desktop.bottom}px`,
    ['--canvas-selection-hint-mobile-left' as string]: `${workspaceLayout.canvas.overlays.selectionHint.mobile.left}px`,
    ['--canvas-selection-hint-mobile-right' as string]: `${workspaceLayout.canvas.overlays.selectionHint.mobile.right}px`,
    ['--canvas-selection-hint-mobile-bottom' as string]: `${workspaceLayout.canvas.overlays.selectionHint.mobile.bottom}px`,
    ['--detail-panel-top' as string]: `${workspaceLayout.canvas.overlays.detailPanel.desktop.top}px`,
    ['--detail-panel-right' as string]: `${workspaceLayout.canvas.overlays.detailPanel.desktop.right}px`,
    ['--detail-panel-bottom' as string]: `${workspaceLayout.canvas.overlays.detailPanel.desktop.bottom}px`,
    ['--detail-panel-width' as string]: `${workspaceLayout.canvas.overlays.detailPanel.desktop.width}px`,
    ['--detail-panel-viewport-inset' as string]: `${workspaceLayout.canvas.overlays.detailPanel.desktop.viewportInset}px`,
    ['--detail-panel-mobile-inset' as string]: `${workspaceLayout.canvas.overlays.detailPanel.mobile.inset}px`,
    ['--detail-panel-mobile-max-height' as string]: workspaceLayout.canvas.overlays.detailPanel.mobile.maxHeight,
  } as CSSProperties

  return (
    <div className={s.wrap}>
      <Breadcrumb />
      <div className={s.canvas} style={canvasLayoutVars}>
        <div className={s.canvasIntro}>
          <div className={s.kicker}>{canvasContent.intro.kicker}</div>
          <h1>{workspaceTitle}</h1>
          <p>{workspaceDescription}</p>
        </div>

        <div className={s.toolbar}>
          <button className={s.toolBtn} onClick={() => setShowNewModule(true)}>{canvasContent.toolbar.newChild}</button>
          <button className={s.toolBtn} onClick={() => reload()}>{canvasContent.toolbar.reload}</button>
          <button className={s.toolBtn} onClick={onToggleTheme}>{themeToggleLabel}</button>
          <button className={s.toolBtn} onClick={() => setShowPalette(true)}>{canvasContent.toolbar.commandMenu}</button>
        </div>

        <div className={s.workspaceMeta}>
          <div className={s.metricCard}>
            <span className={s.metricLabel}>{canvasContent.metrics.submodules}</span>
            <strong>{currentModule?.children.length ?? 0}</strong>
          </div>
          <div className={s.metricCard}>
            <span className={s.metricLabel}>{canvasContent.metrics.theme}</span>
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
          fitViewOptions={workspaceLayout.canvas.graph.fitView}
          minZoom={workspaceLayout.canvas.graph.zoom.min}
          maxZoom={workspaceLayout.canvas.graph.zoom.max}
          deleteKeyCode="Delete"
          proOptions={{ hideAttribution: true }}
          className={s.flow}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="var(--canvas-dot)" />
          <Controls showInteractive={false} className={s.controls} />
          <MiniMap
            nodeColor={() => 'var(--node-bg)'}
            maskColor="var(--overlay-dim)"
            style={{ background: 'var(--surface-overlay)', border: '1px solid var(--line-default)' }}
          />
        </ReactFlow>

        {!selectedEntry && (
          <div className={s.selectionHint}>
            <strong>{canvasContent.selectionHint.title}</strong>
            <span>{canvasContent.selectionHint.body}</span>
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

        {loading && <div className={s.loading}>{canvasContent.loading}</div>}

        {!loading && currentModule && currentModule.children.length === 0 && (
          <div className={s.emptyHint}>
            <h3>{canvasContent.emptyState.title}</h3>
            <p>{canvasContent.emptyState.body}</p>
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
