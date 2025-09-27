import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('DeFi Portfolio Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Start with a fresh state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('should display login form initially', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/DeFi Portfolio/);
    await expect(page.getByTestId('login-form')).toBeVisible();
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('login-button')).toBeVisible();
  });

  test('should login with email and show dashboard', async ({ page }) => {
    await page.goto('/');
    
    // Fill in email and submit
    await page.getByTestId('email-input').fill('test@example.com');
    await page.getByTestId('login-button').click();
    
    // Wait for loading and then dashboard to appear
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('h1')).toContainText('DeFi Portfolio');
  });

  test('should show empty state when no holdings', async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.getByTestId('email-input').fill('test@example.com');
    await page.getByTestId('login-button').click();
    await expect(page.locator('h1')).toContainText('DeFi Portfolio');
    
    // Check empty states
    await expect(page.getByTestId('no-holdings-message')).toBeVisible();
    await expect(page.locator('text=$0.00').first()).toBeVisible();
  });

  test('CSV import flow', async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.getByTestId('email-input').fill('test@example.com');
    await page.getByTestId('login-button').click();
    await expect(page.locator('h1')).toContainText('DeFi Portfolio');
    
    // Test CSV import
    const csvContent = `symbol,amount,acquisition_date,acquisition_price
BTC,0.1,2024-01-15,45000
ETH,1.5,2024-02-01,3000`;
    
    // Create a temporary file
    const fileInput = page.getByTestId('csv-file-input');
    
    // Create a file-like object
    await page.evaluate(async (content) => {
      const blob = new Blob([content], { type: 'text/csv' });
      const file = new File([blob], 'test-holdings.csv', { type: 'text/csv' });
      
      // Trigger file input change
      const input = document.querySelector('[data-testid="csv-file-input"]') as HTMLInputElement;
      if (input) {
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, csvContent);
    
    // Wait for import success message
    await expect(page.getByTestId('import-success-message')).toBeVisible({ timeout: 10000 });
    
    // Check that holdings are displayed - use parent containers which are unique
    await expect(page.getByTestId('holding-mobile-btc').or(page.getByTestId('holding-row-btc'))).toBeVisible();
    await expect(page.getByTestId('holding-mobile-eth').or(page.getByTestId('holding-row-eth'))).toBeVisible();
  });

  test('should show validation errors for invalid CSV', async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.getByTestId('email-input').fill('test@example.com');
    await page.getByTestId('login-button').click();
    await expect(page.locator('h1')).toContainText('DeFi Portfolio');
    
    // Test invalid CSV
    const invalidCsv = `symbol,amount,acquisition_date
BTC,invalid_amount,2024-01-15
,1.5,2024-02-01`;
    
    await page.evaluate(async (content) => {
      const blob = new Blob([content], { type: 'text/csv' });
      const file = new File([blob], 'invalid.csv', { type: 'text/csv' });
      
      const input = document.querySelector('[data-testid="csv-file-input"]') as HTMLInputElement;
      if (input) {
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, invalidCsv);
    
    // Wait for validation errors
    await expect(page.getByTestId('validation-errors')).toBeVisible({ timeout: 5000 });
  });

  test('should download sample CSV', async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.getByTestId('email-input').fill('test@example.com');
    await page.getByTestId('login-button').click();
    await expect(page.locator('h1')).toContainText('DeFi Portfolio');
    
    // Set up download promise before clicking
    const downloadPromise = page.waitForEvent('download');
    
    // Click sample CSV download button
    await page.getByRole('button', { name: 'Sample CSV' }).click();
    
    // Wait for download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('sample-holdings.csv');
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.getByTestId('email-input').fill('test@example.com');
    await page.getByTestId('login-button').click();
    await expect(page.locator('h1')).toContainText('DeFi Portfolio');
    
    // Click logout
    await page.getByRole('button', { name: 'Sign out' }).click();
    
    // Should return to login page
    await expect(page.getByTestId('login-form')).toBeVisible();
    await expect(page.getByTestId('email-input')).toBeVisible();
  });

  test('mobile responsive layout', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Login
    await page.goto('/');
    await page.getByTestId('email-input').fill('test@example.com');
    await page.getByTestId('login-button').click();
    await expect(page.locator('h1')).toContainText('DeFi Portfolio');
    
    // Check mobile layout elements are visible
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('[data-testid="portfolio-overview"]').first()).toBeVisible();
    
    // Import some data to test mobile tables
    const csvContent = `symbol,amount,acquisition_date,acquisition_price
BTC,0.1,2024-01-15,45000`;
    
    await page.evaluate(async (content) => {
      const blob = new Blob([content], { type: 'text/csv' });
      const file = new File([blob], 'test.csv', { type: 'text/csv' });
      
      const input = document.querySelector('[data-testid="csv-file-input"]') as HTMLInputElement;
      if (input) {
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, csvContent);
    
    await expect(page.getByTestId('import-success-message')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('holding-mobile-btc')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have proper ARIA labels and roles', async ({ page }) => {
    await page.goto('/');
    
    // Check login form accessibility
    const emailInput = page.getByTestId('email-input');
    await expect(emailInput).toHaveAttribute('required');
    await expect(emailInput).toHaveAttribute('autoComplete', 'email');
    
    const submitButton = page.getByTestId('login-button');
    await expect(submitButton).toBeVisible();
    
    // Login to test dashboard accessibility
    await page.getByTestId('email-input').fill('test@example.com');
    await page.getByTestId('login-button').click();
    await expect(page.locator('h1')).toContainText('DeFi Portfolio');
    
    // Check for proper heading hierarchy
    await expect(page.locator('h1')).toHaveCount(1);
    const h2Count = await page.locator('h2').count();
    expect(h2Count).toBeGreaterThan(0);
    
    // Check table accessibility
    const tables = page.locator('table');
    if (await tables.count() > 0) {
      const thCount = await tables.first().locator('thead th').count();
      expect(thCount).toBeGreaterThan(0);
    }
  });

  test('should be navigable with keyboard', async ({ page }) => {
    await page.goto('/');
    
    // Tab through login form
    await page.keyboard.press('Tab');
    await expect(page.getByTestId('email-input')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByTestId('login-button')).toBeFocused();
    
    // Fill and submit with keyboard
    await page.keyboard.press('Shift+Tab'); // Back to email input
    await page.keyboard.type('test@example.com');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Should login successfully
    await expect(page.locator('h1')).toContainText('DeFi Portfolio');
  });
});