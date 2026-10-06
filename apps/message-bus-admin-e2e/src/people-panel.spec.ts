import { APIResponse, Browser, BrowserContext, expect, Locator, Page, test } from '@playwright/test';

import { ACCOUNT, PEOPLE, SECTIONS } from '../stand/stand.mjs';
import { bearerOf, pageQa, qa, SECTION, signIn } from './support/admin';
import { expectScreen } from './support/shot';

/**
 * Правки над людьми с экрана: заведение, новый пароль, отключение.
 *
 * Юниты проверяют вызовом и разбор полей, и отказы приёмника, и то, что кнопка с меню прячутся без
 * права; здесь проверяется путь человека — от кнопки над списком до отключённой строки. Входят
 * люди через Keycloak, и запись раздела людей на вход не влияет.
 *
 * Идёт после набора списка людей: тот считает строки стенда, а здесь их становится на одну
 * больше. Заведённая запись — своя: её пароль меняется и её же отключают, и ни одна строка засева
 * не трогается.
 *
 * Прямые запросы к операциям идут через запросы страницы — с тем же токеном, что и экран: отказ по
 * праву и отказ своей записи из панели не увидеть, а обещаны они приёмником.
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
            headers: await bearerOf(page),
            data: { name: 'Стенд без пароля', password: '' },
        });

        expect(answer.status()).toBe(400);
        expect(((await answer.json()) as { message: string }).message).toContain('пароль');
        await expect(personRow(page, 'Стенд без пароля')).toHaveCount(0);
    });

    test('SC-MB-364 — новый пароль из панели сохраняется, и панель говорит об этом', async ({ page }: { page: Page }) => {
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
        await expect(page.locator('body')).not.toContainText(NEXT_PASSWORD);
    });

    test('SC-MB-366 — своя строка отключения не получает, а прямой запрос отвечает причиной', async ({ page }: { page: Page }) => {
        await page.goto(SECTIONS.people);
        await signIn(page);
        await openRowMenu(page, ACCOUNT.name);

        // Сперва положительное: пункт пароля у своей строки есть, и только потом — отсутствие
        // отключения
        await expect(qa(page, 'people-password')).toBeVisible();
        await expect(qa(page, 'people-disable')).toHaveCount(0);

        const answer: APIResponse = await page.request.post(`/api/accounts/${encodeURIComponent(ACCOUNT.name)}/disable`, {
            headers: await bearerOf(page),
        });

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
        const watcher: BrowserContext = await browser.newContext();
        const watcherPage: Page = await watcher.newPage();

        await watcherPage.goto(SECTIONS.postmortems);
        await signIn(watcherPage, PEOPLE.watcher);

        const refused: APIResponse = await watcherPage.request.post(`/api/accounts`, {
            headers: await bearerOf(watcherPage),
            data: { name: 'x', password: 'y' },
        });

        expect(refused.status()).toBe(403);
        await watcher.close();
    });

    test('SC-MB-365, SC-MB-367 — отключение спрашивает и помечает запись, второе отключение и незнакомое имя отбиваются', async ({
        page,
    }: {
        page: Page;
    }) => {
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

        // Второе отключение и незнакомое имя — два разных отказа
        const headers: Record<string, string> = await bearerOf(page);
        const twice: APIResponse = await page.request.post(`/api/accounts/${encodeURIComponent(NEWCOMER.name)}/disable`, { headers });
        const nobody: APIResponse = await page.request.post(`/api/accounts/${encodeURIComponent('Стенд никто')}/disable`, { headers });

        expect(twice.status()).toBe(409);
        expect(nobody.status()).toBe(404);
    });
});
