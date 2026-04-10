import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react'
import type { Connection, Edge, Node, NodeMouseHandler, OnNodesChange } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useCanvasStore } from '../../store/canvas'
import { saveLayout, addLink, createModule, copyModule, deleteModule } from '../../filesystem/writeOps'
import type { ArchModule, ModuleLink, ProjectIndexEntry } from '../../types'
import { workspaceContent } from '../../generated/workspace-content.generated'
import { workspaceLayout } from '../../generated/workspace-layout.generated'
import { Breadcrumb } from '../nav/Breadcrumb'
import { ContextMenu } from '../ui/ContextMenu'
import type { MenuItem } from '../ui/ContextMenu'
import { NewModuleDialog } from '../ui/NewModuleDialog'
import { CommandPalette } from '../ui/CommandPalette'
import type { Command } from '../ui/CommandPalette'
import { ModuleNode } from './ModuleNode'
import type { ModuleNodeData } from './ModuleNode'
import { LinkEdge } from './LinkEdge'
import { DetailPanel } from './DetailPanel'
import { Toast } from '../ui/Toast'
import { HubOverlay } from '../marketplace/HubOverlay'
import { MyModulesOverlay } from '../marketplace/MyModulesOverlay'
import { marketplaceContent } from '../marketplace/marketplace-content'
import { useMarketplaceStore } from '../../store/marketplace'
import s from './CanvasPage.module.css'

const NODE_TYPES = { moduleNode: ModuleNode }
const EDGE_TYPES = { linkEdge: LinkEdge }

const ACCENT_COUNT = 6

