import { expect, Locator, Page, test } from '@playwright/test';

import { TREES } from '../stand/stand.mjs';
import { columnTexts, openSection, pickTree, pickVersion, qa, queryOf, rowsOf, SECTION, sortBy } from './support/admin';

/**
 * Отбор списка по версии выпуска, столбец версии и порядок по нему.
 *
 * Идёт по засеянному стенду, а не по подменённым ответам: набор версий приёмник собирает по самим
 * записям, и подменённый ответ проверял бы разметку вместо разговора экрана с приёмником.
 *
 * Версии на стенде розданы поимённо: у разборов две числовые и одна нечисловая, у предложений —
 * своя. Числа поэтому написаны здесь, а не выведены из кода экрана.
 */

/** Подписи первых двух пунктов отбора: ими он снимается и ими же находят невыпущенное. */
const VERSION: Readonly<Record<'all' | 'none', string>> = Object.freeze({
    all: 'Все версии',
    none: 'Без версии',
});

/** Версии разборов на стенде: две числовые и одна нечисловая — в порядке, которым их отдаёт приёмник. */
const POSTMORTEM_VERSIONS: readonly string[] = ['0.9.0', '0.10.0', 'rt-agent-kit@0.10.1'];

/** Версия предложений: у разборов её нет вовсе. */
const PROPOSAL_VERSION: string = '1.4.0';

/** Сколько разборов стенда уехало версией `0.10.0`: столько строк остаётся от отбора. */
const ONE_VERSION_ROWS: number = 1;

/** Столбец версии у разборов: по нему судятся и отбор, и порядок. */
const VERSION_CELL: string = 'postmortems-cell-version';

