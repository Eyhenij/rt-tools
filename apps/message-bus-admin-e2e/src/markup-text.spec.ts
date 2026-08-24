import { expect, Locator, Page, Request, test } from '@playwright/test';

import { TREES } from '../stand/stand.mjs';
import { openSection, pickTree, qa, rowsOf, TSectionName } from './support/admin';

/**
 * Показ текста груза разметкой.
 *
 * Обещание здесь про человека и про то, что он видит, поэтому проверяется оно тем же путём,
 * каким смотрит человек: раздел, строка, панель. Спека компонента кита поднимает его без
 * каркаса приложения и не застаёт ни чтения записи, ни оформления панели вокруг.
 *
 * Записи стенда для этого и собраны: один разбор несёт всю разметку сразу, другой — текст из
 * одних пробелов, а два предложения — список и ссылку на внешнюю картинку.
 */

/** Имя файла разбора, у которого в тексте лежит вся разметка сразу. */
const MARKUP_FILE: string = 'markup-case.md';

/** Имя файла разбора, у которого текст — одни пробелы. */
const BLANK_FILE: string = 'stand-second-blank.md';

/** Ресурс предложения, чей текст несёт список из трёх пунктов. */
const LIST_RESOURCE: string = 'rules/lists.md';

/** Ресурс предложения, чей текст несёт ссылку на внешнюю картинку. */
const IMAGE_RESOURCE: string = 'patterns/entity-aside.md';

/** Ресурс предложения, чей текст — одна строка без единого знака разметки. */
const PLAIN_RESOURCE: string = 'laws/verifiability.md';

/** Адрес картинки из текста предложения: страница не должна ходить за ним никуда. */
const IMAGE_ADDRESS: string = 'https://example.org/stand/panel.png';

/** Открыть панель записи, найдя её строку по значению в названной ячейке. */
async function openRecord(page: Page, section: TSectionName, cell: string, value: string): Promise<void> {
    const row: Locator = rowsOf(page, section).filter({ has: page.locator(`[qa-dataid="${cell}"]`, { hasText: value }) });

    await expect(row).toHaveCount(1);
    await row.click();
}

/** Узлы показа внутри раздела панели: ими и рисуется размеченный текст. */
function node(page: Page, holder: string, mark: string): Locator {
    return qa(page, holder).locator(`[qa-dataid="${mark}"]`);
}

/** Открыть разбор с разметкой: он лежит у первого дерева и виден на первой странице. */
async function openMarkupPostmortem(page: Page): Promise<void> {
    await openSection(page, 'postmortems');
    await openRecord(page, 'postmortems', 'postmortems-cell-file', MARKUP_FILE);
    await expect(qa(page, 'postmortem-text')).toBeVisible();
}

/** Открыть предложение по его ресурсу. */
async function openProposal(page: Page, resource: string): Promise<void> {
    await openSection(page, 'proposals');
    await openRecord(page, 'proposals', 'proposals-cell-resource', resource);
    await expect(qa(page, 'proposal-text')).toBeVisible();
}

