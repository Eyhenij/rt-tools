import { ICargoStateBody } from './cargo.js';
import { IMarked, IMarkOptions, itemsOf, mark, TMarkCall } from './cargo-state.js';
import { IOutcomeOfCommand } from './commands.js';

const INTAKE: string = 'https://intake.example';
const TREE: string = 'own-tree';

/** Двойник вызова приёма: запоминает пакеты и отвечает тем, что ему задали. */
function callSaving(sent: ICargoStateBody[], answer: IMarked): TMarkCall {
    return async (_intake: string, _token: string, body: ICargoStateBody): Promise<IMarked> => {
        sent.push(body);

        return answer;
    };
}

/** Ответ приёма, в котором ничего не отбито. */
function accepted(changed: number, same: number = 0): IMarked {
    return { ok: true, status: 200, said: '', accepted: { tree: TREE, changed, same, denied: [] } };
}

function optionsOf(over: Partial<IMarkOptions>): IMarkOptions {
    return {
        intake: INTAKE,
        tree: TREE,
        token: 'токен',
        state: 'in_work',
        items: itemsOf(['mark', '--postmortem', 'a.md', '--postmortem', 'b.md'], 'in_work'),
        dryRun: false,
        call: callSaving([], accepted(2)),
        ...over,
    };
}

describe('itemsOf', () => {
    it('SC-AK-427 — записи берутся из доводов в том порядке, в каком их назвали', () => {
        expect(itemsOf(['mark', '--postmortem', 'a.md', '--proposal', 'digest-1'], 'fixed')).toEqual([
            { kind: 'postmortem', key: 'a.md', state: 'fixed' },
            { kind: 'proposal', key: 'digest-1', state: 'fixed' },
        ]);
    });

    it('SC-MB-191 — довод текста ложится каждой записи вызова', () => {
        expect(
            itemsOf(['mark', '--postmortem', 'a.md', '--proposal', 'digest-1'], 'fixed', {
                fixNote: 'статьёй правила',
                releaseVersion: '',
            })
        ).toEqual([
            { kind: 'postmortem', key: 'a.md', state: 'fixed', fixNote: 'статьёй правила' },
            { kind: 'proposal', key: 'digest-1', state: 'fixed', fixNote: 'статьёй правила' },
        ]);
    });

    it('SC-MB-207 — довод версии ложится каждой записи вызова', () => {
        expect(
            itemsOf(['mark', '--postmortem', 'a.md', '--proposal', 'digest-1'], 'released', {
                fixNote: '',
                releaseVersion: 'rt-agent-kit@0.10.1',
            })
        ).toEqual([
            { kind: 'postmortem', key: 'a.md', state: 'released', releaseVersion: 'rt-agent-kit@0.10.1' },
            { kind: 'proposal', key: 'digest-1', state: 'released', releaseVersion: 'rt-agent-kit@0.10.1' },
        ]);
    });

    it('SC-MB-191 — без довода строка едет прежней, без приложенных полей', () => {
        expect(itemsOf(['mark', '--postmortem', 'a.md'], 'in_work')).toEqual([{ kind: 'postmortem', key: 'a.md', state: 'in_work' }]);
        expect(itemsOf(['mark', '--postmortem', 'a.md'], 'in_work', { fixNote: '', releaseVersion: '' })).toEqual([
            { kind: 'postmortem', key: 'a.md', state: 'in_work' },
        ]);
    });

    it('SC-AK-431 — довод без значения записью не считается', () => {
        expect(itemsOf(['mark', '--postmortem', '--dry-run'], 'new')).toEqual([]);
        expect(itemsOf(['mark', '--postmortem'], 'new')).toEqual([]);
    });
});

describe('mark', () => {
    it('SC-AK-427 — обе записи уезжают одним запросом, а вывод называет переведённые', async () => {
        const sent: ICargoStateBody[] = [];
        const outcome: IOutcomeOfCommand = await mark(optionsOf({ call: callSaving(sent, accepted(2)) }));

        expect(sent).toHaveLength(1);
        expect(sent[0].items).toHaveLength(2);
        expect(sent[0].tree).toBe(TREE);
        expect(outcome.code).toBe(0);
        expect(outcome.lines.join('\n')).toContain('переведено 2');
    });

    it('SC-AK-428 — холостой ход печатает пакет и в сеть не идёт', async () => {
        const sent: ICargoStateBody[] = [];
        const outcome: IOutcomeOfCommand = await mark(optionsOf({ dryRun: true, call: callSaving(sent, accepted(2)) }));

        expect(sent).toEqual([]);
        expect(outcome.code).toBe(0);
        expect(outcome.lines.join('\n')).toContain('уехало бы');
    });

    it('SC-AK-429 — без токена дерева отметка отказывает до сети', async () => {
        const sent: ICargoStateBody[] = [];
        const outcome: IOutcomeOfCommand = await mark(optionsOf({ token: '', call: callSaving(sent, accepted(2)) }));

        expect(sent).toEqual([]);
        expect(outcome.code).not.toBe(0);
        expect(outcome.lines.join('\n')).toContain('enroll');
    });

    it('SC-AK-430 — незнакомое состояние отбивается до сети и называет набор', async () => {
        const sent: ICargoStateBody[] = [];
        const outcome: IOutcomeOfCommand = await mark(optionsOf({ state: 'разобрано наполовину', call: callSaving(sent, accepted(2)) }));

        expect(sent).toEqual([]);
        expect(outcome.code).not.toBe(0);
        expect(outcome.lines.join('\n')).toContain('in_work');
    });

    it('SC-AK-431 — вызов без записей отбивается и называет доводы', async () => {
        const sent: ICargoStateBody[] = [];
        const outcome: IOutcomeOfCommand = await mark(optionsOf({ items: [], call: callSaving(sent, accepted(0)) }));

        expect(sent).toEqual([]);
        expect(outcome.code).not.toBe(0);
        expect(outcome.lines.join('\n')).toContain('--postmortem');
        expect(outcome.lines.join('\n')).toContain('--proposal');
    });

    it('SC-AK-432 — отбитая приёмом запись печатается ключом и причиной, а код ненулевой', async () => {
        const answer: IMarked = {
            ok: true,
            status: 200,
            said: '',
            accepted: {
                tree: TREE,
                changed: 1,
                same: 0,
                denied: [{ at: 1, kind: 'postmortem', key: 'b.md', denial: 'forbidden' }],
            },
        };
        const outcome: IOutcomeOfCommand = await mark(optionsOf({ call: callSaving([], answer) }));

        expect(outcome.code).not.toBe(0);
        expect(outcome.lines.join('\n')).toContain('переведено 1');
        expect(outcome.lines.join('\n')).toContain('b.md');
        expect(outcome.lines.join('\n')).toContain('переход не разрешён');
    });

    it('SC-AK-432 — молчание приёма кончает команду ненулевым кодом', async () => {
        const silent: TMarkCall = async (): Promise<IMarked> => ({
            ok: false,
            status: 0,
            said: 'вышло время',
            accepted: null,
        });
        const outcome: IOutcomeOfCommand = await mark(optionsOf({ call: silent }));

        expect(outcome.code).not.toBe(0);
        expect(outcome.lines.join('\n')).toContain('молчанием');
    });
});
