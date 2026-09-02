/**
 * Пометки на надстройках: разбор формы и отбор тех, чья статья в редакции пакета уже есть.
 *
 * Диск здесь настоящий — предмет проверки в том и состоит, что надстройки лежат каталогом, а
 * ресурсы редакции рядом: подменять чтение значило бы проверять подмену.
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { IOverrideMark, marksOfOverride, staleOverrides } from './override-marks.js';
import { OVERRIDES_DIR } from './config.js';

const ARTICLE: string = 'Работа, заказанная словами, становится задачей в очереди тем же ходом.';

describe('пометка раздела надстройки', (): void => {
    it('SC-AK-846 — раздел с пометкой называет ресурс, статью и день', (): void => {
        const text: string = [
            '## Своё',
            '',
            `<!-- rt-proposed: rules/task-flow.md · «${ARTICLE}» · 2026-09-03 -->`,
            '',
            'Текст раздела.',
        ].join('\n');

        expect(marksOfOverride(text, '.claude/rt-kit/overrides/rules/task-flow.md')).toEqual([
            {
                file: '.claude/rt-kit/overrides/rules/task-flow.md',
                heading: 'Своё',
                resource: 'rules/task-flow.md',
                article: ARTICLE,
                day: '2026-09-03',
            },
        ]);
    });

    it('SC-AK-846 — раздел без пометки считается постоянным', (): void => {
        expect(marksOfOverride('## Своё\n\nТекст раздела.', 'overrides/x.md')).toEqual([]);
    });
});

describe('надстройки, чья статья уже приехала', (): void => {
    let root: string = '';
    let assets: string = '';

    const override: (body: string) => void = (body: string): void => {
        mkdirSync(join(root, OVERRIDES_DIR, 'rules'), { recursive: true });
        writeFileSync(join(root, OVERRIDES_DIR, 'rules', 'task-flow.md'), body, 'utf8');
    };

    beforeEach((): void => {
        root = mkdtempSync(join(tmpdir(), 'rt-marks-'));
        assets = mkdtempSync(join(tmpdir(), 'rt-assets-'));
        mkdirSync(join(assets, 'rules'), { recursive: true });
    });

    afterEach((): void => {
        rmSync(root, { recursive: true, force: true });
        rmSync(assets, { recursive: true, force: true });
    });

    it('SC-AK-847 — статья в приехавшей редакции есть: надстройка названа лишней', (): void => {
        override(`## Своё\n\n<!-- rt-proposed: rules/task-flow.md · «${ARTICLE}» · 2026-09-03 -->\n\nТекст.`);
        writeFileSync(join(assets, 'rules', 'task-flow.md'), `# Правило\n\n- **${ARTICLE}** Дальше.\n`, 'utf8');

        const stale: readonly IOverrideMark[] = staleOverrides(root, assets);

        expect(stale).toHaveLength(1);
        expect(stale[0].heading).toBe('Своё');
        expect(stale[0].day).toBe('2026-09-03');
    });

    it('SC-AK-847 — статьи в редакции нет: надстройка молчит', (): void => {
        override(`## Своё\n\n<!-- rt-proposed: rules/task-flow.md · «${ARTICLE}» · 2026-09-03 -->\n\nТекст.`);
        writeFileSync(join(assets, 'rules', 'task-flow.md'), '# Правило\n\nПро другое.\n', 'utf8');

        expect(staleOverrides(root, assets)).toEqual([]);
    });

    it('SC-AK-847 — статья перенесена по своей ширине и всё равно находится', (): void => {
        const wrapped: string = `<!-- rt-proposed: rules/task-flow.md · «Работа, заказанная словами,\n  становится задачей в очереди тем же ходом.» · 2026-09-03 -->`;
        override(`## Своё\n\n${wrapped}\n\nТекст.`);
        writeFileSync(join(assets, 'rules', 'task-flow.md'), `# Правило\n\n- **${ARTICLE}**\n`, 'utf8');

        expect(staleOverrides(root, assets)).toHaveLength(1);
    });

    it('SC-AK-848 — ресурса в редакции нет вовсе: пометка молчит', (): void => {
        override(`## Своё\n\n<!-- rt-proposed: rules/уехало.md · «${ARTICLE}» · 2026-09-03 -->\n\nТекст.`);

        expect(staleOverrides(root, assets)).toEqual([]);
    });

    it('SC-AK-848 — каталога надстроек нет: сверять нечего', (): void => {
        expect(staleOverrides(root, assets)).toEqual([]);
    });
});
