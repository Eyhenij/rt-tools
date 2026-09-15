import { expect, Locator, Page, test } from '@playwright/test';

import { TREES } from '../stand/stand.mjs';
import { columnTexts, openSection, pageQa, pickDay, qa, queryOf, rowsAfterChange, rowsOf, SECTION } from './support/admin';
import { expectScreen } from './support/shot';

/**
 * Раздел использования правил: строка на скил за период, отбор по дереву и периоду, панель
 * сессий по нажатию на строку.
 *
 * Раздел открывается с явным периодом: строки стенда лежат в прошлом, а период, которого адрес
 * не назвал, приёмник считает от своих часов — такая спека сошлась бы с кадром сегодня и
 * разошлась завтра.
 *
 * Быстрый период — единственное место, где день берётся от часов: и в спеке, и в приложении.
 * Оба конца считаются одинаково, и спека не устаревает.
 */

/** Период, в который попадают все строки стенда первого дерева. */
const PERIOD_QUERY: string = `?tree=${TREES[0].slug}&from=2026-08-01&to=2026-08-31`;

/** День, в котором у первого дерева две строки из восьми. */
const ONE_DAY: string = '2026-08-13';

/** Сутки в миллисекундах: ими считается быстрый период. */
const DAY_MS: number = 24 * 60 * 60 * 1000;

/** День вида `ГГГГ-ММ-ДД` по всемирному времени — так же его считает приложение. */
function dayOf(moment: Date): string {
    return moment.toISOString().slice(0, 10);
}

/** Строки одного списка сводки: название и число. */
async function barListTexts(page: Page, list: string, part: 'title' | 'value'): Promise<string[]> {
    return qa(page, list).locator(`[qa-dataid="bar-list-row-${part}"]`).allTextContents();
}

