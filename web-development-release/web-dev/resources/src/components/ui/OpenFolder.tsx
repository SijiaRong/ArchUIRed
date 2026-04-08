import { useState } from 'react'
import { openDirectory } from '../../filesystem/fsa'
import serverAdapter from '../../filesystem/serverAdapter'
import { useCanvasStore } from '../../store/canvas'
import { createE2eAdapter, E2E_ROOT } from '../../e2e-fixture'
import s from './OpenFolder.module.css'

function getTheme() {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
}
function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', next)
}

export function OpenFolder() {
  const setAdapter = useCanvasStore(st => st.setAdapter)
  const [serverUrl, setServerUrl] = useState(import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001')
  const [showUrl, setShowUrl] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>(getTheme)

  function handleToggleTheme() {
    toggleTheme()
    setTheme(getTheme())
  }

  async function handleFsa() {
    try {
      const { adapter, root } = await openDirectory()
      await setAdapter(adapter, '/', 'fsa')
      void root
    } catch (e) {
      if ((e as Error).name !== 'AbortError') console.error(e)
    }
  }

  async function handleServer() {
    await setAdapter(serverAdapter, '.', 'server')
  }

  function handleDemo() {
    setAdapter(createE2eAdapter(), E2E_ROOT, 'mem')
  }

  return (
    <div className={s.root}>
      <button className={s.themeToggle} onClick={handleToggleTheme} title="Toggle light/dark mode">
        {theme === 'dark' ? '☀ Light' : '☾ Dark'}
      </button>

      <div className={s.logo}>ArchUI</div>
      <div className={s.subtitle}>Knowledge canvas for humans & AI agents</div>

      <div className={s.card}>
        <button className={s.btn} onClick={handleServer}>
          Connect to local server
        </button>
        <span className={s.divider}>or</span>
        <button className={`${s.btn} ${s.btnSecondary}`} onClick={handleFsa}>
          Open folder (FSA — Chrome/Edge)
        </button>
        <span className={s.divider}>or</span>
        <button className={`${s.btn} ${s.btnDemo}`} onClick={handleDemo}>
          Load demo project
        </button>
        {showUrl && (
          <div className={s.urlRow}>
            <input
              className={s.urlInput}
              value={serverUrl}
              onChange={e => setServerUrl(e.target.value)}
              placeholder="http://localhost:3001"
            />
          </div>
        )}
        <button
          className={`${s.btn} ${s.btnSecondary}`}
          style={{ fontSize: '11px', padding: '4px 0' }}
          onClick={() => setShowUrl(v => !v)}
        >
          {showUrl ? 'Hide server URL' : 'Change server URL'}
        </button>
      </div>
    </div>
  )
}
