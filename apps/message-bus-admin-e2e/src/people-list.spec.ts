import { expect, Locator, Page, test } from '@playwright/test';

import { ACCOUNT, PEOPLE, SECTIONS, WATCHER_ROLE } from '../stand/stand.mjs';
import { columnTexts, qa, rowsOf, SECTION, signIn, sortBy } from './support/admin';

/**
 * Раздел людей: кто дотягивается до груза и жива ли его запись.
 *
 * Юнит экрана проверяет ту же четвёрку значений вызовом, но между верным решением и тем, что
 * человек его видит, лежит вся отрисовка — здесь проверяется она. И здесь же проверяется то, чего
 * вызовом не проверить вовсе: человек без права `accounts:read` не находит пункта в ряду разделов
 * и не попадает по адресу, набранному руками.
 *
 * Стенд засевает трёх людей помимо записи самого набора: наблюдателя с ролью не владельца,
 * отключённого и запись без роли, которой ни разу не входили. Значения строк ищутся по имени, а не
 * по месту в порядке: вход спеки про право пишет наблюдателю сегодняшнее время последнего входа, и
 * его место в порядке по умолчанию зависит от того, прошла эта спека или ещё нет.
 *
 * Кадра у раздела нет намеренно. Время последнего входа стоит колонкой, ширину столбцов таблица
 * раскладывает по содержимому, а у записи самого набора это время — минута прогона: закрепить его
 * нечем, и кадр расходился бы сам с собой каждый день.
 */
test.describe('раздел людей', () => {
    /** Строка списка, найденная по имени человека. */
    function personRow(page: Page, name: string): Locator {
        return page.locator(`[qa-dataid="${SECTION.people.row}"]`).filter({ hasText: name });
    }

    /** Значение ячейки в строке человека. */
    function personCell(page: Page, name: string, cell: string): Locator {
        return personRow(page, name).locator(`[qa-dataid="people-cell-${cell}"]`);
    }

    test('SC-MB-360 — список называет имя, роль, состояние и последний вход', async ({ page }: { page: Page }) => {
        await page.goto(SECTIONS.people);
        await signIn(page);

        await expect(page.getByRole('heading', { name: SECTION.people.title })).toBeVisible();
        await expect(qa(page, SECTION.people.table)).toBeVisible();
        await expect(rowsOf(page, 'people')).toHaveCount(4);

        const names: string[] = await columnTexts(page, 'people-cell-name');

        expect(new Set(names)).toEqual(new Set([ACCOUNT.name, PEOPLE.watcher.name, PEOPLE.disabled.name, PEOPLE.roleless.name]));

        // Действующая запись с ролью: роль названа своим именем, состояние — словом
        await expect(personCell(page, PEOPLE.watcher.name, 'role')).toHaveText(WATCHER_ROLE);
        await expect(personCell(page, PEOPLE.watcher.name, 'state')).toHaveText('Действует');

        // Время последнего входа показано днём и минутами в поясе смотрящего, а не строкой ответа.
        // Пробелы по краям ячейки нарочно допущены: образцом текста они не сводятся, как сводятся
        // строкой, а разметка ячейки кладёт значение с переносами.
        await expect(personCell(page, PEOPLE.disabled.name, 'last-login')).toHaveText(/^\s*\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}\s*$/);
    });

    test('SC-MB-360 — отключённая запись и запись без роли отдают свои пустоты словами, а не пропадают', async ({
        page,
    }: {
        page: Page;
    }) => {
        await page.goto(SECTIONS.people);
        await signIn(page);
        await expect(qa(page, SECTION.people.table)).toBeVisible();

        await expect(personCell(page, PEOPLE.disabled.name, 'state')).toHaveText('Отключена');

        // Пустая ячейка читалась бы дефектом экрана, поэтому обе пустоты названы словами
        await expect(personCell(page, PEOPLE.roleless.name, 'role')).toHaveText('Роли нет');
        await expect(personCell(page, PEOPLE.roleless.name, 'last-login')).toHaveText('Не входили');
        await expect(personCell(page, PEOPLE.roleless.name, 'state')).toHaveText('Действует');
    });

    test('SC-MB-360 — ни строка, ни её меню не нажимаются: раздел только читает', async ({ page }: { page: Page }) => {
        await page.goto(SECTIONS.people);
        await signIn(page);
        await expect(qa(page, SECTION.people.table)).toBeVisible();

        // Сперва положительное: строка найдена и показывает своё имя — иначе утверждение об
        // отсутствии меню было бы зелено и на пустом экране
        await expect(personCell(page, PEOPLE.roleless.name, 'name')).toHaveText(PEOPLE.roleless.name);
        await expect(qa(page, 'table-row-actions')).toHaveCount(0);

        await personRow(page, PEOPLE.roleless.name).click();

        // Панели подробностей у человека нет: адрес после нажатия остался адресом списка
        await expect(page).toHaveURL(new RegExp(`${SECTIONS.people}$`));
    });

    test('SC-MB-360 — порядок по умолчанию идёт последним входом, а невходившие уезжают в конец', async ({ page }: { page: Page }) => {
        await page.goto(SECTIONS.people);
        await signIn(page);
        await expect(qa(page, SECTION.people.table)).toBeVisible();
        // Строки ждутся счётом, а не видимостью таблицы: таблица видна и с остовом, пока ответ
        // ещё едет, и столбец, прочитанный в эту секунду, пуст
        await expect(rowsOf(page, 'people')).toHaveCount(4);

        const byLogin: string[] = await columnTexts(page, 'people-cell-name');

        // Запись, которой не входили, стоит последней при любом порядке остальных: пустота уезжает
        // в конец, а не притворяется самым давним входом
        expect(byLogin[byLogin.length - 1]).toBe(PEOPLE.roleless.name);

        await sortBy(page, 'name');

        // Порядок по имени детерминирован целиком: он не зависит от того, кто входил последним
        await expect
            .poll(async (): Promise<string[]> => columnTexts(page, 'people-cell-name'))
            .toEqual([ACCOUNT.name, PEOPLE.roleless.name, PEOPLE.watcher.name, PEOPLE.disabled.name]);
    });

    test('SC-MB-325 — без права `accounts:read` пункта раздела нет и адрес не открывается', async ({ page }: { page: Page }) => {
        await page.goto(SECTIONS.people);
        await signIn(page, PEOPLE.watcher);

        // Разделы, право на которые у наблюдателя есть, на месте — иначе утверждение об
        // отсутствии пункта было бы зелено и у вошедшего без единого права
        await expect(qa(page, 'header-nav-item')).toHaveCount(Object.keys(SECTIONS).length - 1);
        await expect(page.locator(`[qa-dataid="header-nav-item"][data-id="${SECTIONS.postmortems}"]`)).toBeVisible();
        await expect(page.locator(`[qa-dataid="header-nav-item"][data-id="${SECTIONS.people}"]`)).toHaveCount(0);

        // Адрес набран руками до входа, и раздел всё равно не открылся: право читается на переходе,
        // а не на показе ряда
        await expect(page).not.toHaveURL(new RegExp(`${SECTIONS.people}$`));
        await expect(qa(page, SECTION.people.table)).toHaveCount(0);
    });
});
