/**
 * Итог задачи: сценарии договорённости `docs/specs/agent-kit/proposed/metrics/`.
 */
import { execFileSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { IObservation, OBSERVATIONS_DIR, parseObservation } from './observations.js';
import {
    changedAfterHandover,
    collectOutcomes,
    EOutcome,
    ICountedPull,
    IPullFact,
    newOutcomes,
    outcomeLines,
    outcomeMetricOf,
    outcomeOf,
} from './outcomes.js';

const HANDED: IPullFact['handover'] = { commit: 'c1', tree: 't1' };

function pull(fields: Partial<IPullFact>): IPullFact {
    return {
        number: 10,
        merged: true,
        task: 5,
        revert: false,
        epic: false,
        closed: '2026-08-10',
        handover: HANDED,
        corrections: 0,
        commits: [{ sha: 'c1', tree: 't1', parents: 1 }],
        ...fields,
    };
}

function outcome(result: EOutcome): IObservation {
    return { event: 'task-outcome', resource: result, kind: '', session: '', version: '0.34.0' };
}

describe('итог заявки', () => {
    it('SC-AK-1273 — заявка без изменений после передачи принята с первого раза', () => {
        expect(outcomeOf(pull({}))).toBe(EOutcome.FirstPass);
    });

    it('SC-AK-1273 — правка владельца после передачи снимает первую приёмку', () => {
        expect(outcomeOf(pull({ corrections: 1 }))).toBe(EOutcome.Changed);
    });

    it('SC-AK-1274 — слияние базы после передачи первую приёмку не снимает', () => {
        const commits: IPullFact['commits'] = [
            { sha: 'c1', tree: 't1', parents: 1 },
            { sha: 'c2', tree: 't2', parents: 2 },
        ];

        expect(changedAfterHandover(pull({ commits }))).toBe(false);
        expect(outcomeOf(pull({ commits }))).toBe(EOutcome.FirstPass);
    });

    it('SC-AK-1275 — переписанная история с другим деревом снимает первую приёмку', () => {
        expect(outcomeOf(pull({ commits: [{ sha: 'other', tree: 't2', parents: 1 }] }))).toBe(EOutcome.Changed);
    });

    it('SC-AK-1275 — переписанная история с тем же деревом изменением не считается', () => {
        expect(outcomeOf(pull({ commits: [{ sha: 'other', tree: 't1', parents: 1 }] }))).toBe(EOutcome.FirstPass);
    });

    it('SC-AK-1275 — коммит после передачи снимает первую приёмку', () => {
        const commits: IPullFact['commits'] = [
            { sha: 'c1', tree: 't1', parents: 1 },
            { sha: 'c2', tree: 't2', parents: 1 },
        ];

        expect(outcomeOf(pull({ commits }))).toBe(EOutcome.Changed);
    });

    it('SC-AK-1276 — закрытая без слияния заявка считается в знаменателе', () => {
        expect(outcomeOf(pull({ merged: false }))).toBe(EOutcome.Closed);
        expect(outcomeMetricOf([outcome(EOutcome.FirstPass), outcome(EOutcome.Closed)])).toEqual({
            accepted: 1,
            closed: 1,
            firstPass: 1,
            lost: 0,
        });
    });

    it('заявка эпика и заявка без подписи передачи не считаются', () => {
        expect(outcomeOf(pull({ epic: true }))).toBeNull();
        expect(outcomeOf(pull({ handover: null }))).toBeNull();
    });
});

describe('новые итоги', () => {
    const counted: readonly ICountedPull[] = [{ number: 10, task: 5, day: '2026-08-10', outcome: EOutcome.FirstPass }];

    it('SC-AK-1276 — заявка считается один раз', () => {
        expect(newOutcomes([pull({})], counted)).toEqual([]);
    });

    it('откат в срок снимает первую приёмку', () => {
        const fresh: readonly ICountedPull[] = newOutcomes([pull({ number: 11, revert: true, closed: '2026-08-12' })], counted);

        expect(fresh).toEqual([{ number: 11, task: 5, day: '2026-08-12', outcome: EOutcome.Lost }]);
    });

    it('новая заявка той же задачи в срок снимает первую приёмку и считается сама', () => {
        const fresh: readonly ICountedPull[] = newOutcomes([pull({ number: 12, closed: '2026-08-20' })], counted);

        expect(fresh.map((entry: ICountedPull): EOutcome => entry.outcome)).toEqual([EOutcome.Lost, EOutcome.FirstPass]);
    });

    it('заявка той же задачи позже срока первую приёмку не снимает', () => {
        const fresh: readonly ICountedPull[] = newOutcomes([pull({ number: 12, closed: '2026-08-25' })], counted);

        expect(fresh.map((entry: ICountedPull): EOutcome => entry.outcome)).toEqual([EOutcome.FirstPass]);
    });

    it('снятая первая приёмка уходит из числа, но задача остаётся принятой', () => {
        expect(outcomeMetricOf([outcome(EOutcome.FirstPass), outcome(EOutcome.Lost)])).toEqual({
            accepted: 1,
            closed: 0,
            firstPass: 0,
            lost: 1,
        });
    });

    it('без записей итогов числа нет', () => {
        expect(outcomeMetricOf([{ event: 'skill-load', resource: 'testing', kind: '', session: '', version: '' }])).toBeNull();
    });
});

describe('итоги словами', () => {
    it('SC-AK-1276 — одна принятая и одна закрытая без слияния читаются как один из двух', () => {
        const lines: readonly string[] = outcomeLines({ accepted: 1, closed: 1, firstPass: 1, lost: 0 }, true, 0);

        expect(lines).toContain('принято с первого раза: 1 из 2');
    });

    it('с десяти задач появляется доля', () => {
        const lines: readonly string[] = outcomeLines({ accepted: 10, closed: 0, firstPass: 7, lost: 3 }, true, 5);

        expect(lines).toContain('принято с первого раза: 7 из 10 (70%)');
        expect(lines).toContain('правки владельца на задачу: 5, на задачу 0.5');
    });

    it('дерево, где спросить некого, названо, а не показывает ноль', () => {
        const lines: readonly string[] = outcomeLines(null, false, 0);

        expect(lines.join('\n')).toContain('спросить некого');
        expect(lines.join('\n')).not.toContain('принято с первого раза');
    });

    it('без записей и с ответом хостинга строк нет: о них говорит строка без данных', () => {
        expect(outcomeLines(null, true, 0)).toEqual([]);
    });
});

describe('collectOutcomes', () => {
    const TODAY: string = '2026-08-12';
    let root: string;

    /** Дерево с разложенным чтением и профилем, который отдаёт эти строки. */
    function treeWith(lines: readonly string[]): void {
        mkdirSync(join(root, '.claude', 'hooks'), { recursive: true });
        mkdirSync(join(root, '.claude', 'rt-kit'), { recursive: true });
        for (const file of ['pull-outcomes.sh', 'metric-marks.sh', 'observe.sh', 'utf8.sh']) {
            writeFileSync(join(root, '.claude', 'hooks', file), readFileSync(join(__dirname, '..', '..', 'assets', 'hooks', file), 'utf8'));
        }
        chmodSync(join(root, '.claude', 'hooks', 'pull-outcomes.sh'), 0o755);
        writeFileSync(join(root, '.claude', 'rt-kit', 'project.sh'), `rt_pull_outcomes() { cat <<'EOF'\n${lines.join('\n')}\nEOF\n}\n`);
    }

    function outcomes(): readonly (string | undefined)[] {
        const dir: string = join(root, OBSERVATIONS_DIR);

        return existsSync(dir)
            ? readdirSync(dir)
                  .filter((name: string): boolean => name.endsWith('.jsonl'))
                  .flatMap((name: string): readonly string[] => readFileSync(join(dir, name), 'utf8').split('\n'))
                  .map((line: string): string | undefined => parseObservation(line)?.resource)
                  .filter((name: string | undefined): boolean => name !== undefined)
            : [];
    }

    beforeEach((): void => {
        root = mkdtempSync(join(tmpdir(), 'rt-outcomes-'));
    });

    afterEach((): void => {
        rmSync(root, { recursive: true, force: true });
    });

    it('спросить некого: функции профиля нет, и это названо', () => {
        expect(collectOutcomes(root, TODAY, '0.34.0')).toBe(false);
    });

    it('SC-AK-1276 — итог пишется один раз, номера в наблюдения не попадают', () => {
        const line: string = JSON.stringify({ ...pull({ number: 777, handover: null }), head: 'RT-5-probe' });

        treeWith([line]);
        // Подпись кладёт тот же код, что и проверка поставки: имя файла считается в одном месте.
        execFileSync('bash', ['-c', `. .claude/hooks/metric-marks.sh; printf 'c1 t1\\n' > "$(rt_branch_mark handover RT-5-probe)"`], {
            cwd: root,
            env: { ...process.env, CLAUDE_PROJECT_DIR: root },
        });

        expect(collectOutcomes(root, TODAY, '0.34.0')).toBe(true);
        expect(collectOutcomes(root, TODAY, '0.34.0')).toBe(true);
        expect(outcomes()).toEqual(['first-pass']);
        expect(readFileSync(join(root, OBSERVATIONS_DIR, `${TODAY}.jsonl`), 'utf8')).toContain('"res":"first-pass"');
        expect(readFileSync(join(root, OBSERVATIONS_DIR, `${TODAY}.jsonl`), 'utf8')).not.toContain('777');
    });

    it('заявка без подписи передачи не считается', () => {
        treeWith([JSON.stringify({ ...pull({ number: 777, handover: null }), head: 'RT-5-probe' })]);

        expect(collectOutcomes(root, TODAY, '0.34.0')).toBe(true);
        expect(outcomes()).toEqual([]);
    });
});
