import { Locator, Page, Route, expect, test } from '@playwright/test';

import { TREES } from '../stand/stand.mjs';
import { columnTexts, openSection, pageQa, pickTree, qa, rowsOf, SECTION, signIn } from './support/admin';

/**
 * Состояния списка, которых на засеянном стенде не бывает: чтение, пустота вовсе, отказ службы,
 * вышедший срок ожидания и ответ, догнавший свой список позже.
 *
 * Показываются они подменой ответа приёмника — той самой, что видит браузер: человек при этом
 * идёт тем же путём, что и всегда, и смотрит на тот же экран. Гасить ради этого приёмник нельзя
 * — он один на весь прогон, и остальные спеки остались бы без данных; а данными такое состояние
 * не выражается вовсе: «служба не ответила» — это не запись в хранилище.
 *
 * Ответ подменяется до захода на раздел: чтение начинается вместе с экраном, и подмена,
 * поставленная после, опоздала бы к первому запросу.
 */

/** Сколько ждать отказа по сроку: предел ожидания у обращения к приёмнику — пятнадцать секунд. */
const TIMEOUT_WAIT_MS: number = 25_000;

/** Адрес операции чтения разборов: его подменяют спеки состояний. */
const POSTMORTEMS_API: string = '**/api/postmortems?*';

test.describe('состояния списка', () => {
    test('SC-MB-48, SC-MB-130 — пока список читается, на месте строк видно чтение, а не пустоту', async ({ page }: { page: Page }) => {
        await page.route(POSTMORTEMS_API, async (route: Route): Promise<void> => {
            await new Promise((resolve: (value: unknown) => void): void => {
                setTimeout(resolve, 3_000);
            });
            await route.continue();
        });

        await page.goto(SECTION.postmortems.path);
        await signIn(page);

        await expect(qa(page, 'table-skeleton-row').first()).toBeVisible();
        await expect(rowsOf(page, 'postmortems')).toHaveCount(0);
        // пустота ещё не установлена: показывать её, пока ответа нет, значило бы врать
        await expect(qa(page, 'empty-state-title')).toHaveCount(0);

        // и то же место занимают строки, когда чтение кончилось: признак чтения не остаётся
        await expect(rowsOf(page, 'postmortems').first()).toBeVisible({ timeout: 15_000 });
        await expect(qa(page, 'table-skeleton-row')).toHaveCount(0);
    });

    test('SC-MB-49, SC-MB-129 — пустой список показывает пустое состояние и объясняет, почему он пуст', async ({
        page,
    }: {
        page: Page;
    }) => {
        await page.route(POSTMORTEMS_API, async (route: Route): Promise<void> => {
            await route.fulfill({ json: { rows: [], total: 0, page: 1, size: 20 } });
        });

        await openSection(page, 'postmortems');

        // вид, а не серая фраза в середине таблицы: значок, заголовок и слово о том, откуда записи
        await expect(qa(page, 'empty-state-icon')).toBeVisible();
        await expect(qa(page, 'empty-state-title')).toHaveText('Записей нет');
        await expect(qa(page, 'empty-state-description')).toHaveText('Ни одно дерево их пока не присылало');
        await expect(rowsOf(page, 'postmortems')).toHaveCount(0);
    });

    test('SC-MB-51, SC-MB-72, SC-MB-131 — не прочитавшийся список называет номер обращения, отличим от пустоты и повторяется одним действием', async ({
        page,
    }: {
        page: Page;
    }) => {
        let refuse: boolean = true;

        await page.route(POSTMORTEMS_API, async (route: Route): Promise<void> => {
            if (!refuse) {
                await route.continue();

                return;
            }

            await route.fulfill({
                status: 500,
                json: { message: 'внутренняя ошибка, обращение 9f31c0d2' },
            });
        });

        // не `openSection`: отказ занимает место списка, и ждать здесь надо не таблицу, а его
        await page.goto(SECTION.postmortems.path);
        await signIn(page);

        await expect(pageQa(page, 'postmortems', 'fault')).toContainText('Прочитать не удалось');
        await expect(pageQa(page, 'postmortems', 'fault')).toContainText('9f31c0d2');
        await expect(rowsOf(page, 'postmortems')).toHaveCount(0);
        // поломка и пустота выглядят по-разному: пустого состояния здесь нет вовсе
        await expect(qa(page, 'empty-state-title')).toHaveCount(0);

        refuse = false;

        const retry: Locator = pageQa(page, 'postmortems', 'retry');

        await retry.click();

        await expect(rowsOf(page, 'postmortems').first()).toBeVisible();
        await expect(pageQa(page, 'postmortems', 'fault')).toHaveCount(0);
        // страница не перезагружалась: повтор — это одно действие на экране
        expect(page.url()).toContain(SECTION.postmortems.path);
    });

    test('SC-MB-73 — ожидание ответа ограничено сроком', async ({ page }: { page: Page }) => {
        test.setTimeout(TIMEOUT_WAIT_MS + 30_000);

        await page.route(POSTMORTEMS_API, async (route: Route): Promise<void> => {
            // служба молчит: ответ уходит настолько позже предела ожидания, что до него дело не
            // доходит вовсе — человек обязан увидеть отказ, а не ждать без конца
            await new Promise((resolve: (value: unknown) => void): void => {
                setTimeout(resolve, TIMEOUT_WAIT_MS * 4);
            });
            await route.continue();
        });

        await openSection(page, 'postmortems');

        await expect(pageQa(page, 'postmortems', 'fault')).toContainText('Прочитать не удалось', { timeout: TIMEOUT_WAIT_MS });
        await expect(pageQa(page, 'postmortems', 'retry')).toBeVisible();
    });

    test('SC-MB-69 — ответ, догнавший свой список позже, не показывается', async ({ page }: { page: Page }) => {
        const late: string = 'опоздавший-ответ.md';
        let delivered: () => void = (): void => {};
        const lateAnswer: Promise<void> = new Promise<void>((resolve: () => void): void => {
            delivered = resolve;
        });

        await page.route(POSTMORTEMS_API, async (route: Route): Promise<void> => {
            const asked: string = new URL(route.request().url()).searchParams.get('tree') ?? '';

            if (asked !== TREES[0].slug) {
                await route.continue();

                return;
            }

            // ответ первого отбора приходит позже, чем ответ второго, — и с ним приезжает
            // строка, которой на экране быть уже не должно
            await new Promise((resolve: (value: unknown) => void): void => {
                setTimeout(resolve, 4_000);
            });
            await route.fulfill({
                json: {
                    rows: [
                        {
                            id: '00000000-0000-4000-8000-00000000dead',
                            tree: TREES[0],
                            file: late,
                            arrivedAt: '2026-08-01T06:00:00.000Z',
                            updatedAt: '2026-08-01T06:00:00.000Z',
                        },
                    ],
                    total: 1,
                    page: 1,
                    size: 20,
                },
            });
            delivered();
        });

        await openSection(page, 'postmortems');
        await pickTree(page, TREES[0].name);
        await pickTree(page, TREES[1].name);

        await expect
            .poll(async (): Promise<string[]> => columnTexts(page, 'postmortems-cell-tree'))
            .toEqual(Array.from({ length: 5 }, (): string => TREES[1].name));

        // ждётся сам ответ, а не отсчёт времени: отсчёт проверял бы загрузку машины
        await lateAnswer;

        expect(await columnTexts(page, 'postmortems-cell-file')).not.toContain(late);
        expect(new Set(await columnTexts(page, 'postmortems-cell-tree'))).toEqual(new Set([TREES[1].name]));
    });
});
