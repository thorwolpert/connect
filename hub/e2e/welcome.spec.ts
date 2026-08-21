import { test, expect } from '@playwright/test'
import { getTestCredentials } from './test-helpers'

test.describe('Welcome Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Listen for console logs and page errors
    page.on('console', msg => console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`))
    page.on('pageerror', err => console.error(`[BROWSER EXCEPTION] ${err.name}: ${err.message}\nStack:\n${err.stack}`))

    // Navigate to the welcome page
    await page.goto('/')
  })

  test('should display the correct page title and SEO meta', async ({ page }) => {
    await expect(page).toHaveTitle(/Connect \| G2G Portal/)
  })

  test('should render the hero section with branding logo and text', async ({ page }) => {
    // Check main heading
    const heading = page.locator('h1')
    await expect(heading).toContainText('Securely Connect to BC Online Services.')

    // Check official infrastructure badge
    await expect(page.locator('text=Official G2G Infrastructure')).toBeVisible()

    // Check animated branding SVG
    const brandingSvg = page.locator('svg[aria-label="Animated Connect branding"]')
    await expect(brandingSvg).toBeVisible()
  })

  test('should navigate to the services catalog page when clicking Explore Services', async ({ page }) => {
    const exploreButton = page.locator('a:has-text("Explore Services"), button:has-text("Explore Services")')
    await expect(exploreButton).toBeVisible()
    await exploreButton.click()
    await page.waitForURL(url => url.pathname.includes('/services'), { timeout: 15000 })
    await expect(page.locator('h1')).toContainText('Service Catalog')
  })

  test('should display the login options for each segment', async ({ page }) => {
    // Check sections/headings
    await expect(page.locator('text=Government & Public Sector')).toBeVisible()
    await expect(page.locator('text=Citizens & Professionals')).toBeVisible()
    await expect(page.locator('text=B2B & SaaS Partners')).toBeVisible()

    // Check action buttons
    const idirButton = page.locator('button:has-text("Login with IDIR")')
    await expect(idirButton).toBeVisible()

    const bcscButton = page.locator('button:has-text("BC Service Card")')
    await expect(bcscButton).toBeVisible()

    const bceidButton = page.locator('button:has-text("BCeID Account")')
    await expect(bceidButton).toBeVisible()
  })

  test('should toggle the chat assistant widget when clicked', async ({ page }) => {
    const assistantButton = page.locator('button[aria-label="Open chat assistant"]')
    await expect(assistantButton).toBeVisible()

    // Dialog should not be visible initially
    await expect(page.locator('text="Hi there!"')).not.toBeVisible()

    // Click to open
    await assistantButton.click()
    await expect(page.locator('text="Hi there!"')).toBeVisible()
    await expect(page.locator('text=I\'m your Connect assistant.')).toBeVisible()

    // Click to close
    await assistantButton.click()
    await expect(page.locator('text="Hi there!"')).not.toBeVisible()
  })

  test('should successfully login via IDIR using BRTEST3 credentials and redirect to intent page', async ({ page }) => {
    test.skip(!process.env.TEST_LIVE_KEYCLOAK, 'Requires Keycloak redirect URI to be configured for localhost:3000')
    const credentials = getTestCredentials('BRTEST3')

    // Verify user is not logged in initially (account options button should not exist)
    await expect(page.locator('#account-options-button')).not.toBeVisible()

    // Click the IDIR login button
    const idirButton = page.locator('button:has-text("Login with IDIR")')
    await idirButton.click()

    // Wait for the redirect to Siteminder/Keycloak login page
    await page.waitForURL(/(logontest7\.gov\.bc\.ca|loginproxy\.gov\.bc\.ca)/, { timeout: 25000 })

    // Fill in credentials
    const userField = page.locator('input[name="user"], input#user, input#username')
    await userField.waitFor({ state: 'visible', timeout: 15000 })
    await userField.fill(credentials.username)

    const passwordField = page.locator('input[name="password"], input#password')
    await passwordField.fill(credentials.password)

    // Click submit/login button
    const loginButton = page.locator('input[type="submit"], input[name="login"], button#kc-login, button[type="submit"], input[value="Continue"]')
    await loginButton.click()

    // Wait for the redirect to the intent page (localized /en-CA/intent or /intent)
    await page.waitForURL(url => url.pathname.includes('/intent'), { timeout: 35000 })

    // Check that the user profile/account button is visible in the header
    const accountButton = page.locator('#account-options-button')
    await expect(accountButton).toBeVisible({ timeout: 25000 })

    // Check that username and ministry are rendered correctly in the header
    await expect(accountButton).toContainText('BRTEST 3')
    await expect(accountButton).toContainText('Ministry of Citizens\' Services')

    // Check intent page main title and verification badge
    await expect(page.locator('h1')).toContainText('Welcome, BRTEST 3')
    await expect(page.locator('text=Institutional Access Verified: Ministry of Citizens\' Services')).toBeVisible()

    // Check path card options
    await expect(page.locator('text=I want to use existing services')).toBeVisible()
    await expect(page.locator('text=I want to register an application')).toBeVisible()

    // Check links/buttons inside cards
    await expect(page.locator('text=Browse Service Catalog')).toBeVisible()
    await expect(page.locator('text=Start Onboarding')).toBeVisible()

    // Check bento boxes
    await expect(page.locator('text=First time here?')).toBeVisible()
    await expect(page.locator('text=Privacy & Security')).toBeVisible()

    // Click the account options button to open the dropdown menu
    await accountButton.click()

    // Check that the dropdown menu is visible and contains standard logout option
    const dropdownMenu = page.locator('.account-options-menu-pw-selector')
    await expect(dropdownMenu).toBeVisible()
    await expect(dropdownMenu).toContainText('Log out')
  })

  test('should successfully login via BCSC using BCREG4000 credentials', async ({ page }) => {
    test.skip(!process.env.TEST_LIVE_KEYCLOAK, 'Requires Keycloak redirect URI to be configured for localhost:3000')
    const credentials = getTestCredentials('BCREG4000')

    // Verify user is not logged in initially
    await expect(page.locator('#account-options-button')).not.toBeVisible()

    // Click the BC Service Card login button
    const bcscButton = page.locator('button:has-text("BC Service Card")')
    await bcscButton.click()

    // Wait for the redirect to BCSC login page (contains idtest.gov.bc.ca or loginproxy.gov.bc.ca)
    await page.waitForURL(/(idtest\.gov\.bc\.ca|loginproxy\.gov\.bc\.ca)/, { timeout: 25000 })

    // Click "Test with username and password" if it exists (on idtest.gov.bc.ca)
    if (page.url().includes('idtest.gov.bc.ca')) {
      const testLink = page.locator('text=Test with username and password')
      await testLink.waitFor({ state: 'visible', timeout: 15000 })
      await testLink.click()
    }

    // Wait for the form fields to appear
    const userField = page.locator('input#username, input[name="username"], input#user, input[name="user"]')
    await userField.waitFor({ state: 'visible', timeout: 15000 })
    await userField.fill(credentials.username)

    const passwordField = page.locator('input#password, input[name="password"]')
    await passwordField.fill(credentials.password)

    // Click submit using the unique button ID on the BCSC test page
    const loginButton = page.locator('#submit-btn')
    await loginButton.click()

    // Wait for the redirect back to localhost:3000 (localized /en-CA or root)
    await page.waitForURL(url => url.pathname.includes('/en-CA') || url.pathname === '/', { timeout: 30000 })

    // Check that the user profile/account button is visible in the header
    const accountButton = page.locator('#account-options-button')
    await expect(accountButton).toBeVisible({ timeout: 25000 })

    // Check that username and account name are rendered correctly
    await expect(accountButton).toContainText('TTHOR')
    await expect(accountButton).toContainText('thor-diverse-2')

    // Click the account options button to open the dropdown menu
    await accountButton.click()

    // Check that the dropdown displays the account name
    const dropdownMenu = page.locator('.account-options-menu-pw-selector')
    await expect(dropdownMenu).toBeVisible()
    await expect(dropdownMenu).toContainText('thor-diverse-2')
  })
})
