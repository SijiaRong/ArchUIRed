import { useEffect } from 'react'
import { useCanvasStore, detectServerRoot } from './store/canvas'
import serverAdapter from './filesystem/serverAdapter'
import { OpenFolder } from './components/ui/OpenFolder'
import { CanvasPage } from './components/canvas/CanvasPage'
import { installTestHook } from './testHook'
import { createE2eAdapter, E2E_ROOT } from './e2e-fixture'

// Install E2E test hook in dev / test builds
if (import.meta.env.DEV || import.meta.env.MODE === 'test') {
  installTestHook()
}

export default function App() {
  const rootPath     = useCanvasStore(s => s.rootPath)
  const setAdapter   = useCanvasStore(s => s.setAdapter)
  const fsMode       = useCanvasStore(s => s.fsMode)

  // ?e2e=1 — load fixture data for Playwright visual snapshot tests
  useEffect(() => {
    if (rootPath !== null) return
    const params = new URLSearchParams(window.location.search)
    if (params.get('e2e') === '1') {
      setAdapter(createE2eAdapter(), E2E_ROOT, 'mem')
      return
    }
  }, [rootPath, setAdapter])

  // Auto-connect when running in server mode (served by our Node server)
  useEffect(() => {
    if (fsMode === 'server' && rootPath === null) {
      detectServerRoot().then(root => {
        setAdapter(serverAdapter, root, 'server')
      })
    }
  }, [fsMode, rootPath, setAdapter])

  if (rootPath === null) return <OpenFolder />
  return <CanvasPage />
}
