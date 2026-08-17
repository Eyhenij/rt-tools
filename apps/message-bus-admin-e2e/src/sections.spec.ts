import { expect, Page, test } from '@playwright/test';

import { TREES } from '../stand/stand.mjs';
import { columnTexts, expectOnlyTree, openSection, pageQa, pickTree, qa, queryOf, rowsOf, SECTION } from './support/admin';

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

        await pickTree(page, TREES[1].name);

        expect(queryOf(page).get('tree')).toBe(TREES[1].slug);
        await expect(rowsOf(page, 'proposals')).toHaveCount(2);

        await rowsOf(page, 'proposals').first().click();

        await expect(qa(page, 'proposal-tree')).toHaveText(TREES[1].name);
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

        const trees: string[] = await columnTexts(page, 'summaries-cell-tree');

        expect(new Set(trees)).toEqual(new Set([TREES[0].name, TREES[1].name]));

        await pickTree(page, TREES[0].name);
        await expectOnlyTree(page, 'summaries-cell-tree', TREES[0].name);
        await expect(rowsOf(page, 'summaries')).toHaveCount(1);

        await rowsOf(page, 'summaries').first().click();

        await expect(qa(page, 'month-record-tree')).toHaveText(TREES[0].name);
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
        await expect(qa(page, 'month-record-sessions')).toHaveText('0');
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
});
