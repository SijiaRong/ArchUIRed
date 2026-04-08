import type { CSSProperties } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import { workspaceContent } from '../../generated/workspace-content.generated'
import type { ProjectIndexEntry } from '../../types'
import s from './ModuleNode.module.css'

/** A link with resolved target module name (resolved from sibling at build time) */
export interface ResolvedLink {
  uuid: string
  relation?: string
  description?: string
  targetName?: string  // name of the target module if it is a sibling in the canvas
}

export interface ModuleNodeData {
  entry: ProjectIndexEntry
  variant: 'primary' | 'child'
  submoduleCount: number
  linkCount: number
  accentIndex: number
}

export function ModuleNode({ data, selected }: NodeProps & { data: ModuleNodeData }) {
  const { entry, variant, submoduleCount, linkCount, accentIndex } = data
  const moduleCardContent = workspaceContent.moduleCard
  const style = {
    ['--node-accent' as string]: `var(--accent-${accentIndex})`,
  } as CSSProperties

  return (
    <div
      className={`${s.node} ${variant === 'primary' ? s.nodePrimary : s.nodeChild} ${selected ? s.nodeSelected : ''}`}
      style={style}
      data-node-variant={variant}
    >
      <Handle type="target" position={Position.Left} className={`${s.handle} ${s.handleLeft}`} />

      <div className={s.chrome}>
        <div className={s.eyebrow}>
          {variant === 'primary' ? moduleCardContent.eyebrow.primary : moduleCardContent.eyebrow.child}
        </div>
        <div className={s.name} title={entry.name}>{entry.name}</div>
        <div className={s.uuid}>{entry.uuid}</div>
      </div>

      {entry.description && (
        <div className={s.desc}>{entry.description}</div>
      )}

      <div className={s.metaRow}>
        <div className={s.badge}>{`${submoduleCount} ${moduleCardContent.badges.submodulesSuffix}`}</div>
        <div className={s.badge}>{`${linkCount} ${moduleCardContent.badges.linksSuffix}`}</div>
      </div>

      <Handle type="source" position={Position.Right} className={`${s.handle} ${s.handleRight}`} />
    </div>
  )
}
