import { expect, Page, test } from '@playwright/test';

import { openSection, qa } from './support/admin';

/**
 * Ширина отбора по дереву.
 *
 * Имена деревьев приходят из приёмника, и ширина отбора берётся от самой длинной подписи: панель
 * кита шириной с триггер, и опция, которой не хватило места, переносится на вторую строку —
 * читается как две. Измеряется числом, а не кадром: кадр показал бы перенос только на том имени,
 * которое засеяно сегодня.
 */

/** Одна опция панели, какой её видит измерение. */
interface IOptionMetrics {
    readonly text: string;
    readonly textWidth: number;
    readonly clientWidth: number;
    readonly scrollWidth: number;
    /** Сколько строк заняла подпись: у прямоугольников выделения по одному на строку. */
    readonly lines: number;
}

/** Триггер отбора: ширина и то, что стоит по краям подписи. */
interface ITriggerMetrics {
    readonly width: number;
    readonly paddingInline: number;
    readonly gap: number;
    readonly chevronWidth: number;
}

test.describe('отбор по дереву', () => {
    test('SC-MB-359 — каждая опция отбора по дереву стоит одной строкой, а триггер не уже самой длинной', async ({
        page,
    }: {
        page: Page;
    }) => {
        await openSection(page, 'postmortems');

        await qa(page, 'list-tree-filter').click();
        await expect(page.getByRole('option').first()).toBeVisible();

        const options: IOptionMetrics[] = await page.getByRole('option').evaluateAll((nodes: Element[]): IOptionMetrics[] =>
            nodes.map((node: Element): IOptionMetrics => {
                const range: Range = document.createRange();

                range.selectNodeContents(node);

                return {
                    text: (node.textContent ?? '').trim(),
                    textWidth: range.getBoundingClientRect().width,
                    clientWidth: node.clientWidth,
                    scrollWidth: node.scrollWidth,
                    lines: range.getClientRects().length,
                };
            })
        );
        const trigger: ITriggerMetrics = await qa(page, 'list-tree-filter')
            .locator('.rt-select__trigger')
            .evaluate((node: Element): ITriggerMetrics => {
                const style: CSSStyleDeclaration = getComputedStyle(node);

                return {
                    width: node.getBoundingClientRect().width,
                    paddingInline: parseFloat(style.paddingLeft) + parseFloat(style.paddingRight),
                    gap: parseFloat(style.gap),
                    chevronWidth: node.querySelector('.rt-select__chevron')?.getBoundingClientRect().width ?? 0,
                };
            });

        expect(options.length).toBeGreaterThan(1);

        for (const option of options) {
            // ничего не обрезано и не перенесено: содержимое умещается в ширину, высота — одна строка
            expect(option.scrollWidth, option.text).toBeLessThanOrEqual(option.clientWidth);
            expect(option.lines, option.text).toBe(1);
        }

        const longest: number = Math.max(...options.map((option: IOptionMetrics): number => option.textWidth));

        // выбранная подпись не обрезается: подпись, отступы, зазор и шеврон умещаются в триггер
        expect(trigger.width).toBeGreaterThanOrEqual(longest + trigger.paddingInline + trigger.gap + trigger.chevronWidth - 1);
    });
});
