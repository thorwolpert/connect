import { test, expect } from '@playwright/test'

test.describe('Service Catalog Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Listen for console logs and page errors
    page.on('console', msg => console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`))
    page.on('pageerror', err => console.error(`[BROWSER EXCEPTION] ${err.name}: ${err.message}\nStack:\n${err.stack}`))

    // Navigate to the services catalog page
    await page.goto('/services')
  })

  test('should display page header, title, search, and inline filter controls', async ({ page }) => {
    // Check page title & SEO
    await expect(page).toHaveTitle(/Service Catalog/)

    // Check Header Navigation Bar
    const header = page.locator('header')
    await expect(header).toBeVisible()

    // Check Main Heading and Subtitle
    const heading = page.locator('h1')
    await expect(heading).toHaveText('Service Catalog')
    await expect(page.locator('text=Explore and access public applications and internal government services')).toBeVisible()

    // Check Search input and Sort select
    const searchInput = page.locator('input[placeholder="Search services..."]')
    await expect(searchInput).toBeVisible()

    const sortSelect = page.locator('select[aria-label="Sort services"]')
    await expect(sortSelect).toBeVisible()
    await expect(sortSelect).toHaveValue('A-Z')

    // Check Inline Active Filter Dropdowns
    await expect(page.locator('select[aria-label="Filter by Category..."]')).toBeVisible()
    await expect(page.locator('select[aria-label="Filter by Status..."]')).toBeVisible()
    await expect(page.locator('select[aria-label="Filter by Ministry..."]')).toBeVisible()
  })

  test('should render category sections and service cards correctly', async ({ page }) => {
    // Category Headers
    await expect(page.locator('h2:has-text("Public Applications")')).toBeVisible()
    await expect(page.locator('h2:has-text("Government & BPS Services")')).toBeVisible()

    // Public Applications cards
    await expect(page.locator('h3:has-text("Court Services Online")')).toBeVisible()
    await expect(page.locator('h3:has-text("Business Registry")')).toBeVisible()
    await expect(page.locator('h3:has-text("Business Search")')).toBeVisible()

    // Government & BPS Services cards
    await expect(page.locator('h3:has-text("Connect Nuxt")')).toBeVisible()
    await expect(page.locator('h3:has-text("Document Creation")')).toBeVisible()

    // Badges & Tag pills
    await expect(page.locator('span:has-text("Production")').first()).toBeVisible()
    await expect(page.locator('span:has-text("Beta")')).toBeVisible()
    await expect(page.locator('span:has-text("Leveraged")').first()).toBeVisible()

    // Ministry footers
    await expect(page.locator('div.border-t:has-text("Ministry of Attorney General")').first()).toBeVisible()
    await expect(page.locator('div.border-t:has-text("Ministry of Citizens\' Services")').first()).toBeVisible()
    await expect(page.locator('div.border-t:has-text("Platform Services")').first()).toBeVisible()
  })

  test('should filter service cards dynamically using search input', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search services..."]')

    // Initially Court Services Online is visible
    await expect(page.locator('h3:has-text("Court Services Online")')).toBeVisible()

    // Search for "Court"
    await searchInput.fill('Court')
    await expect(page.locator('h3:has-text("Court Services Online")')).toBeVisible()
    await expect(page.locator('h3:has-text("Business Registry")')).not.toBeVisible()

    // Search for non-existent service
    await searchInput.fill('XYZ Nonexistent Service')
    await expect(page.locator('text=No services match your filters')).toBeVisible()

    // Clear search
    await searchInput.fill('')
    await expect(page.locator('h3:has-text("Court Services Online")')).toBeVisible()
  })

  test('should add and remove active filters via inline dropdowns', async ({ page }) => {
    // Select Status: Beta from inline dropdown
    const statusSelect = page.locator('select[aria-label="Filter by Status..."]')
    await statusSelect.selectOption('Beta')

    // Active filter badge "Beta" should appear under Active Filters line
    await expect(page.locator('text=Active Filters:')).toBeVisible()
    const activeBadge = page.locator('button[aria-label="Remove filter"]').first()
    await expect(activeBadge).toBeVisible()

    // Removing active filter badge
    await activeBadge.click()
    await expect(page.locator('button[aria-label="Remove filter"]')).toHaveCount(0)
  })
})
