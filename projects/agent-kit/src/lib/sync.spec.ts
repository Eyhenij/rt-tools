import { accessSync, chmodSync, constants, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { parseConfig } from './config.js';
import { IAmbiguousName } from './integrity.js';
import { ISyncResult, runSync } from './sync.js';

/**
 * Дерево-источник: один хук и одна проверка, обе без права на исполнение.
 *
 * Бит на диске теряется молча — архив без прав, файловая система без бита, репозиторий с
 * выключенным учётом режима, — и раскладка, читающая право с диска, положила бы гард с правами
 * 644. Выглядело бы это установленным: файл на месте, раскладка отчиталась.
 */
function assets(): string {
    const dir: string = mkdtempSync(join(tmpdir(), 'rt-kit-assets-'));

    mkdirSync(join(dir, 'hooks'), { recursive: true });
    mkdirSync(join(dir, 'checks'), { recursive: true });
    writeFileSync(join(dir, 'hooks', 'probe-guard.sh'), '#!/usr/bin/env bash\nexit 0\n', 'utf8');
    writeFileSync(join(dir, 'checks', 'probe-check.mjs'), 'process.exit(0);\n', 'utf8');
    chmodSync(join(dir, 'hooks', 'probe-guard.sh'), 0o644);
    chmodSync(join(dir, 'checks', 'probe-check.mjs'), 0o644);

    return dir;
}

/**
 * Право на исполнение у файла на диске: спрашивается система, а не биты режима руками, — тем же
 * приёмом, каким его читает каталог ресурсов.
 */
function executable(path: string): boolean {
    try {
        accessSync(path, constants.X_OK);

        return true;
    } catch {
        return false;
    }
}

describe('runSync — право на исполнение у разложенного (SC-AK-886)', () => {
    let assetsDir: string;
    let root: string;

    beforeEach(() => {
        assetsDir = assets();
        root = mkdtempSync(join(tmpdir(), 'rt-kit-root-'));
    });

    afterEach(() => {
        rmSync(assetsDir, { recursive: true, force: true });
        rmSync(root, { recursive: true, force: true });
    });

    it('хук ложится исполняемым, даже когда бит источника потерян', () => {
        runSync(parseConfig('{}'), root, '0.0.0', assetsDir);

        expect(executable(join(root, '.claude/hooks/probe-guard.sh'))).toBe(true);
    });

    it('проверка права по роду не получает: часть из них зовётся исполнителем', () => {
        runSync(parseConfig('{}'), root, '0.0.0', assetsDir);

        expect(executable(join(root, 'tools/probe-check.mjs'))).toBe(false);
    });

    it('проверка с правом на исполнение в источнике кладётся исполняемой', () => {
        chmodSync(join(assetsDir, 'checks', 'probe-check.mjs'), 0o755);
        runSync(parseConfig('{}'), root, '0.0.0', assetsDir);

        expect(executable(join(root, 'tools/probe-check.mjs'))).toBe(true);
    });
});

describe('runSync — одноимённые ресурсы одного рода', () => {
    let assetsDir: string;
    let root: string;

    beforeEach(() => {
        assetsDir = mkdtempSync(join(tmpdir(), 'rt-kit-assets-'));
        root = mkdtempSync(join(tmpdir(), 'rt-kit-root-'));
        mkdirSync(join(assetsDir, 'laws', 'application'), { recursive: true });
        writeFileSync(join(assetsDir, 'laws', 'access.md'), '# Law on access\n\n## Articles\n', 'utf8');
        writeFileSync(join(assetsDir, 'laws', 'application', 'access.md'), '# Law on access\n\n## Articles\n', 'utf8');
    });

    afterEach(() => {
        rmSync(assetsDir, { recursive: true, force: true });
        rmSync(root, { recursive: true, force: true });
    });

    it('SC-AK-1186 — раскладка называет оба закона и не пишет ни одного файла', () => {
        const result: ISyncResult = runSync(parseConfig('{}'), root, '0.0.0', assetsDir);

        expect(result.ambiguous.map((one: IAmbiguousName): string => `${one.kind}/${one.name}`)).toEqual(['laws/access']);
        expect(result.written).toEqual([]);
        expect(existsSync(join(root, 'docs/constitution/access.md'))).toBe(false);
    });
});
