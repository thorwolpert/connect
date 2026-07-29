import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { getTestCredentials } from './test-helpers'

test.describe('Accessibility Audits', () => {
  test('intent page should have no accessibility violations', async ({ page }) => {
    const credentials = getTestCredentials('BRTEST3')

    // Go to the home page
    await page.goto('/')

    // Click the IDIR login button
    await page.locator('button:has-text("Login with IDIR")').click()

    // Wait for redirect to Siteminder/Keycloak
    await page.waitForURL(/(logontest7\.gov\.bc\.ca|loginproxy\.gov\.bc\.ca)/, { timeout: 25000 })

    // Fill credentials
    const userField = page.locator('input[name="user"], input#user, input#username')
    await userField.waitFor({ state: 'visible', timeout: 15000 })
    await userField.fill(credentials.username)

    const passwordField = page.locator('input[name="password"], input#password')
    await passwordField.fill(credentials.password)

    // Click submit
    const loginButton = page.locator('input[type="submit"], input[name="login"], button#kc-login, button[type="submit"], input[value="Continue"]')
    await loginButton.click()

    // Wait for the redirect to the intent page
    await page.waitForURL(url => url.pathname.includes('/intent'), { timeout: 35000 })

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
})
