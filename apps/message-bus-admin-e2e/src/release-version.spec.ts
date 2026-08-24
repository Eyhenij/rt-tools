import { expect, Locator, Page, test } from '@playwright/test';

import { detailValue, openSection, qa, rowsOf } from './support/admin';

/**
 * Версия выпуска в панели записи груза.
 *
 * Проверяется тем же путём, каким её видит человек: раздел открыт вошедшим, строка выбрана
 * нажатием, панель прочитана со страницы. Спека компонента отвечает на вопрос «дошёл ли вход»,
 * а этот — на вопрос «видно ли это на экране приложения».
 */

/** Версия, которую засев стенда ставит выпущенной записи. Пишется здесь, а не берётся из кода. */
const STAND_VERSION: string = 'rt-agent-kit@0.10.1';

/** Файл выпущенной записи стенда: она одна несёт версию, остальные — нет. */
const RELEASED_FILE: string = 'markup-case.md';

/** Строка списка по имени файла: панель открывается нажатием по ней, а не переходом по адресу. */
function rowOfFile(page: Page, file: string): Locator {
    return rowsOf(page, 'postmortems').filter({ has: page.locator(`[qa-dataid="postmortems-cell-file"]`, { hasText: file }) });
}

test.describe('версия выпуска в панели', () => {
    test('SC-MB-205 — панель выпущенной записи показывает версию выпуска', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems');
        await rowOfFile(page, RELEASED_FILE).first().click();

        await expect(qa(page, 'postmortem-release-version')).toBeVisible();
        await expect(detailValue(page, 'postmortem-release-version')).toHaveText(STAND_VERSION);
    });

    test('SC-MB-206 — у записи без версии строки в панели нет вовсе', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems');
        const other: Locator = rowsOf(page, 'postmortems').filter({ hasNot: page.getByText(RELEASED_FILE) });

        await other.first().click();

        // Отрицательное утверждение идёт в паре с положительным: сперва показано, что панель
        // открыта и её первое свойство на месте, и только потом — что строки версии в ней нет
        await expect(qa(page, 'postmortem-tree')).toBeVisible();
        await expect(qa(page, 'postmortem-release-version')).toHaveCount(0);
    });
});
