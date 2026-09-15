import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRtIDBStorage, provideRtStorage, provideRtUtils } from '@rt-tools/core';

import { AdminPeriodFilterComponent, IAdminPeriod } from './admin-period-filter.component';

/** Человек выбирает день: нативное поле выбора дня отдаёт строку `ГГГГ-ММ-ДД`. */
function pick(fixture: ComponentFixture<AdminPeriodFilterComponent>, qaId: string, day: string): void {
    const field: HTMLInputElement = fixture.debugElement.query(By.css(`[qa-dataid="${qaId}"] input`)).nativeElement;

    field.value = day;
    field.dispatchEvent(new Event('input'));
    fixture.detectChanges();
}

describe('AdminPeriodFilterComponent', () => {
    let fixture: ComponentFixture<AdminPeriodFilterComponent>;
    let picked: IAdminPeriod[];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AdminPeriodFilterComponent],
            providers: [provideRtUtils(), provideRtStorage(), provideRtIDBStorage()],
        });

        fixture = TestBed.createComponent(AdminPeriodFilterComponent);
        picked = [];
        fixture.componentInstance.periodChange.subscribe((period: IAdminPeriod): void => {
            picked.push(period);
        });
        fixture.detectChanges();
    });

    afterEach(() => {
        TestBed.resetTestingModule();
    });

    it('SC-MB-349 — период уходит наверх парой, когда названы оба дня', () => {
        fixture.componentRef.setInput('from', '2026-08-01');
        fixture.detectChanges();

        pick(fixture, 'list-period-to', '2026-08-31');

        expect(picked).toEqual([{ from: '2026-08-01', to: '2026-08-31' }]);
    });

    it('SC-MB-349 — один день из двух уходит наверх пустым периодом: приёмник на полупериод отвечает отказом', () => {
        pick(fixture, 'list-period-from', '2026-08-01');

        expect(picked).toEqual([{ from: '', to: '' }]);
    });

    it('SC-MB-349 — оба дня показаны из входов, а не из своего состояния', async () => {
        fixture.componentRef.setInput('from', '2026-08-01');
        fixture.componentRef.setInput('to', '2026-08-31');
        fixture.detectChanges();
        // Значение в поле кладёт `ngModel`, а он делает это следующим тиком.
        await fixture.whenStable();
        fixture.detectChanges();

        const from: HTMLInputElement = fixture.debugElement.query(By.css('[qa-dataid="list-period-from"] input')).nativeElement;
        const to: HTMLInputElement = fixture.debugElement.query(By.css('[qa-dataid="list-period-to"] input')).nativeElement;

        expect(from.value).toBe('2026-08-01');
        expect(to.value).toBe('2026-08-31');
        expect(to.min).toBe('2026-08-01');
        expect(from.max).toBe('2026-08-31');
    });
});
