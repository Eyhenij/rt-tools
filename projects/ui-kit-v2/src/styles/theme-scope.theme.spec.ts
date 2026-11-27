import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import * as sass from 'sass';

/**
 * Местный кусок темы заново раскладывает на своём узле весь светлый набор, и всё, что корень
 * поправляет поверх набора, кусок обязан поправить у себя тоже. Спрашивается собранный CSS слоя
 * оформления: порядок правил и их селекторы видны только в нём, а сборка и линтер стилей молчат,
 * если поправка осталась на одном корне.
 */

const CSS: string = sass.compile(join(__dirname, '_index.scss')).css;
const PRESET: string = readFileSync(join(__dirname, '_preset-material.scss'), 'utf8');

/** Тело миксина в собранном исходнике — до первой закрывающей скобки на нулевом отступе. */
function mixinBody(text: string, name: string): string {
    const start: number = text.indexOf(`@mixin ${name}`);

    return start < 0 ? '' : text.slice(start, text.indexOf('\n}', start));
}

/** Селекторы правил грубого указателя в порядке их появления и место каждого в файле. */
function coarseRules(): { selectors: string[]; at: number }[] {
    const rules: { selectors: string[]; at: number }[] = [];
    const pattern: RegExp = /@media \(pointer: coarse\) \{\s*([^{]+)\{\s*--rt-input-font-size: var\(--rt-text-md\);\s*\}\s*\}/g;
    for (const match of CSS.matchAll(pattern)) {
        rules.push({ selectors: match[1].split(',').map((selector: string): string => selector.trim()), at: match.index ?? 0 });
    }

    return rules;
}

/** Последнее место правила, в селекторе которого стоит `selector`, объявляющего плотный размер поля. */
function lastDenseDeclaration(selector: string): number {
    let at: number = -1;
    const pattern: RegExp = /([^{}]+)\{[^{}]*--rt-input-font-size: var\(--rt-text-sm\);/g;
    for (const match of CSS.matchAll(pattern)) {
        const selectors: string[] = match[1].split(',').map((part: string): string => part.trim());
        if (selectors.includes(selector)) {
            at = match.index ?? at;
        }
    }

    return at;
}

/** Вес селектора: атрибуты, классы и псевдоклассы, затем имена элементов. Аргумент `:not` весит сам. */
function weightOf(selector: string): number {
    const flat: string = selector.replace(/:not\(([^)]*)\)/g, '$1');
    const classes: number = flat.match(/\[[^\]]*\]|\.[\w-]+|:[\w-]+/g)?.length ?? 0;
    const bare: string = flat.replace(/\[[^\]]*\]|\.[\w-]+|:[\w-]+/g, '');

    return classes * 100 + (bare.match(/(^|[\s>+~])[a-z][\w-]*/g)?.length ?? 0);
}

/** Объявление свойства, которое каскад отдаёт самому узлу: решают вес селектора и порядок правил. */
function winnerOf(node: Element, name: string): string {
    let best: { weight: number; value: string } | undefined;
    for (const [, head, body] of CSS.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        // Внутри правила свойство объявлено несколько раз: набор, тема, тёмный набор. Решает последнее.
        const value: string | undefined = [...body.matchAll(new RegExp(`(?<![\\w-])${name}:([^;]*)`, 'g'))].at(-1)?.[1];
        if (value === undefined) {
            continue;
        }
        for (const selector of head.split(',').map((part: string): string => part.trim())) {
            const weight: number = weightOf(selector);
            if (weight >= (best?.weight ?? 0) && node.matches(selector)) {
                best = { weight, value: value.trim() };
            }
        }
    }

    return best?.value ?? '';
}

