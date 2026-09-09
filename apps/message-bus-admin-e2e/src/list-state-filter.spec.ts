import { expect, Page, test } from '@playwright/test';

import { TREES } from '../stand/stand.mjs';
import { columnTexts, openSection, pickState, pickTree, qa, queryOf, rowsOf, SECTION, sortBy } from './support/admin';

/**
 * Отбор списка по состоянию записи и порядок по нему.
 *
 * Идёт по засеянному стенду, а не по подменённым ответам: отбор — это разговор экрана с
 * приёмником, и подменённый ответ проверял бы разметку вместо него.
 *
 * Состояния на стенде розданы поимённо: у разборов первого дерева двое в работе, один готов,
 * один выпущен, остальные новые. Числа поэтому написаны здесь, а не выведены из кода экрана.
 */

/** Слова состояний — те же, что человек читает в столбце и в отборе. */
const STATE: Readonly<Record<'all' | 'new' | 'inWork' | 'fixed' | 'released' | 'quarantined', string>> = Object.freeze({
    all: 'Все состояния',
    new: 'Новое',
    inWork: 'В работе',
    fixed: 'Готово',
    released: 'Выпущено',
    quarantined: 'В карантине',
});

/** Сколько разборов стенда стоит в работе: столько же строк остаётся от отбора. */
const IN_WORK_ROWS: number = 2;

/** Столбец состояния у разборов: по нему судится и отбор, и порядок. */
const STATE_CELL: string = 'postmortems-cell-state';

