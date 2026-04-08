import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { ChildModule } from '../../types'
import s from './ModuleNode.module.css'

export interface ModuleNodeData {
  child: ChildModule
  submoduleCount: number
}

export function ModuleNode({ data, selected }: NodeProps & { data: ModuleNodeData }) {
  const { child } = data

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

      <Handle type="source" position={Position.Right} className={s.handle} />
    </div>
  )
}