interface CanvasPageProps {}

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

  // Build position map for left-to-right edge normalization
  const positionMap = new Map<string, { x: number; y: number }>()
  positionMap.set(currentModule.uuid, currentModule.layout[currentModule.uuid] ?? workspaceLayout.canvas.graph.primaryNode)
  currentModule.children.forEach((child, index) => {
    positionMap.set(child.uuid, currentModule.layout[child.uuid] ?? autoChildPosition(index, currentModule.children.length))
  })

  for (const source of Object.values(projectIndex)) {
    for (const link of source.links) {
      const sourceVisible = visibleIds.has(source.uuid)
      const targetVisible = visibleIds.has(link.uuid)
      if (!sourceVisible && !targetVisible) continue

      let sourceId = source.uuid
      let targetId = link.uuid
      if (sourceId === targetId) continue

      // Normalize direction: source on left, target on right
      const sourcePos = positionMap.get(sourceId)
      const targetPos = positionMap.get(targetId)
      if (sourcePos && targetPos && sourcePos.x > targetPos.x) {
        const tmp = sourceId
        sourceId = targetId
        targetId = tmp
      }

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
      connectable: true,
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

export function CanvasPage(props: CanvasPageProps) {
  return (
    <ReactFlowProvider>
      <CanvasPageInner {...props} />
    </ReactFlowProvider>
  )
}

function CanvasPageInner({}: CanvasPageProps) {
  const currentModule = useCanvasStore(s => s.currentModule)
  const projectIndex = useCanvasStore(s => s.projectIndex)
  const adapter = useCanvasStore(s => s.adapter)
  const rootPath = useCanvasStore(s => s.rootPath)
  const navigate = useCanvasStore(s => s.navigate)
  const reload = useCanvasStore(s => s.reload)
  const loading = useCanvasStore(s => s.loading)
  const error = useCanvasStore(s => s.error)
  const setError = useCanvasStore(s => s.setError)
  const canvasContent = workspaceContent.canvas

  const [selectedUuid, setSelectedUuid] = useState<string | null>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const { screenToFlowPosition } = useReactFlow()
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; items: MenuItem[] } | null>(null)
  const [showNewModule, setShowNewModule] = useState(false)
  const [showPalette, setShowPalette] = useState(false)
  const [showHub, setShowHub] = useState(false)
  const [showMyModules, setShowMyModules] = useState(false)
  const [myModulesReplaceUuid, setMyModulesReplaceUuid] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type?: 'info' | 'error' } | null>(null)
  const [hintDismissed, setHintDismissed] = useState(() => localStorage.getItem('archui-hint-dismissed') === '1')
  const [hintVisible, setHintVisible] = useState(true)
  const [introVisible, setIntroVisible] = useState(true)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((message: string, type?: 'info' | 'error') => {
    setToast({ message, type })
  }, [])

  // Clean up save timer on unmount or module change
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [currentModule])

  // Auto-hide selection hint after 5s
  useEffect(() => {
    if (hintDismissed) return
    const t = setTimeout(() => setHintVisible(false), 5000)
    return () => clearTimeout(t)
  }, [hintDismissed])

  // Auto-hide canvas intro after 4s (re-shows on module change)
  useEffect(() => {
    setIntroVisible(true)
    const t = setTimeout(() => setIntroVisible(false), 4000)
    return () => clearTimeout(t)
  }, [currentModule?.uuid])

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
    const moduleUuid = currentModule.uuid
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      setNodes(current => {
        const layout: Record<string, { x: number; y: number }> = {}
        for (const node of current) layout[node.id] = node.position
        saveLayout(adapter, moduleUuid, layout).catch(console.error)
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

  const doPaste = useCallback(async (screenPos?: { x: number; y: number }) => {
    try {
      const text = await navigator.clipboard.readText()
      const m = /^archui:\/\/copy\?path=(.+)&uuid=([0-9a-f]{8})$/.exec(text)
      if (!m) {
        showToast(workspaceContent.canvas.contextMenu.nothingToPaste, 'error')
        return
      }
      const [, sourcePath] = m
      const destParent = currentModule?.path ?? rootPath ?? ''
      const flowPos = screenPos
        ? screenToFlowPosition(screenPos)
        : screenToFlowPosition({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
          })
      await copyModule(adapter, sourcePath, destParent, flowPos)
      await reload()
      showToast(workspaceContent.canvas.contextMenu.copiedToClipboard)
    } catch {
      showToast(workspaceContent.canvas.contextMenu.pasteFailed, 'error')
    }
  }, [adapter, currentModule?.path, rootPath, reload, showToast, screenToFlowPosition])

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

    items.push({
      id: 'copy',
      label: workspaceContent.canvas.contextMenu.copyModule,
      icon: 'C',
      action: () => {
        const absPath = entry?.path ?? ''
        void navigator.clipboard.writeText(
          `archui://copy?path=${absPath}&uuid=${uuid}`
        ).then(() => showToast(workspaceContent.canvas.contextMenu.copiedToClipboard))
      },
    })

    if (uuid !== currentModule?.uuid) {
      items.push({
        id: 'sep',
        label: '',
        action: () => {},
      })
      items.push({
        id: 'delete',
        label: workspaceContent.canvas.contextMenu.deleteModule,
        icon: 'X',
        danger: true,
        action: () => {
          const entry = projectIndex[uuid]
          if (!entry) return
          const parentPath = entry.parentPath ?? currentModule?.path ?? ''
          const folderName = entry.path.split('/').filter(Boolean).pop() ?? ''
          if (!confirm(workspaceContent.canvas.contextMenu.deleteConfirm)) return
          void (async () => {
            try {
              await deleteModule(adapter, parentPath, folderName, uuid)
              await reload()
            } catch {
              showToast(workspaceContent.canvas.contextMenu.deleteFailed, 'error')
            }
          })()
        },
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
          id: 'add-from-collection',
          label: marketplaceContent.contextMenu.addFromMyModules,
          icon: '◈',
          action: () => { setMyModulesReplaceUuid(null); setShowMyModules(true) },
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
  }, [adapter, currentModule?.uuid, currentModule?.path, navigate, projectIndex, reload, showToast])

  const handlePaneContextMenu = useCallback((event: MouseEvent | React.MouseEvent) => {
    event.preventDefault()
    const pos = { x: event.clientX, y: event.clientY }
    setCtxMenu({
      x: event.clientX,
      y: event.clientY,
      items: [
        {
          id: 'new-child',
          label: workspaceContent.canvas.contextMenu.newChildModule,
          icon: '+',
          action: () => setShowNewModule(true),
        },
        {
          id: 'add-from-collection',
          label: marketplaceContent.contextMenu.addFromMyModules,
          icon: '◈',
          action: () => { setMyModulesReplaceUuid(null); setShowMyModules(true) },
        },
        {
          id: 'paste',
          label: workspaceContent.canvas.contextMenu.pasteModule,
          icon: 'V',
          action: () => void doPaste(pos),
        },
      ],
    })
  }, [doPaste])

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
    const mod = currentModule
    if (!mod) {
      showToast('No module selected — please reload and try again', 'error')
      return
    }
    setShowNewModule(false)
    try {
      console.log('[handleCreateModule] path:', mod.path, 'folder:', folderName)
      await createModule(adapter, mod.path, folderName, name, description)
      await new Promise(r => setTimeout(r, 500))
      await reload()
      await new Promise(r => setTimeout(r, 300))
      await reload()
      showToast(`Created module "${name}"`)
    } catch (e) {
      console.error('[createModule FAILED]', e)
      showToast(`Failed to create module: ${e}`, 'error')
    }
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setShowPalette(value => !value)
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'c' && selectedUuid) {
        const selEntry = projectIndex[selectedUuid]
        if (selEntry?.path) {
          event.preventDefault()
          void navigator.clipboard.writeText(
            `archui://copy?path=${selEntry.path}&uuid=${selectedUuid}`
          ).then(() => showToast(workspaceContent.canvas.contextMenu.copiedToClipboard))
        }
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'v') {
        event.preventDefault()
        void doPaste()
      }
      if (event.key === 'Escape') {
        if (showHub) {
          // If viewing a detail inside Hub, go back to grid first
          const hubSelectedId = useMarketplaceStore.getState().selectedModuleId
          if (hubSelectedId) { useMarketplaceStore.getState().selectModule(null) }
          else { useMarketplaceStore.getState().resetHubState(); setShowHub(false) }
          return
        }
        if (showMyModules) { setShowMyModules(false); setMyModulesReplaceUuid(null); return }
        setShowPalette(false)
        setCtxMenu(null)
        setSelectedUuid(null)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedUuid, projectIndex, showToast, doPaste, showHub, showMyModules])

  const commands = useMemo<Command[]>(() => {
    const list: Command[] = [
      {
        id: 'new-module',
        label: canvasContent.commands.newChildModule,
        icon: '+',
        action: () => setShowNewModule(true),
      },
      {
        id: 'add-from-collection',
        label: marketplaceContent.commands.addFromMyModules,
        icon: '◈',
        hint: marketplaceContent.commands.addFromMyModulesHint,
        action: () => { setMyModulesReplaceUuid(null); setShowMyModules(true) },
      },
      {
        id: 'module-hub',
        label: marketplaceContent.toolbar.moduleHub,
        icon: '▤',
        hint: marketplaceContent.commands.moduleHubHint,
        action: () => setShowHub(true),
      },
      {
        id: 'reload',
        label: canvasContent.commands.reloadWorkspace,
        icon: 'R',
        hint: canvasContent.commands.reloadHint,
        action: () => reload(),
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
  }, [canvasContent.commands, currentModule, navigate, reload])

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
        <div className={`${s.canvasIntro} ${introVisible ? '' : s.canvasIntroHidden}`}>
          <div className={s.kicker}>{canvasContent.intro.kicker}</div>
          <h1>{workspaceTitle}</h1>
          <p>{workspaceDescription}</p>
        </div>

        <div className={s.toolbar}>
          <button className={s.toolBtn} onClick={() => setShowNewModule(true)}>{canvasContent.toolbar.newChild}</button>
          <button className={s.toolBtn} onClick={() => reload()}>{canvasContent.toolbar.reload}</button>
          <button className={s.toolBtn} onClick={() => setShowPalette(true)}>{canvasContent.toolbar.commandMenu}</button>
          <button className={`${s.toolBtn} ${s.toolBtnAccent}`} onClick={() => setShowHub(true)}>
            {marketplaceContent.toolbar.moduleHub}
          </button>
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
          onPaneContextMenu={handlePaneContextMenu}
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
            nodeColor={(node) => node.data?.variant === 'primary' ? 'var(--brand-honey)' : 'var(--brand-lake)'}
            nodeStrokeColor={() => 'var(--line-default)'}
            nodeStrokeWidth={2}
            maskColor="rgba(0, 0, 0, 0.12)"
            style={{ background: 'var(--surface-panel)', border: '1px solid var(--line-default)', borderRadius: 'var(--radius-soft)' }}
          />
        </ReactFlow>

        {!selectedEntry && !hintDismissed && hintVisible && (
          <div className={s.selectionHint}>
            <strong>{canvasContent.selectionHint.title}</strong>
            <span>{canvasContent.selectionHint.body}</span>
            <button
              className={s.selectionHintClose}
              onClick={() => { setHintDismissed(true); localStorage.setItem('archui-hint-dismissed', '1') }}
              aria-label="Dismiss hint"
            >×</button>
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
            onReplaceModule={selectedUuid !== currentModule.uuid ? () => { setMyModulesReplaceUuid(selectedUuid); setShowMyModules(true) } : undefined}
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

      {showHub && (
        <HubOverlay
          onClose={() => setShowHub(false)}
          onOpenMyModules={() => { setShowHub(false); setShowMyModules(true) }}
          onToast={showToast}
        />
      )}

      {showMyModules && (
        <MyModulesOverlay
          replacingUuid={myModulesReplaceUuid}
          projectIndex={projectIndex}
          adapter={adapter}
          rootPath={rootPath ?? '.'}
          currentModulePath={currentModule?.path ?? null}
          onClose={() => { setShowMyModules(false); setMyModulesReplaceUuid(null) }}
          onOpenHub={() => { setShowMyModules(false); setShowHub(true) }}
          onChanged={() => { void reload(); setSelectedUuid(null) }}
          onToast={showToast}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  )
}
