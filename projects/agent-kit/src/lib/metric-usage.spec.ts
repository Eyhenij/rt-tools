/**
 * Использование слоя правил: сценарии договорённости `docs/specs/agent-kit/proposed/metrics/`.
 */
import { IUsageMetric, usageCounted, usageLines, usageOf } from './metric-usage.js';
import { IObservation } from './observations.js';

function line(event: string, resource: string, session: string, more: Partial<IObservation> = {}): IObservation {
    return { event, resource, kind: '', session, version: '0.34.0', ...more };
}

function linesOf(usage: IUsageMetric): readonly string[] {
    return usageLines(usage, (lines: readonly string[]): readonly string[] => lines);
}

describe('вызовы ролей', () => {
    it('SC-AK-1291 — роль пакета считается по имени, своя роль дерева постоянным словом', () => {
        const usage: IUsageMetric = usageOf([
            line('role-call', 'goal-critic', 's1', { verdict: 'refused' }),
            line('role-call', 'goal-critic', 's1', { verdict: 'passed' }),
            line('role-call', 'tree-own', 's1'),
            line('command-call', 'feedback', 's1'),
        ]);

        expect(usage.calls).toEqual([
            { name: 'goal-critic', calls: 2, verdicts: 2, refused: 1 },
            { name: 'feedback', calls: 1, verdicts: 0, refused: 0 },
            { name: 'tree-own', calls: 1, verdicts: 0, refused: 0 },
        ]);
        expect(linesOf(usage)).toContain('  goal-critic: 2, отказано 1 из 2 (50%)');
        expect(linesOf(usage)).toContain('  tree-own: 1');
    });

    it('SC-AK-1291 — вызов без приговора долю отказов не трогает', () => {
        const usage: IUsageMetric = usageOf([line('role-call', 'goal-critic', 's1'), line('role-call', 'goal-critic', 's1')]);

        expect(linesOf(usage)).toContain('  goal-critic: 2');
        expect(usageCounted(usage)).toContain('Вызовы ролей и команд');
        expect(usageCounted(usage)).not.toContain('Доля работы, отказанной ролью');
    });
});

describe('экзамены', () => {
    it('считается первый приговор сессии', () => {
        const usage: IUsageMetric = usageOf([
            line('exam-verdict', 'failed', 's1'),
            line('exam-verdict', 'passed', 's1'),
            line('exam-verdict', 'passed', 's2'),
        ]);

        expect(usage.examSessions).toBe(2);
        expect(usage.examsFirstPass).toBe(1);
        expect(linesOf(usage)).toContain('экзамены с первого раза: 1 из 2');
    });
});

describe('отказы после загрузки правила', () => {
    it('отказ считается против правила, загруженного в этой сессии', () => {
        const usage: IUsageMetric = usageOf([
            line('guard-deny', 'prose-style-guard', 's1', { rule: 'doc-style' }),
            line('skill-load', 'doc-style', 's1'),
            line('guard-deny', 'prose-style-guard', 's1', { rule: 'doc-style' }),
            line('guard-deny', 'prose-style-guard', 's2', { rule: 'doc-style' }),
        ]);

        expect(usage.refusalsAfterLoad).toEqual([{ name: 'doc-style', count: 1 }]);
        expect(usage.refusalsWithRule).toBe(3);
        expect(linesOf(usage)).toContain('отказы после загрузки правила: 1 из 3');
    });

    it('отказ шлюза правил в этот счёт не входит: запись загрузок гибнет со сжатием окна', () => {
        const usage: IUsageMetric = usageOf([line('skill-load', 'testing', 's1'), line('gate-deny', 'testing', 's1')]);

        expect(usage.refusalsAfterLoad).toEqual([]);
        expect(usageCounted(usage)).not.toContain('Отказы после загрузки правила');
    });
});

describe('доля правок', () => {
    it('знаменатель считает все правки, числитель только отказы по файлам', () => {
        const usage: IUsageMetric = usageOf([
            line('edit-seen', '', 's1'),
            line('edit-seen', '', 's1'),
            line('edit-seen', '', 's1'),
            line('edit-seen', '', 's1'),
            line('gate-deny', 'testing', 's1', { kind: 'ts' }),
            line('gate-deny', 'testing', 's1', { kind: 'command' }),
        ]);

        expect(usage.editsRefused).toBe(1);
        expect(linesOf(usage)).toContain('правки до загрузки правила: 1 из 4 (25%)');
        expect(usageCounted(usage)).toContain('Доля правок до загрузки правила');
    });
});

describe('без записей', () => {
    it('строк нет, а не нули', () => {
        expect(linesOf(usageOf([line('skill-load', 'testing', 's1')]))).toEqual([]);
    });
});
