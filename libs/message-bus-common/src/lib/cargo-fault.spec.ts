import { describe, expect, it } from 'vitest';

import { cargoFault, cargoFaultMessage, ECargoFault, faultyCargoItems, ICargoFault } from './cargo-fault';
import { TCargoBody } from './cargo-shape';

/** Признак дерева, которому принадлежит токен запроса. */
const TREE: string = 'own-tree';

/** Обязательные поля выдуманного рода: проверяется разбор, а не список полей своего домена. */
const REQUIRED: readonly string[] = ['schema', 'tree', 'total'];

function cargo(overrides: Partial<TCargoBody> = {}): TCargoBody {
    return { schema: '1', tree: TREE, total: 0, ...overrides };
}

describe('cargoFault', () => {
    it('SC-MB-32 — груз без версии схемы отбивается отдельным отказом', () => {
        const fault: ICargoFault | null = cargoFault({ tree: TREE, total: 0 }, TREE, REQUIRED);

        expect(fault?.kind).toBe(ECargoFault.Schema);
        expect(cargoFaultMessage(fault as ICargoFault, 'сводка')).toBe('версия схемы груза обязательна');
    });

    it('SC-MB-8 — отказ называет, какого поля не хватает и у какого рода', () => {
        const fault: ICargoFault | null = cargoFault({ schema: '1', tree: TREE }, TREE, REQUIRED);

        expect(fault?.kind).toBe(ECargoFault.Fields);
        expect(fault?.fields).toEqual(['total']);
        expect(cargoFaultMessage(fault as ICargoFault, 'сводка')).toBe('в грузе рода «сводка» не хватает полей: total');
    });

    it('SC-MB-9 — признак чужого дерева отбивает приём', () => {
        const fault: ICargoFault | null = cargoFault(cargo({ tree: 'other-tree' }), TREE, REQUIRED);

        expect(fault?.kind).toBe(ECargoFault.Tree);
        expect(cargoFaultMessage(fault as ICargoFault, 'сводка')).toBe('признак дерева в грузе принадлежит другому дереву');
    });

    it('SC-MB-11 — незнакомая версия схемы приёму не мешает', () => {
        expect(cargoFault(cargo({ schema: '99' }), TREE, REQUIRED)).toBeNull();
    });

    it('SC-MB-12 — незнакомое поле груза приёму не мешает', () => {
        expect(cargoFault(cargo({ freshField: 'что-то новое' }), TREE, REQUIRED)).toBeNull();
    });

    it('SC-MB-31 — нулевые счётчики недостачей не считаются', () => {
        expect(cargoFault(cargo({ total: 0 }), TREE, REQUIRED)).toBeNull();
    });

    it('SC-MB-8 — тело, которое не читается как груз, отбивается до разбора полей', () => {
        expect(cargoFault('строка', TREE, REQUIRED)?.kind).toBe(ECargoFault.Body);
        expect(cargoFault([], TREE, REQUIRED)?.kind).toBe(ECargoFault.Body);
        expect(cargoFault(null, TREE, REQUIRED)?.kind).toBe(ECargoFault.Body);
    });
});

describe('faultyCargoItems', () => {
    it('SC-MB-13 — негодная запись списка находится вместе со своим местом', () => {
        const items: TCargoBody[] = [
            { text: 'первое', address: 'пакет', resource: 'rules/testing.md' },
            { text: 'второе', address: 'пакет', resource: 'rules/testing.md' },
            { text: 'третье', address: 'пакет' },
            { text: 'четвёртое', address: 'пакет', resource: 'rules/testing.md' },
        ];

        expect(faultyCargoItems(items, ['text', 'address', 'resource'])).toEqual([{ at: 2, fields: ['resource'] }]);
    });

    it('SC-MB-13 — список, в котором все записи целы, отбирать нечего', () => {
        const items: TCargoBody[] = [{ file: 'a.md', text: 'раз' }];

        expect(faultyCargoItems(items, ['file', 'text'])).toEqual([]);
    });
});
