import { IAsset } from './assets.js';
import { isMetricKey } from './cargo.js';
import { dayMetrics, ITreeFacts } from './metric-lines.js';
import { IObservation } from './observations.js';

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
