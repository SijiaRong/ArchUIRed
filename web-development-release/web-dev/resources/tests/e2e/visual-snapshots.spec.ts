import { expect, test, type Page } from '@playwright/test'
import { workspaceContent } from '../../src/generated/workspace-content.generated'

const screenshotOptions = {
  animations: 'disabled' as const,
  fullPage: true,
  maxDiffPixels: 250,
}

async function waitForCanvas(page: Page) {
  await page.waitForFunction(() => {
    const hook = (window as Window & {
      __archui?: {
        getStore: () => { currentModule: unknown }
      }
    }).__archui
    return Boolean(hook?.getStore().currentModule)
  }, undefined, { timeout: 10_000 })
  await page.waitForSelector('.react-flow__node', { timeout: 10_000 })
  await page.waitForSelector(`nav[aria-label="${workspaceContent.canvas.breadcrumb.ariaLabel}"]`, { timeout: 10_000 })
  await page.waitForTimeout(250)
}

async function loadWorkspace(page: Page, theme: 'light' | 'dark' = 'light') {
  await page.goto(`/?e2e=1&theme=${theme}`)
  await waitForCanvas(page)
}

test.describe('Landing shell', () => {
  test('keeps the layered typography contract', async ({ page }) => {
    await page.goto('/?theme=light')
    await expect(page.getByAltText(workspaceContent.brand.logoMark.alt)).toBeVisible()
    await expect(page.getByRole('heading', { name: workspaceContent.landing.card.title })).toBeVisible()

    const wordmarkFont = await page.getByText(workspaceContent.landing.brandWordmark, { exact: true }).evaluate(el => window.getComputedStyle(el).fontFamily)
    const headingFont = await page.getByRole('heading', { name: workspaceContent.landing.card.title }).evaluate(el => window.getComputedStyle(el).fontFamily)
    const bodyFont = await page.locator('body').evaluate(el => window.getComputedStyle(el).fontFamily)

    expect(wordmarkFont).toContain('Syne')
    expect(headingFont).toContain('Sora')
    expect(bodyFont).toContain('Lexend')
  })

  test('landing shell snapshot', async ({ page }) => {
    await page.goto('/?theme=light')
    await expect(page).toHaveScreenshot('landing-shell-light.png', screenshotOptions)
  })
})

test.describe('Canvas workbench snapshots', () => {
  test('idle canvas light', async ({ page }) => {
    await loadWorkspace(page, 'light')
    await expect(page).toHaveScreenshot('canvas-idle-light.png', screenshotOptions)
  })

  test('selected canvas with detail panel', async ({ page }) => {
    await loadWorkspace(page, 'light')
    await page.locator('[data-node-variant="primary"]').click()
    await expect(page.locator('aside[aria-label="Module details"]')).toBeVisible()
    await expect(page).toHaveScreenshot('canvas-selected-light.png', screenshotOptions)
  })

  test('drilled canvas dark', async ({ page }) => {
    await loadWorkspace(page, 'dark')
    await page.evaluate(async () => {
      const hook = (window as Window & {
        __archui?: {
          getStore: () => { navigate: (path: string) => Promise<void> }
        }
      }).__archui
      await hook?.getStore().navigate('/project/gui/design-system')
    })
    await expect(page.locator(`nav[aria-label="${workspaceContent.canvas.breadcrumb.ariaLabel}"]`)).toContainText('Design System')
    await expect(page).toHaveScreenshot('canvas-drilled-dark.png', screenshotOptions)
  })
})
