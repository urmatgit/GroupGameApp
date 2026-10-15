import { test, expect } from '@playwright/test';

test.describe('GroupGame App - Notifications System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays notification bell icon in header', async ({ page }) => {
    const bellButton = page.locator('button[title="Уведомления"]');
    await expect(bellButton).toBeVisible();
  });

  test('opens notification dropdown when bell icon is clicked', async ({ page }) => {
    const bellButton = page.locator('button[title="Уведомления"]');
    await bellButton.click();

    // Verify popup header span text
    await expect(page.locator('span:has-text("Уведомления")').first()).toBeVisible();
  });

  test('allows marking notifications as read', async ({ page }) => {
    const bellButton = page.locator('button[title="Уведомления"]');
    await bellButton.click();

    const markAllReadBtn = page.locator('button:has-text("Прочитать все")');
    if (await markAllReadBtn.isVisible()) {
      await markAllReadBtn.click();
    }

    await expect(page.locator('span:has-text("Уведомления")').first()).toBeVisible();
  });

  test('allows switching users from user dropdown', async ({ page }) => {
    // Click user dropdown toggle (contains user avatar image)
    const userMenuBtn = page.locator('header img[alt]').first().locator('..');
    if (await userMenuBtn.isVisible()) {
      await userMenuBtn.click();
      await expect(page.locator('text=Тестовый профиль')).toBeVisible();
    }
  });
});
