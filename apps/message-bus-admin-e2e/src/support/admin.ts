import { expect, Locator, Page } from '@playwright/test';

import { ACCOUNT, SECTIONS } from '../../stand/stand.mjs';

/**
 * Опора сквозного набора: вход, разделы и то, чем на экране находят строки и панель.
 *
 * Селекторы собраны здесь потому, что их знают все спеки: разъехавшись по файлам, они правятся
 * в двадцати местах, а `qa-dataid`, переименованный в разметке, роняет набор в случайном
 * порядке — и починка выглядит правкой каждой спеки по очереди.
 *
 * Вход идёт экраном, а не подстановкой куки. Кука недоступна скриптам, и поставить её со
 * стороны браузера нечем; но дело не только в этом — набор проверяет, что человек входит и
 * попадает туда, куда шёл, и вход, сделанный мимо экрана, отвечал бы на другой вопрос.
 */

/** Адрес экрана входа. Тот же, что объявляют маршруты домена входа. */
export const SIGN_IN_PATH: string = '/sign-in';

/** Чем набор держится за раздел: его адрес, заголовок экрана и метки проверки на разметке. */
export interface ISectionMarks {
    readonly path: string;
    readonly title: string;
    /** Короткое имя раздела: из него собраны метки его страницы — и здесь, и в разметке. */
    readonly prefix: string;
    readonly table: string;
    readonly row: string;
    readonly details: string;
}

/** Что общая страница списка размечает своими метками, собирая их из префикса раздела. */
export type TPageMark = 'hint' | 'columns' | 'refresh' | 'fault' | 'retry';

/** Имя раздела: их три, и все три собраны одним и тем же списочным экраном. */
export type TSectionName = 'postmortems' | 'proposals' | 'summaries';

/** Разделы админки: адрес, заголовок экрана и `qa-dataid` его таблицы и строк. */
export const SECTION: Readonly<Record<TSectionName, ISectionMarks>> = Object.freeze({
    postmortems: Object.freeze({
        path: SECTIONS.postmortems,
        title: 'Разборы происшествий',
        prefix: 'postmortems',
        table: 'postmortems-table',
        row: 'postmortems-row',
        details: 'postmortem-details-close',
    }),
    proposals: Object.freeze({
        path: SECTIONS.proposals,
        title: 'Предложения',
        prefix: 'proposals',
        table: 'proposals-table',
        row: 'proposals-row',
        details: 'proposal-details-close',
    }),
    summaries: Object.freeze({
        path: SECTIONS.summaries,
        title: 'Сводки деревьев',
        prefix: 'summaries',
        table: 'summaries-table',
        row: 'summaries-row',
        details: 'month-record-details-close',
    }),
});

/** Узел по метке проверки: ею размечены все места, за которые набор держится. */
export function qa(page: Page, id: string): Locator {
    return page.locator(`[qa-dataid="${id}"]`);
}

/**
 * Метка на общей странице раздела.
 *
 * Страница собирает их из префикса, который называет экран: одинаковые на трёх разделах, они не
 * отвечали бы на вопрос, чей элемент нашла проверка, — спека, открывшая не тот раздел, находила
 * бы тот же якорь и проходила зелёной.
 */
export function pageQa(page: Page, section: TSectionName, mark: TPageMark): Locator {
    return qa(page, `${SECTION[section].prefix}-${mark}`);
}

/** Строки списка раздела. */
export function rowsOf(page: Page, section: TSectionName): Locator {
    return qa(page, SECTION[section].row);
}

/**
 * Вход парой стенда.
 *
 * Ждёт ухода с экрана входа: форма отвечает не мгновенно, и следующий шаг, начатый раньше,
 * читает ещё старую страницу.
 */
export async function signIn(page: Page): Promise<void> {
    await qa(page, 'sign-in-name').locator('input').fill(ACCOUNT.name);
    await qa(page, 'sign-in-password').locator('input').fill(ACCOUNT.password);
    await qa(page, 'sign-in-submit').click();
    await page.waitForURL((url: URL): boolean => !url.pathname.startsWith(SIGN_IN_PATH));
}

/** Открыть раздел вошедшим: заход с прямого адреса, вход, ожидание строк. */
export async function openSection(page: Page, section: TSectionName, query: string = ''): Promise<void> {
    await page.goto(`${SECTION[section].path}${query}`);
    await signIn(page);
    await expect(qa(page, SECTION[section].table)).toBeVisible();
}

/** Значения одного столбца по всем строкам: по ним судится порядок и состав страницы. */
export async function columnTexts(page: Page, id: string): Promise<string[]> {
    return (await qa(page, id).allTextContents()).map((text: string): string => text.trim());
}

/** Выбрать дерево в отборе. Пустое имя — «Все деревья», то есть снять отбор. */
export async function pickTree(page: Page, name: string): Promise<void> {
    await qa(page, 'list-tree-filter').click();
    await page.getByRole('option', { name, exact: true }).click();
}

/** Нажать заголовок сортируемого столбца: нажатие по самому `th` порядка не меняет. */
export async function sortBy(page: Page, column: string): Promise<void> {
    await page.locator(`[qa-dataid="table-sort-header"][data-column="${column}"]`).click();
}

/**
 * Дождаться списка, в котором осталось одно дерево.
 *
 * Ждать обязательно: отбор уходит в адрес нажатием, а строки приезжают ответом приёмника, и
 * прочитанные сразу — это ещё строки прежнего списка. Проверка без ожидания зелена на свободной
 * машине и красна на занятой, то есть судит машину.
 */
export async function expectOnlyTree(page: Page, cell: string, name: string): Promise<void> {
    await expect.poll(async (): Promise<string[]> => [...new Set(await columnTexts(page, cell))]).toEqual([name]);
}

/**
 * Дождаться списка, сменившегося на другой, и вернуть его.
 *
 * Тем же и лечится главная ловушка этого набора: страница в адресе меняется нажатием сразу, а
 * строки — ответом приёмника, и прочитанные тут же, они ещё прежние. Проверка «на второй
 * странице те же записи, что на первой» без этого ожидания зелена ошибочно.
 */
export async function rowsAfterChange(page: Page, cell: string, before: readonly string[]): Promise<string[]> {
    await expect.poll(async (): Promise<string> => (await columnTexts(page, cell)).join(' ')).not.toBe(before.join(' '));

    return columnTexts(page, cell);
}

/** Параметры адреса: выборка живёт в них, и набор судит её по ним, а не по виду экрана. */
export function queryOf(page: Page): URLSearchParams {
    return new URL(page.url()).searchParams;
}
