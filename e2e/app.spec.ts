import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  page.on('pageerror', (e) => {
    throw e;
  });
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('landing opens with the three-part statement, then the product @mobile', async ({ page }) => {
  await page.goto('/#/');
  const statement = page.locator('.statement');
  await expect(statement).toContainText('I read the AI Transformation Owner job description.');
  await expect(statement).toContainText("I've solved this before: at Corgi I ran product ops");
  await expect(statement).toContainText('This is what I built for you');
  await expect(page.getByAltText('GitLab').first()).toBeVisible();
  await expect(page.getByText('Where every request is')).toBeVisible();
  await expect(page.locator('.sample-line')).toHaveCount(1);
});

test('the tanuki sits top-left', async ({ page }) => {
  await page.goto('/#/');
  const box = await page.locator('.tanuki-link img').boundingBox();
  expect(box!.x).toBeLessThan(80);
  expect(box!.y).toBeLessThan(20);
});

test('intake: a plain-language request is triaged live and lands on the backlog', async ({ page }) => {
  await page.goto('/#/intake');
  await page.fill('#name', 'Sam Rivera');
  await page.selectOption('#team', 'pm-dev');
  await page.fill('#desc', 'Every release I spend about 3 hours copying issue descriptions into release notes. Every PM in Dev does the same and it is tedious.');
  await page.getByRole('button', { name: 'Submit for triage' }).click();
  const analysis = page.getByLabel('Triage analysis');
  await expect(analysis).toContainText('Extract the workflow it touches');
  await expect(analysis.locator('[data-step="rationale"] .rationale-box')).toBeVisible({ timeout: 10_000 });
  await expect(analysis).toContainText('Release post and release notes');
  await expect(analysis).toContainText('volume 3 × frequency 3');
  await page.getByRole('button', { name: /on the backlog/ }).click();
  await expect(page).toHaveURL(/backlog\?focus=AI-129/);
  await expect(page.locator('#row-AI-129')).toBeVisible();
});

test('intake: platform problems are routed to the Hub', async ({ page }) => {
  await page.goto('/#/intake');
  await page.getByRole('button', { name: 'Broken tool' }).click();
  await page.getByRole('button', { name: 'Submit for triage' }).click();
  await expect(page.getByText('Routed to the Enterprise AI Hub')).toBeVisible();
});

test('submissions persist across reloads', async ({ page }) => {
  await page.goto('/#/intake');
  await page.getByRole('button', { name: 'Vague idea' }).click();
  await page.getByRole('button', { name: 'Submit for triage' }).click();
  await page.reload();
  await page.goto('/#/backlog/AI-129');
  await expect(page.getByRole('dialog')).toContainText('Could AI help with planning our team offsite?');
});

test('backlog: every row has a rank, labels and a two-sentence rationale; drawer shows reasoning', async ({ page }) => {
  await page.goto('/#/backlog');
  const rows = page.locator('.list-row');
  expect(await rows.count()).toBeGreaterThanOrEqual(25);
  await expect(rows.first().locator('.rank')).toHaveText('#1');
  await expect(rows.first().locator('.gl-label').first()).toContainText('tier');
  await rows.first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Executive rationale');
  await expect(dialog.locator('.trace-step')).toHaveCount(7);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});

test('backlog: board and theme views', async ({ page }) => {
  await page.goto('/#/backlog?tab=board');
  await expect(page.locator('.board-col')).toHaveCount(4);
  await page.getByRole('tab', { name: /Themes/ }).click();
  await expect(page.getByText('Research ops').first()).toBeVisible();
});

test('backlog: filters narrow the list', async ({ page }) => {
  await page.goto('/#/backlog');
  const before = await page.locator('.list-row').count();
  await page.getByLabel('Theme').selectOption('research-ops');
  const after = await page.locator('.list-row').count();
  expect(after).toBeGreaterThan(0);
  expect(after).toBeLessThan(before);
});

test('fleet: unowned agents are flagged and can be assigned', async ({ page }) => {
  await page.goto('/#/fleet');
  await expect(page.getByText('3 agents have no owner')).toBeVisible();
  expect(await page.locator('tr').count()).toBeGreaterThanOrEqual(13);
  await page.locator('tr.flagged').first().getByRole('button', { name: 'Assign owner' }).click();
  await page.getByRole('menuitem').first().click();
  await expect(page.getByText('2 agents have no owner')).toBeVisible();
});

test('champions: roster, cadence and demo wall', async ({ page }) => {
  await page.goto('/#/champions');
  expect(await page.locator('.champ').count()).toBe(12);
  await expect(page.locator('.champ.vacant')).toHaveCount(2);
  await expect(page.locator('.ritual')).toHaveCount(5);
  expect(await page.locator('.demo').count()).toBeGreaterThanOrEqual(8);
  const react = page.locator('.react').first();
  const n = parseInt((await react.innerText()).trim(), 10);
  await react.click();
  await expect(react).toHaveText(String(n + 1));
});

test('skills: versioned file, usage notes, history and checklist', async ({ page }) => {
  await page.goto('/#/skills/release-note-drafter');
  await expect(page.locator('.blob-head')).toContainText('skills/release-note-drafter/SKILL.md');
  await expect(page.locator('.blob-code')).toContainText('name: release-note-drafter');
  await page.getByRole('tab', { name: /Versions/ }).click();
  await expect(page.locator('.changelog li').first()).toContainText('v1.4.0');
  await page.getByRole('tab', { name: /Promotion/ }).click();
  await expect(page.locator('.checklist li')).toHaveCount(5);
  expect(await page.locator('.skill-item').count()).toBeGreaterThanOrEqual(8);
});

test('search jumps to an agent', async ({ page }) => {
  await page.goto('/#/');
  await page.keyboard.press('/');
  await page.keyboard.type('stale ux');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/fleet\/stale-issue-closer/);
});

test('no horizontal scroll at phone width @mobile', async ({ page }) => {
  for (const r of ['/#/', '/#/backlog', '/#/fleet', '/#/champions', '/#/skills', '/#/intake']) {
    await page.goto(r);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, r).toBeLessThanOrEqual(1);
  }
});

test('no demo banners or placeholder copy in the UI', async ({ page }) => {
  for (const r of ['/#/', '/#/backlog', '/#/fleet', '/#/champions', '/#/skills', '/#/intake']) {
    await page.goto(r);
    const text = (await page.locator('body').innerText()).toLowerCase();
    for (const banned of ['demo data', 'mock data', 'dummy', 'lorem', 'placeholder', 'sample only']) expect(text, `${r} contains ${banned}`).not.toContain(banned);
  }
});
