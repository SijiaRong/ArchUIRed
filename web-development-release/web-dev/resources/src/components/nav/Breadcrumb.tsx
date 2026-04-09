import { useCanvasStore } from '../../store/canvas'
import { workspaceContent } from '../../generated/workspace-content.generated'
import s from './Breadcrumb.module.css'

export function Breadcrumb() {
  const breadcrumb = useCanvasStore(s => s.breadcrumb)
  const navigate = useCanvasStore(s => s.navigate)

  return (
    <nav className={s.nav} aria-label={workspaceContent.canvas.breadcrumb.ariaLabel}>
      {breadcrumb.map((crumb, index) => {
        const isLast = index === breadcrumb.length - 1
        return (
          <div key={crumb.path} className={s.crumb}>
            {index > 0 && <span className={s.sep}>&gt;</span>}
            <button
              className={`${s.btn} ${isLast ? s.btnActive : ''}`}
              onClick={() => !isLast && navigate(crumb.path)}
              disabled={isLast}
              aria-current={isLast ? 'page' : undefined}
            >
              {crumb.name}
            </button>
          </div>
        )
      })}
    </nav>
  )
}
