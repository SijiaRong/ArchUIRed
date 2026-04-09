import { useCallback, useEffect, useRef, useState } from 'react'
import { openDirectory } from '../../filesystem/fsa'
import serverAdapter from '../../filesystem/serverAdapter'
import { workspaceContent } from '../../generated/workspace-content.generated'
import { useCanvasStore } from '../../store/canvas'
import s from './OpenFolder.module.css'

// ─── Animation primitives ────────────────────────────────────────────────────

function useReveal(threshold = 0.18) {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible] as const
}

interface WordRevealProps {
  text: string
  className?: string
  delayBase?: number
  accentWords?: string[]
}

function WordReveal({ text, className, delayBase = 0, accentWords = [] }: WordRevealProps) {
  const words = text.split(' ')
  return (
    <span className={className}>
      {words.map((word, i) => {
        const isAccent = accentWords.some(a => word.includes(a))
        return (
          <span
            key={i}
            className={`${s.wordToken} ${isAccent ? s.wordAccent : ''}`}
            style={{ animationDelay: `${delayBase + i * 65}ms` }}
          >
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </span>
        )
      })}
    </span>
  )
}

// ─── Section 1: Hero ─────────────────────────────────────────────────────────

function SectionHero() {
  const landingContent = workspaceContent.landing
  return (
    <section className={s.sectionHero}>
      <div className={s.heroInner}>
        <svg className={s.logoMark} viewBox="0 0 332 332" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M249.418 197.418C278.137 197.418 301.418 220.699 301.418 249.418C301.418 278.137 278.137 301.418 249.418 301.418C228.871 301.418 211.109 289.501 202.663 272.202C200.17 272.932 197.618 273.651 195.017 274.348C192.412 275.046 189.839 275.7 187.312 276.315C187.395 277.519 187.438 278.734 187.438 279.959C187.438 308.678 164.157 331.959 135.438 331.959C106.72 331.959 83.4387 308.678 83.4385 279.959C83.4385 251.24 106.72 227.959 135.438 227.959C155.985 227.959 173.747 239.875 182.192 257.174C184.686 256.444 187.238 255.726 189.84 255.029C192.444 254.331 195.017 253.676 197.544 253.061C197.461 251.857 197.418 250.642 197.418 249.418C197.418 220.699 220.699 197.418 249.418 197.418ZM82.541 30.541C111.26 30.5412 134.541 53.8223 134.541 82.541C134.541 111.26 111.26 134.541 82.541 134.541C81.3162 134.541 80.1011 134.497 78.8975 134.414C78.2817 136.941 77.6276 139.515 76.9297 142.119C76.2327 144.72 75.5136 147.272 74.7842 149.766C92.0829 158.211 104 175.974 104 196.521C104 225.239 80.7186 248.521 52 248.521C23.2814 248.521 0.000329901 225.239 0 196.521C0 167.802 23.2812 144.521 52 144.521C53.2246 144.521 54.4392 144.563 55.6426 144.646C56.2583 142.119 56.9135 139.547 57.6113 136.942C58.3084 134.341 59.0264 131.789 59.7559 129.295C42.4576 120.849 30.5412 103.087 30.541 82.541C30.541 53.8222 53.8222 30.541 82.541 30.541ZM196.52 0C225.238 0 248.52 23.2812 248.52 52C248.52 62.7785 245.239 72.7905 239.624 81.0938C241.504 82.8899 243.404 84.7426 245.31 86.6484C247.215 88.554 249.067 90.4533 250.863 92.333C259.166 86.7176 269.18 83.4386 279.958 83.4385C308.677 83.4385 331.958 106.72 331.958 135.438C331.958 164.157 308.677 187.438 279.958 187.438C251.239 187.438 227.958 164.157 227.958 135.438C227.958 124.66 231.237 114.647 236.853 106.344C234.973 104.548 233.073 102.696 231.168 100.79C229.262 98.8842 227.409 96.9845 225.613 95.1045C217.31 100.72 207.298 104 196.52 104C167.801 104 144.52 80.7187 144.52 52C144.52 23.2813 167.801 0.000197941 196.52 0Z" fill="var(--brand-honey)"/>
        </svg>
        <div className={s.logo}>{landingContent.brandWordmark}</div>
        <div className={s.subtitle}>{landingContent.subtitle}</div>
      </div>
      <div className={s.scrollHint}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M10 4v12M4 10l6 6 6-6" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </section>
  )
}

