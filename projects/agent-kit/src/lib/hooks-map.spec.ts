/**
 * Карта хуков: что гард говорит о себе и что из этого собирается для настройки агента.
 *
 * Набор стоит отдельно от сквозных сценариев команд потому, что проверяет не раскладку, а разбор
 * объявлений: гард с двумя событиями доезжал до готового куска настройки одним из них, и увидеть
 * это на разложенном дереве было нечем — файл лежал и подключённым выглядел.
 */
import { bindingsOf, hooksSection, IHookBinding, unboundHooks } from './hooks-map.js';

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
