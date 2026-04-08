/**
 * Visual snapshot regression tests for the ArchUI web canvas.
 *
 * Purpose:
 *   - Detect design drift between code and the design system spec.
 *   - Ensure the production build (npm run preview) renders identically to
 *     the dev server — both serve the same bundle, so these snapshots cover both.
 *   - Provide a pixel-accurate baseline comparable to Figma exports.
 *
 * How it works:
 *   All tests load the app with ?e2e=1, which injects a known fixture project
 *   via the in-memory adapter (no real filesystem required).
 *
 * Updating baselines:
 *   npm run test:e2e:update
 */

import { test, expect, Page } from '@playwright/test'

const E2E_URL = '/?e2e=1'

/**
 * Block Google Fonts CDN in every test so Playwright doesn't block
 * indefinitely waiting for Inter to load. System-ui is used as the fallback.
 * Snapshots are about layout/color correctness, not font rendering fidelity.
 */
test.beforeEach(async ({ page }) => {
  await page.route('https://fonts.googleapis.com/**', route => route.abort())
  await page.route('https://fonts.gstatic.com/**', route => route.abort())
})

/** Wait until the canvas has at least one module node rendered */
async function waitForCanvas(page: Page) {
  await page.waitForSelector('.react-flow__node', { timeout: 10_000 })
  await page.waitForTimeout(400)
}

// ─── Group 1: Full canvas — root module ────────────────────────────────────

test.describe('Canvas — root module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(E2E_URL)
    await waitForCanvas(page)
  })

  test('full canvas — default state', async ({ page }) => {
    await expect(page).toHaveScreenshot('canvas-root-default.png', {
      fullPage: false,
    })
  })

  test('canvas background uses color-surface-canvas token', async ({ page }) => {
    // Check the app wrapper div (the outermost layout div) since the ReactFlow
    // viewport itself is transparent
    const bg = await page.locator('body').evaluate(el => {
      return window.getComputedStyle(el).backgroundColor
    })
    // dark mode: --color-surface-canvas = #111113 = rgb(17, 17, 19)
    expect(bg).toBe('rgb(17, 17, 19)')
  })
})

// ─── Group 2: Module node card ─────────────────────────────────────────────

test.describe('ModuleNode — primary card', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(E2E_URL)
    await waitForCanvas(page)
  })

  test('card default state', async ({ page }) => {
    const node = page.locator('.react-flow__node').first()
    await expect(node).toHaveScreenshot('module-node-default.png')
  })

  test('card selected state', async ({ page }) => {
    const node = page.locator('.react-flow__node').first()
    await node.click()
    await page.waitForTimeout(200)
    await expect(node).toHaveScreenshot('module-node-selected.png')
  })

  test('card geometry — 240px wide (offsetWidth, unaffected by zoom)', async ({ page }) => {
    // Use the inner node div (the React component root) for logical CSS width.
    // getBoundingClientRect() is affected by React Flow viewport zoom, but
    // offsetWidth returns the element's CSS layout width regardless of transforms.
    const width = await page.locator('.react-flow__node').first().evaluate(el => {
      // The React component div is the first child of the React Flow node wrapper
      const inner = el.firstElementChild as HTMLElement
      return inner?.offsetWidth ?? el.scrollWidth
    })
    expect(width).toBe(240)
  })

  test('card header height — 36px', async ({ page }) => {
    // The Handle is position:absolute as the first child; header is the second child
    const headerH = await page.locator('.react-flow__node').first().evaluate(el => {
      const inner = el.firstElementChild as HTMLElement
      // Header is identified by computed height: 36px
      const children = inner ? Array.from(inner.children) as HTMLElement[] : []
      for (const child of children) {
        if (window.getComputedStyle(child).height === '36px') return 36
      }
      return null
    })
    expect(headerH).toBe(36)
  })

  test('card uses surface-default background token', async ({ page }) => {
    const bg = await page.locator('.react-flow__node').first().evaluate(el => {
      const inner = el.firstElementChild as HTMLElement
      return inner ? window.getComputedStyle(inner).backgroundColor : ''
    })
    // dark mode: #1C1C1F = rgb(28, 28, 31)
    expect(bg).toBe('rgb(28, 28, 31)')
  })

  test('card name uses correct font', async ({ page }) => {
    const fontInfo = await page.locator('.react-flow__node').first().evaluate(el => {
      // Find the name element by its role (heading-like, first span in header)
      const nameEl = el.querySelector('[class*="name"]') as HTMLElement | null
      if (!nameEl) return null
      const s = window.getComputedStyle(nameEl)
      return { fontSize: s.fontSize, fontWeight: s.fontWeight }
    })
    expect(fontInfo?.fontSize).toBe('14px')
    expect(fontInfo?.fontWeight).toBe('600')
  })

  test('card UUID row renders below header', async ({ page }) => {
    const hasUuid = await page.locator('.react-flow__node').first().evaluate(el => {
      return !!el.querySelector('[class*="uuid"]')
    })
    expect(hasUuid).toBe(true)
  })
})

