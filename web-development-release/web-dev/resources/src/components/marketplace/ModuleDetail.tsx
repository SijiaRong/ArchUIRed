import { marketplaceContent } from './marketplace-content'
import type { MarketplaceModule } from '../../store/marketplace'
import { useMarketplaceStore } from '../../store/marketplace'
import s from './ModuleDetail.module.css'

interface Props {
  module: MarketplaceModule
  onBack(): void
  onPull?(id: string): void
}

function Stars({ count }: { count: number }) {
  return (
    <span className={s.stars}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < count ? s.starFilled : s.starEmpty}>★</span>
      ))}
    </span>
  )
}

const txt = marketplaceContent.detail

export function ModuleDetail({ module: m, onBack, onPull }: Props) {
  const myModules = useMarketplaceStore(s => s.myModules)
  const inMyModules = myModules.some(x => x.id === m.id)

  return (
    <div className={s.root}>
      <button className={s.backBtn} onClick={onBack}>
        <span className={s.backArrow}>&larr;</span> {txt.back}
      </button>

      <div className={`${s.previewArea} ${s[`preview_${m.previewStyle}`]}`} />

      <div className={s.body}>
        <div className={s.header}>
          <div>
            <h2 className={s.title}>{m.name}</h2>
            <div className={s.author}>by {m.author}</div>
          </div>
          <div className={s.actions}>
            <button
              className={`${s.btnSecondary} ${inMyModules ? s.btnDisabled : ''}`}
              disabled={inMyModules}
              onClick={() => onPull?.(m.id)}
            >
              {inMyModules ? txt.pulled : txt.pull}
            </button>
          </div>
        </div>

        <div className={s.statsRow}>
          <div className={s.statItem}>
            <div className={s.statValue}>{m.downloads.toLocaleString()}</div>
            <div className={s.statLabel}>{txt.downloads}</div>
          </div>
          <div className={s.statItem}>
            <div className={s.statValue}>{m.rating}</div>
            <div className={s.statLabel}>{txt.rating}</div>
          </div>
          <div className={s.statItem}>
            <div className={s.statValue}>{m.reviews}</div>
            <div className={s.statLabel}>{txt.reviewCount}</div>
          </div>
          <div className={s.statItem}>
            <div className={s.statValue}>v1.2</div>
            <div className={s.statLabel}>{txt.version}</div>
          </div>
        </div>

        <p className={s.desc}>{m.description}</p>

        <div className={s.sectionTitle}>{txt.structure}</div>
        <div className={s.tree}>
          {m.tree.map((line, i) => {
            const indent = line.search(/\S/)
            const text = line.trim()
            const isFolder = text.endsWith('/')
            return (
              <div key={i} style={{ paddingLeft: indent * 10 }}>
                <span className={isFolder ? s.treeFolder : s.treeFile}>{text}</span>
              </div>
            )
          })}
        </div>

        {m.reviewsList.length > 0 && (
          <>
            <div className={s.sectionTitle}>{txt.reviews}</div>
            <div className={s.reviewList}>
              {m.reviewsList.map((r, i) => (
                <div key={i} className={s.review}>
                  <div className={s.reviewHeader}>
                    <span className={s.reviewAuthor}>{r.author}</span>
                    <Stars count={r.stars} />
                  </div>
                  <div className={s.reviewText}>{r.text}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
