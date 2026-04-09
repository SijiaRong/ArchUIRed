import { marketplaceContent } from './marketplace-content'
import type { MarketplaceModule } from '../../store/marketplace'
import s from './ModuleCard.module.css'

interface Props {
  module: MarketplaceModule
  inCompare: boolean
  onSelect(): void
  onToggleCompare(): void
}

function PreviewContent({ type }: { type: MarketplaceModule['previewType'] }) {
  switch (type) {
    case 'login':
    case 'auth':
      return (
        <>
          <div className={`${s.pEl} ${s.pTitle}`} />
          <div className={`${s.pEl} ${s.pInput}`} />
          <div className={`${s.pEl} ${s.pInput}`} />
          <div className={`${s.pEl} ${s.pBtn}`} />
        </>
      )
    case 'dashboard':
      return (
        <>
          <div className={`${s.pEl} ${s.pSidebar}`} />
          <div className={s.pContent}>
            <div className={`${s.pEl} ${s.pRow}`} />
            <div className={`${s.pEl} ${s.pRow}`} style={{ width: '80%' }} />
            <div className={`${s.pEl} ${s.pRow}`} style={{ width: '60%' }} />
          </div>
        </>
      )
    case 'landing':
      return (
        <>
          <div className={`${s.pEl} ${s.pNav}`} />
          <div className={`${s.pEl} ${s.pHeroBlock}`} />
          <div className={s.pGridRow}>
            <div className={`${s.pEl} ${s.pGridItem}`} />
            <div className={`${s.pEl} ${s.pGridItem}`} />
            <div className={`${s.pEl} ${s.pGridItem}`} />
          </div>
        </>
      )
    case 'settings':
      return (
        <>
          <div className={`${s.pEl} ${s.pSettingRow}`} />
          <div className={`${s.pEl} ${s.pSettingRow}`} />
          <div className={`${s.pEl} ${s.pSettingRow}`} style={{ marginTop: 10 }} />
          <div className={`${s.pEl} ${s.pSettingRow}`} />
        </>
      )
    case 'payment':
      return (
        <>
          <div className={`${s.pEl} ${s.pTitle}`} />
          <div className={`${s.pEl} ${s.pInput}`} />
          <div className={`${s.pEl} ${s.pInput}`} style={{ width: '45%' }} />
          <div className={`${s.pEl} ${s.pBtn}`} />
        </>
      )
    case 'onboarding':
      return (
        <>
          <div className={`${s.pEl} ${s.pTitle}`} style={{ width: '30%' }} />
          <div className={`${s.pEl} ${s.pRow}`} />
          <div className={`${s.pEl} ${s.pRow}`} style={{ width: '50%' }} />
          <div className={`${s.pEl} ${s.pBtn}`} style={{ width: '40%' }} />
        </>
      )
  }
}

const badges = marketplaceContent.card.badges

export function ModuleCard({ module: m, inCompare, onSelect, onToggleCompare }: Props) {
  return (
    <div className={s.card} onClick={onSelect}>
      {m.badge && (
        <span className={`${s.badge} ${s[`badge_${m.badge}`]}`}>
          {badges[m.badge]}
        </span>
      )}
      <div className={`${s.preview} ${s[`preview_${m.previewStyle}`]}`}>
        <div className={s.previewUi}>
          <PreviewContent type={m.previewType} />
        </div>
      </div>
      <div className={s.body}>
        <div className={s.category}>{m.category}</div>
        <div className={s.name}>{m.name}</div>
        <div className={s.desc}>{m.description}</div>
        <div className={s.footer}>
          <div className={s.stats}>
            <span className={s.stat}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              {m.downloads}
            </span>
            <span className={s.stat}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              {m.rating}
            </span>
          </div>
          <button
            className={`${s.compareBtn} ${inCompare ? s.compareBtnActive : ''}`}
            onClick={e => { e.stopPropagation(); onToggleCompare() }}
          >
            {inCompare ? marketplaceContent.card.compared : marketplaceContent.card.compare}
          </button>
        </div>
      </div>
    </div>
  )
}
