import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, el } from '../../../testing/rt-kit-testing';
import { RtTooltipDirective } from './rt-tooltip.directive';
import { IRtTooltip } from './rt-tooltip.model';

/** Подсказка живёт в оверлее CDK — ищем её в документе. */
function tip(): HTMLElement | null {
    return document.querySelector('rt-tooltip');
}

@Component({
    selector: 'rt-tooltip-host',
    template: '<button type="button" qa-dataid="tooltip-host" [rtTooltip]="text()" [rtTooltipPlacement]="placement()">Кнопка</button>',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTooltipDirective],
})
class TooltipHostComponent {
    public readonly text: WritableSignal<string | null | undefined> = signal<string | null | undefined>('Удалить строку');
    public readonly placement: WritableSignal<IRtTooltip.Placement> = signal<IRtTooltip.Placement>('top');
}

function setup(text: string | null | undefined = 'Удалить строку'): ComponentFixture<TooltipHostComponent> {
    const fixture: ComponentFixture<TooltipHostComponent> = createRtFixture(TooltipHostComponent, {}, { skipInitialDetect: true });
    fixture.componentInstance.text.set(text);
    fixture.detectChanges();
    return fixture;
}

function hover(fixture: ComponentFixture<TooltipHostComponent>, event: 'mouseenter' | 'mouseleave' | 'focusin' | 'focusout'): void {
    el(fixture, '[qa-dataid="tooltip-host"]')?.nativeElement.dispatchEvent(new Event(event));
    fixture.detectChanges();
}

describe('RtTooltipDirective', (): void => {
    beforeEach((): void => {
        jest.useFakeTimers();
    });

    afterEach((): void => {
        jest.useRealTimers();
    });

    it('наведение показывает подсказку не сразу, а с задержкой', (): void => {
        // Задержка гасит мелькание при быстром проходе курсора по ряду кнопок.
        const fixture: ComponentFixture<TooltipHostComponent> = setup();

        hover(fixture, 'mouseenter');
        expect(tip()).toBeNull();

        jest.advanceTimersByTime(300);
        fixture.detectChanges();

        expect(tip()?.textContent).toBe('Удалить строку');
    });

    it('уход курсора до истечения задержки не показывает ничего', (): void => {
        const fixture: ComponentFixture<TooltipHostComponent> = setup();

        hover(fixture, 'mouseenter');
        hover(fixture, 'mouseleave');
        jest.advanceTimersByTime(500);
        fixture.detectChanges();

        expect(tip()).toBeNull();
    });

    it('уход курсора прячет показанную подсказку', (): void => {
        const fixture: ComponentFixture<TooltipHostComponent> = setup();
        hover(fixture, 'mouseenter');
        jest.advanceTimersByTime(300);
        fixture.detectChanges();

        hover(fixture, 'mouseleave');

        expect(tip()).toBeNull();
    });

    it('фокус с клавиатуры показывает подсказку так же, как наведение', (): void => {
        const fixture: ComponentFixture<TooltipHostComponent> = setup();

        hover(fixture, 'focusin');
        jest.advanceTimersByTime(300);
        fixture.detectChanges();

        expect(tip()).not.toBeNull();
    });

    it('потеря фокуса прячет подсказку', (): void => {
        const fixture: ComponentFixture<TooltipHostComponent> = setup();
        hover(fixture, 'focusin');
        jest.advanceTimersByTime(300);
        fixture.detectChanges();

        hover(fixture, 'focusout');

        expect(tip()).toBeNull();
    });

    it('клик прячет подсказку — она мешала бы смотреть на результат нажатия', (): void => {
        const fixture: ComponentFixture<TooltipHostComponent> = setup();
        hover(fixture, 'mouseenter');
        jest.advanceTimersByTime(300);
        fixture.detectChanges();

        el(fixture, '[qa-dataid="tooltip-host"]')?.nativeElement.click();
        fixture.detectChanges();

        expect(tip()).toBeNull();
    });

    describe('пустой текст', (): void => {
        it.each<[string, string | null | undefined]>([
            ['пустая строка', ''],
            ['одни пробелы', '   '],
            ['null', null],
            ['undefined', undefined],
        ])('%s выключает директиву', (_name: string, text: string | null | undefined): void => {
            // Директиву вешают на иконочные кнопки безусловно и включают,
            // выставив строку, — поэтому пустое значение обязано быть no-op,
            // а не пустой панелью под курсором.
            // Значение ставится после подъёма: `undefined` в аргументе setup()
            // подставил бы умолчание параметра вместо проверяемого случая.
            const fixture: ComponentFixture<TooltipHostComponent> = setup();
            fixture.componentInstance.text.set(text);
            fixture.detectChanges();

            hover(fixture, 'mouseenter');
            jest.advanceTimersByTime(500);
            fixture.detectChanges();

            expect(tip()).toBeNull();
        });
    });

    it('панель объявлена подсказкой для скринридера', (): void => {
        const fixture: ComponentFixture<TooltipHostComponent> = setup();

        hover(fixture, 'mouseenter');
        jest.advanceTimersByTime(300);
        fixture.detectChanges();

        expect(tip()?.getAttribute('role')).toBe('tooltip');
    });

    it('повторное наведение при открытой подсказке не плодит вторую панель', (): void => {
        const fixture: ComponentFixture<TooltipHostComponent> = setup();
        hover(fixture, 'mouseenter');
        jest.advanceTimersByTime(300);
        fixture.detectChanges();

        hover(fixture, 'mouseenter');
        jest.advanceTimersByTime(300);
        fixture.detectChanges();

        expect(document.querySelectorAll('rt-tooltip').length).toBe(1);
    });
});