// ─── Section 2: Manifesto ────────────────────────────────────────────────────

function SectionManifesto() {
  const [ref, visible] = useReveal(0.1)
  return (
    <section ref={ref} className={`${s.sectionManifesto} ${visible ? s.sectionVisible : ''}`}>
      <div className={s.manifestoInner}>
        <div className={s.manifestoKicker}>2025 — 2026</div>

        <p className={s.manifestoLine}>
          {visible && (
            <WordReveal
              text="软件工程正在经历一场范式转变。"
              delayBase={100}
            />
          )}
        </p>

        <p className={s.manifestoLine}>
          {visible && (
            <WordReveal
              text="从「人类写代码、AI 辅助」到「AI 写代码、人类定义意图」。"
              delayBase={600}
            />
          )}
        </p>

        <p className={s.manifestoLineMed}>
          {visible && (
            <WordReveal
              text="瓶颈不在 AI 能力，而在知识基础设施。"
              delayBase={1400}
              accentWords={['知识基础设施']}
            />
          )}
        </p>

        <div className={`${s.manifestoDeclaration} ${visible ? s.revealUp : ''}`} style={{ transitionDelay: '2600ms' }}>
          ArchUI 是第一个从第一天就为 agentic thinking 设计的开发知识编排引擎。
        </div>
      </div>
    </section>
  )
}

// ─── Section 3: Value Proposition ────────────────────────────────────────────

const CAPABILITIES = [
  {
    icon: '⬡',
    title: '可靠导航',
    body: '通过 UUID 链接系统，跨仓库的依赖关系稳定可追踪。Agent 不再迷路。',
  },
  {
    icon: '◈',
    title: '高效理解',
    body: '渐进式披露设计：在有限的 context window 里处理大规模知识库。',
  },
  {
    icon: '◉',
    title: '安全协作',
    body: '通过 schema 验证，保证文档质量和 agent 行为的可预测性。',
  },
]

