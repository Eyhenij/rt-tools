import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { cargoStateOf, ECargoState } from './cargo-state';

/**
 * Объявление набора в схеме хранилища.
 *
 * Корень ищется вверх от самой спеки: рабочий каталог прогона — каталог либы, и путь, написанный
 * от него, врёт при первом же переезде файла.
 */
function schemaEnum(): string[] {
    let at: string = dirname(fileURLToPath(import.meta.url));

    while (!existsSync(join(at, 'prisma/schema.prisma'))) {
        const up: string = dirname(at);

        expect(up).not.toBe(at);
        at = up;
    }

    const declared: RegExpMatchArray | null = readFileSync(join(at, 'prisma/schema.prisma'), 'utf-8').match(/enum CargoState \{([^}]*)\}/);

    expect(declared).not.toBeNull();

    return String(declared?.[1])
        .split('\n')
        .map((line: string): string => line.trim())
        .filter((line: string): boolean => line.length > 0 && !line.startsWith('///'));
}

describe('cargoStateOf', () => {
    it('SC-MB-167 — значение набора читается тем состоянием, каким приехало', () => {
        expect(cargoStateOf('new')).toBe(ECargoState.New);
        expect(cargoStateOf('in_work')).toBe(ECargoState.InWork);
        expect(cargoStateOf('fixed')).toBe(ECargoState.Fixed);
        expect(cargoStateOf('released')).toBe(ECargoState.Released);
    });

    it('SC-MB-168 — значение вне набора и пустое читаются как новое', () => {
        expect(cargoStateOf('разобрано наполовину')).toBe(ECargoState.New);
        expect(cargoStateOf('')).toBe(ECargoState.New);
    });
});

describe('ECargoState против набора хранилища', () => {
    it('SC-MB-167 — набор объявлен теми же словами, что и колонка хранилища', () => {
        expect(schemaEnum()).toEqual(Object.values(ECargoState));
    });

    it('SC-MB-231 — набор хранилища объявлен шагами разбора: по нему и идёт порядок', () => {
        expect(schemaEnum()).toEqual(['new', 'in_work', 'fixed', 'released']);
    });
});
