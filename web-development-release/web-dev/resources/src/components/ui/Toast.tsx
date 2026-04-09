import { useEffect } from 'react'
import s from './Toast.module.css'

export type ToastType = 'info' | 'error'

interface Props {
  message: string
  type?: ToastType
  onDismiss(): void
}

export function Toast({ message, type = 'info', onDismiss }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 2500)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div className={`${s.toast} ${type === 'error' ? s.error : ''}`}>
      {message}
    </div>
  )
}