test.describe('показ текста груза разметкой', () => {
    test('SC-MB-208 — заголовок разметки виден заголовком, а не палкой', async ({ page }: { page: Page }) => {
        await openMarkupPostmortem(page);

        await expect(node(page, 'postmortem-text', 'markdown-heading').first()).toHaveText('Разбор с разметкой');
        await expect(node(page, 'postmortem-text', 'markdown-heading').first()).toHaveAttribute('aria-level', '1');

        const shown: string = (await qa(page, 'postmortem-text').textContent()) ?? '';

        expect(shown).toContain('Разбор с разметкой');
        expect(shown).not.toContain('# Разбор');
    });

    test('SC-MB-209 — строка скрипта остаётся видимым текстом и не исполняется', async ({ page }: { page: Page }) => {
        await openMarkupPostmortem(page);

        const shown: string = (await qa(page, 'postmortem-text').textContent()) ?? '';

        // Сначала — что найдено то самое место: утверждение об отсутствии зелено и тогда, когда
        // ищет не там
        expect(shown).toContain('<script>window.__standScriptRan = true;</script>');
        await expect(qa(page, 'postmortem-text').locator('script')).toHaveCount(0);
        expect(await page.evaluate((): unknown => (window as unknown as Record<string, unknown>)['__standScriptRan'])).toBeUndefined();
    });

    test('SC-MB-210 — парный тег остаётся видимым текстом', async ({ page }: { page: Page }) => {
        await openMarkupPostmortem(page);

        const shown: string = (await qa(page, 'postmortem-text').textContent()) ?? '';

        expect(shown).toContain('<b>жирным это не становится</b>');
        await expect(qa(page, 'postmortem-text').locator('b')).toHaveCount(0);
    });

    test('SC-MB-211 — таблица разметки показана таблицей', async ({ page }: { page: Page }) => {
        await openMarkupPostmortem(page);

        await expect(node(page, 'postmortem-text', 'markdown-table')).toHaveCount(1);
        await expect(node(page, 'postmortem-text', 'markdown-head-cell')).toHaveText(['Признак', 'Значение']);
        await expect(node(page, 'postmortem-text', 'markdown-cell')).toHaveText(['Дерево', 'Стенд первый', 'Род', 'Случай набора']);

        const shown: string = (await qa(page, 'postmortem-text').textContent()) ?? '';

        expect(shown).not.toContain('| Признак');
    });

    test('SC-MB-212 — список показан списком', async ({ page }: { page: Page }) => {
        await openProposal(page, LIST_RESOURCE);

        await expect(node(page, 'proposal-text', 'markdown-list')).toHaveCount(1);
        await expect(node(page, 'proposal-text', 'markdown-item')).toHaveText([
            'пустой ответ на первый запрос',
            'пустой ответ после смены отбора',
            'отказ службы вместо ответа',
        ]);

        const shown: string = (await qa(page, 'proposal-text').textContent()) ?? '';

        expect(shown).not.toContain('- пустой ответ');
    });

    test('SC-MB-213 — блок кода показан моноширинным и без раскраски', async ({ page }: { page: Page }) => {
        await openMarkupPostmortem(page);

        const code: Locator = node(page, 'postmortem-text', 'markdown-code');

        await expect(code).toHaveCount(1);
        await expect(code).toContainText('const stand = { markup: true');

        // Взглядом моноширинность не проверить: она читается вычисленным начертанием
        const family: string = await code.evaluate((element: Element): string => getComputedStyle(element).fontFamily);

        expect(family.toLowerCase()).toContain('mono');

        // Раскраски нет: содержимое блока — один кусок текста, а не разноцветные узлы внутри
        const inner: number = await code.evaluate((element: Element): number => element.querySelectorAll('code *').length);

        expect(inner).toBe(0);

        // Слово языка стоит у ограды и на вид не влияет: показанным оно быть не должно
        await expect(code).not.toContainText('```');
        expect((await code.textContent())?.startsWith('ts')).toBe(false);
    });

    test('SC-MB-214 — сводка месяца показывается тем же компонентом, блоком кода', async ({ page }: { page: Page }) => {
        await openSection(page, 'summaries');
        await openRecord(page, 'summaries', 'summaries-cell-tree', TREES[0].name);

        await expect(qa(page, 'month-record-summary')).toBeVisible();

        const code: Locator = node(page, 'month-record-summary', 'markdown-code');

        await expect(code).toHaveCount(1);
        // Число взято у засева стенда: сводка первого дерева приехала с сорока восемью заходами
        await expect(code).toContainText('"sessions": 48');
        // Отступы раскладки видны: блоком кода они и держатся
        expect((await code.textContent()) ?? '').toContain('    "sessions": 48');
    });

    test('SC-MB-215 — одиночный перенос строки остаётся переносом', async ({ page }: { page: Page }) => {
        await openMarkupPostmortem(page);

        const paragraph: Locator = node(page, 'postmortem-text', 'markdown-paragraph').first();

        await expect(paragraph).toContainText('Случай заведён засевом стенда');
        await expect(paragraph).toContainText('И эта — тоже');
        // Три строки подряд без пустой между ними: два переноса внутри одного абзаца
        await expect(paragraph.locator('br')).toHaveCount(2);
    });

    test('SC-MB-216 — картинка в вывод не попадает', async ({ page }: { page: Page }) => {
        const asked: string[] = [];

        page.on('request', (request: Request): void => {
            asked.push(request.url());
        });

        await openProposal(page, IMAGE_RESOURCE);

        const shown: string = (await qa(page, 'proposal-text').textContent()) ?? '';

        // Сначала — что найдено то самое место: разметка картинки видна текстом
        expect(shown).toContain('![кадр панели]');
        await expect(qa(page, 'proposal-text').locator('img')).toHaveCount(0);
        expect(asked.some((url: string): boolean => url.includes(IMAGE_ADDRESS))).toBe(false);
    });

    test('SC-MB-217 — внешняя ссылка ведёт наружу, а ссылка чужой схемы остаётся текстом', async ({ page }: { page: Page }) => {
        await openMarkupPostmortem(page);

        const links: Locator = node(page, 'postmortem-text', 'markdown-link');

        await expect(links).toHaveCount(1);
        await expect(links).toHaveAttribute('href', 'https://example.org/stand');
        await expect(links).toHaveText('страница набора');

        const shown: string = (await qa(page, 'postmortem-text').textContent()) ?? '';

        expect(shown).toContain('[этот адрес](javascript:alert)');
        await expect(qa(page, 'postmortem-text').locator('a[href^="javascript:"]')).toHaveCount(0);
    });

    test('SC-MB-218 — текст без разметки показывается как есть', async ({ page }: { page: Page }) => {
        await openProposal(page, PLAIN_RESOURCE);

        const paragraph: Locator = node(page, 'proposal-text', 'markdown-paragraph');

        await expect(paragraph).toHaveCount(1);
        await expect(paragraph).toHaveText('Закон о проверяемости молчит про стенд из прод-сборки.');
        // Добавленных узлов внутри нет: строка без разметки остаётся одним куском текста
        expect(await paragraph.evaluate((element: Element): number => element.querySelectorAll('*').length)).toBe(0);
    });

    test('SC-MB-219 — текста нет — нет и раздела панели', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems');
        await pickTree(page, TREES[1].name);

        await openRecord(page, 'postmortems', 'postmortems-cell-file', BLANK_FILE);

        // Сначала — что найдена та самая панель: свойства записи на ней стоят
        await expect(qa(page, 'postmortem-file')).toContainText(BLANK_FILE);
        await expect(qa(page, 'postmortem-text')).toHaveCount(0);
    });

    test('SC-MB-220 — строка списка текста по-прежнему не несёт', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems');

        const table: Locator = qa(page, 'postmortems-table');

        // Сначала — что найдена та самая таблица: строки в ней есть
        await expect(rowsOf(page, 'postmortems').first()).toBeVisible();
        await expect(table.locator('[qa-dataid^="markdown-"]')).toHaveCount(0);
        await expect(table).not.toContainText('Случай заведён засевом стенда');
        await expect(table).not.toContainText('# Разбор с разметкой');
    });

    test('SC-MB-221 — длинная строка кода не растягивает панель', async ({ page }: { page: Page }) => {
        await openMarkupPostmortem(page);

        const code: Locator = node(page, 'postmortem-text', 'markdown-code');
        const room: number = await qa(page, 'postmortem-text').evaluate((element: Element): number => element.clientWidth);
        const shown: number = await code.evaluate((element: Element): number => element.clientWidth);
        const inside: number = await code.evaluate((element: Element): number => element.scrollWidth);

        // Строка засева длиннее панели: блок обязан прокручиваться сам
        expect(inside).toBeGreaterThan(shown);
        expect(shown).toBeLessThanOrEqual(room);
        // Панель шире окна не стала: страница вбок не едет
        const fits: boolean = await page.evaluate(
            (): boolean => document.documentElement.scrollWidth <= document.documentElement.clientWidth
        );

        expect(fits).toBe(true);
    });
});
