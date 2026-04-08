import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { ChildModule } from '../../types'
import s from './ModuleNode.module.css'

/** A link with resolved target module name (resolved from sibling at build time) */
export interface ResolvedLink {
  uuid: string
  relation?: string
  description?: string
  targetName?: string  // name of the target module if it is a sibling in the canvas
}

export interface ModuleNodeData {
  child: ChildModule
  submoduleCount: number
  resolvedLinks: ResolvedLink[]
}

export function ModuleNode({ data, selected }: NodeProps & { data: ModuleNodeData }) {
  const { child, resolvedLinks } = data

  // Truncate UUID to 8 chars for display
  const shortUuid = child.uuid.length > 8 ? child.uuid.slice(0, 8) + '…' : child.uuid

  return (
    <div className={`${s.node} ${selected ? s.selected : ''}`}>
      <Handle type="target" position={Position.Left} className={s.handle} />

      {/* Header — 36px */}
      <div className={s.header}>
        <span className={s.statusDot} />
        <span className={s.name} title={child.name}>{child.name}</span>
        <span className={s.drillIn}>↗</span>
      </div>

      {/* UUID row */}
      <div className={s.uuid}>{shortUuid}</div>

      {/* Body — 52px */}
      <div className={s.body}>
        {child.description && (
          <p className={s.desc}>{child.description}</p>
        )}
      </div>

      {/* Port rows — one per outgoing link, labelled by target module name */}
      {resolvedLinks.length > 0 && (
        <>
          <div className={s.portDivider} />
          {resolvedLinks.map(link => {
            const label = link.targetName ?? link.uuid.slice(0, 8)
            return (
              <div key={link.uuid} className={s.portRow} title={link.description}>
                <Handle
                  type="source"
                  id={`port-${link.uuid}`}
                  position={Position.Right}
                  className={s.portHandle}
                />
                <span className={s.portLabel}>{label}</span>
              </div>
            )
          })}
        </>
      )}

      <Handle type="source" position={Position.Right} className={s.handle} />
    </div>
  )
}
