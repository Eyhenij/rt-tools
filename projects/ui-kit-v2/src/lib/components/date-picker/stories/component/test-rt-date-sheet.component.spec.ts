import { ComponentFixture, TestBed } from '@angular/core/testing';

import { STORY_TRIGGER_ATTRIBUTE } from '../../../../../showcase/story-overlay';
import { provideRtKitTesting } from '../../../../../testing/rt-kit-testing';
import { TestRtDateSheetComponent } from './test-rt-date-sheet.component';

type TKind = TestRtDateSheetComponent['kind'];

/** Рисует обёртку кадра с заданным видом поля и отдаёт её корень. */
function render(kind: TKind): HTMLElement {
    TestBed.configureTestingModule({ providers: [...provideRtKitTesting()] });
    const fixture: ComponentFixture<TestRtDateSheetComponent> = TestBed.createComponent(TestRtDateSheetComponent);
    fixture.componentInstance.kind = kind;
    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
}

/** Поле кадра, по которому история находит кнопку, открывающую шторку. */
function trigger(root: HTMLElement): Element | null {
    return root.querySelector(`[data-story-trigger="${STORY_TRIGGER_ATTRIBUTE}"]`);
}

describe('Обёртка витрины шторки даты', (): void => {
    afterEach((): void => {
        TestBed.resetTestingModule();
    });

    it('SC-UKV-1919 — кадр времени ставит поле времени с признаком кнопки истории', (): void => {
        const root: HTMLElement = render('time');

        expect(trigger(root)?.tagName.toLowerCase()).toBe('rt-date-picker');
        expect(root.textContent).toContain('Время заезда');
    });

    it('SC-UKV-1919 — кадр времени с полуночи ставит пустое поле времени', (): void => {
        const root: HTMLElement = render('midnight');

        expect(trigger(root)?.tagName.toLowerCase()).toBe('rt-date-picker');
        expect(root.textContent).toContain('Время выезда');
    });

    it('SC-UKV-1919 — кадр даты со временем ставит поле заезда', (): void => {
        const root: HTMLElement = render('datetime-local');

        expect(trigger(root)?.tagName.toLowerCase()).toBe('rt-date-picker');
        expect(root.textContent).toContain('Заезд');
    });

    it('SC-UKV-1919 — кадр периода ставит поле периода', (): void => {
        const root: HTMLElement = render('range');

        expect(trigger(root)?.tagName.toLowerCase()).toBe('rt-date-range');
        expect(root.textContent).toContain('Период');
    });
});
