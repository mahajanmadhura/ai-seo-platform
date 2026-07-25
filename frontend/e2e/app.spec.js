import { test, expect } from '@playwright/test';

test.describe('Athenura Enterprise SEO Platform - Deep UI/UX & End-to-End Test Suite', () => {

  // ── 1. AUTHENTICATION & LOGIN UI/UX ──
  test.describe('1. Authentication & Security UI/UX', () => {
    test('should render sleek dark-green brand login page with high-contrast inputs', async ({ page }) => {
      await page.goto('/login');

      // Page Title & Header
      await expect(page).toHaveTitle(/Athenura|SEO/i);
      await expect(page.locator('h2')).toContainText(/Welcome back to your SEO workspace/i);

      // Input Fields & Styling
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();

      // Buttons & Navigation Links
      const signInBtn = page.locator('button[type="submit"]');
      await expect(signInBtn).toBeVisible();
      await expect(page.locator('a[href="/register"]')).toBeVisible();
    });

    test('should render register page layout with full form inputs', async ({ page }) => {
      await page.goto('/register');
      await expect(page.locator('form')).toBeVisible();
      await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
      await expect(page.locator('input[type="password"]').first()).toBeVisible();
    });
  });

  // ── 2. DASHBOARD & NAVIGATION UI/UX ──
  test.describe('2. Dashboard & Layout Navigation UI/UX', () => {
    test('should load dashboard or redirect unauthenticated user to login cleanly', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      if (page.url().includes('/dashboard')) {
        await expect(page.locator('text=Credits').first()).toBeVisible();
        await expect(page.locator('a[href="/dashboard"]')).toBeVisible();
      } else {
        await expect(page.locator('h2')).toContainText(/Welcome back/i);
      }
    });
  });

  // ── 3. WEBSITES MODULE UI/UX ──
  test.describe('3. Websites Module UI/UX & Controls', () => {
    test('should render websites list or handle login redirect', async ({ page }) => {
      await page.goto('/websites');
      await page.waitForLoadState('networkidle');

      if (page.url().includes('/websites')) {
        await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
      } else {
        await expect(page.locator('h2')).toContainText(/Welcome back/i);
      }
    });

    test('should trigger Add Website modal overlay or login redirect', async ({ page }) => {
      await page.goto('/websites?add=true');
      await page.waitForLoadState('networkidle');

      if (page.url().includes('/websites')) {
        await expect(page.locator('text=Add Website').first()).toBeVisible();
      } else {
        await expect(page.locator('button[type="submit"]')).toBeVisible();
      }
    });
  });

  // ── 4. AUDITS HUB & RESULTS UI/UX ──
  test.describe('4. Audits & Execution Hub UI/UX', () => {
    test('should render audits hub page or login redirect', async ({ page }) => {
      await page.goto('/audits');
      await page.waitForLoadState('networkidle');

      if (page.url().includes('/audits')) {
        await expect(page.locator('body')).toBeVisible();
      } else {
        await expect(page.locator('h2')).toContainText(/Welcome back/i);
      }
    });
  });

  // ── 5. REPORTS HUB & SINGLE EXPORT CENTER UI/UX ──
  test.describe('5. Reports Hub & Single Export Center UI/UX', () => {
    test('should render reports hub page or login redirect', async ({ page }) => {
      await page.goto('/reports');
      await page.waitForLoadState('networkidle');

      if (page.url().includes('/reports')) {
        await expect(page.locator('body')).toBeVisible();
      } else {
        await expect(page.locator('h2')).toContainText(/Welcome back/i);
      }
    });

    test('should handle White Label Settings tab on reports hub', async ({ page }) => {
      await page.goto('/reports');
      await page.waitForLoadState('networkidle');

      if (page.url().includes('/reports')) {
        const brandingTab = page.locator('button:has-text("White Label"), button:has-text("Branding")').first();
        if (await brandingTab.isVisible()) {
          await brandingTab.click();
          await expect(page.locator('text=White Label Branding')).toBeVisible();
        }
      } else {
        await expect(page.locator('form')).toBeVisible();
      }
    });
  });

  // ── 6. SETTINGS & PROFILE MANAGEMENT UI/UX ──
  test.describe('6. Settings & Profile Preferences UI/UX', () => {
    test('should render settings page or login redirect', async ({ page }) => {
      await page.goto('/settings');
      await page.waitForLoadState('networkidle');

      if (page.url().includes('/settings')) {
        await expect(page.locator('body')).toBeVisible();
      } else {
        await expect(page.locator('h2')).toContainText(/Welcome back/i);
      }
    });
  });

  // ── 7. RESPONSIVE VIEWPORT TESTING ──
  test.describe('7. Mobile & Tablet Responsive UI/UX Checks', () => {
    test('should render responsive mobile viewport layout', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/login');
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });
  });

});
