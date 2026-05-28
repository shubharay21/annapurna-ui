import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

test('Comprehensive E2E Test: Login, Validation Failure, and Successful Submission', async ({ page }) => {
  test.setTimeout(180000); // 3 minutes

  // ─── STEP 1: LOGIN ─────────────────────────────────────────────────────────
  console.log('--- STEP 1: UI LOGIN ---');
  let captchaId = '';

  page.on('response', async response => {
    if (response.url().includes('/auth/captcha') && response.status() === 200) {
      try {
        const data = await response.json();
        captchaId = data.captchaId;
      } catch (e) {}
    }
  });

  await page.goto('http://localhost:3000/');

  // Select District
  await page.click('#district-search');
  await page.fill('#district-search', 'KMC');
  await page.click('button:has-text("KMC")');

  // Fill Mobile
  const mobile = '7777' + Math.floor(100000 + Math.random() * 900000).toString();
  await page.fill('input[placeholder="Enter 10-digit number"]', mobile);

  // Wait for Captcha
  await page.waitForTimeout(2000);
  expect(captchaId).not.toBe('');

  const captchaAnswer = execSync(`docker exec annapurna-redis redis-cli GET "captcha:${captchaId}"`).toString().trim();
  console.log(`Fetched Captcha from Redis: ${captchaAnswer}`);

  await page.fill('input[placeholder="Enter characters exactly as shown"]', captchaAnswer);
  await page.click('button:has-text("Request OTP")');

  await page.waitForTimeout(3000);

  const otp = execSync(`docker exec annapurna-redis redis-cli GET "otp:${mobile}"`).toString().trim();
  console.log(`Fetched OTP from Redis: ${otp}`);

  await page.fill('input[placeholder="------"]', otp);
  await page.click('button:has-text("Verify & Continue")');

  await page.waitForURL('http://localhost:3000/form');
  await expect(page.locator('h1')).toContainText('Family Data Collection');
  console.log('Login successful! Form loaded.');

  // ─── STEP 2: TRIGGER VALIDATION ERRORS ─────────────────────────────────────
  console.log('--- STEP 2: TRIGGER VALIDATION ERRORS ---');

  // Navigate to Declaration & Consent (Common tab) without filling anything
  await page.click('button:has-text("Declaration & Consent")');
  await page.waitForTimeout(500);

  // Click Submit Application (no data filled)
  await page.click('button:has-text("Submit Application")');
  await page.waitForTimeout(1000);

  const errorContainer = page.locator('.bg-error-container');
  await expect(errorContainer).toBeVisible();
  const errorText = await errorContainer.innerText();
  console.log('Validation Errors Triggered Successfully:\n' + errorText);
  expect(errorText).toContain('Permanent Address is required');
  expect(errorText).toContain('Name is required');

  // ─── STEP 3: FILL FORM CORRECTLY ──────────────────────────────────────────
  console.log('--- STEP 3: FILL FORM CORRECTLY ---');

  // ── 3a. Go to Head of Family tab → Basic Info ──
  console.log('Navigating to Head of Family → Basic Info...');
  await page.click('button:has-text("Head of Family")');
  await page.waitForTimeout(300);

  // Click Basic Info section in sidebar
  await page.click('button:has-text("Basic Info")');
  await page.waitForTimeout(500);

  // Fill member details using data-testid selectors
  await page.locator('[data-testid="member-name"]').fill('Playwright UI Tester');
  await page.locator('[data-testid="member-gender"]').selectOption('Female');

  // Wait for Annapurna Yojana dropdown to appear (visible for adult females)
  await page.waitForSelector('[data-testid="member-annapurna"]', { timeout: 5000 });
  await page.locator('[data-testid="member-annapurna"]').selectOption('Yes');

  await page.locator('[data-testid="member-aadhaar"]').fill('234567890124');
  await page.locator('[data-testid="member-mobile"]').fill('9876543210');
  console.log('Basic Info filled.');

  // ── 3b. Income section → set Literacy Status ──
  console.log('Navigating to Income / Profession section...');
  await page.click('button:has-text("Income / Profession")');
  await page.waitForTimeout(500);

  // Click "Literate" radio button
  await page.locator('[data-testid="member-literate"]').check({ force: true });
  console.log('Literacy status set to Literate.');

  // ── 3c. Family Identity → Permanent Address ──
  console.log('Navigating to Family Identity section...');
  await page.click('button:has-text("Family Identity")');
  await page.waitForTimeout(500);

  await page.locator('[data-testid="permanent-address"]').fill('100 Automation Street, Test City');
  console.log('Permanent Address filled.');

  // ── 3d. Declaration & Consent (Common tab) ──
  console.log('Navigating to Declaration & Consent...');
  await page.click('button:has-text("Declaration & Consent")');
  await page.waitForTimeout(500);

  const declarationCheckbox = page.locator('[data-testid="declaration-checkbox"]');
  if (!(await declarationCheckbox.isChecked())) {
    await declarationCheckbox.check({ force: true });
  }
  console.log('Declaration checked.');

  // ─── STEP 4: FINAL SUBMISSION ──────────────────────────────────────────────
  console.log('--- STEP 4: FINAL SUBMISSION ---');

  // Set up dialog handler BEFORE clicking submit
  let successDialogShown = false;
  page.on('dialog', async dialog => {
    console.log(`Dialog message received: ${dialog.message()}`);
    if (dialog.message().toLowerCase().includes('success')) {
      successDialogShown = true;
      await dialog.accept();
    } else {
      await dialog.dismiss();
    }
  });

  await page.screenshot({ path: 'debug_submit.png' });
  console.log('Screenshot taken at debug_submit.png');

  await page.click('button:has-text("Submit Application")');

  // Wait for API call to complete
  await page.waitForTimeout(6000);

  // Log any validation errors shown on screen
  const errors = await page.locator('.bg-error-container').allTextContents();
  if (errors.length > 0) {
    console.log('Validation Errors on Submit:', errors);
  }

  expect(successDialogShown).toBeTruthy();
  console.log('Form submitted successfully!');
});
