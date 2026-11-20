import { ApplicationRef, Provider, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { BreakpointsService } from '../../platform';
import { rtToggleGroupFolds } from './rt-toggle-button-group-fold.logic';
import { IRtToggleButtonGroup } from './rt-toggle-button-group.model';
import { RtToggleButtonGroupComponent } from './rt-toggle-button-group.component';

const PERIODS: ReadonlyArray<IRtToggleButtonGroup.Option> = [
    { value: 'day', label: 'День' },
    { value: 'week', label: 'Неделя' },
    { value: 'month', label: 'Месяц' },
    { value: 'quarter', label: 'Квартал' },
    { value: 'year', label: 'Год' },
    { value: 'own', label: 'Свой период' },
];

/** Наблюдатель размера: в jsdom его нет, двойник сообщает о размере сразу при подписке. */
class ResizeObserverDouble {
    constructor(private readonly callback: () => void) {}

    public observe(): void {
        this.callback();
    }

    public disconnect(): void {}
}

/** Телефон: узкое окно, поле открывает список в нижней шторке. */
class PhoneBreakpointsStub {
    public readonly viewportNarrow: WritableSignal<boolean> = signal<boolean>(true);
    public readonly phone: WritableSignal<boolean> = signal<boolean>(true);
    public readonly narrow: WritableSignal<boolean> = signal<boolean>(true);
}

/** Строке кнопок нужно `natural`, у группы есть `place`. */
function stubWidths(natural: number, place: number): void {
    jest.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(function (this: HTMLElement): number {
        return this.getAttribute('role') === 'group' && this.classList.contains('rt-toggle-button-group') ? natural : 0;
    });
    jest.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement): number {
        return this.classList.contains('rt-toggle-button-group--foldable') ? place : 0;
    });
}

function settle<T>(fixture: ComponentFixture<T>): void {
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
    fixture.detectChanges();
}

function setup(inputs: Readonly<Record<string, unknown>>): ComponentFixture<RtToggleButtonGroupComponent<string>> {
    const providers: Provider[] = [{ provide: BreakpointsService, useValue: new PhoneBreakpointsStub() }];
    const fixture: ComponentFixture<RtToggleButtonGroupComponent<string>> = createRtFixture(
        RtToggleButtonGroupComponent<string>,
        { options: PERIODS, ariaLabel: 'Период', ...inputs },
        { providers }
    );
    settle(fixture);
    return fixture;
}

function folded(fixture: ComponentFixture<unknown>): HTMLElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector('[qa-dataid="toggle-button-group-folded"]');
}

function row(fixture: ComponentFixture<unknown>): HTMLElement {
    return (fixture.nativeElement as HTMLElement).querySelector('div.rt-toggle-button-group') as HTMLElement;
}

describe('RtToggleButtonGroupComponent — сворачивание', (): void => {
    beforeEach((): void => {
        Reflect.set(globalThis, 'ResizeObserver', ResizeObserverDouble);
    });

    afterEach((): void => {
        Reflect.deleteProperty(globalThis, 'ResizeObserver');
        jest.restoreAllMocks();
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
    });

    it('SC-UKV-1452 — кнопки не помещаются: группа стоит полем выбора, а выбор в шторке уходит как нажатие', (): void => {
        stubWidths(520, 343);
        const fixture: ComponentFixture<RtToggleButtonGroupComponent<string>> = setup({ value: 'week' });
        const picked: string[] = [];
        fixture.componentInstance.valueChange.subscribe((value: string): void => {
            picked.push(value);
        });

        expect(folded(fixture)?.tagName).toBe('RT-SELECT');
        expect(row(fixture).getAttribute('aria-hidden')).toBe('true');
        expect(row(fixture).classList).toContain('rt-toggle-button-group--measure');

        (folded(fixture)?.querySelector('[qa-dataid="select-trigger"]') as HTMLElement).click();
        settle(fixture);
        expect(document.querySelector('.rt-popover-sheet')).not.toBeNull();
        (document.querySelectorAll('.rt-popover-sheet [qa-dataid="select-option"]')[2] as HTMLElement).click();
        settle(fixture);

        expect(picked).toEqual(['month']);
    });

    it('SC-UKV-1453 — кнопки помещаются: группа остаётся кнопками', (): void => {
        stubWidths(280, 343);
        const fixture: ComponentFixture<RtToggleButtonGroupComponent<string>> = setup({ value: 'week' });

        expect(folded(fixture)).toBeNull();
        expect(row(fixture).getAttribute('aria-hidden')).toBeNull();
    });

    it('SC-UKV-1454 — множественный выбор сворачивается в мультиселект', (): void => {
        stubWidths(520, 343);
        const fixture: ComponentFixture<RtToggleButtonGroupComponent<string>> = setup({ multiple: true, values: ['day'] });

        expect(folded(fixture)?.tagName).toBe('RT-MULTISELECT');
    });

    it('SC-UKV-1455 — выключенное сворачивание и перенос строк оставляют кнопки', (): void => {
        stubWidths(520, 343);

        expect(folded(setup({ fold: false }))).toBeNull();
        expect(folded(setup({ layout: 'wrap' }))).toBeNull();
        expect(rtToggleGroupFolds(520, 0, 'row', true)).toBe(false);
        expect(rtToggleGroupFolds(343.4, 343, 'row', true)).toBe(false);
    });

    it('SC-UKV-1474 — sheet=false: свёрнутое поле открывает список поповером, а одиночное поле не очищается крестиком', (): void => {
        stubWidths(520, 343);
        const fixture: ComponentFixture<RtToggleButtonGroupComponent<string>> = setup({ value: 'week', sheet: false });

        expect(folded(fixture)?.querySelector('.rt-select__clear')).toBeNull();
        (folded(fixture)?.querySelector('[qa-dataid="select-trigger"]') as HTMLElement).click();
        settle(fixture);

        expect(document.querySelector('.rt-popover-sheet')).toBeNull();
        expect(document.querySelector('[qa-dataid="select-option"]')).not.toBeNull();
    });
});
