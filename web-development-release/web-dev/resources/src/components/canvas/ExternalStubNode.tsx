import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import s from './ExternalStubNode.module.css'

export interface ExternalStubNodeData {
  uuid: string
  relation?: string
  label?: string
}

export function ExternalStubNode({ data }: NodeProps & { data: ExternalStubNodeData }) {
  const shortUuid = data.uuid.length > 8 ? data.uuid.slice(0, 8) + '…' : data.uuid

  return (
    <div className={s.node}>
      <Handle type="target" position={Position.Left} className={s.handle} />
      <div className={s.name}>{data.label ?? 'External module'}</div>
      <div className={s.uuid}>{shortUuid}</div>
      <Handle type="source" position={Position.Right} className={s.handle} />
    </div>
  )
}
