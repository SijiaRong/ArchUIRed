import s from './StatusBar.module.css'

interface StatusBarProps {
  selectedCount: number
}

export function StatusBar({ selectedCount }: StatusBarProps) {
  const isSelected = selectedCount > 0
  const label = isSelected ? `${selectedCount} selected` : 'IDLE'
  return (
    <footer className={s.bar}>
      <span className={`${s.badge} ${isSelected ? s.badgeSelected : s.badgeIdle}`}>
        <span className={s.dot} />
        {label}
      </span>
      <span className={s.sep} />
      <span className={s.hint}>
        Click to select · Double-click to drill in · Esc to go back
      </span>
    </footer>
  )
}
