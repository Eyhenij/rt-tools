import { expect, Page, Request, test } from '@playwright/test';

import { SECTIONS } from '../stand/stand.mjs';
import { openSection, qa, SECTION, SIGN_IN_PATH, signIn } from './support/admin';
import { expectScreen } from './support/shot';

/**
 * Оболочка админки: разделы верхним рядом, попап профиля, тема и язык.
 *
 * Всё здесь — то, что человек видит и трогает: подсветка пункта, попап под именем вошедшего,
 * тёмный экран, английские подписи кита. Юниты те же решения проверяют вызовом, но между верным
 * решением и увиденным лежит вся отрисовка — она и проверяется тут.
 */
test.describe('оболочка админки', () => {
    test('SC-MB-307 — вошедшему на стенде открыты все разделы: роль засева даёт все права', async ({ page }: { page: Page }) => {
        // Разделы приходят по праву, и запись без роли не увидела бы ни одного. Набор проверяет
        // разделы, а не права: само сложение прав проверяется вызовом, спеками приёмника.
        await openSection(page, 'postmortems');

        await expect(qa(page, 'header-nav-item')).toHaveCount(Object.keys(SECTIONS).length);
        await expect(qa(page, 'container-no-sections')).toHaveCount(0);
    });

    test('SC-MB-142 — разделы стоят верхним рядом, а колонки с ними слева нет', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems');

        await expect(qa(page, 'container-header')).toBeVisible();
        await expect(page.locator('rt-section-nav')).toHaveCount(0);
        await expect(qa(page, 'header-nav-item')).toHaveCount(Object.keys(SECTIONS).length);

        await expectScreen(page, 'shell');
    });

    test('SC-MB-143 — подсвечен тот пункт, чей раздел открыт, и после перехода, и по прямой ссылке', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems');

        const active: string = 'rt-page-header__link--is-active';

        await expect(page.locator(`[qa-dataid="header-nav-item"][data-id="${SECTION.postmortems.path}"] a.${active}`)).toBeVisible();

        await page.locator(`[qa-dataid="header-nav-item"][data-id="${SECTION.proposals.path}"] a`).click();
        await expect(page).toHaveURL(new RegExp(`${SECTION.proposals.path}$`));

        await expect(page.locator(`[qa-dataid="header-nav-item"][data-id="${SECTION.proposals.path}"] a.${active}`)).toBeVisible();
        await expect(page.locator(`[qa-dataid="header-nav-item"][data-id="${SECTION.postmortems.path}"] a.${active}`)).toHaveCount(0);
    });

    test('SC-MB-145 — нажатие на профиль открывает попап, а не выходит', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems');

        await qa(page, 'header-user-menu').click();

        await expect(qa(page, 'profile-menu')).toBeVisible();
        await expect(qa(page, 'profile-name')).toBeVisible();
        await expect(page).toHaveURL(new RegExp(`${SECTION.postmortems.path}$`));

        // указатель остаётся на кнопке: попап профиля кит открывает наведением и от увода закрывает
        await expectScreen(page, 'shell-profile-menu', { keepPointer: true });
    });

    test('SC-MB-146 — выход идёт из попапа и уводит на экран входа', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems');

        await qa(page, 'header-user-menu').click();
        await qa(page, 'profile-sign-out').click();

        await expect(page).toHaveURL(new RegExp(`${SIGN_IN_PATH}\\b`));
        await expect(qa(page, 'sign-in-submit')).toBeVisible();
    });

    test('SC-MB-147 — тема переключается в попапе и переживает перезагрузку', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems');

        await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

        await qa(page, 'header-user-menu').click();
        await qa(page, 'profile-theme').locator('button').click();

        await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

        await page.reload();

        await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

        await expectScreen(page, 'shell-dark');
    });

    test('SC-MB-150 — язык выбирается в попапе профиля и переживает перезагрузку', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems');

        await qa(page, 'header-user-menu').click();
        await qa(page, 'profile-language').locator('[qa-dataid="toggle-button-group-option"][data-value="en"]').click();

        // У подписи «строк на странице» своего якоря кит не ставит — берём её классом блока
        await expect(page.locator('.rt-pagination__per-page-label')).toHaveText(/Per page/);

        await page.reload();
        await expect(qa(page, SECTION.postmortems.table)).toBeVisible();

        await qa(page, 'header-user-menu').click();
        const chosen: ReturnType<Page['locator']> = qa(page, 'profile-language').locator(
            '[qa-dataid="toggle-button-group-option"][data-value="en"]'
        );

        await expect(chosen).toHaveAttribute('aria-pressed', 'true');
    });

    test('SC-MB-404 — переключение языка меняет и подписи админки, и подписи кита, без перезагрузки', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems');

        // Метка на окне переживает переключение и не переживает перезагрузку: ею и проверяется,
        // что страницу никто не перезагружал.
        await page.evaluate((): void => {
            (window as unknown as Record<string, boolean>)['rtSameLoad'] = true;
        });

        // Сначала положительная половина: место, за которое держится проба, найдено и говорит
        // по-русски. Без неё проба осталась бы зелёной и на переименованной метке.
        await expect(qa(page, 'admin-brand')).toHaveText('Приёмник');
        await expect(qa(page, 'header-nav-item').first()).toContainText(SECTION.postmortems.title);

        await qa(page, 'header-user-menu').click();
        await qa(page, 'profile-language').locator('[qa-dataid="toggle-button-group-option"][data-value="en"]').click();

        // Подписи админки
        await expect(qa(page, 'admin-brand')).toHaveText('Message bus');
        await expect(qa(page, 'header-nav-item').first()).toContainText('Incident analyses');

        // Подписи кита: своего якоря у подписи «строк на странице» он не ставит — берём её классом
        await expect(page.locator('.rt-pagination__per-page-label')).toHaveText(/Per page/);

        expect(await page.evaluate((): boolean => (window as unknown as Record<string, boolean>)['rtSameLoad'] === true)).toBe(true);
    });

    test('SC-MB-405 — выбор языка переживает перезагрузку и не уходит на сервер', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems');

        await qa(page, 'header-user-menu').click();
        await qa(page, 'profile-language').locator('[qa-dataid="toggle-button-group-option"][data-value="en"]').click();
        await expect(qa(page, 'admin-brand')).toHaveText('Message bus');

        const asked: string[] = [];

        page.on('request', (request: Request): void => {
            asked.push(`${request.url()} ${request.postData() ?? ''}`);
        });

        await page.reload();
        await expect(qa(page, SECTION.postmortems.table)).toBeVisible();

        // Выбор пережил перезагрузку: подписи остались английскими
        await expect(qa(page, 'admin-brand')).toHaveText('Message bus');

        // Сначала положительная половина: запросы к приёмнику вообще были — иначе «про язык не
        // спрашивали» осталось бы зелёным и на странице, не сходившей в сеть ни разу.
        expect(asked.some((call: string): boolean => call.includes('/api/'))).toBe(true);
        expect(asked.filter((call: string): boolean => /locale|lang(uage)?=/i.test(call))).toEqual([]);
    });

    test('SC-MB-152 — заголовок вкладки называет приложение, а не проект сборки', async ({ page }: { page: Page }) => {
        await page.goto(SIGN_IN_PATH);
        await expect(qa(page, 'sign-in-submit')).toBeVisible();

        await expect(page).toHaveTitle(/Приёмник$/);

        await signIn(page);
        await expect(qa(page, SECTION.postmortems.table)).toBeVisible();

        await expect(page).toHaveTitle(`${SECTION.postmortems.title} · Приёмник`);
    });
});
