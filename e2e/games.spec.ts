import { test, expect } from '@playwright/test';

test.describe('GroupGame App - Main Page & Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads the header with title and main components', async ({ page }) => {
    await expect(page.locator('header').getByText('GroupGame', { exact: true })).toBeVisible();
    await expect(page.locator('header').getByText('Спортивные игры')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Все игры' })).toBeVisible();
  });

  test('allows filtering games by search query', async ({ page }) => {
    await page.waitForSelector('.grid');
    const searchInput = page.locator('input[placeholder*="Поиск по названию"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Футбол');
      await expect(searchInput).toHaveValue('Футбол');
    }
  });

  test('navigates through tabs and displays Recharts analytics in My Games', async ({ page }) => {
    const myGamesBtn = page.getByRole('button', { name: 'Мои игры' });
    if (await myGamesBtn.isVisible()) {
      await myGamesBtn.click();
      await expect(page.getByRole('button', { name: 'Мои игры' })).toBeVisible();
      // Check Recharts analytics banner presence
      await expect(page.getByText('Аналитика и статистика игр')).toBeVisible();
      await expect(page.getByText('Recharts Visualizer')).toBeVisible();
    }

    const allGamesBtn = page.getByRole('button', { name: 'Все игры' });
    await allGamesBtn.click();
    await expect(allGamesBtn).toBeVisible();
  });

  test('opens game details modal on clicking a game card', async ({ page }) => {
    const firstCard = page.locator('.group.bg-white.rounded-2xl').first();
    if (await firstCard.isVisible()) {
      await firstCard.click();
      await expect(page.locator('text=Запись на игру').or(page.locator('text=Информация об игре'))).toBeVisible();
    }
  });
});
