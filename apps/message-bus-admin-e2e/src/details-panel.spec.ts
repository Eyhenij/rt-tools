import { expect, Locator, Page, Route, test } from '@playwright/test';

import { detailValue, openSection, qa, rowsOf, TSectionName } from './support/admin';

/**
 * Панель подробностей: три раздела груза показывают запись одной и той же панелью.
 *
 * Проверяется не состав свойств — он у каждого раздела свой, — а то, чем панель собрана: за
 * неё саму, за её шапку и за строку свойства спека держится своими метками, а пока запись
 * читается, на месте значений стоят скелетоны, а не пустота.
 */

/** Раздел, его первое свойство в панели и метки самой панели. */
interface IPanelCase {
    readonly section: TSectionName;
    readonly row: string;
    readonly api: RegExp;
}

const PANELS: readonly IPanelCase[] = [
    { section: 'postmortems', row: 'postmortem-tree', api: /\/api\/postmortems\/[^/]+$/ },
    { section: 'proposals', row: 'proposal-tree', api: /\/api\/proposals\/[^/]+$/ },
    { section: 'summaries', row: 'month-record-tree', api: /\/api\/summaries\/[^/]+$/ },
];

/** Метки панели собраны из префикса раздела — так же, как метки его списочной страницы. */
function panelQa(row: string, mark: 'panel' | 'header'): string {
    return `${row.slice(0, row.lastIndexOf('-'))}-details-${mark}`;
}

/** Скелетон внутри строки свойства: его рисует готовая строка кита, а не панель. */
function skeletonOf(page: Page, row: string): Locator {
    return qa(page, row).locator('[qa-dataid="skeleton-wrapper-placeholder"]');
}

test.describe('панель подробностей', () => {
    for (const panel of PANELS) {
        test(`SC-MB-140 — панель раздела ${panel.section}, её шапка и строка свойства находятся каждая по своей метке`, async ({
            page,
        }: {
            page: Page;
        }) => {
            await openSection(page, panel.section);
            await rowsOf(page, panel.section).first().click();

            // сама панель боксом не становится — её рамку рисует кит внутри, — поэтому спека
            // проверяет, что метка на месте, а не то, что её узел занимает площадь
            await expect(qa(page, panelQa(panel.row, 'panel'))).toBeAttached();
            await expect(qa(page, panelQa(panel.row, 'header'))).toBeVisible();
            await expect(qa(page, panel.row)).toBeVisible();
            await expect(detailValue(page, panel.row)).not.toHaveText('');
        });

        test(`SC-MB-139 — пока запись раздела ${panel.section} читается, на месте значения виден скелетон`, async ({
            page,
        }: {
            page: Page;
        }) => {
            await openSection(page, panel.section);

            let release: () => void = (): void => undefined;
            const held: Promise<void> = new Promise<void>((resolve: () => void): void => {
                release = resolve;
            });

            await page.route(panel.api, async (route: Route): Promise<void> => {
                await held;
                await route.continue();
            });

            await rowsOf(page, panel.section).first().click();

            // название свойства уже на месте, а значение ещё читается: вместо него — скелетон
            await expect(qa(page, panel.row).locator('[qa-dataid="detail-row-label"]')).not.toHaveText('');
            await expect(skeletonOf(page, panel.row)).toBeVisible();
            await expect(detailValue(page, panel.row)).toHaveText('');

            release();

            await expect(skeletonOf(page, panel.row)).toHaveCount(0);
            await expect(detailValue(page, panel.row)).not.toHaveText('');
        });
    }
});
