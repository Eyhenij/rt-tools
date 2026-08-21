import { describe, expect, it } from 'vitest';

import { cargoPageAsked, cargoPageFault, cargoStateFault, ICargoPageAsked } from './cargo-page';
import { ECargoState } from './cargo-state';

/** Поля порядка списка груза: первое — умолчание домена, последнее — состояние записи. */
const SORTABLE: readonly string[] = ['arrivedAt', 'file', 'tree', 'state'];

describe('cargoStateFault', () => {
    it('SC-MB-232 — несказанное состояние отказом не является', () => {
        expect(cargoStateFault({})).toBeNull();
        expect(cargoStateFault({ state: '' })).toBeNull();
    });

    it('SC-MB-232 — состояние из набора принимается любым из четырёх', () => {
        for (const state of Object.values(ECargoState)) {
            expect(cargoStateFault({ state })).toBeNull();
        }
    });

    it('SC-MB-232 — слово вне набора отбивается, и отказ называет параметр', () => {
        const fault: string | null = cargoStateFault({ state: 'починен-наверное' });

        expect(fault).toContain('параметр state');
        expect(fault).toContain('released');
    });

    it('SC-MB-232 — повторённый параметр приходит массивом и отбивается тем же отказом', () => {
        expect(cargoStateFault({ state: ['new', 'fixed'] })).toContain('параметр state');
    });
});

describe('cargoPageFault', () => {
    it('SC-MB-232 — отказ страничной выборки называется раньше отказа по состоянию', () => {
        expect(cargoPageFault({ page: 'вторая', state: 'нет-такого' }, SORTABLE)).toContain('параметр page');
    });

    it('SC-MB-232 — разобравшаяся выборка отказа не даёт', () => {
        expect(cargoPageFault({ page: '2', sort: 'state', state: 'fixed' }, SORTABLE)).toBeNull();
    });
});

describe('cargoPageAsked', () => {
    it('SC-MB-224 — выборка без состояния несёт пустоту: список не сужен', () => {
        expect(cargoPageAsked({}, SORTABLE).state).toBeNull();
        expect(cargoPageAsked({ state: '   ' }, SORTABLE).state).toBeNull();
    });

    it('SC-MB-223 — названное состояние приходит значением набора, а не строкой', () => {
        expect(cargoPageAsked({ state: 'in_work' }, SORTABLE).state).toBe(ECargoState.InWork);
    });

    it('SC-MB-225 — состояние и дерево приезжают в выборке вместе', () => {
        const asked: ICargoPageAsked = cargoPageAsked({ state: 'released', tree: 'own-tree' }, SORTABLE);

        expect(asked).toMatchObject({ state: ECargoState.Released, tree: 'own-tree' });
    });

    it('SC-MB-231 — состояние принимается полем порядка наравне с остальными', () => {
        expect(cargoPageAsked({ sort: 'state', dir: 'asc' }, SORTABLE)).toMatchObject({ sort: 'state', dir: 'asc' });
    });

    it('страничная часть выборки остаётся той же, что и без отбора по состоянию', () => {
        expect(cargoPageAsked({ page: '3', size: '50' }, SORTABLE)).toMatchObject({ page: 3, size: 50 });
    });
});
