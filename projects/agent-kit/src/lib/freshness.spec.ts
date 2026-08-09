/**
 * Сверка собранного пакета с его исходниками.
 *
 * Проверяется главным образом молчание: у потребителя исходников рядом нет, и сверка обязана не
 * находить их там, где их нет, — иначе первая же установка получала бы отказ на пустом месте.
 */
import { mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { IStaleBuild, staleBuild } from './freshness.js';

const NAME: string = '@probe/kit';

let workspace: string;

const write: (path: string, at: number) => void = (path: string, at: number): void => {
    writeFileSync(path, 'текст', 'utf8');
    utimesSync(path, at, at);
};

/** Рабочее пространство с исходниками пакета и его сборкой в `dist`. */
const layout: (sourceAt: number, builtAt: number) => { source: string; built: string } = (
    sourceAt: number,
    builtAt: number
): { source: string; built: string } => {
    const source: string = join(workspace, 'projects', 'kit');
    const built: string = join(workspace, 'dist', 'kit');
    mkdirSync(join(source, 'assets', 'rules'), { recursive: true });
    mkdirSync(join(built, 'assets', 'rules'), { recursive: true });
    writeFileSync(join(source, 'package.json'), JSON.stringify({ name: NAME }), 'utf8');
    writeFileSync(join(built, 'package.json'), JSON.stringify({ name: NAME }), 'utf8');
    write(join(source, 'assets', 'rules', 'x.md'), sourceAt);
    write(join(built, 'assets', 'rules', 'x.md'), builtAt);

    return { source, built };
};

beforeEach((): void => {
    workspace = mkdtempSync(join(tmpdir(), 'rt-kit-freshness-'));
    writeFileSync(join(workspace, 'nx.json'), '{}', 'utf8');
});

afterEach((): void => {
    rmSync(workspace, { recursive: true, force: true });
});

describe('staleBuild', (): void => {
    it('SC-AK-03 — раскладка из устаревшей сборки названа вслух', (): void => {
        const { source, built } = layout(2_000_000, 1_000_000);
        const stale: IStaleBuild | null = staleBuild(built, NAME);

        expect(stale).not.toBeNull();
        expect(stale?.source).toBe(join(source, 'assets'));
        expect(stale?.newest).toBe(join(source, 'assets', 'rules', 'x.md'));
    });

    it('сборка свежее исходников — молчание', (): void => {
        const { built } = layout(1_000_000, 2_000_000);

        expect(staleBuild(built, NAME)).toBeNull();
    });

    // Пакет, поставленный из реестра, лежит без рабочего пространства над собой: сверять не с
    // чем, и отказ здесь был бы отказом на ровном месте.
    it('рабочего пространства над пакетом нет — молчание', (): void => {
        const alone: string = mkdtempSync(join(tmpdir(), 'rt-kit-installed-'));
        mkdirSync(join(alone, 'assets'), { recursive: true });
        writeFileSync(join(alone, 'package.json'), JSON.stringify({ name: NAME }), 'utf8');

        expect(staleBuild(alone, NAME)).toBeNull();
        rmSync(alone, { recursive: true, force: true });
    });

    it('исходников с этим именем в рабочем пространстве нет — молчание', (): void => {
        const { built } = layout(2_000_000, 1_000_000);

        expect(staleBuild(built, '@probe/другой')).toBeNull();
    });

    // Прогон прямо из исходников: собранное и исходное — один каталог, и сверять его с собой
    // значило бы отказывать всегда.
    it('запуск из исходников — молчание', (): void => {
        const { source } = layout(2_000_000, 1_000_000);

        expect(staleBuild(source, NAME)).toBeNull();
    });
});
