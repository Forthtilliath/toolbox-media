import { expect, test } from '@playwright/test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

// These mock the network boundary (page.route) rather than the api client
// module — Vitest's unit/functional suite already exercises every page's
// logic against a mocked api client exhaustively. What only a real browser
// can catch is covered here instead: real file inputs, real button
// disabled-state rendering, real focus/DOM behavior.

test('generates a QR code end-to-end in the browser', async ({ page }) => {
  await page.route('**/api/misc/qrcode', async (route) => {
    await route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from('fake-png-bytes') })
  })

  await page.goto('/qrcode')
  await page.getByLabel('Texte ou URL').fill('https://example.com')
  await page.getByRole('button', { name: 'Générer' }).click()

  await expect(page.getByRole('button', { name: /Télécharger/ })).toBeVisible()
})

test('shows the server error message when the API call fails', async ({ page }) => {
  await page.route('**/api/misc/qrcode', async (route) => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'Erreur de test' }),
    })
  })

  await page.goto('/qrcode')
  await page.getByLabel('Texte ou URL').fill('https://example.com')
  await page.getByRole('button', { name: 'Générer' }).click()

  await expect(page.getByRole('alert')).toContainText('Erreur de test')
})

test('disables the submit button while a request is in flight, preventing a duplicate call', async ({ page }) => {
  let callCount = 0
  let resolveRoute: () => void = () => {}
  const pending = new Promise<void>((resolve) => {
    resolveRoute = resolve
  })

  await page.route('**/api/images/compress', async (route) => {
    callCount += 1
    await pending
    await route.fulfill({ status: 200, contentType: 'image/jpeg', body: Buffer.from('fake-jpeg-bytes') })
  })

  await page.goto('/compress-image')
  await page.locator('input[type="file"]').setInputFiles({
    name: 'photo.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('fake-image-data'),
  })

  const button = page.getByRole('button', { name: 'Compresser' })
  await button.click()
  await expect(button).toBeDisabled()

  // A second, real click while disabled must not reach the handler.
  await button.click({ force: true })
  resolveRoute()

  await expect(page.getByRole('button', { name: /Télécharger/ })).toBeVisible()
  expect(callCount).toBe(1)
})

test('rejects an oversized file client-side without any network request', async ({ page }) => {
  // setInputFiles rejects in-memory buffers over 50 MB — write the (sparse,
  // fast-to-create) oversized file to disk and pass its path instead.
  const hugeFilePath = path.join(os.tmpdir(), 'toolbox-media-e2e-huge.jpg')
  const fd = fs.openSync(hugeFilePath, 'w')
  fs.writeSync(fd, Buffer.from([0]), 0, 1, 500 * 1024 * 1024) // just over the 500 MB client-side limit
  fs.closeSync(fd)

  try {
    let requestMade = false
    await page.route('**/api/images/compress', async (route) => {
      requestMade = true
      await route.continue()
    })

    await page.goto('/compress-image')
    await page.locator('input[type="file"]').setInputFiles(hugeFilePath)

    await page.getByRole('button', { name: 'Compresser' }).click()

    await expect(page.getByRole('alert')).toContainText('trop volumineux')
    expect(requestMade).toBe(false)
  } finally {
    fs.unlinkSync(hugeFilePath)
  }
})
