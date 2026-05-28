import { test, expect } from '@playwright/test';

test('Verify Submitted Application State and Read-Only Mode', async ({ page }) => {
  await page.goto('/');

  // 1. Fetch Captcha
  const captchaId = await page.evaluate(async () => {
    const res = await fetch('http://localhost:5002/api/auth/captcha');
    const data = await res.json();
    return data.captchaId;
  });

  // 2. Fetch answer from Redis
  const captchaAnswer = await page.evaluate(async (id) => {
    const res = await fetch(`http://localhost:5002/debug/redis/captcha:${id}`);
    const data = await res.json();
    return data.value;
  }, captchaId);

  // 3. Fill Login Form
  await page.fill('input[placeholder="Enter 10-digit mobile number"]', '7777979435');
  await page.fill('input[placeholder="Enter Captcha"]', captchaAnswer);
  await page.click('button:has-text("Send OTP")');

  // 4. Get OTP from Redis
  await page.waitForTimeout(1000);
  const otp = await page.evaluate(async () => {
    const res = await fetch(`http://localhost:5002/debug/redis/otp:7777979435`);
    const data = await res.json();
    return data.value;
  });

  // 5. Submit OTP
  await page.fill('input[placeholder="Enter 6-digit OTP"]', otp);
  await page.click('button:has-text("Verify & Login")');
  await page.waitForURL('**/form');

  // 6. Assert Success Screen
  await expect(page.locator('text="Application Submitted"')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('text="Temporary ID:"')).toBeVisible();
  await page.screenshot({ path: 'debug_success_screen.png' });

  // 7. Click View Submitted Form
  await page.click('button:has-text("View Submitted Form")');

  // 8. Assert Read-Only Mode
  await expect(page.locator('text="Read-Only Mode"')).toBeVisible();
  await expect(page.locator('text="Back to Status"')).toBeVisible();
  
  // The form should have pointer-events-none applied to the main wrapper
  const formWrapper = page.locator('.pointer-events-none');
  await expect(formWrapper).toBeVisible();

  await page.screenshot({ path: 'debug_readonly_mode.png' });
});
