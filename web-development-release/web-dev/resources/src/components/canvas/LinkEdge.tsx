import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react'
import type { EdgeProps } from '@xyflow/react'
import s from './LinkEdge.module.css'

export interface LinkEdgeData {
  relation?: string
}

/** CSS variable name → relation type mapping */
const RELATION_COLOR: Record<string, string> = {
  'depends-on': 'var(--color-edge-depends-on)',
  'implements':  'var(--color-edge-implements)',
  'extends':     'var(--color-edge-extends)',
  'references':  'var(--color-edge-references)',
  'related-to':  'var(--color-edge-related-to)',
}

/** Stroke width by relation type (px) */
const RELATION_WIDTH: Record<string, number> = {
  'depends-on': 2,
  'implements': 1.5,
  'extends':    1.5,
  'references': 1,
  'related-to': 1,
}

/** SVG dash pattern by relation type */
const RELATION_DASH: Record<string, string> = {
  'extends':    '6 3',
  'references': '2 4',
  'related-to': '2 4',
}

export function LinkEdge({
  id,
  sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  data,
  markerEnd,
  style,
}: EdgeProps & { data?: LinkEdgeData }) {
  const relation = data?.relation ?? ''
  const color = RELATION_COLOR[relation] ?? 'var(--color-edge-default)'
  const strokeWidth = RELATION_WIDTH[relation] ?? 1
  const strokeDasharray = RELATION_DASH[relation]

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  })

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: color,
          strokeWidth,
          strokeDasharray,
          ...style,
        }}
      />
      {relation && (
        <EdgeLabelRenderer>
          <div
            className={s.label}
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'none',
            }}
          >
            {relation}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
