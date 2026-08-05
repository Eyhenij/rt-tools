/**
 * Чтение свойств оформления прямо из подключённых таблиц стилей.
 *
 * Список токенов в документации не выписывается руками: выписанный расходится с
 * `src/styles/` на первом же добавленном свойстве, и заметить это нечем —
 * страница продолжает выглядеть действующей справкой. Здесь она читает то же,
 * что получает потребитель.
 */

export interface IToken {
    readonly name: string;
    readonly value: string;
}

/** Правило светлой темы: свойства объявлены на корне без дополнительных признаков. */
const isLightRoot = (selector: string): boolean => [':root', 'html', ':root, html', 'html, body'].includes(selector.trim());

/** Правило тёмной темы: `:root[data-theme='dark']` либо `html.rt-theme-dark`. */
const isDarkRoot = (selector: string): boolean => selector.includes('data-theme') || selector.includes('rt-theme-dark');

function eachRootRule(dark: boolean, visit: (style: CSSStyleDeclaration) => void): void {
    for (const sheet of Array.from(document.styleSheets)) {
        let rules: CSSRule[];
        try {
            rules = Array.from(sheet.cssRules);
        } catch {
            // Таблица с чужого источника правил не отдаёт. На витрине таких нет,
            // но падать из-за них страница не должна.
            continue;
        }

        for (const rule of rules) {
            const style: CSSStyleRule = rule as CSSStyleRule;
            if (!style.selectorText || !style.style) {
                continue;
            }
            if (dark ? isDarkRoot(style.selectorText) : isLightRoot(style.selectorText)) {
                visit(style.style);
            }
        }
    }
}

/** Все объявленные свойства с данным префиксом, в порядке объявления. */
export function readTokens(prefix: string, dark: boolean = false): IToken[] {
    const found: Map<string, string> = new Map();

    eachRootRule(dark, (style: CSSStyleDeclaration): void => {
        for (const name of Array.from(style)) {
            if (name.startsWith(prefix)) {
                found.set(name, style.getPropertyValue(name).trim());
            }
        }
    });

    return [...found].map(([name, value]: [string, string]): IToken => ({ name, value }));
}

/** Токены, чьё имя начинается с любого из перечисленных префиксов. */
export function readGroups(prefixes: readonly string[], dark: boolean = false): IToken[] {
    return prefixes.flatMap((prefix: string): IToken[] => readTokens(prefix, dark));
}
