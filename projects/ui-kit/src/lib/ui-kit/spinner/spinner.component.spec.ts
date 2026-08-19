import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { By } from '@angular/platform-browser';

import { RtuiSpinnerComponent } from './spinner.component';

describe('RtuiSpinnerComponent', () => {
    // Стенд зоннезависимый: `fakeAsync` здесь не поднимается, время двигают таймеры прогонщика.
    beforeEach(() => {
        jest.useFakeTimers();
        TestBed.configureTestingModule({ imports: [RtuiSpinnerComponent] });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    function setup(delay?: number): ComponentFixture<RtuiSpinnerComponent> {
        const fixture: ComponentFixture<RtuiSpinnerComponent> = TestBed.createComponent(RtuiSpinnerComponent);

        // Вход ставится до первой отрисовки: отсчёт идёт от вставки компонента.
        if (delay !== undefined) {
            fixture.componentRef.setInput('delay', delay);
        }

        fixture.detectChanges();

        return fixture;
    }

    function hasSpinner(fixture: ComponentFixture<RtuiSpinnerComponent>): boolean {
        return fixture.debugElement.query(By.directive(MatProgressSpinner)) !== null;
    }

    it('SC-UK-05: без задержки спиннер виден сразу', () => {
        expect(hasSpinner(setup())).toBe(true);
    });

    it('SC-UK-06: до конца задержки спиннера не видно', () => {
        const fixture: ComponentFixture<RtuiSpinnerComponent> = setup(300);

        jest.advanceTimersByTime(299);
        fixture.detectChanges();

        expect(hasSpinner(fixture)).toBe(false);
    });

    it('SC-UK-07: после конца задержки спиннер появляется', () => {
        const fixture: ComponentFixture<RtuiSpinnerComponent> = setup(300);

        jest.advanceTimersByTime(300);
        fixture.detectChanges();

        expect(hasSpinner(fixture)).toBe(true);
    });

    it('SC-UK-08: снятый до срока спиннер счётчик за собой убирает', () => {
        const fixture: ComponentFixture<RtuiSpinnerComponent> = setup(300);

        fixture.destroy();
        jest.advanceTimersByTime(300);

        expect(jest.getTimerCount()).toBe(0);
        expect(hasSpinner(fixture)).toBe(false);
    });
});
