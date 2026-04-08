import { useState } from 'react'
import { openDirectory } from '../../filesystem/fsa'
import serverAdapter from '../../filesystem/serverAdapter'
import { workspaceContent } from '../../generated/workspace-content.generated'
import { useCanvasStore } from '../../store/canvas'
import s from './OpenFolder.module.css'

interface OpenFolderProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export function OpenFolder({ theme, onToggleTheme }: OpenFolderProps) {
  const landingContent = workspaceContent.landing
  const setAdapter = useCanvasStore(s => s.setAdapter)
  const [serverUrl, setServerUrl] = useState(
    import.meta.env.VITE_SERVER_URL ?? landingContent.actions.serverUrlPlaceholder,
  )
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
        {theme === 'light' ? landingContent.themeToggle.toDark : landingContent.themeToggle.toLight}
      </button>

      <div className={s.hero}>
        <div className={s.logoMark} />
        <div className={s.logo}>{landingContent.brandWordmark}</div>
        <div className={s.subtitle}>{landingContent.subtitle}</div>
      </div>

      <div className={s.card}>
        <div className={s.cardKicker}>{landingContent.card.kicker}</div>
        <h1>{landingContent.card.title}</h1>
        <p>{landingContent.card.body}</p>

        <div className={s.actionGrid}>
          <button className={s.btnPrimary} onClick={handleServer}>
            {landingContent.actions.connectServer}
          </button>
          <button className={s.btnSecondary} onClick={handleFsa}>
            {landingContent.actions.openFolder}
          </button>
        </div>

        <button className={s.inlineBtn} onClick={() => setShowUrl(v => !v)}>
          {showUrl ? landingContent.actions.hideServerUrl : landingContent.actions.showServerUrl}
        </button>

        {showUrl && (
          <div className={s.urlRow}>
            <input
              className={s.urlInput}
              value={serverUrl}
              onChange={e => setServerUrl(e.target.value)}
              placeholder={landingContent.actions.serverUrlPlaceholder}
            />
          </div>
        )}
      </div>
    </div>
  )
}
