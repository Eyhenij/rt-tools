import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ADMIN_LABELS, cargoStateKey } from '@rt/message-bus-admin/common/core/util';
import { ECargoState } from '@rt/message-bus-common';
import { provideRtIDBStorage, provideRtStorage, provideRtUtils } from '@rt-tools/core';
import { IRtSelect, RtSelectComponent } from '@rt-tools/ui-kit-v2';

import { AdminStateFilterComponent } from './admin-state-filter.component';

/** Выбор кита, каким его видит человек: подписи и значения опций. */
function optionsOf(fixture: ComponentFixture<AdminStateFilterComponent>): ReadonlyArray<IRtSelect.Option<string>> {
    return fixture.debugElement.query(By.directive(RtSelectComponent)).componentInstance.options();
}

describe('AdminStateFilterComponent', () => {
    let fixture: ComponentFixture<AdminStateFilterComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AdminStateFilterComponent],
            providers: [provideHttpClient(), provideHttpClientTesting(), provideRtUtils(), provideRtStorage(), provideRtIDBStorage()],
        });

        fixture = TestBed.createComponent(AdminStateFilterComponent);
        fixture.detectChanges();
    });

    afterEach(() => {
        TestBed.resetTestingModule();
    });

    it('SC-MB-222 — отбор предлагает весь набор состояний, а первым — снятый отбор', () => {
        expect(optionsOf(fixture).map((option: IRtSelect.Option<string>): string => option.value)).toEqual([
            '',
            'new',
            'in_work',
            'fixed',
            'released',
            'quarantined',
        ]);
    });

    it('SC-MB-236 — состояние названо в отборе тем же словом, каким оно подписано в столбце', () => {
        const shown: ReadonlyArray<IRtSelect.Option<string>> = optionsOf(fixture);

        expect(shown[0].label).toBe('Все состояния');
        expect(shown[2].label).toBe(ADMIN_LABELS[cargoStateKey(ECargoState.InWork)]);
        expect(shown[4].label).toBe(ADMIN_LABELS[cargoStateKey(ECargoState.Released)]);
    });

    it('SC-MB-224 — снятие отбора поднимается наверх пустой строкой, а не пустотой', () => {
        const picked: string[] = [];

        fixture.componentInstance.stateChange.subscribe((state: string): void => {
            picked.push(state);
        });

        fixture.debugElement.query(By.directive(RtSelectComponent)).componentInstance.selectionChange.emit(null);

        expect(picked).toEqual(['']);
    });

    it('SC-MB-223 — выбранное состояние поднимается наверх значением набора', () => {
        const picked: string[] = [];

        fixture.componentInstance.stateChange.subscribe((state: string): void => {
            picked.push(state);
        });

        fixture.debugElement.query(By.directive(RtSelectComponent)).componentInstance.selectionChange.emit('fixed');

        expect(picked).toEqual(['fixed']);
    });
});
