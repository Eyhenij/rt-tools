import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgModel } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { STORY_TRIGGER_ATTRIBUTE } from '../../../../../showcase/story-overlay';
import { provideRtKitTesting } from '../../../../../testing/rt-kit-testing';
import { RtDatePickerComponent } from '../../rt-date-picker.component';
import { TestRtDateSheetComponent } from './test-rt-date-sheet.component';

type TKind = TestRtDateSheetComponent['kind'];

/** Что кадр поставил в рамку: поле с признаком кнопки истории, его подпись и модель формы. */
interface IFrame {
    readonly field: DebugElement;
    readonly label: string;
    readonly model: unknown;
}

/** Рисует обёртку кадра с заданным видом поля и отдаёт поле, найденное по признаку кнопки истории. */
async function render(kind: TKind): Promise<IFrame> {
    TestBed.configureTestingModule({ providers: [...provideRtKitTesting()] });
    const fixture: ComponentFixture<TestRtDateSheetComponent> = TestBed.createComponent(TestRtDateSheetComponent);
    fixture.componentInstance.kind = kind;
    fixture.detectChanges();
    await fixture.whenStable();

    const field: DebugElement = fixture.debugElement.query(By.css(`[data-story-trigger="${STORY_TRIGGER_ATTRIBUTE}"]`));
    const wrapper: Element | null = (field.nativeElement as HTMLElement).closest('rt-field');

    return { field, label: wrapper?.textContent ?? '', model: field.injector.get(NgModel).model };
}

function picker(frame: IFrame): RtDatePickerComponent {
    return frame.field.injector.get(RtDatePickerComponent);
}

describe('Обёртка витрины шторки даты', (): void => {
    afterEach((): void => {
        TestBed.resetTestingModule();
    });

    it('SC-UKV-1919 — кадр времени ставит в подпись «Время заезда» поле времени со значением', async (): Promise<void> => {
        const frame: IFrame = await render('time');

        expect(frame.label).toContain('Время заезда');
        expect(picker(frame).type()).toBe('time');
        expect(picker(frame).timeStart()).toBe('now');
        expect(frame.model).toBe('09:30');
    });

    it('SC-UKV-1919 — кадр времени с полуночи ставит пустое поле времени, барабан которого начинает с полуночи', async (): Promise<void> => {
        const frame: IFrame = await render('midnight');

        expect(frame.label).toContain('Время выезда');
        expect(picker(frame).type()).toBe('time');
        expect(picker(frame).timeStart()).toBe('midnight');
        expect(frame.model).toBe('');
    });

    it('SC-UKV-1919 — кадр даты со временем ставит в подпись «Заезд» поле даты со временем', async (): Promise<void> => {
        const frame: IFrame = await render('datetime-local');

        expect(frame.label).toContain('Заезд');
        expect(picker(frame).type()).toBe('datetime-local');
        expect(frame.model).toBe('2026-09-27T09:30');
    });

    it('SC-UKV-1919 — кадр периода ставит в подпись «Период» поле периода', async (): Promise<void> => {
        const frame: IFrame = await render('range');

        expect(frame.label).toContain('Период');
        expect(frame.field.name).toBe('rt-date-range');
        expect(frame.model).toEqual({ start: '2026-09-21', end: '2026-09-27' });
    });
});
