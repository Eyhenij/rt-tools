import { expect, Page, test } from '@playwright/test';

import { openSection, qa } from './support/admin';

/** Прямоугольник узла на экране: столько, сколько нужно, чтобы судить о наложении. */
interface IBox {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
}

/** Пусто — узла на экране нет вовсе, и замер об этом скажет нулевой шириной. */
const NOWHERE: IBox = Object.freeze({ x: 0, y: 0, width: 0, height: 0 });

/**
 * Накладываются ли два узла друг на друга.
 *
 * Считается здесь, а не в самой спеке: ветвление внутри теста прячет то, что он утверждает, и
 * линтер набора его не пропускает.
 */
function overlap(one: IBox, other: IBox): boolean {
    const apart: boolean = one.x + one.width <= other.x || other.x + other.width <= one.x;
    const above: boolean = one.y + one.height <= other.y || other.y + other.height <= one.y;

    return !apart && !above;
}

/**
 * Два отбора на узком экране.
 *
 * Полоса над списком на телефоне не вмещает их в строку, и обрезанная она прячет второй отбор,
 * не сказав об этом. Проверяется замером, а не взглядом: оба видны целиком, и ни один не выходит
 * за ширину окна.
 */
test.describe('отборы на узком экране', () => {
    test('SC-MB-235 — два отбора переносятся, а не режутся', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems');

        const viewport: number = page.viewportSize()?.width ?? 0;
        const tree: IBox = (await qa(page, 'list-tree-filter').boundingBox()) ?? NOWHERE;
        const state: IBox = (await qa(page, 'list-state-filter').boundingBox()) ?? NOWHERE;

        expect(tree.width).toBeGreaterThan(0);
        expect(state.width).toBeGreaterThan(0);

        // ни один не вылезает за окно: вылезший обрезается прокруткой и пропадает из виду
        expect(tree.x + tree.width).toBeLessThanOrEqual(viewport);
        expect(state.x + state.width).toBeLessThanOrEqual(viewport);

        // и они не наложены друг на друга: либо стоят в строку, либо перенесены на свои строки
        expect(overlap(tree, state)).toBe(false);
    });
});
