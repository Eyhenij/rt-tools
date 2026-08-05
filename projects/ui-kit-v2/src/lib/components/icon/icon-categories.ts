import { IRtIcon } from './rt-icon.model';

/**
 * Категории иконок rt-icon. 10 buckets: 8 prefix-based + Custom (префикс `ico-`) + Misc (fallback).
 * Порядок фиксирован — соответствует порядку отображения в Catalog story (rt-icon.stories.ts).
 *
 * Аннотация типа намеренно не указывается: явный `readonly string[]` потерял бы узкий
 * литеральный тип, нужный для {@link IIconCategory}. `as const` сохраняет литеральные ключи.
 */
// eslint-disable-next-line @typescript-eslint/typedef -- аннотация стёрла бы литеральный тип, на котором стоит IIconCategory
export const CATEGORY_ORDER = [
    'Navigation',
    'Alignment & Sorting',
    'Status',
    'Time & Calendar',
    'Communication',
    'Documents',
    'People',
    'Commerce',
    'Custom',
    'Misc',
] as const;

/** Литеральный union из {@link CATEGORY_ORDER}. */
export type IIconCategory = (typeof CATEGORY_ORDER)[number];

/**
 * Правило маппинга имени иконки в категорию.
 * Порядок правил в {@link ICON_CATEGORY_RULES} важен: первое совпавшее правило выигрывает.
 */
interface IIconCategoryRule {
    readonly category: IIconCategory;
    readonly match: (name: string) => boolean;
}

function startsWithAny(name: string, prefixes: readonly string[]): boolean {
    return prefixes.some((p: string): boolean => name.startsWith(p));
}

function isOneOf(name: string, names: readonly string[]): boolean {
    return names.includes(name);
}

function matchPrefixOrExact(prefixes: readonly string[], exact: readonly string[]): (name: string) => boolean {
    return (name: string): boolean => startsWithAny(name, prefixes) || isOneOf(name, exact);
}

/**
 * Упорядоченный список правил категоризации.
 * `Custom` — единственная категория по строгому префиксу `ico-` и проверяется первой,
 * чтобы исключить конфликты с другими prefix-based категориями.
 * `Misc` — fallback в {@link categoryOf}, отдельным правилом не описывается.
 */
export const ICON_CATEGORY_RULES: readonly IIconCategoryRule[] = [
    { category: 'Custom', match: (n: string): boolean => n.startsWith('ico-') },
    {
        category: 'Navigation',
        match: matchPrefixOrExact(['arrow', 'arrows', 'angle', 'chevron', 'directions'], []),
    },
    {
        category: 'Alignment & Sorting',
        match: matchPrefixOrExact(['align', 'sort', 'bars', 'ellipsis', 'sliders', 'filter', 'th'], []),
    },
    {
        category: 'Status',
        match: matchPrefixOrExact(['check', 'times', 'ban', 'exclamation', 'info', 'eye', 'lock', 'unlock', 'shield'], ['spinner', 'stop']),
    },
    {
        category: 'Time & Calendar',
        match: matchPrefixOrExact(['alarm', 'calendar'], ['clock']),
    },
    {
        category: 'Communication',
        match: matchPrefixOrExact(['comment', 'share'], ['bell', 'bot', 'telegram', 'at', 'email', 'send', 'phone', 'mobile']),
    },
    {
        category: 'Documents',
        match: matchPrefixOrExact(['attach', 'file', 'folder', 'bookmark'], ['book', 'copy', 'clone', 'tag', 'tags']),
    },
    {
        category: 'People',
        match: matchPrefixOrExact(['user'], ['users', 'id-card']),
    },
    {
        category: 'Commerce',
        match: (n: string): boolean => isOneOf(n, ['wallet', 'money-bill', 'ticket', 'credit-card']),
    },
];

/**
 * Возвращает категорию для имени иконки.
 * Первое совпавшее правило в {@link ICON_CATEGORY_RULES} выигрывает; иначе — `Misc`.
 */
export function categoryOf(name: IRtIcon.Name): IIconCategory {
    for (const rule of ICON_CATEGORY_RULES) {
        if (rule.match(name)) {
            return rule.category;
        }
    }
    return 'Misc';
}
