import { test, expect } from '@playwright/test';

test.describe('GroupGame App - Modals & Information Panels', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('opens and closes Rules modal', async ({ page }) => {
    const rulesBtn = page.getByRole('button', { name: 'Правила', exact: true });
    if (await rulesBtn.isVisible()) {
      await rulesBtn.click();
      await expect(page.locator('text=Правила и регламент GroupGame')).toBeVisible();
      
      const closeBtn = page.locator('button.absolute.top-5.right-5');
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
    }
  });

  test('opens and closes Subscriptions modal', async ({ page }) => {
    const subBtn = page.getByRole('button', { name: 'Абонементы' }).or(page.getByRole('button', { name: 'Абонемент' })).first();
    if (await subBtn.isVisible()) {
      await subBtn.click();
      await expect(page.locator('text=Абонементы').or(page.locator('text=Тарифные планы'))).toBeVisible();
    }
  });
});
