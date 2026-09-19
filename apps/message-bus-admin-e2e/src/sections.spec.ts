import { expect, Locator, Page, test } from '@playwright/test';

import { TREES } from '../stand/stand.mjs';
import { columnTexts, detailValue, expectOnlyTree, openSection, pageQa, pickTree, qa, queryOf, rowsOf, SECTION } from './support/admin';
import { expectScreen } from './support/shot';

/**
 * Разделы предложений и сводок — те же обещания на той же основе.
 *
 * Проверяется не повтор списка построчно, а то, что оба раздела собраны тем же списочным
 * экраном: таблица, тулбар с отбором, переключатель страниц, нажатие на строку и панель. Если
 * раздел соберут своей разметкой, спека упадёт здесь, а не через месяц на первом расхождении.
 */
test.describe('разделы груза', () => {
    test('SC-MB-74, SC-MB-133 — раздел предложений собран тем же списочным экраном, а свой отбор кладёт в слот тулбара', async ({
        page,
    }: {
        page: Page;
    }) => {
        await openSection(page, 'proposals');

        await expect(page.getByRole('heading', { name: SECTION.proposals.title })).toBeVisible();
        await expect(rowsOf(page, 'proposals')).toHaveCount(5);
        await expect(qa(page, 'list-tree-filter')).toBeVisible();
        // отбор стоит именно в левой части тулбара: там, где живёт всё, что меняет выборку
        await expect(page.locator('[qa-dataid="toolbar-bar"][data-slot="left"] [qa-dataid="list-tree-filter"]')).toBeVisible();
        // переключатель страниц стоит на месте и называет, сколько записей показано; сами
        // страницы он прячет, пока их одна — тем же правилом, что и в разделе разборов
        await expect(qa(page, 'pagination-range')).toContainText('из 5');
        await expect(pageQa(page, 'proposals', 'columns')).toBeVisible();

        await expectScreen(page, 'list-proposals');

        await pickTree(page, TREES[1].name);

        expect(queryOf(page).get('tree')).toBe(TREES[1].slug);
        await expect(rowsOf(page, 'proposals')).toHaveCount(2);

        await rowsOf(page, 'proposals').first().click();

        await expect(detailValue(page, 'proposal-tree')).toHaveText(TREES[1].name);
        await expect(qa(page, 'proposal-text')).not.toHaveText('');
        expect(page.url()).toContain('ro:proposals');

        await qa(page, SECTION.proposals.details).click();

        await expect(qa(page, 'proposal-text')).toHaveCount(0);
        expect(queryOf(page).get('tree')).toBe(TREES[1].slug);
    });

    test('SC-MB-75 — раздел сводок собран тем же списочным экраном', async ({ page }: { page: Page }) => {
        await openSection(page, 'summaries');

        await expect(page.getByRole('heading', { name: SECTION.summaries.title })).toBeVisible();
        await expect(rowsOf(page, 'summaries')).toHaveCount(2);
        await expect(qa(page, 'list-tree-filter')).toBeVisible();
        await expect(qa(page, 'pagination-range')).toContainText('из 2');
        await expect(pageQa(page, 'summaries', 'columns')).toBeVisible();

        await expectScreen(page, 'list-summaries');

        const trees: string[] = await columnTexts(page, 'summaries-cell-tree');

        expect(new Set(trees)).toEqual(new Set([TREES[0].name, TREES[1].name]));

        await pickTree(page, TREES[0].name);
        await expectOnlyTree(page, 'summaries-cell-tree', TREES[0].name);
        await expect(rowsOf(page, 'summaries')).toHaveCount(1);

        await rowsOf(page, 'summaries').first().click();

        await expect(detailValue(page, 'month-record-tree')).toHaveText(TREES[0].name);
        // сводка приехала телом груза и показана текстом целиком
        await expect(qa(page, 'month-record-summary')).toContainText('sessions');
        expect(page.url()).toContain('ro:summaries');

        await qa(page, SECTION.summaries.details).click();

        await expect(qa(page, 'month-record-summary')).toHaveCount(0);
        expect(queryOf(page).get('tree')).toBe(TREES[0].slug);
    });

    test('сводки нет — запись месяца говорит об этом словами', async ({ page }: { page: Page }) => {
        await openSection(page, 'summaries');
        await pickTree(page, TREES[1].name);
        await expectOnlyTree(page, 'summaries-cell-tree', TREES[1].name);

        await rowsOf(page, 'summaries').first().click();

        // второму дереву запись месяца завели предложения, а сводки оно не присылало
        await expect(qa(page, 'month-record-summary-missing')).toContainText('Сводки в этом месяце ещё не было');
        await expect(qa(page, 'month-record-summary')).toHaveCount(0);
        await expect(detailValue(page, 'month-record-sessions')).toHaveText('0');
    });

    test('SC-MB-78 — подписи кита идут из словаря приложения', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems');

        // переключатель страниц: его подписи рисует кит, и без словаря они были бы английскими
        await expect(page.getByText('Строк на странице:', { exact: true })).toBeVisible();
        await expect(qa(page, 'pagination-range')).toContainText('из');
        await expect(qa(page, 'pagination-nav')).toHaveAttribute('aria-label', 'Страницы');
        await expect(qa(page, 'pagination-prev').locator('button')).toHaveAttribute('aria-label', 'Предыдущая страница');
        await expect(qa(page, 'pagination-next').locator('button')).toHaveAttribute('aria-label', 'Следующая страница');

        // пустое состояние таблицы: тот же кит, тот же словарь
        await pickTree(page, TREES[2].name);

        await expect(qa(page, 'table-empty')).toContainText('По этому отбору записей нет');
        await expect(page.getByText('No rows', { exact: false })).toHaveCount(0);
        await expect(page.getByText('Per page', { exact: false })).toHaveCount(0);
    });

    test('SC-MB-407 — экран раздела идёт за выбором языка, и ячейки таблицы тоже', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems');

        // Метка на окне переживает переключение и не переживает перезагрузку: ею и проверяется,
        // что страницу никто не перезагружал.
        await page.evaluate((): void => {
            (window as unknown as Record<string, boolean>)['rtSameLoad'] = true;
        });

        const stateCell: Locator = rowsOf(page, 'postmortems').first().locator('[qa-dataid="postmortems-cell-state"]');
        const treeHeader: Locator = page.locator('[qa-dataid="postmortems-table"] th').first();

        // Сначала положительная половина: места, за которые держится проба, найдены и говорят
        // по-русски. Без неё проба осталась бы зелёной и на пустой ячейке.
        await expect(page.getByRole('heading', { name: SECTION.postmortems.title })).toBeVisible();
        await expect(treeHeader).toHaveText('Проект');
        const stateBefore: string = (await stateCell.innerText()).trim();

        expect(stateBefore).not.toBe('');

        await qa(page, 'header-user-menu').click();
        await qa(page, 'profile-language').locator('[qa-dataid="toggle-button-group-option"][data-value="en"]').click();

        // Оба набора полны, и на английском выборе приходят английские слова: и заголовок раздела,
        // и подпись столбца, и слово состояния в ячейке.
        await expect(page.getByRole('heading', { name: 'Incident analyses' })).toBeVisible();
        await expect(treeHeader).toHaveText('Project');
        await expect(stateCell).not.toHaveText(stateBefore);
        await expect(stateCell).not.toHaveText('');

        expect(await page.evaluate((): boolean => (window as unknown as Record<string, boolean>)['rtSameLoad'] === true)).toBe(true);
    });

    test('SC-MB-415 — на английском выборе подписи экрана раздела без кириллицы', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems');

        // Подписи экрана: заголовок, подсказка, столбцы, слова состояний, кнопки тулбара и
        // оболочка. Имена деревьев и файлов в ячейках сюда не входят — они данные, а не подписи.
        const labels: () => Promise<string[]> = async (): Promise<string[]> => {
            const texts: string[] = [];

            for (const selector of [
                '[qa-dataid="admin-brand"]',
                '[qa-dataid="header-nav-item"]',
                '.admin-page__title',
                '[qa-dataid="postmortems-hint"]',
                '[qa-dataid="postmortems-table"] th',
                '[qa-dataid="postmortems-cell-state"]',
                '.rt-pagination__per-page-label',
                '[qa-dataid="pagination-range"]',
            ]) {
                texts.push(...(await page.locator(selector).allInnerTexts()));
            }

            for (const selector of ['[qa-dataid="postmortems-refresh"] button', '[qa-dataid="postmortems-columns"] button']) {
                texts.push((await page.locator(selector).getAttribute('aria-label')) ?? '');
            }

            return texts.map((one: string): string => one.trim()).filter((one: string): boolean => one !== '');
        };

        const cyrillic: RegExp = /[А-Яа-яЁё]/;

        // Сначала положительная половина: по-русски те же места кириллицу несут. Без неё проба
        // осталась бы зелёной и на пустом отборе — например, на переименованном признаке.
        const russian: string[] = await labels();

        expect(russian.length).toBeGreaterThan(10);
        expect(russian.filter((one: string): boolean => cyrillic.test(one)).length).toBeGreaterThan(5);

        await qa(page, 'header-user-menu').click();
        await qa(page, 'profile-language').locator('[qa-dataid="toggle-button-group-option"][data-value="en"]').click();
        await expect(page.getByRole('heading', { name: 'Incident analyses' })).toBeVisible();

        const english: string[] = await labels();

        expect(english).toHaveLength(russian.length);
        expect(english.filter((one: string): boolean => cyrillic.test(one))).toEqual([]);
    });
});
