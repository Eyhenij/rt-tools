import 'reflect-metadata';

import { describe, expect, it } from 'vitest';

import { OPERATION_ACCESS, OPERATION_RIGHT, RequiresRight } from './operation-access';

/**
 * Метки объявления доступа.
 *
 * Проверка доступа в спеке рядом читает метки подставным отражателем — то есть верит, что
 * объявление их поставило. Здесь проверяется само объявление: обе метки и под своими ключами.
 */
describe('объявление доступа правом', (): void => {
    it('SC-MB-287 — объявление ставит обе метки: вид доступа и само право', (): void => {
        class Operation {
            @RequiresRight('postmortems:manage')
            public read(): void {
                // Тело здесь ни при чём: предмет проверки — метки на самом обработчике.
            }
        }

        const handler: () => void = Operation.prototype.read;

        expect(Reflect.getMetadata(OPERATION_ACCESS, handler)).toBe('permission');
        expect(Reflect.getMetadata(OPERATION_RIGHT, handler)).toBe('postmortems:manage');
    });
});
