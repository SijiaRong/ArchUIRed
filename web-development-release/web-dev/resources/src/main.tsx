import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './design-tokens.css'
import './global.css'
import App from './App'

// Theme: ?theme=light overrides default dark (used by E2E tests to verify light mode tokens)
const _urlTheme = new URLSearchParams(window.location.search).get('theme')
document.documentElement.setAttribute('data-theme', _urlTheme === 'light' ? 'light' : 'dark')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
