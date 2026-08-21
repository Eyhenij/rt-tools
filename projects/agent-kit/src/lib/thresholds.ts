/**
 * Пороги окна захода: где заход останавливается и где инструмент сжимает контекст сам.
 *
 * Чисел два, и живут они в разных местах чужой настройки. Размер окна и доля, на которой страж
 * останавливает заход, приходят переменными окружения — их читает профиль дерева. Порог, на
 * котором инструмент сжимает контекст, задаётся своей парой: размером окна автосжатия и долей в
 * процентах. Пакет ни тем ни другим не владеет — окно принадлежит дереву.
 *
 * Разъехавшись, пары дают заход, который либо сжимается раньше, чем передача написана, либо
 * доживает до предела окна и роняет работу. Заметить это нечем: обе стороны по отдельности
 * выглядят настроенными, а расхождение видно только тому, кто положит их рядом. Здесь их и
 * кладут рядом — разбор состояния раскладки печатает числа и называет разошедшееся.
 *
 * Дерево, не объявившее размера окна, стража не получает вовсе, и судить у него нечего: раздел
 * молчит целиком, а не краснеет отсутствием.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SETTINGS_PATH } from './hooks-map.js';

/** Доля окна, на которой страж напоминает выбрать точку остановки. Умолчание профиля. */
const WARN_PCT_DEFAULT: number = 40;

/** Доля окна, на которой страж отбивает всё, кроме закрытия захода. Умолчание профиля. */
const STOP_PCT_DEFAULT: number = 50;

/** Пороги, объявленные деревом. Размер окна не объявлен — стража нет, и судить нечего. */
export interface IThresholds {
    /** Размер окна захода в токенах: `RT_WINDOW_TOKENS`. */
    readonly window: number;
    /** Доля окна, на которой страж напоминает: `RT_WINDOW_WARN_PCT`. */
    readonly warnPct: number;
    /** Доля окна, на которой страж отбивает работу: `RT_WINDOW_STOP_PCT`. */
    readonly stopPct: number;
    /** Размер окна автосжатия: настройка `autoCompactWindow`. Не объявлен — `null`. */
    readonly compactWindow: number | null;
    /** Доля, на которой приходит сжатие: `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`. Не объявлена — `null`. */
    readonly compactPct: number | null;
}

/** Расхождение пары: что с чем разъехалось и какими числами. */
export interface IThresholdDrift {
    /** Что разошлось, словами читателя. */
    readonly what: string;
    /** Что объявлено стражу. */
    readonly guard: string;
    /** Что объявлено сжатию. */
    readonly compact: string;
}

/**
 * Число из строки настройки. Пусто, не число, ноль и меньше — ничего: значение, которого нельзя
 * посчитать, объявленным не считается, иначе расхождением станет опечатка, а не расхождение.
 */
function numberOf(value: unknown): number | null {
    const parsed: number = typeof value === 'number' ? value : Number.parseInt(String(value ?? ''), 10);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/**
 * Что дерево объявило о порогах.
 *
 * Настройку читаем разбором и только им: пороги лежат полями объекта, и вынуть их из текста
 * поиском значило бы гадать. Не разобралась — молчим целиком, как молчит карта хуков: назвать
 * расхождением непрочитанное хуже, чем не назвать ничего.
 */
export function readThresholds(root: string): IThresholds | null {
    const path: string = join(root, SETTINGS_PATH);
    if (!existsSync(path)) {
        return null;
    }

    let settings: Record<string, unknown>;
    try {
        settings = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
    } catch {
        return null;
    }

    const env: Record<string, unknown> = (settings['env'] as Record<string, unknown>) ?? {};
    const windowTokens: number | null = numberOf(env['RT_WINDOW_TOKENS']);
    if (windowTokens === null) {
        return null;
    }

    return {
        window: windowTokens,
        warnPct: numberOf(env['RT_WINDOW_WARN_PCT']) ?? WARN_PCT_DEFAULT,
        stopPct: numberOf(env['RT_WINDOW_STOP_PCT']) ?? STOP_PCT_DEFAULT,
        compactWindow: numberOf(settings['autoCompactWindow']),
        compactPct: numberOf(env['CLAUDE_AUTOCOMPACT_PCT_OVERRIDE']),
    };
}

/**
 * Чем пара стража разошлась с парой сжатия.
 *
 * Незаданное расхождением не считается: дерево вправе не задавать порога сжатия вовсе — тогда
 * его назначает инструмент, и сказать об этом надо один раз, а не двумя строками о разнице.
 */
export function thresholdDrift(thresholds: IThresholds): readonly IThresholdDrift[] {
    const drift: IThresholdDrift[] = [];

    if (thresholds.compactWindow !== null && thresholds.compactWindow !== thresholds.window) {
        drift.push({
            what: 'размер окна',
            guard: String(thresholds.window),
            compact: String(thresholds.compactWindow),
        });
    }

    if (thresholds.compactPct !== null && thresholds.compactPct !== thresholds.stopPct) {
        drift.push({
            what: 'доля окна',
            guard: `${thresholds.stopPct}%`,
            compact: `${thresholds.compactPct}%`,
        });
    }

    return drift;
}

/** Раздел разбора состояния: числа порогов и то, что о них известно. */
export function thresholdLines(root: string): string[] {
    const thresholds: IThresholds | null = readThresholds(root);
    if (!thresholds) {
        return [];
    }

    const lines: string[] = [
        `окно захода: ${thresholds.window} токенов, напоминание ${thresholds.warnPct}%, остановка ${thresholds.stopPct}%`,
    ];

    if (thresholds.compactWindow === null && thresholds.compactPct === null) {
        lines.push(
            '  порог сжатия деревом не задан — его назначает инструмент, и передача пишется когда придётся',
            `  объяви в \`${SETTINGS_PATH}\`: \`autoCompactWindow\` числом ${thresholds.window}, а \`CLAUDE_AUTOCOMPACT_PCT_OVERRIDE\` — числом ${thresholds.stopPct}`
        );

        return lines;
    }

    const drift: readonly IThresholdDrift[] = thresholdDrift(thresholds);
    if (!drift.length) {
        lines.push('  порог сжатия сведён с порогом остановки: сжатие приходит первым, страж остаётся страховкой');

        return lines;
    }

    lines.push('  порог сжатия разошёлся с порогом остановки:');
    for (const one of drift) {
        lines.push(`    ${one.what}: у стража ${one.guard}, у сжатия ${one.compact}`);
    }

    return lines;
}
