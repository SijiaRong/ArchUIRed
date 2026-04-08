import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './font-faces.css'
import './design-tokens.generated.css'
import './global.css'
import App from './App'

// Apply initial theme synchronously to avoid flash; must match getInitialTheme() in App.tsx
;(function () {
  const params = new URLSearchParams(window.location.search)
  const urlTheme = params.get('theme')
  if (urlTheme === 'light' || urlTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', urlTheme)
    return
  }
  const stored = window.localStorage.getItem('archui-theme')
  document.documentElement.setAttribute('data-theme', stored === 'dark' ? 'dark' : 'light')
})()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
