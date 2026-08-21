import { test, expect } from '@playwright/test'

test.describe('Applications Dashboard Journey', () => {
  test('should successfully display applications, open environment credentials and interact with chat assistant', async ({ page }) => {
    // Navigate directly to the applications dashboard
    await page.goto('/gov-user/dashboard')
    await page.waitForURL(url => url.pathname.includes('/gov-user/dashboard'), { timeout: 15000 })

    // Verify main page title
    await expect(page.locator('h2')).toContainText('Your Applications')

    // 3. Verify application grid exists
    const appCard = page.locator('h3:has-text("Business Registry")')
    await expect(appCard).toBeVisible()

    // 4. Click DEV button for Business Registry to open Details Modal
    const registryCard = page.locator('div.group:has-text("Business Registry")').first()
    const devButton = registryCard.locator('button:has-text("DEV")')
    await devButton.click()

    // Verify modal is visible
    const modalTitle = page.locator('[data-testid="modal-app-title"]')
    await expect(modalTitle).toBeVisible()
    await expect(modalTitle).toContainText('Business Registry')
    await expect(page.locator('span:has-text("DEV")').last()).toBeVisible()

    // Check credentials table
    await expect(page.locator('td:has-text("CLIENT_ID")')).toBeVisible()
    await expect(page.locator('td:has-text("API_KEY")')).toBeVisible()

    // Close Modal
    await page.locator('button:has-text("Close View")').click()
    await expect(modalTitle).not.toBeVisible()

    // 5. Test Connect Assistant Chatbot interaction
    const chatTitle = page.locator('h3:has-text("Connect Assistant")')
    await expect(chatTitle).toBeVisible()

    // Click "Email Service (Node.js)" quick snippet generator
    const snippetButton = page.locator('button:has-text("Email Service (Node.js)")')
    await snippetButton.click()

    // Verify user message appears in chat history
    const userMessage = page.locator('div:has-text("Email Service (Node.js)")').last()
    await expect(userMessage).toBeVisible()

    // Verify assistant responds with Node.js code snippet
    const codeResponse = page.locator('div:has-text("@connect/email-service")').last()
    await expect(codeResponse).toBeVisible({ timeout: 10000 })
  })
})
