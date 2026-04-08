import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react'
import type { EdgeProps } from '@xyflow/react'
import s from './LinkEdge.module.css'

export interface LinkEdgeData {
  relation?: string
}

/** Resolved CSS color strings for arrowhead SVG markers (must be actual colors, not var()) */
const RELATION_HEX: Record<string, string> = {
  'depends-on': '#5B8DEE',
  'implements':  '#22C55E',
  'extends':     '#A855F7',
  'references':  '#60606A',
  'related-to':  '#60606A',
  'custom':      '#F97316',
}
const DEFAULT_HEX = '#60606A'

/** CSS variable name → relation type mapping (used for path stroke) */
const RELATION_COLOR: Record<string, string> = {
  'depends-on': 'var(--color-edge-depends-on)',
  'implements':  'var(--color-edge-implements)',
  'extends':     'var(--color-edge-extends)',
  'references':  'var(--color-edge-references)',
  'related-to':  'var(--color-edge-related-to)',
  'custom':      'var(--color-edge-custom)',
}

const RELATION_WIDTH: Record<string, number> = {
  'depends-on': 2,
  'implements': 1.5,
  'extends':    1.5,
  'references': 1,
  'related-to': 1,
}

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
  style,
}: EdgeProps & { data?: LinkEdgeData }) {
  const relation = data?.relation ?? ''
  const color      = RELATION_COLOR[relation] ?? 'var(--color-edge-default)'
  const arrowColor = RELATION_HEX[relation] ?? DEFAULT_HEX
  const strokeWidth     = RELATION_WIDTH[relation] ?? 1
  const strokeDasharray = RELATION_DASH[relation]
  const markerId = `arr-${id}`

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  })

  return (
    <>
      {/* Per-edge arrowhead marker with correct relation color */}
      <defs>
        <marker
          id={markerId}
          markerWidth="10"
          markerHeight="8"
          refX="9"
          refY="4"
          orient="auto"
        >
          <path d="M0,0 L0,8 L10,4 z" fill={arrowColor} />
        </marker>
      </defs>

      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={`url(#${markerId})`}
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
              '--edge-color': arrowColor,
            } as React.CSSProperties}
          >
            {relation}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
