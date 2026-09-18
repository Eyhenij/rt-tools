import { computed, Signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRtStorage, provideRtUtils } from '@rt-tools/core';
import { afterEach, describe, expect, it } from 'vitest';

import { ECargoState } from '@rt/message-bus-common';

import { adminStatedRows, IAdminStatedRow, IAdminStateWord } from './admin-cargo-rows';
import { AdminLocaleService, EAdminLocale } from './admin-locale';

/** Строки всех названных состояний. Помощница спрашивает словарь у инжектора — отсюда и заведение. */
function wordsOf(states: readonly ECargoState[]): Signal<readonly (IAdminStatedRow & IAdminStateWord)[]> {
    TestBed.configureTestingModule({ providers: [provideRtUtils(), provideRtStorage()] });

    const rows: Signal<readonly IAdminStatedRow[]> = computed((): readonly IAdminStatedRow[] =>
        states.map((state: ECargoState): IAdminStatedRow => ({ state }))
    );

    return TestBed.runInInjectionContext((): Signal<readonly (IAdminStatedRow & IAdminStateWord)[]> => adminStatedRows(rows));
}

describe('adminStatedRows', () => {
    afterEach(() => {
        TestBed.resetTestingModule();
        localStorage.clear();
    });

    it('SC-MB-171 — у каждого состояния своё слово человека, а не машинная строка', () => {
        const words: Signal<readonly IAdminStateWord[]> = wordsOf([
            ECargoState.New,
            ECargoState.InWork,
            ECargoState.Fixed,
            ECargoState.Released,
        ]);

        expect(words().map((row: IAdminStateWord): string => row.stateLabel)).toEqual(['Новое', 'В работе', 'Готово', 'Выпущено']);
    });

    it('SC-MB-316 — у карантина тоже своё слово человека', () => {
        expect(wordsOf([ECargoState.Quarantined])()[0].stateLabel).toBe('В карантине');
    });

    it('SC-MB-404 — слово состояния идёт за выбором языка, а не остаётся на прежнем', () => {
        const words: Signal<readonly IAdminStateWord[]> = wordsOf([ECargoState.InWork]);

        expect(words()[0].stateLabel).toBe('В работе');

        TestBed.inject(AdminLocaleService).setLocale(EAdminLocale.En);

        // Английского слова у состояния пока нет — его наберёт задача RT-2213, — и на этом выборе
        // приходит признак ненайденного ключа. Проверяется здесь не перевод, а то, что подпись
        // пересчиталась: сравнение с готовым английским словом покраснело бы от чужой правки набора.
        expect(words()[0].stateLabel).not.toBe('В работе');
        expect(words()[0].stateLabel).toContain('cargoStateInWork');
    });
});
