import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react'
import type { EdgeProps } from '@xyflow/react'
import s from './LinkEdge.module.css'

export interface LinkEdgeData {
  relation?: string
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

export function LinkEdge({
  id,
  sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  data,
  style,
}: EdgeProps & { data?: LinkEdgeData }) {
  const relation = data?.relation ?? ''
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  })

  const stroke = relationColor(data?.relation)

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{ stroke, strokeWidth: 1.9, ...style }}
      />

      {relation && (
        <EdgeLabelRenderer>
          <div
            className={s.label}
            style={{
              ['--edge-accent' as string]: stroke,
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'none',
            } as React.CSSProperties}
          >
            {relation}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
