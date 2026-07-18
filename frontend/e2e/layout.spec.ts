import { expect, test } from '@playwright/test'

test.describe('Layout', () => {
  test('sidebar and main content scroll independently', async ({ page }) => {
    await page.goto('/documentation')

    await page.locator('main').evaluate((el) => {
      el.scrollTop = 300
    })

    // The sidebar's own scroll container must be unaffected by main's scroll —
    // its first link should still be in view without needing to scroll the page.
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Accueil' })).toBeInViewport()
  })

  test('clicking a sidebar link navigates and resets the main scroll position', async ({ page }) => {
    await page.goto('/documentation')

    await page.locator('main').evaluate((el) => {
      el.scrollTop = 500
    })

    await page.getByRole('navigation').getByRole('link', { name: 'Rogner' }).click()

    await expect(page.getByRole('heading', { level: 2, name: 'Rogner une image' })).toBeVisible()
    const scrollTop = await page.locator('main').evaluate((el) => el.scrollTop)
    expect(scrollTop).toBe(0)
  })

  test('skip link moves keyboard focus to the main content landmark', async ({ page }) => {
    await page.goto('/')

    await page.keyboard.press('Tab')
    const skipLink = page.getByRole('link', { name: 'Aller au contenu principal' })
    await expect(skipLink).toBeFocused()

    await page.keyboard.press('Enter')
    await expect(page.getByRole('main')).toBeFocused()
  })
})
