import { IAsset } from './assets.js';
import { isMetricKey } from './cargo.js';
import { dayMetrics } from './metric-lines.js';
import { ITreeFacts } from './metric-send-mark.js';
import { IObservation } from './observations.js';
import { EOutcome } from './outcomes.js';
import { IWorkResultDay } from './work-result.js';

const ASSETS: readonly IAsset[] = [
    { id: 'rules/testing.md', kind: 'rules', name: 'testing', text: '', target: '', executable: false },
    { id: 'hooks/git-guard-push.sh', kind: 'hooks', name: 'git-guard-push', text: '', target: '', executable: true },
    { id: 'agents/goal-critic.md', kind: 'agents', name: 'goal-critic', text: '', target: '', executable: false },
];

function seen(event: string, resource: string, over: Partial<IObservation> = {}): IObservation {
    return { event, resource, kind: '', session: 's1', version: '0.35.0', ...over };
}

const FACTS: ITreeFacts = {
    rulesLaidOut: 40,
    rulesDead: 3,
    sectionsTotal: 200,
    sectionsOverridden: 5,
    entryChars: 9000,
    outcomesBroken: 1,
    outcomesUnread: 1,
    sendFault: 2,
};

describe('dayMetrics', () => {
    it('считает отказы, загрузки и сессии дня', () => {
        const metrics: Readonly<Record<string, number>> = dayMetrics(
            [
                seen('guard-deny', 'git-guard-push', { empty: true }),
                seen('skill-load', 'testing'),
                seen('skill-load', 'testing', { session: 's2' }),
                seen('gate-deny', 'testing', { kind: 'ts' }),
            ],
            ASSETS,
            null
        );

        expect(metrics).toMatchObject({
            sessions: 2,
            'guardRefusals:git-guard-push': 1,
            'guardEmpty:git-guard-push': 1,
            'ruleLoads:testing': 2,
            'gateRefusals:testing': 1,
        });
    });

    it('SC-AK-1322 — приёмка и откат разных дней складываются так же, как одного', () => {
        const passed: IObservation = seen('task-outcome', EOutcome.FirstPass);
        const lost: IObservation = seen('task-outcome', EOutcome.Lost);

        const first: Readonly<Record<string, number>> = dayMetrics([passed], ASSETS, null);
        const second: Readonly<Record<string, number>> = dayMetrics([lost], ASSETS, null);
        const same: Readonly<Record<string, number>> = dayMetrics([passed, lost], ASSETS, null);

        expect(first).toMatchObject({ tasksFirstPass: 1 });
        expect(second).toMatchObject({ tasksLost: 1 });
        expect(same).toMatchObject({ tasksFirstPass: 1, tasksLost: 1 });
    });

    it('SC-AK-1305 — имя, которого пакет не везёт, уходит словом own', () => {
        const metrics: Readonly<Record<string, number>> = dayMetrics(
            [seen('skill-load', 'client-secret-task'), seen('guard-deny', 'client-guard'), seen('role-call', 'client-role')],
            ASSETS,
            null
        );

        expect(metrics).toMatchObject({ 'ruleLoads:own': 1, 'guardRefusals:own': 1, 'roleCalls:own': 1 });
        expect(JSON.stringify(metrics)).not.toContain('client');
    });

    it('SC-AK-1280 — ключ вне формы не уходит и не отказывает строку', () => {
        const metrics: Readonly<Record<string, number>> = dayMetrics(
            [seen('run', 'Two Words', { seconds: 5, kind: 'Two Words' }), seen('skill-load', 'testing')],
            ASSETS,
            null
        );

        expect(Object.keys(metrics).every(isMetricKey)).toBe(true);
        expect(metrics['ruleLoads:testing']).toBe(1);
    });

    it('роль и команда считаются разными ключами, приговор считается отдельно', () => {
        const metrics: Readonly<Record<string, number>> = dayMetrics(
            [
                seen('role-call', 'goal-critic'),
                seen('role-verdict', 'goal-critic', { verdict: 'refused' }),
                seen('command-call', 'goal-critic'),
            ],
            ASSETS,
            null
        );

        expect(metrics).toMatchObject({
            'roleCalls:goal-critic': 1,
            'commandCalls:goal-critic': 1,
            'roleVerdicts:goal-critic': 1,
            'roleRefused:goal-critic': 1,
        });
    });

    it('числа дерева едут только там, где их передали', () => {
        expect(dayMetrics([], ASSETS, null)).toEqual({});
        expect(dayMetrics([], ASSETS, FACTS)).toEqual(FACTS);
    });

    it('неизвестное число дерева не становится нулём', () => {
        expect(dayMetrics([], ASSETS, { ...FACTS, rulesDead: null, entryChars: null })).not.toHaveProperty('rulesDead');
    });
});

