/**
 * E2E — the scenes of the two library pages (hero media plus every section
 * that carries media), at 1440x900 and 360x800, with motion and with
 * reducedMotion: 'reduce'. The scene list is read from the en content.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test, expect, type Locator, type Page } from '@playwright/test';
import { ROUTES } from '../fixtures/routes';

type Scene = { type: 'video' | 'svg'; alt: string; light?: string; dark?: string };

const en = JSON.parse(
  readFileSync(fileURLToPath(new URL('../../../public/content/en.json', import.meta.url)), 'utf8'),
);
const howTitle: string = en.libraryPage.howTitle;

const pages = [
  { slug: 'rand-engine', route: ROUTES.randEngine },
  { slug: 'dadaia-workspace', route: ROUTES.dadaiaWorkspace },
].map((p) => {
  const item = en.projectsV2.list.find((i: { slug: string }) => i.slug === p.slug);
  const sectionScenes = (item.sections as { media?: Scene }[]).flatMap((s) => (s.media ? [s.media] : []));
  return { ...p, hero: item.hero.media as Scene | undefined, sectionScenes };
});

const viewports = [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '360x800', width: 360, height: 800 },
];

const figureOf = (page: Page, scene: Scene): Locator => {
  const figures = page.locator('figure');
  return figures
    .filter({ has: page.getByAltText(scene.alt, { exact: true }) })
    .or(figures.filter({ has: page.getByLabel(scene.alt, { exact: true }) }))
    .first();
};

async function open(page: Page, route: string, reduced: boolean) {
  await page.emulateMedia({ reducedMotion: reduced ? 'reduce' : 'no-preference' });
  await page.addInitScript(() => localStorage.setItem('lang', 'en'));
  await page.goto(route);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('h1').first()).toBeVisible();
}

for (const { slug, route, hero, sectionScenes } of pages) {
  const scenes = [...(hero ? [hero] : []), ...sectionScenes];

  for (const vp of viewports) {
    for (const reduced of [false, true]) {
      test.describe(`${slug} scenes @ ${vp.name}, ${reduced ? 'reduced motion' : 'motion'}`, () => {
        test.use({ viewport: { width: vp.width, height: vp.height } });

        test('the content declares 4 scenes', () => {
          expect(scenes).toHaveLength(4);
        });

        test('every scene renders as its content says', async ({ page }) => {
          await open(page, route, reduced);

          for (const scene of scenes) {
            const fig = figureOf(page, scene);
            await expect(fig).toHaveCount(1);

            if (!reduced && scene.type === 'video') {
              const below = await fig.evaluate((el) => el.getBoundingClientRect().top > window.innerHeight);
              if (below) await expect(fig.locator('video')).toHaveCount(0);
            }

            await fig.scrollIntoViewIfNeeded();

            if (reduced) {
              await expect(page.locator('video')).toHaveCount(0);
              const img = fig.getByAltText(scene.alt, { exact: true }).and(fig.locator('img:visible'));
              await expect(img).toHaveCount(1);
              await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.naturalWidth)).toBeGreaterThan(0);
            } else if (scene.type === 'video') {
              const video = fig.locator('video');
              await expect(video).toHaveCount(1);
              await expect(video).toHaveAccessibleName(scene.alt);
              const flags = await video.evaluate((v: HTMLVideoElement) => ({
                muted: v.muted,
                loop: v.loop,
                playsInline: v.playsInline,
                w: Number(v.getAttribute('width')),
                h: Number(v.getAttribute('height')),
                poster: v.getAttribute('poster'),
                sources: [...v.querySelectorAll('source')].map((s) => s.getAttribute('type')),
              }));
              expect(flags).toMatchObject({ muted: true, loop: true, playsInline: true });
              expect(flags.w).toBeGreaterThan(0);
              expect(flags.h).toBeGreaterThan(0);
              expect(flags.poster).toBeTruthy();
              expect(flags.sources).toEqual(['video/webm', 'video/mp4']);
            } else {
              const img = fig.locator('img:visible');
              await expect(img).toHaveCount(1);
              await expect(img).toHaveAccessibleName(scene.alt);
              await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.naturalWidth)).toBeGreaterThan(0);
            }
          }

          if (vp.width === 360) {
            const [scrollWidth, innerWidth] = await page.evaluate(() => [
              document.documentElement.scrollWidth,
              window.innerWidth,
            ]);
            expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
          }
        });

        if (!reduced) {
          test('each svg scene shows the variant of the theme, and swaps with the toggle', async ({ page }) => {
            await open(page, route, reduced);
            const themed = scenes.filter((s) => s.type === 'svg' && s.dark && s.dark !== s.light);
            expect(themed.length).toBeGreaterThan(0);

            for (const scene of themed) {
              const fig = figureOf(page, scene);
              await fig.scrollIntoViewIfNeeded();
              await expect(fig.getByTestId('diagram-dark')).toBeVisible();
              await expect(fig.getByTestId('diagram-light')).toBeHidden();
            }

            await page.getByRole('switch').click();

            for (const scene of themed) {
              const fig = figureOf(page, scene);
              await fig.scrollIntoViewIfNeeded();
              await expect(fig.getByTestId('diagram-light')).toBeVisible();
              await expect(fig.getByTestId('diagram-dark')).toBeHidden();
            }
          });
        }

        test('every section scene follows the "How it works" heading and its own h3', async ({ page }) => {
          await open(page, route, reduced);
          const how = page.getByRole('heading', { level: 2, name: howTitle, exact: true });
          await expect(how).toHaveCount(1);

          for (const scene of sectionScenes) {
            const fig = figureOf(page, scene);
            const section = page.locator('[data-testid="project-section"]').filter({ has: fig });
            const follows = (a: Locator, b: Locator) =>
              Promise.all([a.elementHandle(), b.elementHandle()]).then(([x, y]) =>
                x!.evaluate((el, other) => !!(el.compareDocumentPosition(other as Node) & Node.DOCUMENT_POSITION_FOLLOWING), y),
              );
            expect(await follows(how, fig)).toBe(true);
            expect(await follows(section.locator('h3'), fig)).toBe(true);
          }
        });
      });
    }
  }
}
