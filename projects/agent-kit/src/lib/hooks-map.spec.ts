/**
 * Карта хуков: что гард говорит о себе и что из этого собирается для настройки агента.
 *
 * Набор стоит отдельно от сквозных сценариев команд потому, что проверяет не раскладку, а разбор
 * объявлений: гард с двумя событиями доезжал до готового куска настройки одним из них, и увидеть
 * это на разложенном дереве было нечем — файл лежал и подключённым выглядел.
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { bindingsOf, driftedMatchers, hooksSection, IHookBinding, IMatcherDrift, SETTINGS_PATH, unboundHooks } from './hooks-map.js';

const GUARD: string = '.claude/hooks/window-fill-guard.sh';

const TWO_EVENTS: string = ['#!/usr/bin/env bash', '# rt-hook: PostToolUse .*', '# rt-hook: PreToolUse .*', 'exit 0'].join('\n');

const eventsOf: (bindings: readonly IHookBinding[]) => readonly string[] = (bindings: readonly IHookBinding[]): readonly string[] =>
    bindings.map((binding: IHookBinding): string => binding.event);

describe('bindingsOf', () => {
    it('SC-AK-42 — гард с двумя объявлениями доезжает до настройки обоими', (): void => {
        const bindings: readonly IHookBinding[] = bindingsOf(TWO_EVENTS, GUARD);
        const section: Record<string, unknown> = hooksSection(bindings);

        expect(eventsOf(bindings)).toEqual(['PostToolUse', 'PreToolUse']);
        expect(JSON.stringify(section['PreToolUse'])).toContain(GUARD);
        expect(JSON.stringify(section['PostToolUse'])).toContain(GUARD);
    });

    it('гард без объявления к агенту не подключается вовсе', (): void => {
        expect(bindingsOf('#!/usr/bin/env bash\nexit 0\n', GUARD)).toEqual([]);
    });

    it('событие без образца встаёт записью без образца: пустому не соответствует ни один вызов', (): void => {
        const section: Record<string, unknown> = hooksSection(bindingsOf('#!/usr/bin/env bash\n# rt-hook: Stop\n', GUARD));

        expect(JSON.stringify(section['Stop'])).not.toContain('matcher');
    });
});

describe('unboundHooks', () => {
    it('настройки нет вовсе — не подключён ни один', (): void => {
        expect(unboundHooks(bindingsOf(TWO_EVENTS, GUARD), '/дерева-с-таким-именем-нет')).toHaveLength(2);
    });
});

/** Дерево с настройкой агента, в которой гард стоит под названным образцом. */
function treeWithMatcher(event: string, matcher: string): string {
    const root: string = mkdtempSync(join(tmpdir(), 'rt-hooks-'));
    const path: string = join(root, SETTINGS_PATH);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(
        path,
        JSON.stringify({
            hooks: { [event]: [{ matcher, hooks: [{ type: 'command', command: `$CLAUDE_PROJECT_DIR/${GUARD}` }] }] },
        })
    );

    return root;
}

const ONE_EVENT: string = ['#!/usr/bin/env bash', '# rt-hook: PreToolUse Edit|Bash', 'exit 0'].join('\n');

describe('driftedMatchers', () => {
    it('SC-AK-260 — гард, подписанный не на то, что объявляет, находится сверкой', (): void => {
        const root: string = treeWithMatcher('PreToolUse', 'Edit');
        try {
            const drifts: readonly IMatcherDrift[] = driftedMatchers(bindingsOf(ONE_EVENT, GUARD), root);

            expect(drifts).toHaveLength(1);
            expect(drifts[0]?.declared).toBe('Edit|Bash');
            expect(drifts[0]?.bound).toBe('Edit');
        } finally {
            rmSync(root, { recursive: true, force: true });
        }
    });

    it('SC-AK-261 — сошедшийся образец расхождением не считается', (): void => {
        const root: string = treeWithMatcher('PreToolUse', 'Edit|Bash');
        try {
            expect(driftedMatchers(bindingsOf(ONE_EVENT, GUARD), root)).toEqual([]);
        } finally {
            rmSync(root, { recursive: true, force: true });
        }
    });

    it('неподключённый гард здесь не называется: о нём говорит своя строка', (): void => {
        const root: string = treeWithMatcher('PostToolUse', 'Edit');
        try {
            expect(driftedMatchers(bindingsOf(ONE_EVENT, GUARD), root)).toEqual([]);
        } finally {
            rmSync(root, { recursive: true, force: true });
        }
    });

    it('настройки, которую не разобрать, расхождений не даёт: образец лежит полем, а не текстом', (): void => {
        const root: string = mkdtempSync(join(tmpdir(), 'rt-hooks-'));
        try {
            mkdirSync(join(root, '.claude'), { recursive: true });
            writeFileSync(join(root, SETTINGS_PATH), '{ // так JSON не разбирается\n"hooks": {}');

            expect(driftedMatchers(bindingsOf(ONE_EVENT, GUARD), root)).toEqual([]);
        } finally {
            rmSync(root, { recursive: true, force: true });
        }
    });
});
