import { useEffect, useState } from 'react'
import { useCanvasStore, detectServerRoot } from './store/canvas'
import serverAdapter from './filesystem/serverAdapter'
import { OpenFolder } from './components/ui/OpenFolder'
import { CanvasPage } from './components/canvas/CanvasPage'
import { installTestHook } from './testHook'
import { createE2eAdapter, E2E_ROOT } from './e2e-fixture'

if (import.meta.env.DEV || import.meta.env.MODE === 'test') {
  installTestHook()
}

type ThemeMode = 'light' | 'dark'

function getSearchParams(): URLSearchParams {
  if (typeof window === 'undefined') return new URLSearchParams()
  return new URLSearchParams(window.location.search)
}

function getInitialTheme(): ThemeMode {
  const params = getSearchParams()
  const forcedTheme = params.get('theme')
  if (forcedTheme === 'light' || forcedTheme === 'dark') return forcedTheme
  const stored = window.localStorage.getItem('archui-theme')
  if (stored === 'light' || stored === 'dark') return stored
  return 'light'
}

export default function App() {
  const rootPath = useCanvasStore(s => s.rootPath)
  const setAdapter = useCanvasStore(s => s.setAdapter)
  const fsMode = useCanvasStore(s => s.fsMode)
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme)

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = theme
      window.localStorage.setItem('archui-theme', theme)
    }
  }, [theme])

  useEffect(() => {
    if (rootPath !== null) return

    const params = getSearchParams()
    const wantsFixture = params.get('e2e') === '1' || params.get('fixture') === '1'
    if (wantsFixture) {
      const loadFixture = async () => {
        if (typeof window !== 'undefined' && window.__archui?.loadFixture) {
          await window.__archui.loadFixture()
          return
        }
        await setAdapter(createE2eAdapter(), E2E_ROOT, 'mem')
      }
      void loadFixture()
      return
    }

    if (fsMode === 'server') {
      void detectServerRoot().then(root => {
        if (root) {
          void setAdapter(serverAdapter, root, 'server')
        }
      })
    }
  }, [fsMode, rootPath, setAdapter])

  const toggleTheme = () => setTheme(value => value === 'light' ? 'dark' : 'light')

  if (rootPath === null) {
    return <OpenFolder theme={theme} onToggleTheme={toggleTheme} />
  }

  return <CanvasPage theme={theme} onToggleTheme={toggleTheme} />
}