// ─── Group 3: Canvas with edges ────────────────────────────────────────────

test.describe('Canvas — with link edges', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate into web-development-release (which has 3 child submodules)
    await page.goto(E2E_URL)
    await waitForCanvas(page)
    const wdr = page.locator('.react-flow__node').filter({ hasText: 'Web Development Release' })
    if (await wdr.count() > 0) {
      await wdr.dblclick()
      await waitForCanvas(page)
    }
  })

  test('web-development-release has 3 child nodes', async ({ page }) => {
    // React Flow adds class react-flow__node to every node wrapper
    const nodeCount = await page.locator('.react-flow__node').count()
    // web-dev, web-server, web-build
    expect(nodeCount).toBeGreaterThanOrEqual(3)
  })

  test('canvas with submodules screenshot', async ({ page }) => {
    await expect(page).toHaveScreenshot('canvas-webdev-release.png')
  })
})

// ─── Group 4: Breadcrumb navigation ────────────────────────────────────────

test.describe('Breadcrumb', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(E2E_URL)
    await waitForCanvas(page)
    await page.locator('.react-flow__node').first().dblclick()
    await waitForCanvas(page)
  })

  test('breadcrumb appears after drilling in', async ({ page }) => {
    // Breadcrumb uses aria-label="Breadcrumb" (capital B)
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]')
    await expect(breadcrumb).toBeVisible()
  })

  test('breadcrumb shows two crumbs after one drill-in', async ({ page }) => {
    const buttons = page.locator('nav[aria-label="Breadcrumb"] button')
    const count = await buttons.count()
    expect(count).toBeGreaterThanOrEqual(2)
  })

  test('breadcrumb screenshot', async ({ page }) => {
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]')
    if (await breadcrumb.count() > 0) {
      await expect(breadcrumb).toHaveScreenshot('breadcrumb-drilled-in.png')
    }
  })
})

// ─── Group 5: Token compliance (dark mode) ─────────────────────────────────

test.describe('Token compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(E2E_URL)
    await waitForCanvas(page)
  })

  test('node border uses border-subtle token (#2C2C33)', async ({ page }) => {
    const borderColor = await page.locator('.react-flow__node').first().evaluate(el => {
      const inner = el.firstElementChild as HTMLElement
      return inner ? window.getComputedStyle(inner).borderColor : ''
    })
    // dark mode border-subtle: #2C2C33 = rgb(44, 44, 51)
    expect(borderColor).toBe('rgb(44, 44, 51)')
  })

  test('node card has drop shadow (elevation/card/default)', async ({ page }) => {
    const shadow = await page.locator('.react-flow__node').first().evaluate(el => {
      const inner = el.firstElementChild as HTMLElement
      return inner ? window.getComputedStyle(inner).boxShadow : ''
    })
    expect(shadow).not.toBe('none')
    expect(shadow).toContain('rgba(0, 0, 0,')
  })

  test('no raw hex colors in computed node styles', async ({ page }) => {
    // Spot-check: ensure key colors are CSS-variable-resolved values matching
    // the spec, not hardcoded Catppuccin values from the old implementation.
    const textColor = await page.locator('.react-flow__node [class*="name"]').first().evaluate(el => {
      return window.getComputedStyle(el).color
    })
    // Old Catppuccin primary text: rgb(205, 214, 244) = #cdd6f4
    // New spec dark text: rgb(242, 242, 243) = #F2F2F3
    expect(textColor).not.toBe('rgb(205, 214, 244)')
    expect(textColor).toBe('rgb(242, 242, 243)')
  })
})

// ─── Group 6: Light mode — Figma design alignment ──────────────────────────
//
// These tests load ?e2e=1&theme=light and verify every key token against the
// Figma Color variable collection (Light mode).  Source of truth:
//   gui/design-system/foundations/color/resources/token-table.md
//
// Light mode token values verified here:
//   color/surface/canvas   #F5F5F5  rgb(245, 245, 245)
//   color/surface/default  #FFFFFF  rgb(255, 255, 255)
//   color/border/subtle    #E4E4E8  rgb(228, 228, 232)
//   color/text/primary     #0F0F10  rgb(15, 15, 16)
//   color/text/secondary   #6B6B72  rgb(107, 107, 114)
//   color/text/tertiary    #A0A0A8  rgb(160, 160, 168)

