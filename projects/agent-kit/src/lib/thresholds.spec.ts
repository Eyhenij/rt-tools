/**
 * Пороги окна захода: что дерево о них объявило и чем пара стража разошлась с парой сжатия.
 *
 * Набор стоит отдельно от сквозных сценариев команд потому, что проверяет не раскладку, а чтение
 * чужой настройки: числа лежат в двух её местах, и разойтись они могут молча — обе стороны по
 * отдельности выглядят настроенными.
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { SETTINGS_PATH } from './hooks-map.js';
import { IThresholds, readThresholds, thresholdDrift, thresholdLines } from './thresholds.js';

const SWEPT: string[] = [];

afterAll((): void => {
    for (const root of SWEPT) {
        rmSync(root, { recursive: true, force: true });
    }
});

/** Дерево с названной настройкой агента: корень отдаётся наружу, каталог убирается после набора. */
function tree(text: string): string {
    const root: string = mkdtempSync(join(tmpdir(), 'rt-thresholds-'));
    SWEPT.push(root);
    const path: string = join(root, SETTINGS_PATH);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, text, 'utf8');

    return root;
}

/** То же деревом объекта: настройку почти везде пишут разбираемой. */
function treeOf(settings: Record<string, unknown>): string {
    return tree(JSON.stringify(settings));
}

describe('readThresholds', () => {
    it('SC-AK-433 — пороги стража и пороги сжатия читаются из одной настройки', (): void => {
        const thresholds: IThresholds | null = readThresholds(
            treeOf({
                autoCompactWindow: 1000000,
                env: {
                    RT_WINDOW_TOKENS: '1000000',
                    RT_WINDOW_WARN_PCT: '40',
                    RT_WINDOW_STOP_PCT: '50',
                    RT_WINDOW_MARGIN_PCT: '5',
                    CLAUDE_AUTOCOMPACT_PCT_OVERRIDE: '45',
                },
            })
        );

        expect(thresholds).toEqual({
            window: 1000000,
            warnPct: 40,
            stopPct: 50,
            marginPct: 5,
            compactWindow: 1000000,
            compactPct: 45,
        });
    });

    it('доли, не объявленные деревом, приходят умолчаниями профиля', (): void => {
        const thresholds: IThresholds | null = readThresholds(treeOf({ env: { RT_WINDOW_TOKENS: '400000' } }));

        expect(thresholds?.warnPct).toBe(40);
        expect(thresholds?.stopPct).toBe(50);
        expect(thresholds?.marginPct).toBe(5);
        expect(thresholds?.compactWindow).toBeNull();
        expect(thresholds?.compactPct).toBeNull();
    });

    it('дерево без размера окна стража не получает — судить нечего', (): void => {
        expect(readThresholds(treeOf({ env: {} }))).toBeNull();
        expect(readThresholds(treeOf({}))).toBeNull();
    });

    it('настройки нет вовсе — молчим, а не краснеем', (): void => {
        expect(readThresholds('/дерева-с-таким-именем-нет')).toBeNull();
    });

    it('настройку не разобрать — молчим целиком: назвать расхождением непрочитанное нельзя', (): void => {
        expect(readThresholds(tree('{ "env": { // JSON комментариев не разбирает\n'))).toBeNull();
    });

    it('значение, которого нельзя посчитать, объявленным не считается', (): void => {
        const thresholds: IThresholds | null = readThresholds(
            treeOf({ autoCompactWindow: 0, env: { RT_WINDOW_TOKENS: '1000000', CLAUDE_AUTOCOMPACT_PCT_OVERRIDE: 'половина' } })
        );

        expect(thresholds?.compactWindow).toBeNull();
        expect(thresholds?.compactPct).toBeNull();
    });
});

