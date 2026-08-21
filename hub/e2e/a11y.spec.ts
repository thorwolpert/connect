import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Audits', () => {
  test('intent page should have no accessibility violations', async ({ page }) => {
    // Navigate directly to the intent page
    await page.goto('/intent')
    const container = page.locator('[data-testid="intent-page-container"]')
    await container.waitFor({ state: 'visible', timeout: 15000 })

    // Run the axe accessibility audit specifically on the intent page container
    const results = await new AxeBuilder({ page }).include('[data-testid="intent-page-container"]').analyze()

    // Log the violations if there are any to help debugging
    if (results.violations.length > 0) {
      console.log('AXE VIOLATIONS:')
      console.dir(results.violations, { depth: null })
    }

    // Assert that there are no violations
    expect(results.violations).toEqual([])
  })

  test('services page should have no accessibility violations', async ({ page }) => {
    await page.goto('/services')
    const container = page.locator('[data-testid="services-page-container"]')
    await container.waitFor({ state: 'visible', timeout: 15000 })
    const results = await new AxeBuilder({ page }).include('[data-testid="services-page-container"]').analyze()

    if (results.violations.length > 0) {
      console.log('AXE VIOLATIONS (Services Page):')
      console.dir(results.violations, { depth: null })
    }

    expect(results.violations).toEqual([])
  })
})
