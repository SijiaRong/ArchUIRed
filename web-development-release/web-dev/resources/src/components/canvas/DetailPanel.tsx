import { workspaceContent } from '../../generated/workspace-content.generated'
import type { ProjectIndexEntry } from '../../types'
import s from './DetailPanel.module.css'

const RELATION_COLORS: Record<string, string> = {
  'depends-on': 'var(--color-edge-depends-on)',
  'implements':  'var(--color-edge-implements)',
  'extends':     'var(--color-edge-extends)',
  'references':  'var(--color-edge-references)',
  'related-to':  'var(--color-edge-related-to)',
  'custom':      'var(--color-edge-custom)',
}

interface DetailPanelProps {
  entry: ProjectIndexEntry
  currentModuleUuid: string
  projectIndex: Record<string, ProjectIndexEntry>
  accentIndex: number
  onNavigate: (path: string, uuid: string) => void
  onClose: () => void
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items))
}

export function DetailPanel({
  entry,
  currentModuleUuid,
  projectIndex,
  accentIndex,
  onNavigate,
  onClose,
}: DetailPanelProps) {
  const detailContent = workspaceContent.detailPanel
  const defaultRelation = workspaceContent.linkRenderer.defaultRelation
  const submodules = Object.entries(entry.submodules).map(([folderName, uuid]) => (
    projectIndex[uuid] ?? {
      uuid,
      path: '',
      parentPath: entry.path,
      name: folderName,
      description: detailContent.fallback.missingSubmodule,
      submodules: {},
      links: [],
    }
  ))

  const outgoing = entry.links.map(link => ({
    relation: link.relation ?? defaultRelation,
    description: link.description,
    target: projectIndex[link.uuid] ?? {
      uuid: link.uuid,
      path: '',
      parentPath: null,
      name: detailContent.fallback.unknownModuleName,
      description: detailContent.fallback.unknownModuleDescription,
      submodules: {},
      links: [],
    },
  }))

  const incoming = Object.values(projectIndex).flatMap(source =>
    source.links
      .filter(link => link.uuid === entry.uuid)
      .map(link => ({
        relation: link.relation ?? 'related-to',
        description: link.description,
        source,
      })),
  )

  const tags = unique([
    entry.uuid === currentModuleUuid ? detailContent.kicker.focused : detailContent.kicker.visible,
    ...outgoing.slice(0, 2).map(item => item.relation),
    ...incoming.slice(0, 2).map(item => item.relation),
  ])

  return (
    <aside
      className={s.panel}
      style={{ ['--panel-accent' as string]: `var(--accent-${accentIndex})` }}
      aria-label={detailContent.ariaLabel}
    >
      <div className={s.topBar}>
        <div className={s.dot} />
        <button className={s.closeBtn} onClick={onClose} aria-label={detailContent.closeAriaLabel}>
          {detailContent.closeLabel}
        </button>
      </div>

      <div className={s.header}>
        <div className={s.kicker}>
          {entry.uuid === currentModuleUuid ? detailContent.kicker.focused : detailContent.kicker.selection}
        </div>
        <h2 className={s.title}>{entry.name}</h2>
        <div className={s.uuid}>{entry.uuid}</div>
        <p className={s.description}>{entry.description || detailContent.fallback.description}</p>
      </div>

      <div className={s.tagRow}>
        {tags.map(tag => (
          <span key={tag} className={s.tag}>{tag}</span>
        ))}
      </div>

      <div className={s.metrics}>
        <div className={s.metric}>
          <span className={s.metricLabel}>{detailContent.metrics.submodules}</span>
          <span className={s.metricValue}>{submodules.length}</span>
        </div>
        <div className={s.metric}>
          <span className={s.metricLabel}>{detailContent.metrics.outgoing}</span>
          <span className={s.metricValue}>{outgoing.length}</span>
        </div>
        <div className={s.metric}>
          <span className={s.metricLabel}>{detailContent.metrics.incoming}</span>
          <span className={s.metricValue}>{incoming.length}</span>
        </div>
      </div>

      <div className={s.section}>
        <div className={s.sectionTitle}>{detailContent.sections.submodules}</div>
        {submodules.length === 0 ? (
          <div className={s.empty}>{detailContent.empty.submodules}</div>
        ) : (
          submodules.map(item => (
            <button
              key={item.uuid}
              className={s.row}
              onClick={() => item.path && onNavigate(item.path, item.uuid)}
              disabled={!item.path}
            >
              <span className={s.rowTitle}>{item.name}</span>
              <span className={s.rowMeta}>{item.uuid}</span>
            </button>
          ))
        )}
      </div>

      <div className={s.section}>
        <div className={s.sectionTitle}>{detailContent.sections.linksTo}</div>
        {outgoing.length === 0 ? (
          <div className={s.empty}>{detailContent.empty.outgoing}</div>
        ) : (
          outgoing.map(item => (
            <button
              key={`${entry.uuid}-${item.target.uuid}-${item.relation}`}
              className={s.row}
              onClick={() => item.target.path && onNavigate(item.target.path, item.target.uuid)}
              disabled={!item.target.path}
            >
              <span className={s.rowTitle}>{item.target.name}</span>
              <span
                className={s.rowMeta}
                style={{ color: RELATION_COLORS[item.relation] ?? RELATION_COLORS['custom'] }}
              >
                {item.relation}
              </span>
              {item.description && <span className={s.rowDesc}>{item.description}</span>}
            </button>
          ))
        )}
      </div>

      <div className={s.section}>
        <div className={s.sectionTitle}>{detailContent.sections.linkedBy}</div>
        {incoming.length === 0 ? (
          <div className={s.empty}>{detailContent.empty.incoming}</div>
        ) : (
          incoming.map(item => (
            <button
              key={`${item.source.uuid}-${entry.uuid}-${item.relation}`}
              className={s.row}
              onClick={() => item.source.path && onNavigate(item.source.path, item.source.uuid)}
            >
              <span className={s.rowTitle}>{item.source.name}</span>
              <span
                className={s.rowMeta}
                style={{ color: RELATION_COLORS[item.relation] ?? RELATION_COLORS['custom'] }}
              >
                {item.relation}
              </span>
              {item.description && <span className={s.rowDesc}>{item.description}</span>}
            </button>
          ))
        )}
      </div>
    </aside>
  )
}