describe('thresholdDrift', () => {
    it('SC-AK-434 — разъехавшиеся пары названы каждая своей строкой', (): void => {
        const thresholds: IThresholds | null = readThresholds(
            treeOf({
                autoCompactWindow: 500000,
                env: { RT_WINDOW_TOKENS: '1000000', RT_WINDOW_STOP_PCT: '50', CLAUDE_AUTOCOMPACT_PCT_OVERRIDE: '92' },
            })
        );

        expect(thresholdDrift(thresholds as IThresholds)).toEqual([
            { what: 'размер окна', guard: '1000000', compact: '500000', why: expect.stringContaining('не от того же окна') },
            { what: 'доля окна', guard: '50%', compact: '92%', why: expect.stringContaining('выше остановки') },
        ]);
    });

    it('SC-AK-469 — порог сжатия ниже порога остановки на запас и более расхождения не даёт', (): void => {
        const thresholds: IThresholds | null = readThresholds(
            treeOf({ autoCompactWindow: 1000000, env: { RT_WINDOW_TOKENS: '1000000', CLAUDE_AUTOCOMPACT_PCT_OVERRIDE: '45' } })
        );

        expect(thresholdDrift(thresholds as IThresholds)).toEqual([]);
    });

    it('SC-AK-470 — совпавшие пороги отбиваются: их гонку выигрывает страж', (): void => {
        const thresholds: IThresholds | null = readThresholds(
            treeOf({ autoCompactWindow: 1000000, env: { RT_WINDOW_TOKENS: '1000000', CLAUDE_AUTOCOMPACT_PCT_OVERRIDE: '50' } })
        );

        expect(thresholdDrift(thresholds as IThresholds)).toEqual([
            { what: 'доля окна', guard: '50%', compact: '50%', why: expect.stringContaining('пороги совпали') },
        ]);
    });

    it('SC-AK-471 — порог сжатия выше порога остановки отбивается', (): void => {
        const thresholds: IThresholds | null = readThresholds(
            treeOf({ autoCompactWindow: 1000000, env: { RT_WINDOW_TOKENS: '1000000', CLAUDE_AUTOCOMPACT_PCT_OVERRIDE: '60' } })
        );

        expect(thresholdDrift(thresholds as IThresholds)).toEqual([
            { what: 'доля окна', guard: '50%', compact: '60%', why: expect.stringContaining('выше остановки') },
        ]);
    });

    it('SC-AK-472 — запаса меньше объявленного не хватает, и отказ называет оба числа', (): void => {
        const thresholds: IThresholds | null = readThresholds(
            treeOf({
                autoCompactWindow: 1000000,
                env: { RT_WINDOW_TOKENS: '1000000', RT_WINDOW_MARGIN_PCT: '5', CLAUDE_AUTOCOMPACT_PCT_OVERRIDE: '49' },
            })
        );

        expect(thresholdDrift(thresholds as IThresholds)).toEqual([
            {
                what: 'запас между порогами',
                guard: '5% объявлено',
                compact: '1% на деле',
                why: expect.stringContaining('не мгновенно'),
            },
        ]);
    });

    it('SC-AK-473 — незаданный порог сжатия расхождением не считается: его назначает инструмент', (): void => {
        const thresholds: IThresholds | null = readThresholds(treeOf({ env: { RT_WINDOW_TOKENS: '1000000' } }));

        expect(thresholdDrift(thresholds as IThresholds)).toEqual([]);
    });
});

describe('thresholdLines', () => {
    it('SC-AK-435 — незаданный порог сжатия разбор называет вместе с готовыми числами', (): void => {
        const lines: string[] = thresholdLines(treeOf({ env: { RT_WINDOW_TOKENS: '1000000' } }));

        expect(lines[0]).toContain('окно захода: 1000000 токенов');
        expect(lines.join('\n')).toContain('порог сжатия деревом не задан');
        expect(lines.join('\n')).toContain('числом 45');
    });

    it('разведённые пороги разбор называет одной строкой без расхождений', (): void => {
        const lines: string[] = thresholdLines(
            treeOf({ autoCompactWindow: 1000000, env: { RT_WINDOW_TOKENS: '1000000', CLAUDE_AUTOCOMPACT_PCT_OVERRIDE: '45' } })
        );

        expect(lines.join('\n')).toContain('порог сжатия ниже порога остановки на 5% и более');
        expect(lines.join('\n')).not.toContain('разошёлся');
    });

    it('разошедшиеся пороги разбор называет числами обеих сторон', (): void => {
        const lines: string[] = thresholdLines(
            treeOf({ autoCompactWindow: 1000000, env: { RT_WINDOW_TOKENS: '1000000', CLAUDE_AUTOCOMPACT_PCT_OVERRIDE: '92' } })
        );

        expect(lines.join('\n')).toContain('порог сжатия разошёлся с порогом остановки');
        expect(lines.join('\n')).toContain('у стража 50%, у сжатия 92%');
        expect(lines.join('\n')).toContain('выше остановки');
    });

    it('SC-AK-474 — дерево без размера окна раздела не получает вовсе', (): void => {
        expect(thresholdLines(treeOf({ env: {} }))).toEqual([]);
    });
});
