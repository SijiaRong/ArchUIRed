import { useState } from 'react'
import type { ChildModule, ModuleLink } from '../../types'
import s from './DetailPanel.module.css'

// Relation pill colors keyed by relation name
const RELATION_COLORS: Record<string, string> = {
  'depends-on': 'var(--color-edge-depends-on)',
  'implements':  'var(--color-edge-implements)',
  'extends':     'var(--color-edge-extends)',
  'references':  'var(--color-edge-references)',
  'related-to':  'var(--color-edge-related-to)',
  'custom':      'var(--color-edge-custom)',
}

// Port palette for title accent color (round-robin 0-7)
const PORT_COLORS = [
  'var(--color-port-0)',
  'var(--color-port-1)',
  'var(--color-port-2)',
  'var(--color-port-3)',
  'var(--color-port-4)',
  'var(--color-port-5)',
  'var(--color-port-6)',
  'var(--color-port-7)',
]

interface RelationPillProps { relation?: string }
function RelationPill({ relation }: RelationPillProps) {
  if (!relation) return null
  const color = RELATION_COLORS[relation] ?? RELATION_COLORS['custom']
  return (
    <span
      className={s.pill}
      style={{ color, backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` } as React.CSSProperties}
    >
      {relation}
    </span>
  )
}

interface LinkRowProps {
  link: ModuleLink
  targetModule?: ChildModule
}
function LinkRow({ link, targetModule }: LinkRowProps) {
  const [hovered, setHovered] = useState(false)
  const targetName = targetModule?.name ?? link.uuid.slice(0, 8)
  const isFallback = !targetModule

  return (
    <div
      className={`${s.row} ${hovered ? s.rowHovered : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={s.rowMain}>
        <RelationPill relation={link.relation} />
        <span className={isFallback ? s.rowNameFallback : s.rowName}>{targetName}</span>
      </div>
      {link.description && (
        <div className={s.rowMeta}>{link.description}</div>
      )}
      {hovered && targetModule?.description && (
        <div className={s.rowMeta}>{targetModule.description}</div>
      )}
    </div>
  )
}

interface LinkedByRowProps {
  sourceModule: ChildModule
  link: ModuleLink
}
function LinkedByRow({ sourceModule, link }: LinkedByRowProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={`${s.row} ${hovered ? s.rowHovered : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={s.rowMain}>
        <RelationPill relation={link.relation} />
        <span className={s.rowName}>{sourceModule.name}</span>
      </div>
      {link.description && (
        <div className={s.rowMeta}>{link.description}</div>
      )}
      {hovered && sourceModule.description && (
        <div className={s.rowMeta}>{sourceModule.description}</div>
      )}
    </div>
  )
}

export interface DetailPanelProps {
  selectedUuid: string | null
  /** All sibling modules at the current canvas level */
  allModules: ChildModule[]
  /** Sibling index of selected module (for port color round-robin) */
  selectedIndex: number
}

export function DetailPanel({ selectedUuid, allModules, selectedIndex }: DetailPanelProps) {
  const isVisible = selectedUuid !== null
  const module = allModules.find(m => m.uuid === selectedUuid) ?? null

  // Build UUID → module map for resolving link targets
  const moduleByUuid = new Map(allModules.map(m => [m.uuid, m]))

  // Linked-by: modules in current canvas that link to selectedUuid
  const linkedBy: Array<{ source: ChildModule; link: ModuleLink }> = []
  if (selectedUuid) {
    for (const m of allModules) {
      for (const link of m.links) {
        if (link.uuid === selectedUuid) {
          linkedBy.push({ source: m, link })
        }
      }
    }
  }

  const titleColor = PORT_COLORS[selectedIndex % PORT_COLORS.length] ?? PORT_COLORS[0]

  return (
    <div className={`${s.panel} ${isVisible ? s.visible : ''}`}>
      {module && (
        <div className={s.content}>
          {/* Header */}
          <h2 className={s.title} style={{ color: titleColor } as React.CSSProperties}>
            {module.name}
          </h2>
          <div className={s.uuid}>{module.uuid.slice(0, 8)}</div>
          {module.description && (
            <p className={s.description}>{module.description}</p>
          )}

          {/* Submodules section */}
          {module.submodules.length > 0 && (
            <>
              <hr className={s.divider} />
              <div className={s.sectionHeader}>SUBMODULES ({module.submodules.length})</div>
              {module.submodules.map(sub => (
                <SubmoduleRow key={sub.uuid} name={sub.name} description={sub.description} />
              ))}
            </>
          )}

          {/* Link to section */}
          {module.links.length > 0 && (
            <>
              <hr className={s.divider} />
              <div className={s.sectionHeader}>LINK TO ({module.links.length})</div>
              {module.links.map(link => (
                <LinkRow
                  key={link.uuid}
                  link={link}
                  targetModule={moduleByUuid.get(link.uuid)}
                />
              ))}
            </>
          )}

          {/* Linked by section */}
          {linkedBy.length > 0 && (
            <>
              <hr className={s.divider} />
              <div className={s.sectionHeader}>LINKED BY ({linkedBy.length})</div>
              {linkedBy.map(({ source, link }) => (
                <LinkedByRow key={source.uuid} sourceModule={source} link={link} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

interface SubmoduleRowProps { name: string; description?: string }
function SubmoduleRow({ name, description }: SubmoduleRowProps) {
  const [hovered, setHovered] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const canExpand = !!description

  return (
    <div
      className={`${s.row} ${hovered ? s.rowHovered : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => { if (canExpand) setExpanded(e => !e) }}
    >
      <div className={s.rowMain}>
        {canExpand && (
          <span className={`${s.arrow} ${expanded ? s.arrowExpanded : ''}`}>›</span>
        )}
        <span className={`${s.rowName} ${!canExpand ? s.rowNameNoArrow : ''}`}>{name}</span>
      </div>
      {expanded && description && (
        <div className={s.rowMeta}>{description}</div>
      )}
    </div>
  )
}
