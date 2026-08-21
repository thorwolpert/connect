import { test, expect } from '@playwright/test'

test.describe('Application Registration Journey', () => {
  test('should successfully navigate, fill, preview, submit and persist a registered application', async ({ page }) => {
    // 1. Navigate to the intent page
    await page.goto('/intent')
    await page.waitForURL(url => url.pathname.includes('/intent'), { timeout: 15000 })

    // 2. Click on the "I want to register an application" card
    const registerCard = page.locator('text=I want to register an application')
    await registerCard.click()

    // Wait for navigation to the registration form page
    await page.waitForURL(url => url.pathname.includes('/gov-user/register-application'), { timeout: 15000 })

    // Verify header title
    await expect(page.locator('h2')).toContainText('Application Registration')

    // 3. Fill in the form fields and verify real-time Live Preview updates
    // Locate form fields
    const shortNameInput = page.locator('input[placeholder="e.g. CORE-API"]')
    const longNameInput = page.locator('input[placeholder="e.g. Centralized Resource Engine API"]')
    const descriptionInput = page.locator('textarea[placeholder="Provide a detailed overview of the service utility..."]')
    const codeownersInput = page.locator('input[placeholder="e.g. @bcgov/team-alpha, @jsmith"]')
    const gcpProjectInput = page.locator('input[placeholder="e.g. bcgov-project-id"]')

    // Fill Short Name and verify preview title
    await shortNameInput.fill('E2E-TEST-APP')
    const previewTitle = page.locator('[data-testid="live-preview-card"] >> h3')
    await expect(previewTitle).toContainText('E2E-TEST-APP')

    // Fill Description and verify preview description
    await descriptionInput.fill('This is a test application registered during E2E verification.')
    const previewDescription = page.locator('[data-testid="live-preview-card"] >> p.line-clamp-3')
    await expect(previewDescription).toContainText('This is a test application registered during E2E verification.')

    // Fill remaining fields
    await longNameInput.fill('E2E Test Long Name')
    await codeownersInput.fill('@bcgov/e2e-owners')
    await gcpProjectInput.fill('bcgov-e2e-project')

    // 4. Submit the registration
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // 5. Verify the success modal appears with registered details
    const successModal = page.locator('.space-y-6 >> text=Application Registered!')
    await expect(successModal).toBeVisible({ timeout: 15000 })

    // Check modal contents
    await expect(page.locator('div.font-mono')).toContainText('E2E-TEST-APP')
    await expect(page.locator('div.font-mono')).toContainText('E2E Test Long Name')

    // 6. Click Return to Intent Portal and verify navigation
    await page.waitForTimeout(1500)
    const returnButton = page.locator('[data-testid="return-to-intent-button"]')
    await returnButton.click()
    await page.waitForURL(url => url.pathname.includes('/intent'), { timeout: 15000 })

    // 7. Verify DB persistence via GET API request
    const appResponse = await page.request.get('/api/applications?shortName=E2E-TEST-APP')
    expect(appResponse.ok()).toBeTruthy()
    const appBody = await appResponse.json()
    expect(appBody.data.shortName).toBe('E2E-TEST-APP')
    expect(appBody.data.longName).toBe('E2E Test Long Name')
    expect(appBody.data.description).toBe('This is a test application registered during E2E verification.')
    expect(appBody.data.gcpProjectId).toBe('bcgov-e2e-project')
  })
})
