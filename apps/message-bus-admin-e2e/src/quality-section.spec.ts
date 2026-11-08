import { APIRequestContext, APIResponse, expect, Locator, Page, Route, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

import { API_ORIGIN, STAND_TREE_TOKEN_FILE, TREES } from '../stand/stand.mjs';
import { columnTexts, openSection, pageQa, pickTree, qa, rowsOf, SECTION, signIn } from './support/admin';
import { expectScreen } from './support/shot';

/**
 * Раздел «Качество» на строках дня стенда.
 *
 * Раздел открывается с явным периодом: строки стенда лежат в прошлом. Пустота и отказ на засеянном стенде
 * не бывают, поэтому показаны подменой ответа приёмника, как в спеке состояний списка.
 */

/** Период, в который попадают все строки дня стенда. */
const PERIOD_QUERY: string = '?from=2026-08-01&to=2026-08-31';

/** Один день: задач в нём меньше порога доли. */
const ONE_DAY_QUERY: string = '?from=2026-08-13&to=2026-08-13';

const QUALITY_API: string = '**/api/usage/quality?*';

/** Период, в котором строк дня нет, хотя в другие дни они были. */
const EMPTY_PERIOD_QUERY: string = '?from=2020-01-01&to=2020-01-02';

/** День со строкой, но без единой задачи. */
const NO_TASKS_QUERY: string = '?from=2026-08-01&to=2026-08-01';

/** Самое длинное имя, какое принимает приём: строка сбоя мерится на нём, а не на образце. */
const LONGEST_TREE_NAME: string = 'Очень длинное название проекта на шестьдесят четыре знака без сокр';

/** Ширины из договорённости: широкий экран, планшет и телефон. */
const WIDTHS: readonly number[] = [1440, 768, 375];

function sendFaultLine(request: APIRequestContext, origin: string): Promise<APIResponse> {
    return request.post(`${API_ORIGIN}/api/intake/metrics`, {
        headers: { 'x-tree-token': readFileSync(STAND_TREE_TOKEN_FILE, 'utf8').trim() },
        data: {
            schema: '2',
            tree: TREES[0].slug,
            origin,
            day: new Date().toISOString().slice(0, 10),
            version: '0.35.0',
            stamp: 500,
            metrics: { sessions: 1, sendFault: 2 },
        },
    });
}

/** Узел, который виден: таблица держит пустоту и в строке, и в карточках, а показывает одну. */
function shownQa(page: Page, id: string): Locator {
    return qa(page, id).locator('visible=true');
}

/** Ни страница, ни её прокручиваемая зона не шире экрана: зона прячет переполнение от самой страницы. */
async function expectFits(page: Page, width: number): Promise<void> {
    const widest: number = await page.locator('html').evaluate((root: Element): number => {
        const zone: Element | null = root.querySelector('.admin-page__scroll');

        return Math.max(root.scrollWidth, zone ? zone.scrollWidth + zone.getBoundingClientRect().left : 0);
    });

    expect(widest).toBeLessThanOrEqual(width);
}

/** Настоящий ответ приёмника с заменой полей: так показывается то, чего нет в данных стенда. */
async function changeAnswer(page: Page, change: Readonly<Record<string, unknown>>): Promise<void> {
    await page.route(QUALITY_API, async (route: Route): Promise<void> => {
        const answer: APIResponse = await route.fetch();

        await route.fulfill({ json: { ...(await answer.json()), ...change } });
    });
}

/** Выбрать версию в отборе таблицы. */
async function pickVersion(page: Page, version: string): Promise<void> {
    await qa(page, 'list-version-filter').click();
    await page.getByRole('option', { name: version, exact: true }).click();
}

test.describe('раздел «Качество»', () => {
    test('SC-AK-1325, SC-AK-1327 — числа итога и таблица причин по потерям, отбор сужает и то и другое', async ({
        page,
    }: {
        page: Page;
    }) => {
        await openSection(page, 'quality', PERIOD_QUERY);

        await expect(page.getByRole('heading', { name: SECTION.quality.title })).toBeVisible();
        await expect(qa(page, 'quality-tile-first-pass')).toContainText('64 %');
        await expect(qa(page, 'quality-tile-first-pass')).toContainText('PR без подписи передачи: 1');
        await expect(qa(page, 'quality-tile-corrections')).toContainText('0.40 на задачу');
        await expect(qa(page, 'quality-tile-repeats')).toContainText('1 из 1');

        await expect(rowsOf(page, 'quality')).toHaveCount(3);
        expect(await columnTexts(page, 'quality-cell-resource')).toEqual(['git-guard-push', 'testing', 'e2e']);
        expect(await columnTexts(page, 'quality-cell-loss')).toEqual(['5', '3', '2']);
        expect(await columnTexts(page, 'quality-cell-wasted-minutes')).toEqual(['0', '0', '5']);

        // строка полноты считает свежие дни, и её число зависит от дня прогона
        await expectScreen(page, 'list-quality', { mask: [qa(page, 'quality-completeness')] });

        await pickTree(page, TREES[0].name);
        await expect(rowsOf(page, 'quality')).toHaveCount(2);
        expect(await columnTexts(page, 'quality-cell-resource')).toEqual(['git-guard-push', 'e2e']);
        await expect(qa(page, 'quality-tile-first-pass')).toContainText('6 из 7');
        await expect(qa(page, 'quality-tile-repeats')).toContainText('1 из 1');

        await pickTree(page, TREES[1].name);
        await expect(qa(page, 'quality-tile-first-pass')).toContainText('1 из 4');
        await expect(qa(page, 'quality-tile-repeats')).toContainText('0 из 1');

        await pickTree(page, 'Все проекты');
        await expect(rowsOf(page, 'quality')).toHaveCount(3);
        await pickVersion(page, '0.35.0');
        await expect(rowsOf(page, 'quality')).toHaveCount(2);
        expect(await columnTexts(page, 'quality-cell-resource')).toEqual(['testing', 'git-guard-push']);
        await expect(qa(page, 'quality-tile-first-pass')).toContainText('1 из 4');
        await expect(qa(page, 'quality-tile-repeats')).toContainText('1 из 1');
    });

    test('SC-AK-1325 — меньше десяти задач дают счёт вместо доли', async ({ page }: { page: Page }) => {
        await openSection(page, 'quality', ONE_DAY_QUERY);

        await expect(qa(page, 'quality-tile-first-pass')).toContainText('1 из 4');
        await expect(qa(page, 'quality-tile-corrections')).toContainText('Правок: 1, задач: 3');
    });

    test('SC-AK-1325 — день со строкой, но без задач, говорит «нет данных»', async ({ page }: { page: Page }) => {
        await openSection(page, 'quality', NO_TASKS_QUERY);

        await expect(qa(page, 'quality-tile-first-pass')).toContainText('Нет данных');
        await expect(qa(page, 'quality-tile-corrections')).toContainText('Нет данных');
        await expect(qa(page, 'quality-tile-first-pass')).not.toContainText('0 из 0');
    });

    test('SC-AK-1328 — без фиксов старше месяца плитка повторов говорит «нет данных»', async ({ page }: { page: Page }) => {
        await changeAnswer(page, { repeats: { repeats: 0, fixes: 0, share: null, unnamed: 3 } });
        await openSection(page, 'quality', PERIOD_QUERY);

        await expect(qa(page, 'quality-tile-repeats')).toContainText('Нет данных');
        await expect(qa(page, 'quality-tile-repeats')).toContainText('Фиксов старше месяца пока нет');
        await expect(qa(page, 'quality-tile-first-pass')).toContainText('64 %');
    });

    test('SC-AK-1326 — строка полноты называет дерево с неудавшейся отправкой и причину', async ({
        page,
        request,
    }: {
        page: Page;
        request: APIRequestContext;
    }) => {
        expect((await sendFaultLine(request, `fault-${test.info().project.name}`)).status()).toBe(200);

        await openSection(page, 'quality', PERIOD_QUERY);

        await expect(qa(page, 'quality-completeness')).toContainText(/Прислали числа за 7 дней: \d+ из \d+ проектов/);
        await expect(qa(page, 'quality-send-fault')).toHaveText(`${TREES[0].name}: приём отказал токену проекта`);
    });

    test('SC-AK-1325 — пока раздел читается, вместо чисел стоит скелет', async ({ page }: { page: Page }) => {
        await page.route(QUALITY_API, async (route: Route): Promise<void> => {
            await new Promise((resolve: (value: unknown) => void): void => {
                setTimeout(resolve, 3_000);
            });
            await route.continue();
        });

        await page.goto(`${SECTION.quality.path}${PERIOD_QUERY}`);
        await signIn(page);

        await expect(qa(page, 'quality-reading')).toBeVisible();
        await expect(qa(page, 'table-skeleton-row').first()).toBeVisible();
        await expect(qa(page, 'quality-tiles')).toBeVisible({ timeout: 15_000 });
        await expect(qa(page, 'quality-reading')).toHaveCount(0);
    });

    test('SC-AK-1329 — ни одной строки дня: чисел нет, а пустая таблица называет команду', async ({ page }: { page: Page }) => {
        await changeAnswer(page, { rows: [], total: 0, anyLine: false });
        await openSection(page, 'quality');

        await expect(qa(page, 'empty-state-title')).toHaveText('Ни один проект ещё не прислал числа');
        await expect(qa(page, 'empty-state-description')).toContainText('npx agent-kit enroll --code');
        await expect(qa(page, 'quality-tiles')).toHaveCount(0);
    });

    test('SC-AK-1330 — отказ чтения снимает числа, а повтор возвращает их одним действием', async ({ page }: { page: Page }) => {
        let refused: boolean = true;

        await page.route(QUALITY_API, async (route: Route): Promise<void> => {
            await (refused ? route.fulfill({ status: 500, json: { message: 'сбой' } }) : route.continue());
        });

        await page.goto(`${SECTION.quality.path}${PERIOD_QUERY}`);
        await signIn(page);

        await expect(pageQa(page, 'quality', 'fault')).toBeVisible();
        await expect(qa(page, 'quality-tiles')).toHaveCount(0);

        const retry: Locator = pageQa(page, 'quality', 'retry');

        refused = false;
        await retry.click();

        await expect(qa(page, 'quality-tiles')).toBeVisible();
        await expect(pageQa(page, 'quality', 'fault')).toHaveCount(0);
    });

    test('SC-AK-1331 — период без строк не показывает нули, а просит другой период', async ({ page }: { page: Page }) => {
        await openSection(page, 'quality', EMPTY_PERIOD_QUERY);

        await expect(qa(page, 'empty-state-title')).toHaveText('За этот период чисел нет');
        await expect(qa(page, 'quality-tiles')).toHaveCount(0);
        await expect(qa(page, 'quality-completeness')).toBeVisible();
    });

    for (const width of WIDTHS) {
        test(`SC-AK-1327 — на ширине ${width} ни одно состояние раздела не выходит за край экрана`, async ({ page }: { page: Page }) => {
            await page.setViewportSize({ width, height: 900 });

            await openSection(page, 'quality', PERIOD_QUERY);
            await expect(qa(page, 'quality-tiles')).toBeVisible();
            await expectFits(page, width);

            await page.goto(`${SECTION.quality.path}${ONE_DAY_QUERY}`);
            await expect(qa(page, 'quality-tile-first-pass')).toContainText('1 из 4');
            await expectFits(page, width);

            await page.goto(`${SECTION.quality.path}${NO_TASKS_QUERY}`);
            await expect(qa(page, 'quality-tile-first-pass')).toContainText('Нет данных');
            await expectFits(page, width);

            await page.goto(`${SECTION.quality.path}${EMPTY_PERIOD_QUERY}`);
            await expect(shownQa(page, 'empty-state-title')).toHaveText('За этот период чисел нет');
            await expectFits(page, width);

            await changeAnswer(page, {
                repeats: { repeats: 0, fixes: 0, share: null, unnamed: 27 },
                completeness: {
                    enrolled: 4,
                    sent: 1,
                    withOutcomes: 0,
                    faults: [{ tree: { slug: 'long', name: LONGEST_TREE_NAME }, fault: 2 }],
                },
            });
            await page.goto(`${SECTION.quality.path}${PERIOD_QUERY}`);
            await expect(qa(page, 'quality-send-fault')).toContainText(LONGEST_TREE_NAME);
            await expect(qa(page, 'quality-tile-repeats')).toContainText('Нет данных');
            await expectFits(page, width);
            await page.unroute(QUALITY_API);

            await page.route(QUALITY_API, async (route: Route): Promise<void> => {
                await route.fulfill({ status: 500, json: { message: 'сбой' } });
            });
            await page.goto(`${SECTION.quality.path}${PERIOD_QUERY}`);
            await expect(pageQa(page, 'quality', 'fault')).toBeVisible();
            await expectFits(page, width);
            await page.unroute(QUALITY_API);

            await changeAnswer(page, { rows: [], total: 0, anyLine: false });
            await page.goto(`${SECTION.quality.path}${PERIOD_QUERY}`);
            await expect(shownQa(page, 'empty-state-description')).toContainText('npx agent-kit enroll');
            await expectFits(page, width);
            await page.unroute(QUALITY_API);

            await page.route(QUALITY_API, async (route: Route): Promise<void> => {
                await new Promise((resolve: (value: unknown) => void): void => {
                    setTimeout(resolve, 2_000);
                });
                await route.continue();
            });
            await page.goto(`${SECTION.quality.path}${PERIOD_QUERY}`);
            await expect(qa(page, 'quality-reading')).toBeVisible();
            await expectFits(page, width);
            await expect(qa(page, 'quality-tiles')).toBeVisible({ timeout: 15_000 });
        });
    }
});
