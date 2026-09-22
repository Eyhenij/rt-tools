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

/**
 * Имя раздела. Три раздела груза собраны одним и тем же списочным экраном; раздел использования
 * — тем же, с отбором по периоду и панелью сессий вместо панели подробностей; приглашения — тем
 * же, но без отбора по дереву и без панели: приглашение ждёт дерева, которого ещё нет. Люди и
 * роли не имеют ни отбора, ни панели подробностей: их панели правят и открываются кнопкой и
 * меню строки, а не нажатием на строку.
 */
export type TSectionName = 'postmortems' | 'proposals' | 'summaries' | 'usage' | 'invites' | 'people' | 'roles' | 'chat';

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
        title: 'Сводки проектов',
        prefix: 'summaries',
        table: 'summaries-table',
        row: 'summaries-row',
        details: 'month-record-details-close',
    }),
    chat: Object.freeze({
        path: SECTIONS.chat,
        title: 'Чат',
        prefix: 'chat',
        table: 'chat-talks',
        row: 'chat-talk',
        details: 'chat-feed',
    }),
    usage: Object.freeze({
        path: SECTIONS.usage,
        title: 'Использование',
        prefix: 'usage',
        table: 'usage-table',
        row: 'usage-row',
        details: 'usage-sessions-close',
    }),
    invites: Object.freeze({
        path: SECTIONS.invites,
        title: 'Приглашения',
        prefix: 'invites',
        table: 'invites-table',
        row: 'invites-row',
        // Панели подробностей у приглашения нет: всё известное о нём стоит в строке. Метка
        // объявлена пустой, а не выдуманной, — по выдуманной спека искала бы то, чего нет, и
        // молча ничего не находила.
        details: '',
    }),
    people: Object.freeze({
        path: SECTIONS.people,
        title: 'Пользователи',
        prefix: 'people',
        table: 'people-table',
        row: 'people-row',
        // Панели подробностей у человека нет: всё известное о нём стоит в строке, а панели
        // заведения, пароля и прав правят и открываются кнопкой и меню строки.
        details: '',
    }),
    roles: Object.freeze({
        path: SECTIONS.roles,
        title: 'Роли',
        prefix: 'roles',
        table: 'roles-table',
        row: 'roles-row',
        // Панели подробностей у роли нет: строка несёт её целиком, а панель роли правит.
        details: '',
    }),
});

/**
 * Прямоугольник узла на экране.
 *
 * Playwright отдаёт пустоту, когда узла на экране нет, и спека сверяет это отдельно: измерение
 * пустоты молча читалось бы нулями и сходилось бы с любым обещанием о раскладке.
 */
export interface IBox {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
}

/** Узел по метке проверки: ею размечены все места, за которые набор держится. */
export function qa(page: Page, id: string): Locator {
    return page.locator(`[qa-dataid="${id}"]`);
}

/**
 * Значение свойства в панели подробностей.
 *
 * Метка панели стоит на строке свойства целиком, а название и значение внутри неё размечает
 * кит: взятая строкой, она читалась бы вместе с названием.
 */
export function detailValue(page: Page, id: string): Locator {
    return qa(page, id).locator('[qa-dataid="detail-row-value"]');
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
 * Пара входа: имя записи и её пароль.
 *
 * Названа не так, как то же самое зовётся в домене входа админки, и намеренно: набор в либы
 * приложения не смотрит — он говорит с ним по сети, как человек. Одно имя на два объявления
 * прочиталось бы общим типом, которого нет, и проверка повторов отбивает его прямо на пуше.
 */
export interface IStandSignInPair {
    readonly name: string;
    readonly password: string;
}

/**
 * Вход парой стенда.
 *
 * Ждёт ухода с экрана входа: форма отвечает не мгновенно, и следующий шаг, начатый раньше,
 * читает ещё старую страницу.
 *
 * Пара приезжает доводом, а умолчание — запись самого набора: у неё права на все разделы, и ею
 * идёт весь набор, кроме проверок того, что видит человек без права.
 */
export async function signIn(page: Page, account: IStandSignInPair = ACCOUNT): Promise<void> {
    await qa(page, 'sign-in-name').locator('input').fill(account.name);
    await qa(page, 'sign-in-password').locator('input').fill(account.password);
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

/** Выбрать состояние в отборе. Пустое имя — «Все состояния», то есть снять отбор. */
export async function pickState(page: Page, name: string): Promise<void> {
    await qa(page, 'list-state-filter').click();
    await page.getByRole('option', { name, exact: true }).click();
}

/** Выбрать версию выпуска в отборе. Пустое имя — «Все версии», то есть снять отбор. */
export async function pickVersion(page: Page, name: string): Promise<void> {
    await qa(page, 'list-version-filter').click();
    await page.getByRole('option', { name, exact: true }).click();
}

/**
 * Назвать день в одном из двух полей отбора по периоду.
 *
 * Поле — нативный выбор дня, и значение в него кладётся строкой той же формы, какой день читает
 * приёмник: нажимать по календарю браузера набор не умеет, а строка приходит тем же событием.
 */
export async function pickDay(page: Page, field: 'from' | 'to', day: string): Promise<void> {
    await qa(page, `list-period-${field}`).locator('input').fill(day);
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