test.describe('отбор по состоянию', () => {
    test('SC-MB-222, SC-MB-236 — в полосе над списком стоят два отбора, и состояния названы словами столбца', async ({
        page,
    }: {
        page: Page;
    }) => {
        await openSection(page, 'postmortems');

        await expect(qa(page, 'list-tree-filter')).toBeVisible();
        await expect(qa(page, 'list-state-filter')).toBeVisible();

        // отбор по состоянию стоит правее отбора по дереву: они — два условия одного вопроса
        const tree: { x: number } = (await qa(page, 'list-tree-filter').boundingBox()) ?? { x: 0 };
        const state: { x: number } = (await qa(page, 'list-state-filter').boundingBox()) ?? { x: 0 };

        expect(state.x).toBeGreaterThan(tree.x);

        await qa(page, 'list-state-filter').click();

        const offered: string[] = await page.getByRole('option').allTextContents();

        expect(offered.map((text: string): string => text.trim())).toEqual([
            STATE.all,
            STATE.new,
            STATE.inWork,
            STATE.fixed,
            STATE.released,
            STATE.quarantined,
        ]);
    });

    test('SC-MB-223, SC-MB-224 — выбранное состояние сужает список и встаёт в адрес, а снятое уходит из него', async ({
        page,
    }: {
        page: Page;
    }) => {
        await openSection(page, 'postmortems');

        await pickState(page, STATE.inWork);

        await expect.poll(async (): Promise<string[]> => [...new Set(await columnTexts(page, STATE_CELL))]).toEqual([STATE.inWork]);
        await expect(rowsOf(page, 'postmortems')).toHaveCount(IN_WORK_ROWS);
        expect(queryOf(page).get('state')).toBe('in_work');

        await pickState(page, STATE.all);

        await expect.poll(async (): Promise<number> => new Set(await columnTexts(page, STATE_CELL)).size).toBeGreaterThan(1);
        expect(queryOf(page).has('state')).toBe(false);
    });

    test('SC-MB-225 — отбор по состоянию складывается с отбором по дереву, а не снимает его', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems');

        await pickTree(page, TREES[0].name);
        await pickState(page, STATE.inWork);

        await expect.poll(async (): Promise<string[]> => [...new Set(await columnTexts(page, STATE_CELL))]).toEqual([STATE.inWork]);
        await expect
            .poll(async (): Promise<string[]> => [...new Set(await columnTexts(page, 'postmortems-cell-tree'))])
            .toEqual([TREES[0].name]);

        const asked: URLSearchParams = queryOf(page);

        expect(asked.get('state')).toBe('in_work');
        expect(asked.get('tree')).toBe(TREES[0].slug);
    });

    test('SC-MB-226, SC-MB-227 — отбор возвращает список на первую страницу и переживает переход на вторую', async ({
        page,
    }: {
        page: Page;
    }) => {
        await openSection(page, 'postmortems', '?page=2');

        await pickState(page, STATE.new);

        await expect.poll(async (): Promise<string[]> => [...new Set(await columnTexts(page, STATE_CELL))]).toEqual([STATE.new]);
        expect(queryOf(page).has('page')).toBe(false);

        await qa(page, 'pagination-next').locator('button').click();

        await expect.poll(async (): Promise<string | null> => queryOf(page).get('page')).toBe('2');
        expect(queryOf(page).get('state')).toBe('new');
        await expect.poll(async (): Promise<string[]> => [...new Set(await columnTexts(page, STATE_CELL))]).toEqual([STATE.new]);
    });

    test('SC-MB-228 — закрытая панель записи возвращает список с тем же отбором', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems');

        await pickState(page, STATE.inWork);
        await expect(rowsOf(page, 'postmortems')).toHaveCount(IN_WORK_ROWS);

        await rowsOf(page, 'postmortems').first().click();
        await expect(qa(page, SECTION.postmortems.details)).toBeVisible();
        await qa(page, SECTION.postmortems.details).click();

        await expect(qa(page, SECTION.postmortems.details)).toHaveCount(0);
        expect(queryOf(page).get('state')).toBe('in_work');
        await expect(rowsOf(page, 'postmortems')).toHaveCount(IN_WORK_ROWS);
    });

    test('SC-MB-229 — список, пустой по отбору состояния, объясняет это отбором', async ({ page }: { page: Page }) => {
        await openSection(page, 'proposals');

        // Готовых предложений на стенде нет: выпущенное там есть — им проверяется отбор по версии
        await pickState(page, STATE.fixed);

        await expect(qa(page, 'empty-state-title')).toHaveText('По этому отбору записей нет');
        await expect(qa(page, 'empty-state-description')).toHaveText('Снимите отбор над списком или выберите в нём другое значение');
    });

    test('SC-MB-230 — заголовок столбца состояния меняет порядок списка', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems', '?size=50');

        await sortBy(page, 'state');

        await expect.poll((): string | null => queryOf(page).get('sort')).toBe('state');

        const dir: string | null = queryOf(page).get('dir');

        expect(dir === 'asc' || dir === 'desc').toBe(true);

        // и показанный порядок — тот, который назван в адресе, а не какой-нибудь.
        // Ждать обязательно: порядок уходит в адрес нажатием, а строки приезжают ответом
        // приёмника, и прочитанные сразу — это ещё строки прежнего порядка.
        const forward: string[] = [STATE.new, STATE.inWork, STATE.fixed, STATE.released];

        await expect
            .poll(async (): Promise<string[]> => {
                const shown: string[] = await columnTexts(page, STATE_CELL);

                return shown.filter((word: string, at: number): boolean => word !== shown[at - 1]);
            })
            .toEqual(dir === 'asc' ? forward : [...forward].reverse());
    });

    test('SC-MB-231 — порядок по состоянию идёт шагами разбора, а не алфавитом', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems', '?size=50&sort=state&dir=asc');

        // Ждать обязательно, тем же приёмом, что у соседней спеки: заход по прямому адресу
        // поднимает приложение заново, строки приезжают ответом приёмника, и прочитанный
        // сразу столбец приходит пустым.
        // алфавит поставил бы «В работе» перед «Выпущено» и «Готово» перед «Новое»
        await expect
            .poll(async (): Promise<string[]> => {
                const shown: string[] = await columnTexts(page, STATE_CELL);

                return shown.filter((word: string, at: number): boolean => word !== shown[at - 1]);
            })
            .toEqual([STATE.new, STATE.inWork, STATE.fixed, STATE.released]);
    });

    test('SC-MB-233 — состояние, написанное в адресе с опечаткой, читается как снятый отбор', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems', '?state=починен-наверное');

        await expect(qa(page, 'list-state-filter')).toContainText(STATE.all);
        await expect.poll(async (): Promise<number> => new Set(await columnTexts(page, STATE_CELL)).size).toBeGreaterThan(1);
    });

    test('SC-MB-234 — у раздела сводок отбора по состоянию нет: состояния у записи месяца не бывает', async ({ page }: { page: Page }) => {
        await openSection(page, 'summaries');

        await expect(qa(page, 'list-tree-filter')).toBeVisible();
        await expect(qa(page, 'list-state-filter')).toHaveCount(0);
    });
});