test.describe('раздел использования', () => {
    test('SC-MB-348 — таблица показывает строку на скил выбранного дерева за период: род словом, загрузки, сессии, отказы', async ({
        page,
    }: {
        page: Page;
    }) => {
        await openSection(page, 'usage', PERIOD_QUERY);

        await expect(page.getByRole('heading', { name: SECTION.usage.title })).toBeVisible();
        await expect(rowsOf(page, 'usage')).toHaveCount(5);
        await expect(qa(page, 'list-tree-filter')).toBeVisible();
        await expect(qa(page, 'list-period-from').locator('input')).toHaveValue('2026-08-01');
        await expect(qa(page, 'list-period-to').locator('input')).toHaveValue('2026-08-31');
        await expect(qa(page, 'pagination-range')).toContainText('из 5');
        await expect(pageQa(page, 'usage', 'columns')).toBeVisible();

        // самые загружаемые сверху, при равных — по имени; правило с одними отказами — последним
        expect(await columnTexts(page, 'usage-cell-skill')).toEqual([
            'testing',
            'cargo-triage',
            'git-workflow-commit',
            'rt-tools-storybook',
            'lists',
        ]);
        expect(await columnTexts(page, 'usage-cell-kind')).toEqual(['правило', 'скил пакета', 'паттерн', 'свой скил проекта', 'правило']);
        expect(await columnTexts(page, 'usage-cell-loads')).toEqual(['3', '1', '1', '1', '0']);
        expect(await columnTexts(page, 'usage-cell-sessions')).toEqual(['2', '1', '1', '1', '0']);
        expect(await columnTexts(page, 'usage-cell-denials')).toEqual(['1', '0', '0', '0', '1']);

        await expectScreen(page, 'list-usage');
    });

    test('SC-MB-349 — сужение периода до одного дня перечитывает таблицу, и период встаёт в адрес', async ({ page }: { page: Page }) => {
        await openSection(page, 'usage', PERIOD_QUERY);

        const before: string[] = await columnTexts(page, 'usage-cell-skill');

        await pickDay(page, 'from', ONE_DAY);
        await pickDay(page, 'to', ONE_DAY);

        const after: string[] = await rowsAfterChange(page, 'usage-cell-skill', before);

        expect(after).toEqual(['rt-tools-storybook', 'testing']);
        expect(await columnTexts(page, 'usage-cell-loads')).toEqual(['1', '1']);
        expect(queryOf(page).get('from')).toBe(ONE_DAY);
        expect(queryOf(page).get('to')).toBe(ONE_DAY);
        expect(queryOf(page).get('tree')).toBe(TREES[0].slug);
    });

    test('SC-MB-350 — нажатие на строку открывает панель сессий скила: день, признак сессии, сколько раз', async ({
        page,
    }: {
        page: Page;
    }) => {
        await openSection(page, 'usage', PERIOD_QUERY);

        await rowsOf(page, 'usage').first().click();

        await expect(qa(page, 'usage-sessions-panel')).toBeVisible();
        expect(page.url()).toContain('ro:usage/testing');
        await expect(qa(page, 'usage-session')).toHaveCount(2);
        // свежий день первым; сессия названа признаком как есть, а рядом — сколько раз
        expect(await columnTexts(page, 'usage-session-sid')).toEqual(['s2', 's1']);
        expect(await columnTexts(page, 'usage-session-count')).toEqual(['Раз: 1', 'Раз: 2']);
        await expect(qa(page, 'usage-session').locator('[qa-dataid="detail-row-label"]')).toHaveText(['2026-08-13', '2026-08-12']);

        await expectScreen(page, 'usage-sessions-panel');

        await qa(page, SECTION.usage.details).click();

        await expect(qa(page, 'usage-session')).toHaveCount(0);
        expect(queryOf(page).get('from')).toBe('2026-08-01');
        expect(queryOf(page).get('tree')).toBe(TREES[0].slug);
    });

    test('SC-MB-352 — период без строк рисует пустое состояние основы, а не сообщение шины', async ({ page }: { page: Page }) => {
        await openSection(page, 'usage', PERIOD_QUERY);

        await pickDay(page, 'from', '2026-08-20');
        await pickDay(page, 'to', '2026-08-25');

        await expect(rowsOf(page, 'usage')).toHaveCount(0);
        await expect(qa(page, 'empty-state-title')).toHaveText('По этому отбору записей нет');
        await expect(qa(page, 'empty-state-description')).toHaveText('Снимите отбор над списком или выберите в нём другое значение');
        await expect(pageQa(page, 'usage', 'fault')).toHaveCount(0);
        await expect(page.locator('rt-toast')).toHaveCount(0);
    });

    test('SC-MB-357 — над таблицей стоит сводка периода: столбик на день, топ скилов, роды, отказы', async ({ page }: { page: Page }) => {
        await openSection(page, 'usage', PERIOD_QUERY);

        await expect(qa(page, 'usage-digest')).toBeVisible();
        await expect(qa(page, 'usage-digest-chart-title')).toContainText('Загрузок: 6');
        // столбик на каждый день августа, с нулями там, где строк нет
        await expect(qa(page, 'usage-digest-bar')).toHaveCount(31);
        await expect(qa(page, 'usage-digest-bar').nth(11)).toHaveAttribute('data-day', '2026-08-12');
        await expect(qa(page, 'usage-digest-bar').nth(11)).toHaveAttribute('data-loads', '4');
        await expect(qa(page, 'usage-digest-bar').nth(12)).toHaveAttribute('data-loads', '2');
        await expect(qa(page, 'usage-digest-bar').first()).toHaveAttribute('data-loads', '0');

        // самый загружаемый первым; правило с одними отказами в топ не попадает
        expect(await barListTexts(page, 'usage-digest-top', 'title')).toEqual([
            'testing',
            'cargo-triage',
            'git-workflow-commit',
            'rt-tools-storybook',
        ]);
        expect(await barListTexts(page, 'usage-digest-top', 'value')).toEqual(['3', '1', '1', '1']);
        expect(await barListTexts(page, 'usage-digest-kinds', 'title')).toEqual(['правило', 'свой скил проекта', 'паттерн', 'скил пакета']);
        expect(await barListTexts(page, 'usage-digest-kinds', 'value')).toEqual(['3', '1', '1', '1']);
        expect(await barListTexts(page, 'usage-digest-denied', 'title')).toEqual(['lists', 'testing']);
        expect(await barListTexts(page, 'usage-digest-denied', 'value')).toEqual(['1', '1']);
    });

    test('SC-MB-358 — «7 дней» ставит в адрес последние семь дней по сегодняшний, и таблица со сводкой перечитываются', async ({
        page,
    }: {
        page: Page;
    }) => {
        await openSection(page, 'usage', PERIOD_QUERY);

        await expect(rowsOf(page, 'usage')).toHaveCount(5);

        const now: Date = new Date();
        const seven: Locator = qa(page, 'usage-quick-period').locator('[qa-dataid="toggle-button-group-option"][data-value="7"]');

        await expect(seven).toHaveAttribute('aria-pressed', 'false');
        await seven.click();

        await expect(seven).toHaveAttribute('aria-pressed', 'true');
        await expect(qa(page, 'list-period-from').locator('input')).toHaveValue(dayOf(new Date(now.getTime() - 6 * DAY_MS)));
        await expect(qa(page, 'list-period-to').locator('input')).toHaveValue(dayOf(now));
        expect(queryOf(page).get('from')).toBe(dayOf(new Date(now.getTime() - 6 * DAY_MS)));
        expect(queryOf(page).get('to')).toBe(dayOf(now));
        // строки стенда лежат в прошлом: за последнюю неделю их нет, и сводка говорит об этом словами
        await expect(rowsOf(page, 'usage')).toHaveCount(0);
        await expect(qa(page, 'usage-digest-bar')).toHaveCount(7);
        await expect(qa(page, 'usage-digest-chart-title')).toContainText('Загрузок: 0');
        await expect(qa(page, 'usage-digest-top').locator('[qa-dataid="bar-list-empty"]')).toBeVisible();
    });
});
