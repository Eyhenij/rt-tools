/**
 * Разбор предложений и проверка на адрес дерева.
 *
 * Сценарии договорённости `docs/specs/agent-kit/proposed/rules-feedback/`: SC-AK-77 … SC-AK-81.
 * Сама отправка проверяется в спеке команд — двойником, а не живой записью.
 */
import { ILeak, IProposal, leaksIn, markSent, marksOf, parseProposals, TO_PACKAGE, TO_TREE } from './proposals.js';
import { repositoryOf } from './submit.js';

const FILE: string = '.claude/rt-kit/proposals/2026-08-12-probe.md';

const text: string = [
    '# Предложения по слою правил',
    '',
    '## пакет · rules/styling-bem.md',
    '',
    '- **место:** раздел «Ловушки», в конец',
    '- **повод:** правило молчит про токены',
    '',
    '> Готовый текст правки.',
    '',
    '## дерево · .claude/rt-kit/gate-map.sh',
    '',
    '- **место:** ветка edit',
    '',
    '> Свой род файлов.',
    '',
    '## пакет · rules/<правило>.md',
    '',
    '> Незаполненный образец из шаблона.',
    '',
].join('\n');

describe('разбор предложений', (): void => {
    it('SC-AK-77 — адрес и ресурс читаются из заголовка', (): void => {
        const found: readonly IProposal[] = parseProposals(text, FILE);

        expect(found).toHaveLength(2);
        expect(found[0]).toMatchObject({ address: TO_PACKAGE, resource: 'rules/styling-bem.md', sent: '' });
        expect(found[1]).toMatchObject({ address: TO_TREE, resource: '.claude/rt-kit/gate-map.sh' });
    });

    it('SC-AK-77 — незаполненный образец предложением не считается', (): void => {
        expect(parseProposals(text, FILE).map((entry: IProposal): string => entry.resource)).not.toContain('rules/<правило>.md');
    });

    it('тело блока едет целиком, а заголовок в него не попадает', (): void => {
        expect(parseProposals(text, FILE)[0].body).toContain('Готовый текст правки.');
        expect(parseProposals(text, FILE)[0].body).not.toContain('## пакет');
    });

    it('заголовок чужой формы блоком не считается', (): void => {
        expect(parseProposals('## Просто раздел\n\nтекст\n', FILE)).toHaveLength(0);
    });

    it('SC-AK-80 — отправленное узнаётся по пометке', (): void => {
        const sent: string = ['## пакет · rules/testing.md', '', '- **отправлено:** https://example.test/1', '', '> Текст.', ''].join('\n');

        expect(parseProposals(sent, FILE)[0].sent).toBe('https://example.test/1');
    });

    it('SC-AK-80 — пометка ложится в свой блок, а не в конец файла', (): void => {
        const marked: string = markSent(text, parseProposals(text, FILE)[0], 'https://example.test/7');
        const again: readonly IProposal[] = parseProposals(marked, FILE);

        expect(again[0].sent).toBe('https://example.test/7');
        expect(again[1].sent).toBe('');
    });
});

describe('адрес дерева в тексте', (): void => {
    const marks: readonly string[] = marksOf('/Users/probe/work/some-tree', 'git@github.com:probe/some-tree.git');

    it('SC-AK-79 — абсолютный путь машины ловится', (): void => {
        const found: readonly ILeak[] = leaksIn('Правится в /Users/probe/work/some-tree/apps/site.', marks);

        expect(found).toHaveLength(1);
        expect(found[0].why).toContain('абсолютный путь');
    });

    it('SC-AK-79 — имя дерева ловится и без пути', (): void => {
        expect(leaksIn('В some-tree это делается иначе.', marks)[0].why).toContain('имя этого дерева');
    });

    it('SC-AK-79 — адрес удалённого репозитория ловится', (): void => {
        expect(leaksIn('см. git@github.com:probe/some-tree.git', marks)).not.toHaveLength(0);
    });

    it('SC-AK-79 — номер строки считается от начала блока', (): void => {
        expect(leaksIn(['первая', 'вторая', 'третья ~/work/тут'].join('\n'), marks)[0].line).toBe(3);
    });

    it('общие пути пакета утечкой не считаются', (): void => {
        expect(leaksIn('Закон лежит в docs/constitution/delivery.md, правило — в .claude/skills/.', marks)).toEqual([]);
        expect(leaksIn('Слой либы — libs/<семья>/<домен>/<слой>.', marks)).toEqual([]);
    });

    it('дерево без удалённого репозитория проверку не ломает', (): void => {
        expect(marksOf('/tmp/probe', '')).toEqual(['/tmp/probe', 'probe']);
    });
});

describe('адрес репозитория пакета', (): void => {
    it('SC-AK-81 — читается из любой формы записи в манифесте', (): void => {
        expect(repositoryOf('https://github.com/Eyhenij/rt-tools.git')).toBe('Eyhenij/rt-tools');
        expect(repositoryOf('git+https://github.com/Eyhenij/rt-tools.git')).toBe('Eyhenij/rt-tools');
        expect(repositoryOf('git@github.com:Eyhenij/rt-tools.git')).toBe('Eyhenij/rt-tools');
    });

    it('SC-AK-81 — чужой хостинг адресом не считается', (): void => {
        expect(repositoryOf('https://example.test/some/repo.git')).toBe('');
        expect(repositoryOf('')).toBe('');
    });
});
