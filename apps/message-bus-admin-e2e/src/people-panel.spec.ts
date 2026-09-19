import { APIResponse, Browser, BrowserContext, expect, Locator, Page, Response, test } from '@playwright/test';

import { ACCOUNT, PEOPLE, SECTIONS } from '../stand/stand.mjs';
import { pageQa, qa, SECTION, signIn, SIGN_IN_PATH } from './support/admin';
import { expectScreen } from './support/shot';

/**
 * Правки над людьми с экрана: заведение, новый пароль, отключение.
 *
 * Юниты проверяют вызовом и разбор полей, и отказы приёмника, и то, что кнопка с меню прячутся без
 * права; здесь проверяется путь человека целиком — от кнопки над списком до входа заведённой
 * записью и до отказа во входе отключённой.
 *
 * Идёт после набора списка людей: тот считает строки стенда, а здесь их становится на одну
 * больше. Заведённая запись — своя: её пароль меняется, ею входят и её же отключают, и ни одна
 * строка засева не трогается.
 *
 * Прямые запросы к операциям идут через запросы страницы — с той же кукой входа, что и экран:
 * отказ по праву и отказ своей записи из панели не увидеть, а обещаны они приёмником.
 */
test.describe('правки над людьми', () => {
    const NEWCOMER: { readonly name: string; readonly password: string } = { name: 'Стенд новичок', password: 'nabor-e2e-newcomer' };
    const NEXT_PASSWORD: string = 'nabor-e2e-newcomer-2';

    /** Строка списка, найденная по имени человека. */
    function personRow(page: Page, name: string): Locator {
        return page.locator(`[qa-dataid="${SECTION.people.row}"]`).filter({ hasText: name });
    }

    /** Открыть меню строки человека. */
    async function openRowMenu(page: Page, name: string): Promise<void> {
        const row: Locator = personRow(page, name);

        await row.hover();
        await row.locator('[qa-dataid="menu-trigger"] button').click();
    }

    /**
     * Вход в новом окне браузера парой заведённой записи: своя кука, чужой вход не трогается.
     *
     * Исход читается по ответу операции входа, а не по уходу с экрана: у заведённой записи роли
     * нет, ей не открыт ни один раздел, и после удавшегося входа она остаётся на том же адресе.
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

    test('SC-MB-361 — заведение из панели: строка в списке сразу, панель закрыта, пароль не показан', async ({ page }: { page: Page }) => {
        await page.goto(SECTIONS.people);
        await signIn(page);

        // Сперва положительное: кнопка раздела найдена и стоит рядом с общими кнопками страницы
        await expect(qa(page, 'people-create')).toBeVisible();
        await expect(pageQa(page, 'people', 'refresh')).toBeVisible();

        await qa(page, 'people-create').click();

        await expect(qa(page, 'person-create-panel')).toBeVisible();
        expect(page.url()).toContain('ro:people/new');

        // Перезагрузка панель не гасит: она живёт адресом, а не вызовом
        await page.reload();
        await expect(qa(page, 'person-create-panel')).toBeVisible();

        await expectScreen(page, 'people-create-panel');

        await qa(page, 'person-create-name').locator('input').fill(NEWCOMER.name);
        await qa(page, 'person-create-password').locator('input').fill(NEWCOMER.password);
        await qa(page, 'person-create-submit').click();

        await expect(qa(page, 'person-create-panel')).toHaveCount(0);
        await expect(qa(page, 'toast-message')).toContainText('заведён');

        const created: Locator = personRow(page, NEWCOMER.name);

        await expect(created.locator('[qa-dataid="people-cell-role"]')).toHaveText('Роли нет');
        await expect(created.locator('[qa-dataid="people-cell-state"]')).toHaveText('Действует');
        await expect(created.locator('[qa-dataid="people-cell-last-login"]')).toHaveText('Не входили');
        await expect(page.locator('body')).not.toContainText(NEWCOMER.password);
    });

    test('SC-MB-362 — занятое имя отбивается с названной причиной, а введённое остаётся в поле', async ({ page }: { page: Page }) => {
        await page.goto(SECTIONS.people);
        await signIn(page);
        await qa(page, 'people-create').click();

        await qa(page, 'person-create-name').locator('input').fill(PEOPLE.roleless.name.toUpperCase());
        await qa(page, 'person-create-password').locator('input').fill('любой');
        await qa(page, 'person-create-submit').click();

        await expect(qa(page, 'person-create-fault')).toContainText('занято');
        await expect(qa(page, 'person-create-name').locator('input')).toHaveValue(PEOPLE.roleless.name.toUpperCase());
        await expect(qa(page, 'person-create-panel')).toBeVisible();
        await expect(personRow(page, PEOPLE.roleless.name)).toHaveCount(1);
    });

    test('SC-MB-363 — пустой пароль отбивается словами о пароле, и запись не заводится', async ({ page }: { page: Page }) => {
        await page.goto(SECTIONS.people);
        await signIn(page);

        const answer: APIResponse = await page.request.post(`/api/accounts`, {
            data: { name: 'Стенд без пароля', password: '' },
        });

        expect(answer.status()).toBe(400);
        expect(((await answer.json()) as { message: string }).message).toContain('пароль');
        await expect(personRow(page, 'Стенд без пароля')).toHaveCount(0);
    });

    test('SC-MB-364 — новый пароль из панели: новым входят, прежний не принимается', async ({
        page,
        browser,
    }: {
        page: Page;
        browser: Browser;
    }) => {
        await page.goto(SECTIONS.people);
        await signIn(page);
        await openRowMenu(page, NEWCOMER.name);
        await qa(page, 'people-password').click();

        await expect(qa(page, 'person-password-panel')).toBeVisible();
        await expect(qa(page, 'person-password-for')).toContainText(NEWCOMER.name);
        expect(decodeURIComponent(page.url())).toContain(`ro:people/${NEWCOMER.name}/password`);

        await qa(page, 'person-password-field').locator('input').fill(NEXT_PASSWORD);
        await qa(page, 'person-password-submit').click();

        await expect(qa(page, 'person-password-panel')).toHaveCount(0);
        await expect(qa(page, 'toast-message')).toContainText('сменён');

        // Сперва положительное: новым паролем вход состоялся — иначе отказ прежнему зеленел бы и у
        // записи, которой не войти никак
        const fresh: BrowserContext = await signedInContext(browser, { name: NEWCOMER.name, password: NEXT_PASSWORD });

        await fresh.close();

        const stale: BrowserContext = await browser.newContext();
        const stalePage: Page = await stale.newPage();

        await stalePage.goto(SECTIONS.postmortems);
        await qa(stalePage, 'sign-in-name').locator('input').fill(NEWCOMER.name);
        await qa(stalePage, 'sign-in-password').locator('input').fill(NEWCOMER.password);
        await qa(stalePage, 'sign-in-submit').click();

        await expect(qa(stalePage, 'sign-in-fault')).toBeVisible();
        await stale.close();
    });

    test('SC-MB-366 — своя строка отключения не получает, а прямой запрос отвечает причиной', async ({ page }: { page: Page }) => {
        await page.goto(SECTIONS.people);
        await signIn(page);
        await openRowMenu(page, ACCOUNT.name);

        // Сперва положительное: пункт пароля у своей строки есть, и только потом — отсутствие
        // отключения
        await expect(qa(page, 'people-password')).toBeVisible();
        await expect(qa(page, 'people-disable')).toHaveCount(0);

        const answer: APIResponse = await page.request.post(`/api/accounts/${encodeURIComponent(ACCOUNT.name)}/disable`);

        expect(answer.status()).toBe(409);
        expect(((await answer.json()) as { message: string }).message).toContain('свою');
    });

    test('SC-MB-369 — без входа операции отвечают «не представились», без права — «не для вас»', async ({
        page,
        browser,
    }: {
        page: Page;
        browser: Browser;
    }) => {
        const anonymous: APIResponse = await page.request.post(`/api/accounts`, { data: { name: 'x', password: 'y' } });

        expect(anonymous.status()).toBe(401);

        // Наблюдатель вошёл, но права на правку людей у него нет: отказ другой, и его не вылечить
        // входом
        const watcher: BrowserContext = await signedInContext(browser, PEOPLE.watcher);
        const watcherPage: Page = watcher.pages()[0];
        const refused: APIResponse = await watcherPage.request.post(`/api/accounts`, { data: { name: 'x', password: 'y' } });

        expect(refused.status()).toBe(403);
        await watcher.close();
    });

    test('SC-MB-365, SC-MB-367 — отключение спрашивает, обрывает вход, и запись больше не входит', async ({
        page,
        browser,
    }: {
        page: Page;
        browser: Browser;
    }) => {
        // Живой вход отключаемой записи — в своём окне: по нему видно, что обрыв дошёл до браузера
        const newcomer: BrowserContext = await signedInContext(browser, { name: NEWCOMER.name, password: NEXT_PASSWORD });
        const newcomerPage: Page = newcomer.pages()[0];

        // Сперва положительное: вход жив — иначе отказ после отключения зеленел бы и на входе,
        // которого не было
        expect((await newcomerPage.request.get(`/api/auth/session`)).status()).toBe(200);

        await page.goto(SECTIONS.people);
        await signIn(page);
        await openRowMenu(page, NEWCOMER.name);
        await qa(page, 'people-disable').click();

        // Вопрос называет запись и последствие, а не спрашивает «вы уверены»
        await expect(qa(page, 'menu-confirm-message')).toContainText(NEWCOMER.name);

        await qa(page, 'menu-confirm-cancel').click();

        await expect(personRow(page, NEWCOMER.name).locator('[qa-dataid="people-cell-state"]')).toHaveText('Действует');

        await qa(page, 'people-disable').click();
        await qa(page, 'menu-confirm-accept').click();

        await expect(personRow(page, NEWCOMER.name).locator('[qa-dataid="people-cell-state"]')).toHaveText('Отключена');
        await expect(personRow(page, NEWCOMER.name).locator('[qa-dataid="menu-trigger"]')).toHaveCount(0);
        await expect(qa(page, 'toast-message')).toContainText('отключён');

        // Живой вход оборван: тот же вопрос о вошедшем отвечает отказом входа
        expect((await newcomerPage.request.get(`/api/auth/session`)).status()).toBe(401);
        await newcomerPage.goto(SECTIONS.people);
        await expect(newcomerPage).toHaveURL(new RegExp(`${SIGN_IN_PATH}\\b`));

        await qa(newcomerPage, 'sign-in-name').locator('input').fill(NEWCOMER.name);
        await qa(newcomerPage, 'sign-in-password').locator('input').fill(NEXT_PASSWORD);
        await qa(newcomerPage, 'sign-in-submit').click();
        await expect(qa(newcomerPage, 'sign-in-fault')).toBeVisible();
        await newcomer.close();

        // Второе отключение и незнакомое имя — два разных отказа
        const twice: APIResponse = await page.request.post(`/api/accounts/${encodeURIComponent(NEWCOMER.name)}/disable`);
        const nobody: APIResponse = await page.request.post(`/api/accounts/${encodeURIComponent('Стенд никто')}/disable`);

        expect(twice.status()).toBe(409);
        expect(nobody.status()).toBe(404);
    });
});
