import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('loads and renders the analysis for the default ticker', async ({
    page,
  }) => {
    await page.goto('/');

    // The headline price/regime card resolves (live data or sample fallback).
    await expect(
      page.getByText(/Price & Market Regimes/i),
    ).toBeVisible({ timeout: 30_000 });

    // Core panels are present.
    await expect(page.getByText(/Model Diagnostics/i)).toBeVisible();
    await expect(page.getByText(/Forecast/i).first()).toBeVisible();
    await expect(page.getByText(/Regime Transitions/i)).toBeVisible();
    await expect(page.getByText(/Regime Statistics/i)).toBeVisible();
  });

  test('runs a new analysis when the ticker changes', async ({ page }) => {
    await page.goto('/');

    const ticker = page.getByLabel(/Ticker symbol/i);
    await ticker.fill('MSFT');
    await page.getByRole('button', { name: /Run analysis/i }).click();

    await expect(
      page.getByText(/MSFT — Price & Market Regimes/i),
    ).toBeVisible({ timeout: 30_000 });
  });

  test('auto-select toggle disables the manual states dropdown', async ({
    page,
  }) => {
    await page.goto('/');

    const autoSelect = page.getByLabel(/Auto-select/i);
    await autoSelect.check();
    await expect(page.locator('#states')).toBeDisabled();
  });
});
