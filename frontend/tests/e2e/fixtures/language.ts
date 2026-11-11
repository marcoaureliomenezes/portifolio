import { readFileSync } from 'node:fs';
import { expect, type Page } from '@playwright/test';

const LANG_BY_OPTION: Record<string, string> = { Português: 'pt', English: 'en', Deutsch: 'de' };

/** Switches the UI language and returns once the chosen locale's header nav label shows. */
export async function switchLanguage(page: Page, option: string): Promise<void> {
  const lang = LANG_BY_OPTION[option];
  const { siteChrome } = JSON.parse(readFileSync(`public/content/${lang}.json`, 'utf-8'));
  await page.locator('[role="combobox"]').first().click();
  await page.getByRole('option', { name: option }).click();
  await expect(page.locator('header nav a').first()).toHaveText(siteChrome.nav.resume);
}
