import { useCallback } from 'react'
import { marketplaceContent } from './marketplace-content'
import { useMarketplaceStore } from '../../store/marketplace'
import type { MarketplaceModule } from '../../store/marketplace'
import { replaceModule, copyModule, createModule } from '../../filesystem/writeOps'
import type { FsAdapter, ProjectIndexEntry } from '../../types'
import s from './MyModulesOverlay.module.css'

interface Props {
  /** UUID of the module being replaced, or null when adding a new module */
  replacingUuid: string | null
  projectIndex: Record<string, ProjectIndexEntry>
  adapter: FsAdapter
  rootPath: string
  /** Path of the current canvas module (destination for "add to project") */
  currentModulePath: string | null
  onClose(): void
  onOpenHub(): void
  /** Called after replace or add succeeds — caller should reload canvas */
  onChanged(): void
  onToast(message: string, type?: 'info' | 'error'): void
}

const txt = marketplaceContent.myModules
const toasts = marketplaceContent.toast

export function MyModulesOverlay({
  replacingUuid,
  projectIndex,
  adapter,
  rootPath,
  currentModulePath,
  onClose,
  onOpenHub,
  onChanged,
  onToast,
}: Props) {
  const myModules = useMarketplaceStore(s => s.myModules)
  const removeFromMyModules = useMarketplaceStore(s => s.removeFromMyModules)

  const replacingEntry = replacingUuid ? projectIndex[replacingUuid] : null
  const isReplaceMode = !!replacingUuid

  // Escape is handled by CanvasPage — no local keydown listener needed

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  /** Derive a kebab-case folder name from module name */
  function toFolderName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'module'
  }

  /** Replace an existing module with one from My Modules */
  const handleReplace = useCallback(async (sourceModule: MarketplaceModule) => {
    if (!replacingUuid || !replacingEntry?.path) return

    try {
      const sourcePath = (sourceModule as MarketplaceModule & { sourcePath?: string }).sourcePath
      if (sourcePath) {
        // Real registry module — full filesystem replace with UUID rebinding
        await replaceModule(adapter, rootPath, replacingEntry.path, replacingUuid, sourcePath)
      } else {
        // Mock/hub module — delete old, create new with hub module's metadata at same location
        const pathParts = replacingEntry.path.split('/').filter(Boolean)
        const folderName = pathParts.pop()!
        const parentPath = pathParts.join('/') || '.'
        // Delete old module
        if (adapter.removeDir) {
          await adapter.removeDir(replacingEntry.path)
          // Deregister from parent
          const { parse: parseYaml, stringify: stringifyYaml } = await import('yaml')
          const parentIndexPath = `${parentPath}/.archui/index.yaml`
          const parentContent = await adapter.readFile(parentIndexPath).catch(() => '')
          const parentIndex = parentContent ? parseYaml(parentContent) : { schema_version: '1', uuid: '', submodules: {} }
          if (parentIndex.submodules) delete parentIndex.submodules[folderName]
          await adapter.writeFile(parentIndexPath, stringifyYaml(parentIndex))
        }
        // Create new module with hub module info
        await createModule(adapter, pathParts.join('/') || '.', toFolderName(sourceModule.name), sourceModule.name, sourceModule.description)
      }
      onToast(toasts.replaced)
      onChanged()
      onClose()
    } catch (e) {
      onToast(String(e instanceof Error ? e.message : e), 'error')
    }
  }, [replacingUuid, replacingEntry, adapter, rootPath, onToast, onChanged, onClose])

  /** Add a module from My Modules as a child of the current canvas module */
  const handleAdd = useCallback(async (sourceModule: MarketplaceModule) => {
    if (!currentModulePath) return

    try {
      const sourcePath = (sourceModule as MarketplaceModule & { sourcePath?: string }).sourcePath
      if (sourcePath) {
        // Real registry module — full folder copy
        await copyModule(adapter, sourcePath, currentModulePath)
      } else {
        // Mock/hub module — create a new module with the hub module's name and description
        await createModule(adapter, currentModulePath, toFolderName(sourceModule.name), sourceModule.name, sourceModule.description)
      }
      onToast(toasts.added)
      onChanged()
      onClose()
    } catch (e) {
      onToast(String(e instanceof Error ? e.message : e), 'error')
    }
  }, [currentModulePath, adapter, onToast, onChanged, onClose])

  return (
    <div className={s.overlay} onClick={handleBackdropClick}>
      <div className={s.panel}>
        {/* Header */}
        <div className={s.header}>
          <div>
            <div className={s.kicker}>{txt.kicker}</div>
            <h2 className={s.title}>{txt.title}</h2>
            {replacingEntry ? (
              <p className={s.replacing}>
                {txt.replacing}: <strong>{replacingEntry.name}</strong>
              </p>
            ) : (
              <p className={s.desc}>{txt.description}</p>
            )}
          </div>
          <div className={s.headerActions}>
            <button className={s.hubBtn} onClick={onOpenHub}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4 }}>
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              {txt.browseHub}
            </button>
            <button className={s.closeBtn} onClick={onClose} aria-label={txt.closeAriaLabel}>
              {txt.closeLabel}
            </button>
          </div>
        </div>

        {/* Module list */}
        <div className={s.body}>
          {myModules.length === 0 ? (
            <div className={s.emptyState}>
              <h3>{txt.empty.title}</h3>
              <p>{txt.empty.body}</p>
              <button className={s.emptyHubBtn} onClick={onOpenHub}>{txt.browseHub}</button>
            </div>
          ) : (
            <div className={s.moduleList}>
              {myModules.map(m => (
                <div key={m.id} className={s.moduleItem}>
                  <div className={`${s.modulePreview} ${s[`preview_${m.previewStyle}`]}`} />
                  <div className={s.moduleInfo}>
                    <div className={s.moduleName}>{m.name}</div>
                    <div className={s.moduleCategory}>{m.category}</div>
                    <div className={s.moduleDesc}>{m.description}</div>
                    <div className={s.moduleMeta}>
                      <span className={s.moduleStat}>{m.downloads} downloads</span>
                      <span className={s.moduleStat}>{m.rating} rating</span>
                    </div>
                  </div>
                  <div className={s.moduleActions}>
                    {isReplaceMode ? (
                      <button className={s.replaceBtn} onClick={() => void handleReplace(m)}>
                        {txt.replaceWith}
                      </button>
                    ) : (
                      <button className={s.addBtn} onClick={() => void handleAdd(m)}>
                        {txt.addToProject}
                      </button>
                    )}
                    <button className={s.removeBtn} onClick={() => removeFromMyModules(m.id)}>{txt.remove}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
