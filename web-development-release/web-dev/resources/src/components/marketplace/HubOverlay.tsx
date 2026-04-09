import { useCallback, useEffect, useRef } from 'react'
import { marketplaceContent } from './marketplace-content'
import { useMarketplaceStore, TAGS } from '../../store/marketplace'
import type { SortKey } from '../../store/marketplace'
import { ModuleCard } from './ModuleCard'
import { ModuleDetail } from './ModuleDetail'
import s from './HubOverlay.module.css'

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: 'hot', label: marketplaceContent.sort.hot },
  { key: 'new', label: marketplaceContent.sort.new },
  { key: 'rating', label: marketplaceContent.sort.rating },
  { key: 'downloads', label: marketplaceContent.sort.downloads },
]

interface Props {
  onClose(): void
  onOpenMyModules(): void
  onToast(message: string, type?: 'info' | 'error'): void
}

export function HubOverlay({ onClose, onOpenMyModules, onToast }: Props) {
  const txt = marketplaceContent
  const activeTag = useMarketplaceStore(s => s.activeTag)
  const searchQuery = useMarketplaceStore(s => s.searchQuery)
  const sortKey = useMarketplaceStore(s => s.sortKey)
  const selectedModuleId = useMarketplaceStore(s => s.selectedModuleId)
  const compareList = useMarketplaceStore(s => s.compareList)
  const modules = useMarketplaceStore(s => s.modules)

  const setActiveTag = useMarketplaceStore(s => s.setActiveTag)
  const setSearchQuery = useMarketplaceStore(s => s.setSearchQuery)
  const setSortKey = useMarketplaceStore(s => s.setSortKey)
  const selectModule = useMarketplaceStore(s => s.selectModule)
  const toggleCompare = useMarketplaceStore(s => s.toggleCompare)
  const clearCompare = useMarketplaceStore(s => s.clearCompare)
  const addToMyModules = useMarketplaceStore(s => s.addToMyModules)
  const resetHubState = useMarketplaceStore(s => s.resetHubState)
  const filteredModules = useMarketplaceStore(s => s.filteredModules)

  const searchRef = useRef<HTMLInputElement>(null)
  const filtered = filteredModules()
  const selectedModule = selectedModuleId ? modules.find(m => m.id === selectedModuleId) ?? null : null

  // Reset hub browse state on mount so each open starts clean
  useEffect(() => { resetHubState() }, [resetHubState])

  // Keyboard: only "/" for search focus — Escape is handled by CanvasPage
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleClose = useCallback(() => {
    resetHubState()
    onClose()
  }, [resetHubState, onClose])

  const handleOpenMyModules = useCallback(() => {
    selectModule(null) // Fix 2: clear detail view before switching
    onOpenMyModules()
  }, [selectModule, onOpenMyModules])

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose()
  }, [handleClose])

  const handlePull = useCallback((id: string) => {
    addToMyModules(id)
    onToast(txt.toast.pulled)
  }, [addToMyModules, onToast, txt.toast.pulled])

  return (
    <div className={s.overlay} onClick={handleBackdropClick}>
      <div className={s.panel}>
        {/* Header */}
        <div className={s.header}>
          <div>
            <div className={s.kicker}>{txt.hub.kicker}</div>
            <h2 className={s.title}>{txt.hub.title}</h2>
            <p className={s.desc}>{txt.hub.description}</p>
          </div>
          <div className={s.headerActions}>
            <button className={s.myModulesBtn} onClick={handleOpenMyModules}>
              {txt.myModules.title}
            </button>
            <button className={s.closeBtn} onClick={handleClose} aria-label={txt.hub.closeAriaLabel}>
              {txt.hub.closeLabel}
            </button>
          </div>
        </div>

        {selectedModule ? (
          /* Detail view */
          <div className={s.detailWrap}>
            <ModuleDetail
              module={selectedModule}
              onBack={() => selectModule(null)}
              onPull={handlePull}
            />
          </div>
        ) : (
          /* Browse view */
          <>
            {/* Search + Sort */}
            <div className={s.searchRow}>
              <div className={s.searchWrap}>
                <svg className={s.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  ref={searchRef}
                  className={s.searchInput}
                  type="text"
                  placeholder={txt.search.placeholder}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <kbd className={s.searchKbd}>{txt.search.shortcut}</kbd>
              </div>
              <select
                className={s.sortSelect}
                value={sortKey}
                onChange={e => setSortKey(e.target.value as SortKey)}
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.key} value={opt.key}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className={s.tagsRow}>
              {TAGS.map(tag => (
                <button
                  key={tag.key}
                  className={`${s.tag} ${activeTag === tag.key ? s.tagActive : ''}`}
                  onClick={() => setActiveTag(tag.key)}
                >
                  {tag.label}
                  <span className={s.tagCount}>{tag.count}</span>
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className={s.grid}>
              {filtered.length === 0 ? (
                <div className={s.emptyState}>
                  <h3>{txt.empty.noResults}</h3>
                  <p>{txt.empty.hint}</p>
                </div>
              ) : (
                filtered.map(m => (
                  <ModuleCard
                    key={m.id}
                    module={m}
                    inCompare={compareList.includes(m.id)}
                    onSelect={() => selectModule(m.id)}
                    onToggleCompare={() => toggleCompare(m.id)}
                  />
                ))
              )}
            </div>
          </>
        )}

        {/* Compare bar */}
        {compareList.length > 0 && !selectedModule && (
          <div className={s.compareBar}>
            <div className={s.compareLeft}>
              <span className={s.compareLabel}>{txt.compare.label}</span>
              <div className={s.compareItems}>
                {compareList.map(id => {
                  const m = modules.find(x => x.id === id)
                  if (!m) return null
                  return (
                    <div key={id} className={s.compareItem}>
                      {m.name}
                      <button className={s.compareItemRemove} onClick={() => toggleCompare(id)}>×</button>
                    </div>
                  )
                })}
              </div>
            </div>
            <button className={s.compareClearBtn} onClick={clearCompare}>{txt.compare.clear}</button>
          </div>
        )}
      </div>
    </div>
  )
}
