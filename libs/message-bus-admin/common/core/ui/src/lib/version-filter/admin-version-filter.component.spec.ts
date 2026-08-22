import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CARGO_VERSION_NONE } from '@rt/message-bus-common';
import { provideRtIDBStorage, provideRtStorage, provideRtUtils } from '@rt-tools/core';
import { IRtSelect, RtSelectComponent } from '@rt-tools/ui-kit-v2';

import { AdminVersionFilterComponent } from './admin-version-filter.component';

/** Версии, как их отдаёт приёмник: уже упорядоченные номерами, нечисловая — в конце. */
const VERSIONS: readonly string[] = ['0.9.0', '0.10.0', 'hotfix-3'];

/** Выбор кита, каким его видит человек: подписи и значения опций. */
function optionsOf(fixture: ComponentFixture<AdminVersionFilterComponent>): ReadonlyArray<IRtSelect.Option<string>> {
    return fixture.debugElement.query(By.directive(RtSelectComponent)).componentInstance.options();
}

describe('AdminVersionFilterComponent', () => {
    let fixture: ComponentFixture<AdminVersionFilterComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AdminVersionFilterComponent],
            providers: [provideHttpClient(), provideHttpClientTesting(), provideRtUtils(), provideRtStorage(), provideRtIDBStorage()],
        });

        fixture = TestBed.createComponent(AdminVersionFilterComponent);
        fixture.componentRef.setInput('versions', VERSIONS);
        fixture.detectChanges();
    });

    afterEach(() => {
        TestBed.resetTestingModule();
    });

    it('SC-MB-240 — отбор перечисляет встретившиеся версии в том порядке, в каком их отдал приёмник', () => {
        expect(optionsOf(fixture).map((option: IRtSelect.Option<string>): string => option.value)).toEqual([
            '',
            CARGO_VERSION_NONE,
            '0.9.0',
            '0.10.0',
            'hotfix-3',
        ]);
    });

    it('SC-MB-243 — первым пунктом стоят «все версии», вторым — «без версии»', () => {
        const shown: ReadonlyArray<IRtSelect.Option<string>> = optionsOf(fixture);

        expect(shown[0].label).toBe('Все версии');
        expect(shown[1].label).toBe('Без версии');
        expect(shown[2].label).toBe('0.9.0');
    });

    it('SC-MB-242 — снятие отбора поднимается наверх пустой строкой, а не пустотой', () => {
        const picked: string[] = [];

        fixture.componentInstance.versionChange.subscribe((version: string): void => {
            picked.push(version);
        });

        fixture.debugElement.query(By.directive(RtSelectComponent)).componentInstance.selectionChange.emit(null);

        expect(picked).toEqual(['']);
    });

    it('SC-MB-241, SC-MB-243 — выбранная версия и «без версии» поднимаются наверх тем же словом', () => {
        const picked: string[] = [];

        fixture.componentInstance.versionChange.subscribe((version: string): void => {
            picked.push(version);
        });

        fixture.debugElement.query(By.directive(RtSelectComponent)).componentInstance.selectionChange.emit('0.10.0');
        fixture.debugElement.query(By.directive(RtSelectComponent)).componentInstance.selectionChange.emit(CARGO_VERSION_NONE);

        expect(picked).toEqual(['0.10.0', CARGO_VERSION_NONE]);
    });

    it('раздел без записей с версией показывает только два первых пункта', () => {
        fixture.componentRef.setInput('versions', []);
        fixture.detectChanges();

        expect(optionsOf(fixture)).toHaveLength(2);
    });
});