describe('тема узла набора на любой странице', (): void => {
    const ROOTS: string[] = ['none', 'data-theme', 'rt-theme-dark'];
    const THEMES: (string | null)[] = [null, 'light', 'dark'];
    const FORMS: [string, string][] = [
        ['class', 'rt-preset-material'],
        ['data-preset', 'material'],
    ];
    function surfaceOf(mixin: string): string {
        return /--rt-color-bg-surface:([^;]*);/.exec(mixinBody(PRESET, mixin))?.[1].trim() ?? '';
    }

    const lightSurface: string = surfaceOf('rt-preset-material-tokens');
    const darkSurface: string = surfaceOf('rt-preset-material-dark-tokens');

    function paint(root: string, piece: string | null, theme: string | null, [attribute, value]: [string, string]): string {
        const html: HTMLElement = document.documentElement;
        html.className = root === 'rt-theme-dark' ? root : '';
        if (root === 'data-theme') {
            html.setAttribute('data-theme', 'dark');
        } else {
            html.removeAttribute('data-theme');
        }
        const outer: HTMLElement = document.createElement('div');
        const node: HTMLElement = document.createElement('div');
        if (piece !== null) {
            outer.setAttribute('data-theme', piece);
        }
        if (theme !== null) {
            node.setAttribute('data-theme', theme);
        }
        node.setAttribute(attribute, value);
        // Между куском и узлом стоит обёртка: в разметке приложения узел редко прямой потомок куска.
        const wrapper: HTMLElement = document.createElement('div');
        wrapper.append(node);
        outer.append(wrapper);
        document.body.replaceChildren(outer);

        // Любое третье значение поверхности — тоже ошибка: светлым оно не считается.
        const surface: string = winnerOf(node, '--rt-color-bg-surface');
        if (surface === darkSurface) {
            return 'dark';
        }

        return surface === lightSurface ? 'light' : surface;
    }

    it('SC-UKV-1921 — узел набора берёт свою тему, а без своей — тему куска или страницы', (): void => {
        const wrong: string[] = [];
        let checked: number = 0;
        for (const root of ROOTS) {
            for (const piece of THEMES) {
                for (const theme of THEMES) {
                    for (const form of FORMS) {
                        const expected: string = theme ?? piece ?? (root === 'none' ? 'light' : 'dark');
                        const got: string = paint(root, piece, theme, form);
                        checked += 1;
                        if (got !== expected) {
                            wrong.push(`${root} > ${piece} > ${theme} (${form[0]}): ${got}`);
                        }
                    }
                }
            }
        }

        expect(darkSurface).not.toBe('');
        expect(lightSurface).not.toBe('');
        expect(lightSurface).not.toBe(darkSurface);
        expect(checked).toBe(54);
        expect(wrong).toEqual([]);
    });
});

describe('кусок темы и сенсорный экран', (): void => {
    it.each([
        ':root',
        '[data-theme=light]:not(:root)',
        '[data-theme=dark]:not(:root)',
        '[data-preset=material]:not(:root)',
        '.rt-preset-material:not(:root)',
        '[data-theme=dark] [data-preset=material]',
        'html.rt-theme-dark .rt-preset-material',
        '[data-theme=dark] [data-theme=light] [data-preset=material]',
        '[data-preset=material][data-theme=light]:not(:root)',
        '.rt-preset-material [data-theme=dark]:not(:root)',
    ])('поле ввода не мельче 16px и внутри %s: поправка стоит после плотного размера того же правила', (selector: string): void => {
        const rule: { selectors: string[]; at: number } | undefined = coarseRules().find(
            (candidate: { selectors: string[]; at: number }): boolean => candidate.selectors.includes(selector)
        );

        expect(rule).toBeDefined();
        expect(rule?.at ?? -1).toBeGreaterThan(lastDenseDeclaration(selector));
    });

    it('имя, взятое от размера поля, объявлено в светлом наборе ссылкой — кусок пересчитывает его у себя', (): void => {
        expect(CSS).toContain('--rt-overlay-select-option-font-size: var(--rt-input-font-size);');
        expect(CSS).toContain('--rt-list-search-font-size: var(--rt-input-font-size);');
    });
});

describe('материальный набор под тёмной темой', (): void => {
    it('обводка стрелки пагинации отвечает тёмной ступенью, как рамки её соседей', (): void => {
        const dark: string = mixinBody(PRESET, 'rt-preset-material-dark-tokens');

        expect(dark).toContain('--rt-pagination-arrow-shadow: inset 0 0 0 var(--rt-border-width-thin) var(--rt-mat-dark-30);');
        expect(dark).toContain('--rt-pagination-box-color-border: var(--rt-mat-dark-30);');
    });

    it.each(['--rt-list-search-icon-color', '--rt-list-search-color-placeholder', '--rt-list-table-icon-color'])(
        'без темы Material %s читается на белом: запасная ступень — neutral-60, а не neutral-30',
        (name: string): void => {
            const light: string = mixinBody(PRESET, 'rt-preset-material-tokens');

            expect(light).toContain(`${name}: var(--rt-sys-on-surface-variant, var(--rt-mat-neutral-60));`);
        }
    );
});
