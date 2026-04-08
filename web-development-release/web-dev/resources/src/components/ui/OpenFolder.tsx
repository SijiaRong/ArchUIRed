import { useState } from 'react'
import { openDirectory } from '../../filesystem/fsa'
import serverAdapter from '../../filesystem/serverAdapter'
import { useCanvasStore } from '../../store/canvas'
import s from './OpenFolder.module.css'

interface OpenFolderProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export function OpenFolder({ theme, onToggleTheme }: OpenFolderProps) {
  const setAdapter = useCanvasStore(s => s.setAdapter)
  const [serverUrl, setServerUrl] = useState(import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001')
  const [showUrl, setShowUrl] = useState(false)

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

  return (
    <div className={s.root}>
      <button className={s.themeBtn} onClick={onToggleTheme}>
        {theme === 'light' ? 'Switch to dark' : 'Switch to light'}
      </button>

      <div className={s.hero}>
        <div className={s.logoMark} />
        <div className={s.logo}>ArchUI</div>
        <div className={s.subtitle}>Canvas-first knowledge workspace for humans and AI agents.</div>
      </div>

      <div className={s.card}>
        <div className={s.cardKicker}>Deep Honey / Lake Workspace</div>
        <h1>Open a project and step into the graph.</h1>
        <p>
          This first wave focuses on the canvas workspace, so the entry page stays intentionally light
          while the workbench carries the visual identity.
        </p>

        <div className={s.actionGrid}>
          <button className={s.btnPrimary} onClick={handleServer}>
            Connect to local server
          </button>
          <button className={s.btnSecondary} onClick={handleFsa}>
            Open folder in Chrome or Edge
          </button>
        </div>

        <button className={s.inlineBtn} onClick={() => setShowUrl(v => !v)}>
          {showUrl ? 'Hide server URL' : 'Show server URL'}
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
      </div>
    </div>
  )
}