describe('результат работы в строке дня', () => {
    const MERGES: IWorkResultDay = {
        day: '2026-11-13',
        recorded: false,
        beforeCounter: false,
        skipped: 0,
        goalNotMet: 0,
        tasksMerged: 0,
        tasksTimed: 0,
        takenMinutes: 0,
    };
    const RECORDED: IWorkResultDay = {
        ...MERGES,
        recorded: true,
        skipped: 1,
        goalNotMet: 2,
        tasksMerged: 3,
        tasksTimed: 2,
        takenMinutes: 390,
        calls: 187,
        refusals: 35,
        byKind: { hook: 30, permission: 1, stop: 4 },
        byCheck: { 'git-guard-push': { refusals: 5, per100: 2.67 }, 'tree-own-guard': { refusals: 30, per100: 16.04 } },
        pairs: { 'git-guard-push → tree-own-guard': 4 },
        idleMinutes: 42,
        reasks: 3,
        interrupts: 2,
        ownerWords: 196,
        deadEnds: 1,
    };

    it('SC-AK-1630 — новые числа дня стоят под ключами закрытого списка, отказы записи отдельно от отказов проверок', () => {
        const metrics: Readonly<Record<string, number>> = dayMetrics([seen('guard-deny', 'git-guard-push')], ASSETS, null, RECORDED);

        expect(metrics).toMatchObject({
            calls: 187,
            refusalsHook: 30,
            refusalsPermission: 1,
            refusalsStop: 4,
            'recordRefusals:git-guard-push': 5,
            'recordRefusals:own': 30,
            'guardRefusals:git-guard-push': 1,
            'refusalPairs:git-guard-push:own': 4,
            idleMinutes: 42,
            reasks: 3,
            interrupts: 2,
            ownerWords: 196,
            goalNotMet: 2,
            deadEnds: 1,
            tasksMerged: 3,
            tasksTimed: 2,
            takenMinutes: 390,
            recordLinesSkipped: 1,
        });
        expect(Object.keys(metrics).every((key: string): boolean => isMetricKey(key))).toBe(true);
    });

    it('SC-AK-1647 — пара двух длинных имён уходит ключом из двух половин', () => {
        // буквы вне шестнадцатеричных: длинный ряд таких форма имени принимает за сумму
        const long: string = 'k'.repeat(20) + '-guard-' + 'm'.repeat(13);
        const assets: readonly IAsset[] = [
            ...ASSETS,
            { id: `hooks/${long}.sh`, kind: 'hooks', name: long, text: '', target: '', executable: true },
            { id: `hooks/${long}-x.sh`, kind: 'hooks', name: `${long}-x`, text: '', target: '', executable: true },
        ];
        const metrics: Readonly<Record<string, number>> = dayMetrics([], assets, null, {
            ...RECORDED,
            byCheck: {},
            pairs: { [`${long} → ${long}-x`]: 2 },
        });

        expect(long).toHaveLength(40);
        expect(metrics[`refusalPairs:${long}:${long}-x`]).toBe(2);
        expect(isMetricKey(`refusalPairs:${long}:${long}-x`)).toBe(true);
        expect(isMetricKey(`refusalPairs:${long}`)).toBe(false);
    });

    it('SC-AK-1649 — день до счётчика не несёт ключей записи, а слияния несёт', () => {
        const metrics: Readonly<Record<string, number>> = dayMetrics([], ASSETS, null, { ...MERGES, beforeCounter: true, tasksMerged: 1 });

        expect(metrics).toEqual({ tasksMerged: 1 });
    });

    it('SC-AK-1653 — две свои проверки складываются под одним `own`', () => {
        const metrics: Readonly<Record<string, number>> = dayMetrics([], ASSETS, null, {
            ...RECORDED,
            byCheck: { 'first-own-guard': { refusals: 2, per100: 1 }, 'second-own-guard': { refusals: 3, per100: 1.5 } },
            pairs: {},
        });

        expect(metrics['recordRefusals:own']).toBe(5);
    });
});
