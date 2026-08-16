import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppLoggerService } from './app-logger.service';

/** Момент записи приходит доводом: спека судит строку, а не часы машины. */
const NOW: Date = new Date('2026-08-16T10:20:30.000Z');

/** Вид записи выбирается на подъёме, поэтому служба заводится после того, как среда назначена. */
function loggerIn(env: string | undefined): AppLoggerService {
    if (env === undefined) {
        delete process.env['NODE_ENV'];
    } else {
        process.env['NODE_ENV'] = env;
    }

    return new AppLoggerService();
}

describe('AppLoggerService', () => {
    const initial: string | undefined = process.env['NODE_ENV'];

    beforeEach(() => {
        vi.spyOn(process.stdout, 'write').mockReturnValue(true);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        if (initial === undefined) {
            delete process.env['NODE_ENV'];
        } else {
            process.env['NODE_ENV'] = initial;
        }
    });

    it('SC-MB-102 — на проде строка машинная, а переменное лежит полями', () => {
        const line: string = loggerIn('production').write('warn', 'intake.failed', [{ cargoKind: 'summary', treeSlug: 'own-tree' }], NOW);

        expect(JSON.parse(line)).toEqual({
            ts: '2026-08-16T10:20:30.000Z',
            level: 'warn',
            name: 'intake.failed',
            cargoKind: 'summary',
            treeSlug: 'own-tree',
        });
    });

    it('SC-MB-102 — имя строки постоянно: номер обращения уходит полем, а не в имя', () => {
        const line: string = loggerIn('production').write('error', 'intake.failed', [{ incident: 'a1b2c3d4' }], NOW);

        expect(JSON.parse(line).name).toBe('intake.failed');
        expect(JSON.parse(line).incident).toBe('a1b2c3d4');
    });

    it('SC-MB-106 — вызов каркаса с контекстом строкой пишется тем же путём', () => {
        const line: string = loggerIn('production').write('info', 'соединение с хранилищем открыто', ['Db'], NOW);

        expect(JSON.parse(line)).toEqual({
            ts: '2026-08-16T10:20:30.000Z',
            level: 'info',
            name: 'соединение с хранилищем открыто',
            context: 'Db',
        });
    });

    it('SC-MB-106 — стек, переданный каркасом вторым доводом, уходит подробностью', () => {
        const line: string = loggerIn('production').write('error', 'поломка', ['Error: поломка\n    at шаг', 'Bootstrap'], NOW);

        expect(JSON.parse(line).detail).toBe('Error: поломка\n    at шаг');
        expect(JSON.parse(line).context).toBe('Bootstrap');
    });

    it('SC-MB-103 — поля вычищаются до вывода', () => {
        const line: string = loggerIn('production').write('warn', 'auth.refused', [{ accountName: 'owner', password: 'секрет' }], NOW);

        expect(JSON.parse(line).password).toBe('***');
        expect(JSON.parse(line).accountName).toBe('owner');
    });

    it('SC-MB-105 — вне прода строка печатается читаемой', () => {
        const line: string = loggerIn('development').write('warn', 'intake.failed', [{ treeSlug: 'own-tree' }, 'Failure'], NOW);

        expect(line).toContain('2026-08-16T10:20:30.000Z');
        expect(line).toContain('WARN');
        expect(line).toContain('[Failure]');
        expect(line).toContain('intake.failed');
        expect(line).toContain('{"treeSlug":"own-tree"}');
    });

    it('SC-MB-105 — среда, не названная вовсе, читается как не прод', () => {
        const line: string = loggerIn(undefined).write('info', 'приёмник поднят', [], NOW);

        expect(line).not.toContain('{"ts"');
        expect(line).toContain('приёмник поднят');
    });

    it('SC-MB-102 — циклическая ссылка в полях запись не роняет: вычистка обрывает её пределом глубины', () => {
        const fields: Record<string, unknown> = { treeSlug: 'own-tree' };
        fields['self'] = fields;

        const line: string = loggerIn('production').write('error', 'intake.failed', [fields], NOW);

        expect(JSON.parse(line).name).toBe('intake.failed');
        expect(JSON.parse(line).treeSlug).toBe('own-tree');
        expect(line).toContain('глубже предела');
    });

    it('SC-MB-102 — уровни каркаса пишутся своими именами', () => {
        const logger: AppLoggerService = loggerIn('production');
        const written: string[] = [];
        vi.spyOn(process.stdout, 'write').mockImplementation((chunk: unknown): boolean => {
            written.push(String(chunk));

            return true;
        });

        logger.log('поднято');
        logger.warn('осторожно');
        logger.error('отказ');
        logger.fatal('процесс лёг');

        expect(written.map((line: string) => JSON.parse(line).level)).toEqual(['info', 'warn', 'error', 'fatal']);
    });
});