test.describe('отбор по версии выпуска', () => {
    test('SC-MB-239, SC-MB-240 — отбор стоит третьим в полосе и перечисляет встретившиеся версии', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems');

        await expect(qa(page, 'list-version-filter')).toBeVisible();

        // отбор по версии стоит правее отбора по состоянию: порядок отборов идёт от общего к частному
        const state: { x: number } = (await qa(page, 'list-state-filter').boundingBox()) ?? { x: 0 };
        const version: { x: number } = (await qa(page, 'list-version-filter').boundingBox()) ?? { x: 0 };

        expect(version.x).toBeGreaterThan(state.x);

        await qa(page, 'list-version-filter').click();

        const expected: readonly string[] = [VERSION.all, VERSION.none, ...POSTMORTEM_VERSIONS];
        const offered: Locator = page.getByRole('option');

        // Набор версий приезжает ответом приёмника, а разметкой стоят только два постоянных
        // пункта. Прочитанный сразу после нажатия, он судил бы загрузку машины: на свободной
        // проверка зелена, на занятой красна. Ждётся сам набор пунктов, а не его след.
        await expect(offered).toHaveCount(expected.length);

        expect((await offered.allTextContents()).map((text: string): string => text.trim())).toEqual([...expected]);
    });

    test('SC-MB-237, SC-MB-238 — столбец версии стоит за состоянием и пуст у невыпущенной записи', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems', '?size=50');

        // Строки приезжают ответом приёмника позже видимой таблицы, а замер без них берёт ноль
        // с обеих сторон и сравнивает ноль с нулём.
        await expect(qa(page, 'postmortems-cell-state').first()).toBeVisible();
        await expect(qa(page, VERSION_CELL).first()).toBeVisible();

        const state: { x: number } = (await qa(page, 'postmortems-cell-state').first().boundingBox()) ?? { x: 0 };
        const version: { x: number } = (await qa(page, VERSION_CELL).first().boundingBox()) ?? { x: 0 };

        expect(version.x).toBeGreaterThan(state.x);

        const shown: string[] = await columnTexts(page, VERSION_CELL);

        expect(shown.filter((text: string): boolean => text !== '')).toEqual(expect.arrayContaining(['0.9.0', '0.10.0']));
        expect(shown.filter((text: string): boolean => text === '').length).toBeGreaterThan(0);
    });

    test('SC-MB-241, SC-MB-242 — выбранная версия сужает список и встаёт в адрес, а снятая уходит из него', async ({
        page,
    }: {
        page: Page;
    }) => {
        await openSection(page, 'postmortems');

        await pickVersion(page, '0.10.0');

        await expect.poll(async (): Promise<string[]> => [...new Set(await columnTexts(page, VERSION_CELL))]).toEqual(['0.10.0']);
        await expect(rowsOf(page, 'postmortems')).toHaveCount(ONE_VERSION_ROWS);
        expect(queryOf(page).get('version')).toBe('0.10.0');

        await pickVersion(page, VERSION.all);

        await expect.poll(async (): Promise<number> => new Set(await columnTexts(page, VERSION_CELL)).size).toBeGreaterThan(1);
        expect(queryOf(page).has('version')).toBe(false);
    });

    test('SC-MB-243 — «без версии» оставляет записи, которых никто не выпускал', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems');

        await pickVersion(page, VERSION.none);

        await expect.poll(async (): Promise<string[]> => [...new Set(await columnTexts(page, VERSION_CELL))]).toEqual(['']);
        expect(queryOf(page).get('version')).toBe('none');
    });

    test('SC-MB-244, SC-MB-245 — три отбора складываются и возвращают список на первую страницу', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems', '?page=2');

        await pickTree(page, TREES[0].name);
        await pickVersion(page, '0.9.0');

        await expect.poll(async (): Promise<string[]> => [...new Set(await columnTexts(page, VERSION_CELL))]).toEqual(['0.9.0']);

        const asked: URLSearchParams = queryOf(page);

        expect(asked.get('version')).toBe('0.9.0');
        expect(asked.get('tree')).toBe(TREES[0].slug);
        expect(asked.has('page')).toBe(false);
    });

    test('SC-MB-246 — отбор по версии переживает переход на страницу и возврат из панели', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems', '?size=20');

        await pickVersion(page, VERSION.none);
        await expect.poll(async (): Promise<string | null> => queryOf(page).get('version')).toBe('none');

        await qa(page, 'pagination-next').locator('button').click();

        await expect.poll(async (): Promise<string | null> => queryOf(page).get('page')).toBe('2');
        expect(queryOf(page).get('version')).toBe('none');

        await rowsOf(page, 'postmortems').first().click();
        await expect(qa(page, SECTION.postmortems.details)).toBeVisible();
        await qa(page, SECTION.postmortems.details).click();

        await expect(qa(page, SECTION.postmortems.details)).toHaveCount(0);

        const asked: URLSearchParams = queryOf(page);

        expect(asked.get('version')).toBe('none');
        expect(asked.get('page')).toBe('2');
    });

    test('SC-MB-247 — версия, которой в записях нет, отдаёт пустой список, а не отказ', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems', '?version=9.9.9');

        await expect(qa(page, 'empty-state-title')).toHaveText('По этому отбору записей нет');
        await expect(qa(page, 'empty-state-description')).toHaveText('Снимите отбор над списком или выберите в нём другое значение');
    });

    test('SC-MB-248, SC-MB-249, SC-MB-250, SC-MB-251 — заголовок столбца упорядочивает номерами, а пустые уходят вниз', async ({
        page,
    }: {
        page: Page;
    }) => {
        await openSection(page, 'postmortems', '?size=50');

        await sortBy(page, 'releaseVersion');

        await expect.poll((): string | null => queryOf(page).get('sort')).toBe('releaseVersion');

        const dir: string | null = queryOf(page).get('dir');
        const forward: string[] = [...POSTMORTEM_VERSIONS, ''];

        await expect
            .poll(async (): Promise<string[]> => {
                const shown: string[] = await columnTexts(page, VERSION_CELL);

                return shown.filter((text: string, at: number): boolean => text !== shown[at - 1]);
            })
            .toEqual(dir === 'asc' ? forward : [...forward].reverse());
    });

    test('SC-MB-252 — у раздела сводок отбора по версии нет: версии у записи месяца не бывает', async ({ page }: { page: Page }) => {
        await openSection(page, 'summaries');

        await expect(qa(page, 'list-tree-filter')).toBeVisible();
        await expect(qa(page, 'list-version-filter')).toHaveCount(0);
    });

    test('SC-MB-254 — раздел предложений показывает свои версии, а не версии разборов', async ({ page }: { page: Page }) => {
        await openSection(page, 'proposals');

        await qa(page, 'list-version-filter').click();

        const expected: readonly string[] = [VERSION.all, VERSION.none, PROPOSAL_VERSION];
        const offered: Locator = page.getByRole('option');

        await expect(offered).toHaveCount(expected.length);

        expect((await offered.allTextContents()).map((text: string): string => text.trim())).toEqual([...expected]);
    });
});