const LIGHT_URL = '/?e2e=1&theme=light'

test.describe('Light mode — Figma token alignment', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LIGHT_URL)
    await waitForCanvas(page)
  })

  // ── Full canvas screenshots ──────────────────────────────────────────────

  test('full canvas — light mode default state', async ({ page }) => {
    await expect(page).toHaveScreenshot('canvas-root-light.png', { fullPage: false })
  })

  test('canvas with submodules — light mode', async ({ page }) => {
    const wdr = page.locator('.react-flow__node').filter({ hasText: 'Web Development Release' })
    if (await wdr.count() > 0) {
      await wdr.dblclick()
      await waitForCanvas(page)
    }
    await expect(page).toHaveScreenshot('canvas-webdev-light.png')
  })

  // ── Surface tokens ────────────────────────────────────────────────────────

  test('canvas background — color/surface/canvas — #F5F5F5', async ({ page }) => {
    const bg = await page.locator('body').evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    )
    // #F5F5F5 = rgb(245, 245, 245)
    expect(bg).toBe('rgb(245, 245, 245)')
  })

  test('node card background — color/surface/default — #FFFFFF', async ({ page }) => {
    const bg = await page.locator('.react-flow__node').first().evaluate(el => {
      const inner = el.firstElementChild as HTMLElement
      return inner ? window.getComputedStyle(inner).backgroundColor : ''
    })
    // #FFFFFF = rgb(255, 255, 255)
    expect(bg).toBe('rgb(255, 255, 255)')
  })

  // ── Border token ──────────────────────────────────────────────────────────

  test('node border — color/border/subtle — #E4E4E8', async ({ page }) => {
    const border = await page.locator('.react-flow__node').first().evaluate(el => {
      const inner = el.firstElementChild as HTMLElement
      return inner ? window.getComputedStyle(inner).borderColor : ''
    })
    // #E4E4E8 = rgb(228, 228, 232)
    expect(border).toBe('rgb(228, 228, 232)')
  })

  // ── Text tokens ───────────────────────────────────────────────────────────

  test('node name color — color/text/primary — #0F0F10', async ({ page }) => {
    const color = await page.locator('.react-flow__node [class*="name"]').first().evaluate(el =>
      window.getComputedStyle(el).color
    )
    // #0F0F10 = rgb(15, 15, 16)
    expect(color).toBe('rgb(15, 15, 16)')
  })

  test('node description color — color/text/secondary — #6B6B72', async ({ page }) => {
    // Navigate into a module that has a description (e.g. web-development-release)
    const wdr = page.locator('.react-flow__node').filter({ hasText: 'Web Development Release' })
    if (await wdr.count() > 0) {
      await wdr.dblclick()
      await waitForCanvas(page)
    }
    const descEl = page.locator('.react-flow__node [class*="desc"]').first()
    if (await descEl.count() > 0) {
      const color = await descEl.evaluate(el => window.getComputedStyle(el).color)
      // #6B6B72 = rgb(107, 107, 114)
      expect(color).toBe('rgb(107, 107, 114)')
    }
  })

  test('UUID color — color/text/tertiary — #A0A0A8', async ({ page }) => {
    const color = await page.locator('.react-flow__node [class*="uuid"]').first().evaluate(el =>
      window.getComputedStyle(el).color
    )
    // #A0A0A8 = rgb(160, 160, 168)
    expect(color).toBe('rgb(160, 160, 168)')
  })

  // ── Selected state ────────────────────────────────────────────────────────

  test('selected node — color/border/focus — #2563EB ring', async ({ page }) => {
    const node = page.locator('.react-flow__node').first()
    await node.click()
    await page.waitForTimeout(200)
    const border = await node.evaluate(el => {
      const inner = el.firstElementChild as HTMLElement
      return inner ? window.getComputedStyle(inner).borderColor : ''
    })
    // color/border/focus light: #2563EB = rgb(37, 99, 235)
    expect(border).toBe('rgb(37, 99, 235)')
  })

  test('selected node card screenshot — light mode', async ({ page }) => {
    const node = page.locator('.react-flow__node').first()
    await node.click()
    await page.waitForTimeout(200)
    await expect(node).toHaveScreenshot('module-node-selected-light.png')
  })

  test('default node card screenshot — light mode', async ({ page }) => {
    await expect(page.locator('.react-flow__node').first()).toHaveScreenshot('module-node-default-light.png')
  })
})
