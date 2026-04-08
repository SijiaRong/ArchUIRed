import type { CSSProperties } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { ProjectIndexEntry } from '../../types'
import s from './ExternalStubNode.module.css'

export interface ExternalStubNodeData {
  entry: ProjectIndexEntry
  relationLabels: string[]
  accentIndex: number
  side: 'left' | 'right'
}

export function ExternalStubNode({ data, selected }: NodeProps & { data: ExternalStubNodeData }) {
  const style = {
    ['--node-accent' as string]: `var(--accent-${data.accentIndex})`,
  } as CSSProperties

  return (
    <div className={`${s.node} ${selected ? s.nodeSelected : ''}`} style={style} data-side={data.side}>
      <Handle type="target" position={Position.Left} className={`${s.handle} ${s.handleLeft}`} />
      <div className={s.eyebrow}>{data.side === 'left' ? 'Incoming reference' : 'External reference'}</div>
      <div className={s.label}>{data.entry.name}</div>
      <div className={s.uuid}>{data.entry.uuid}</div>
      {data.entry.description && <div className={s.desc}>{data.entry.description}</div>}
      <div className={s.tagRow}>
        {data.relationLabels.slice(0, 3).map(relation => (
          <span key={relation} className={s.tag}>{relation}</span>
        ))}
      </div>
      <Handle type="source" position={Position.Right} className={`${s.handle} ${s.handleRight}`} />
    </div>
  )
}
