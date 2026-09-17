import { APIResponse, Browser, BrowserContext, expect, Locator, Page, Response, test } from '@playwright/test';

import { ACCOUNT, PEOPLE, SECTIONS, WATCHER_ROLE } from '../stand/stand.mjs';
import { pageQa, qa, rowsOf, SECTION, signIn } from './support/admin';
import { expectScreen } from './support/shot';

/**
 * Раздел ролей и панель прав пользователя.
 *
 * Юниты проверяют разбор полей, отказы приёмника и то, что кнопка с меню прячутся без права;
 * здесь — путь человека целиком: от строки списка ролей до входа записью, которой роль и личные
 * права выданы с экрана, и до того, какие разделы она после этого видит.
 *
 * Сцены идут одна за другой и наследуют состояние: роль, заведённая в одной, правится и
 * назначается в следующих. Строки засева не трогаются: заводится своя роль, ею же и
 * распоряжаются, а удаляется только заведённая для удаления.
 *
 * Идёт после набора людей: тот считает строки и время входа записи без роли, а здесь ей
 * назначается роль и ею входят.
 */
test.describe('раздел ролей', () => {
    const READER: string = 'Стенд читатель';
    const SPARE: string = 'Стенд лишняя';

    /** Строка списка ролей, найденная по имени роли. */
    function roleRow(page: Page, name: string): Locator {
        return page.locator(`[qa-dataid="${SECTION.roles.row}"]`).filter({ hasText: name });
    }

    /** Ячейка строки роли. */
    function roleCell(page: Page, name: string, cell: string): Locator {
        return roleRow(page, name).locator(`[qa-dataid="roles-cell-${cell}"]`);
    }

    /** Открыть меню строки роли. */
    async function openRoleMenu(page: Page, name: string): Promise<void> {
        const row: Locator = roleRow(page, name);

        await row.hover();
        await row.locator('[qa-dataid="menu-trigger"] button').click();
    }

    /** Открыть меню строки человека. */
    async function openPersonMenu(page: Page, name: string): Promise<void> {
        const row: Locator = page.locator(`[qa-dataid="${SECTION.people.row}"]`).filter({ hasText: name });

        await row.hover();
        await row.locator('[qa-dataid="menu-trigger"] button').click();
    }

    /** Флажок права в панели роли: сам переключатель, по которому читается состояние. */
    function rightBox(page: Page, right: string): Locator {
        return qa(page, `role-right-${right}`).locator('[qa-dataid="checkbox-control"]');
    }

    /** Выбрать слово о праве в панели прав человека. */
    async function pickWord(page: Page, right: string, word: string): Promise<void> {
        await qa(page, `person-access-word-${right}`).click();
        await page.getByRole('option', { name: word, exact: true }).click();
    }

    /** Исход по праву в панели прав человека: «есть» или «нет». */
    function outcome(page: Page, right: string): Locator {
        return qa(page, `person-access-outcome-${right}`);
    }

    /** Открыть панель прав человека из списка людей. */
    async function openAccess(page: Page, name: string): Promise<void> {
        await page.goto(SECTIONS.people);
        await signIn(page);
        await openPersonMenu(page, name);
        await qa(page, 'people-access').click();
        await expect(qa(page, 'person-access-panel')).toBeVisible();
        expect(decodeURIComponent(page.url())).toContain(`ro:people/${name}/access`);
    }

    /**
     * Вход в новом окне браузера другой записью: своя кука, чужой вход не трогается.
     *
     * Исход читается по ответу операции входа, а не по уходу с экрана: записи без единого права
     * не открыт ни один раздел, и после удавшегося входа она остаётся на том же адресе.
     */
    async function signedInContext(
        browser: Browser,
        account: { readonly name: string; readonly password: string }
    ): Promise<BrowserContext> {
        const context: BrowserContext = await browser.newContext();
        const page: Page = await context.newPage();

        await page.goto(SECTIONS.postmortems);
        await qa(page, 'sign-in-name').locator('input').fill(account.name);
        await qa(page, 'sign-in-password').locator('input').fill(account.password);

        const [answer]: [APIResponse | Response, void] = await Promise.all([
            page.waitForResponse((response: Response): boolean => response.url().endsWith('/api/auth/login')),
            qa(page, 'sign-in-submit').click(),
        ]);

        expect(answer.status()).toBeLessThan(400);

        return context;
    }

    test('SC-MB-371 — список ролей: имя, права словами и число людей у каждой', async ({ page }: { page: Page }) => {
        await page.goto(SECTIONS.roles);
        await signIn(page);

        await expect(page.getByRole('heading', { name: SECTION.roles.title })).toBeVisible();
        await expect(rowsOf(page, 'roles')).toHaveCount(2);
        await expect(qa(page, 'pagination-range')).toContainText('из 2');
        await expect(pageQa(page, 'roles', 'columns')).toBeVisible();
        await expect(qa(page, 'roles-create')).toBeVisible();

        // Права стоят словами шапки, а не именами из набора: имя права человеку не показывается
        await expect(roleCell(page, 'Владелец', 'rights')).toContainText('Пользователи — правка');
        await expect(roleCell(page, 'Владелец', 'rights')).toContainText('Роли — правка');
        await expect(roleCell(page, 'Владелец', 'rights')).not.toContainText('roles:manage');
        await expect(roleCell(page, 'Владелец', 'people')).toHaveText('1');

        await expect(roleCell(page, WATCHER_ROLE, 'rights')).toContainText('Разборы происшествий — чтение');
        await expect(roleCell(page, WATCHER_ROLE, 'rights')).not.toContainText('Пользователи');
        // Наблюдатель и отключённый: отключённая запись роль держит по-прежнему
        await expect(roleCell(page, WATCHER_ROLE, 'people')).toHaveText('2');

        await expectScreen(page, 'roles-list');
    });

    test('SC-MB-372 — без права `roles:manage` пункта раздела нет и адрес не открывается', async ({ page }: { page: Page }) => {
        await page.goto(SECTIONS.roles);
        await signIn(page, PEOPLE.watcher);

        // Сперва положительное: разделы, право на которые у наблюдателя есть, на месте
        await expect(page.locator(`[qa-dataid="header-nav-item"][data-id="${SECTIONS.postmortems}"]`)).toBeVisible();
        await expect(page.locator(`[qa-dataid="header-nav-item"][data-id="${SECTIONS.roles}"]`)).toHaveCount(0);

        await expect(page).not.toHaveURL(new RegExp(`${SECTIONS.roles}$`));
        await expect(qa(page, SECTION.roles.table)).toHaveCount(0);

        // Прямой запрос тем же вошедшим отвечает «не для вас», а не пустой страницей
        const refused: APIResponse = await page.request.get(`/api/roles`);

        expect(refused.status()).toBe(403);
    });

    test('SC-MB-373 — заведение из панели: роль в списке сразу с правами словами и без людей', async ({ page }: { page: Page }) => {
        await page.goto(SECTIONS.roles);
        await signIn(page);
        await qa(page, 'roles-create').click();

        await expect(qa(page, 'role-panel')).toBeVisible();
        expect(page.url()).toContain('ro:roles/new');

        // Перезагрузка панель не гасит: она живёт адресом, а не вызовом
        await page.reload();
        await expect(qa(page, 'role-panel')).toBeVisible();

        await qa(page, 'role-name').locator('input').fill(READER);
        await rightBox(page, 'postmortems:read').click();
        await expect(rightBox(page, 'postmortems:read')).toHaveAttribute('aria-checked', 'true');
        await qa(page, 'role-submit').click();

        await expect(qa(page, 'role-panel')).toHaveCount(0);
        await expect(qa(page, 'toast-message')).toContainText('заведена');
        await expect(rowsOf(page, 'roles')).toHaveCount(3);
        await expect(roleCell(page, READER, 'rights')).toHaveText('Разборы происшествий — чтение');
        await expect(roleCell(page, READER, 'people')).toHaveText('0');
    });

    test('SC-MB-374 — панель роли показывает её состав, а правка меняет права в строке', async ({ page }: { page: Page }) => {
        await page.goto(SECTIONS.roles);
        await signIn(page);
        await openRoleMenu(page, READER);
        await qa(page, 'roles-edit').click();

        await expect(qa(page, 'role-panel')).toBeVisible();
        expect(decodeURIComponent(page.url())).toContain(`ro:roles/${READER.toLowerCase()}`);
        await expect(qa(page, 'role-name').locator('input')).toHaveValue(READER);
        await expect(rightBox(page, 'postmortems:read')).toHaveAttribute('aria-checked', 'true');
        await expect(rightBox(page, 'proposals:read')).toHaveAttribute('aria-checked', 'false');

        await rightBox(page, 'proposals:read').click();
        await qa(page, 'role-submit').click();

        await expect(qa(page, 'role-panel')).toHaveCount(0);
        await expect(qa(page, 'toast-message')).toContainText('сохранена');
        await expect(roleCell(page, READER, 'rights')).toHaveText('Разборы происшествий — чтение, Предложения — чтение');
    });

    test('SC-MB-375 — занятое имя отбивается по приведённому виду, а введённое остаётся в поле', async ({ page }: { page: Page }) => {
        await page.goto(SECTIONS.roles);
        await signIn(page);
        await qa(page, 'roles-create').click();

        await qa(page, 'role-name').locator('input').fill('ВЛАДЕЛЕЦ');
        await qa(page, 'role-submit').click();

        await expect(qa(page, 'role-fault')).toContainText('занято');
        await expect(qa(page, 'role-name').locator('input')).toHaveValue('ВЛАДЕЛЕЦ');
        await expect(qa(page, 'role-panel')).toBeVisible();
        await expect(rowsOf(page, 'roles')).toHaveCount(3);
    });

    test('SC-MB-376 — свободная роль удаляется после вопроса, а роль, которую держат, — нет', async ({ page }: { page: Page }) => {
        await page.goto(SECTIONS.roles);
        await signIn(page);
        await qa(page, 'roles-create').click();
        await qa(page, 'role-name').locator('input').fill(SPARE);
        await qa(page, 'role-submit').click();

        await expect(qa(page, 'role-panel')).toHaveCount(0);
        await expect(roleCell(page, SPARE, 'rights')).toHaveText('Ни одного права');

        await openRoleMenu(page, SPARE);
        await qa(page, 'roles-delete').click();

        await expect(qa(page, 'menu-confirm-message')).toContainText(SPARE);
        await qa(page, 'menu-confirm-accept').click();

        // Уведомление о заведении ещё висит рядом: ищется то, что говорит об удалении
        await expect(page.locator('[qa-dataid="toast-message"]', { hasText: 'удалена' })).toBeVisible();
        await expect(roleRow(page, SPARE)).toHaveCount(0);
        await expect(rowsOf(page, 'roles')).toHaveCount(3);

        // У роли, которую держат, пункта удаления нет, а прямой запрос отвечает причиной с числом
        await openRoleMenu(page, 'Владелец');
        await expect(qa(page, 'roles-edit')).toBeVisible();
        await expect(qa(page, 'roles-delete')).toHaveCount(0);

        const refused: APIResponse = await page.request.delete(`/api/roles/owner`);

        expect(refused.status()).toBe(409);
        expect(((await refused.json()) as { message: string }).message).toContain('держат');
    });

    test('SC-MB-377 — панель прав записи без роли: «Без роли», всё «По роли» и исход «нет»', async ({ page }: { page: Page }) => {
        await openAccess(page, PEOPLE.roleless.name);

        await expect(qa(page, 'person-access-header')).toContainText(PEOPLE.roleless.name);
        await expect(qa(page, 'person-access-role')).toContainText('Без роли');
        await expect(qa(page, 'person-access-word-postmortems:read')).toContainText('По роли');
        await expect(outcome(page, 'postmortems:read')).toHaveText('нет');
        await expect(outcome(page, 'roles:manage')).toHaveText('нет');

        await expectScreen(page, 'person-access-panel');
    });

    test('SC-MB-378 — роль и личные слова дают ровно те разделы: исход виден до сохранения, а после входа — в шапке', async ({
        page,
        browser,
    }: {
        page: Page;
        browser: Browser;
    }) => {
        await openAccess(page, PEOPLE.roleless.name);

        // Роль даёт два права — и исход по обоим меняется сразу, до сохранения
        await qa(page, 'person-access-role').click();
        await page.getByRole('option', { name: READER, exact: true }).click();

        await expect(outcome(page, 'postmortems:read')).toHaveText('есть');
        await expect(outcome(page, 'proposals:read')).toHaveText('есть');
        await expect(outcome(page, 'usage:read')).toHaveText('нет');

        // Отнятое поверх роли уходит, данное поверх роли приходит
        await pickWord(page, 'proposals:read', 'Отнято');
        await expect(outcome(page, 'proposals:read')).toHaveText('нет');

        await pickWord(page, 'usage:read', 'Дано');
        await expect(outcome(page, 'usage:read')).toHaveText('есть');

        await qa(page, 'person-access-submit').click();

        await expect(qa(page, 'person-access-panel')).toHaveCount(0);
        await expect(qa(page, 'toast-message')).toContainText('сохранены');
        await expect(
            page
                .locator(`[qa-dataid="${SECTION.people.row}"]`)
                .filter({ hasText: PEOPLE.roleless.name })
                .locator('[qa-dataid="people-cell-role"]')
        ).toHaveText(READER);

        // Роль держат: строка списка ролей считает записи заново
        await page.goto(SECTIONS.roles);
        await expect(roleCell(page, READER, 'people')).toHaveText('1');

        // Вошедшая запись видит ровно два раздела: разборы по роли и использование по личному
        // праву; предложения отняты
        const fresh: BrowserContext = await signedInContext(browser, PEOPLE.roleless);
        const freshPage: Page = fresh.pages()[0];

        await expect(qa(freshPage, 'header-nav-item')).toHaveCount(2);
        await expect(freshPage.locator(`[qa-dataid="header-nav-item"][data-id="${SECTIONS.postmortems}"]`)).toBeVisible();
        await expect(freshPage.locator(`[qa-dataid="header-nav-item"][data-id="${SECTIONS.usage}"]`)).toBeVisible();
        await expect(freshPage.locator(`[qa-dataid="header-nav-item"][data-id="${SECTIONS.proposals}"]`)).toHaveCount(0);
        await fresh.close();
    });

    test('SC-MB-382 — без входа операции над ролями отвечают «не представились»', async ({ page }: { page: Page }) => {
        const anonymous: APIResponse = await page.request.post(`/api/roles`, { data: { name: 'x', rights: [] } });

        expect(anonymous.status()).toBe(401);

        const access: APIResponse = await page.request.get(`/api/accounts/${encodeURIComponent(ACCOUNT.name)}/access`);

        expect(access.status()).toBe(401);
    });
});