function SectionValue() {
  const [ref, visible] = useReveal(0.15)
  return (
    <section ref={ref} className={`${s.sectionValue} ${visible ? s.sectionVisible : ''}`}>
      <div className={s.valueInner}>
        <div className={`${s.sectionLabel} ${visible ? s.revealUp : ''}`} style={{ transitionDelay: '0ms' }}>
          核心价值主张
        </div>
        <h2 className={`${s.valueHeading} ${visible ? s.revealClip : ''}`} style={{ transitionDelay: '100ms' }}>
          当你有 50 个仓库、10 个 agent 在并行工作时
        </h2>
        <p className={`${s.valueSubheading} ${visible ? s.fadeSlide : ''}`} style={{ transitionDelay: '350ms' }}>
          你需要的不是「更好的 Confluence」，而是 agent-native 的知识编排引擎。
        </p>
        <div className={s.capabilityGrid}>
          {CAPABILITIES.map((cap, i) => (
            <div
              key={cap.title}
              className={`${s.capabilityCard} ${visible ? s.fadeSlide : ''}`}
              style={{ transitionDelay: `${500 + i * 150}ms` }}
            >
              <div className={s.capabilityIcon}>{cap.icon}</div>
              <h3 className={s.capabilityTitle}>{cap.title}</h3>
              <p className={s.capabilityBody}>{cap.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Section 4: Why Now ──────────────────────────────────────────────────────

const WHY_NOW = [
  {
    num: '01',
    title: 'Agentic engineering 的兴起',
    body: 'AI agent 从「代码补全」进化到「多步骤任务执行」。Claude Code、Cursor、Windsurf 让 agent 成为开发主力。',
  },
  {
    num: '02',
    title: 'Context window 的瓶颈',
    body: '即使 Claude 有 200K context，企业级项目（50+ 仓库）仍然无法一次性加载。需要新的知识组织方式。',
  },
  {
    num: '03',
    title: '文档熵增的加速',
    body: '代码由 agent 生成后，文档更新的负担反而更重。传统「人工维护文档」模式已经不可持续。',
  },
]

function SectionWhyNow() {
  const [ref, visible] = useReveal(0.15)
  return (
    <section ref={ref} className={`${s.sectionWhyNow} ${visible ? s.sectionVisible : ''}`}>
      <div className={s.whyNowInner}>
        <div className={`${s.sectionLabel} ${visible ? s.revealUp : ''}`} style={{ transitionDelay: '0ms' }}>
          为什么是现在
        </div>
        <h2 className={`${s.whyNowHeading} ${visible ? s.revealClip : ''}`} style={{ transitionDelay: '100ms' }}>
          三个同时发生的信号
        </h2>
        <div className={s.timelineList}>
          {WHY_NOW.map((item, i) => (
            <div
              key={item.num}
              className={`${s.timelineItem} ${visible ? s.fadeSlide : ''}`}
              style={{ transitionDelay: `${350 + i * 180}ms` }}
            >
              <div className={s.timelineNum}>{item.num}</div>
              <div className={s.timelineContent}>
                <h3 className={s.timelineTitle}>{item.title}</h3>
                <p className={s.timelineBody}>{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Section 5: CTA ──────────────────────────────────────────────────────────

interface SectionCtaProps {
  onServer: () => void
  onFsa: () => void
  serverUrl: string
  onServerUrlChange: (v: string) => void
  showUrl: boolean
  onToggleUrl: () => void
}

function SectionCta({ onServer, onFsa, serverUrl, onServerUrlChange, showUrl, onToggleUrl }: SectionCtaProps) {
  const landingContent = workspaceContent.landing
  const [ref, visible] = useReveal(0.2)
  return (
    <section ref={ref} className={`${s.sectionCta} ${visible ? s.sectionVisible : ''}`}>
      <div className={`${s.card} ${visible ? s.fadeSlide : ''}`} style={{ transitionDelay: '150ms' }}>
        <div className={s.cardKicker}>{landingContent.card.kicker}</div>
        <h1>{landingContent.card.title}</h1>
        <p>{landingContent.card.body}</p>

        <div className={s.actionGrid}>
          <button className={s.btnPrimary} onClick={onServer}>
            {landingContent.actions.connectServer}
          </button>
          <button className={s.btnSecondary} onClick={onFsa}>
            {landingContent.actions.openFolder}
          </button>
        </div>

        <button className={s.inlineBtn} onClick={onToggleUrl}>
          {showUrl ? landingContent.actions.hideServerUrl : landingContent.actions.showServerUrl}
        </button>

        {showUrl && (
          <div className={s.urlRow}>
            <input
              className={s.urlInput}
              value={serverUrl}
              onChange={e => onServerUrlChange(e.target.value)}
              placeholder={landingContent.actions.serverUrlPlaceholder}
            />
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Root component ───────────────────────────────────────────────────────────

export function OpenFolder() {
  const landingContent = workspaceContent.landing
  const setAdapter = useCanvasStore(s => s.setAdapter)
  const [serverUrl, setServerUrl] = useState(
    import.meta.env.VITE_SERVER_URL ?? landingContent.actions.serverUrlPlaceholder,
  )
  const [showUrl, setShowUrl] = useState(false)

  const handleFsa = useCallback(async () => {
    try {
      const { adapter, root } = await openDirectory()
      await setAdapter(adapter, '/', 'fsa')
      void root
    } catch (e) {
      if ((e as Error).name !== 'AbortError') console.error(e)
    }
  }, [setAdapter])

  const handleServer = useCallback(async () => {
    await setAdapter(serverAdapter, '.', 'server')
  }, [setAdapter])

  return (
    <div className={s.scrollRoot}>
      <SectionHero />
      <SectionManifesto />
      <SectionValue />
      <SectionWhyNow />
      <SectionCta
        onServer={handleServer}
        onFsa={handleFsa}
        serverUrl={serverUrl}
        onServerUrlChange={setServerUrl}
        showUrl={showUrl}
        onToggleUrl={() => setShowUrl(v => !v)}
      />
    </div>
  )
}
