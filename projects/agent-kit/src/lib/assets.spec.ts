import { targetOf } from './assets.js';
import { IEntryOfCatalog } from './catalog.js';
import { DEFAULT_LAYOUT, TKind } from './config.js';

/**
 * Образцы — единственный род, у которого путь внутри рода значит место в дереве, а не слой:
 * `tasks/_template/plan.md` ложится туда, где идёт работа. Отсюда и сценарии: умолчание рода и
 * названный деревом каталог.
 *
 * Наборы сценариев по исполняемым ресурсам пакета отсюда не зовутся: их гоняет цель `test-hooks`
 * пакета — и в наборе перед отправкой, и в конвейере. Отсюда они шли второй раз и держали
 * проверку пакета на 102 секундах из 109.
 */
describe('куда ложится образец', (): void => {
    const sample: Pick<IEntryOfCatalog, 'id' | 'kind' | 'name'> = {
        id: 'samples/tasks/_template/plan.md',
        kind: 'samples',
        name: 'tasks/_template/plan',
    };

    it('SC-AK-202 — образец ложится по своему пути внутри каталога документов', (): void => {
        expect(targetOf(sample, DEFAULT_LAYOUT)).toBe('docs/tasks/_template/plan.md');
    });

    it('SC-AK-203 — дерево называет образцам свой каталог', (): void => {
        const layout: Readonly<Record<TKind, string>> = { ...DEFAULT_LAYOUT, samples: 'работа/образцы' };

        expect(targetOf(sample, layout)).toBe('работа/образцы/tasks/_template/plan.md');
    });
});

describe('холодная часть правила', (): void => {
    it('SC-AK-517 — холодная часть ложится третьим файлом в каталог своего правила', (): void => {
        expect(targetOf({ id: 'pitfalls/task-flow.md', kind: 'pitfalls', name: 'task-flow' }, DEFAULT_LAYOUT)).toBe(
            '.claude/skills/task-flow/pitfalls.md'
        );
    });

    it('SC-AK-518 — холодная часть за имя файла с самим правилом не спорит', (): void => {
        const rule: string = targetOf({ id: 'rules/task-flow.md', kind: 'rules', name: 'task-flow' }, DEFAULT_LAYOUT);
        const pitfalls: string = targetOf({ id: 'pitfalls/task-flow.md', kind: 'pitfalls', name: 'task-flow' }, DEFAULT_LAYOUT);

        expect(rule).not.toBe(pitfalls);
    });
});
