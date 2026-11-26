import { ApplicationRef, EnvironmentProviders, Provider, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { createRtFixture, qa } from '../../../testing/rt-kit-testing';
import { BreakpointsService } from '../../platform';
import { rtPreloadPopoverSheet } from '../popover/rt-popover-sheet.helper';
import { RtDynamicSelectorComponent } from './rt-dynamic-selector.component';

interface IPerson {
    readonly id: number;
    readonly name: string;
}

const PEOPLE: IPerson[] = [
    { id: 1, name: 'Anna' },
    { id: 2, name: 'Boris' },
    { id: 3, name: 'Clara' },
];

/** Подмена наблюдателя ширины: сам он в тестовой среде ничего не измеряет. */
class BreakpointsStub {
    public readonly viewportNarrow: WritableSignal<boolean> = signal<boolean>(true);
    public readonly phone: WritableSignal<boolean> = signal<boolean>(true);
    public readonly narrow: WritableSignal<boolean> = signal<boolean>(true);
}

type TFixture = ComponentFixture<RtDynamicSelectorComponent<IPerson>>;

function open(inputs: Readonly<Record<string, unknown>> = {}): TFixture {
    const providers: Array<Provider | EnvironmentProviders> = [
        { provide: BreakpointsService, useValue: new BreakpointsStub() },
        provideRouter([]),
    ];
    const fixture: TFixture = createRtFixture(
        RtDynamicSelectorComponent<IPerson>,
        { keyExp: 'id', displayExp: 'name', entities: PEOPLE, ...inputs },
        { providers }
    );
    (qa(fixture, 'dynamic-selector-add')?.nativeElement as HTMLElement).click();
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
    fixture.detectChanges();

    return fixture;
}

/** Значение поля закрыто от шаблона и снаружи: тест читает его так же, как форма, — по имени. */
function valueOf(fixture: TFixture): unknown[] {
    return (Reflect.get(fixture.componentInstance, 'value') as () => unknown[])();
}

function settle(fixture: TFixture): void {
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
    fixture.detectChanges();
}

/** Шторка и её пункты живут в оверлее CDK — ищем их в документе. */
function inSheet(selector: string): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>(`.rt-popover-sheet ${selector}`));
}

describe('Динамический селектор в нижней шторке (вход sheetCards)', (): void => {
    beforeAll(async (): Promise<void> => {
        await rtPreloadPopoverSheet();
    });

    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
    });

    it('SC-UKV-1780 — выбор нескольких: каждый пункт — карточка с флажком кита', (): void => {
        open();

        expect(inSheet('[qa-dataid="dynamic-selector-options"]')[0].classList).toContain('rt-dynamic-selector-popup__list--cards');
        const boxes: HTMLElement[] = inSheet('[qa-dataid="dynamic-selector-option"] [role="checkbox"]');
        expect(boxes).toHaveLength(3);
        expect(boxes.every((box: HTMLElement): boolean => box.classList.contains('rt-checkbox--card'))).toBe(true);
    });

    it('SC-UKV-1780 — выбор одной записи: каждый пункт — карточка с радиокнопкой кита', (): void => {
        open({ mode: 'single' });

        const radios: HTMLElement[] = inSheet('[qa-dataid="dynamic-selector-option"] [role="radio"]');
        expect(radios).toHaveLength(3);
        expect(radios.every((radio: HTMLElement): boolean => radio.classList.contains('rt-radio-button--card'))).toBe(true);
    });

    it('выбор одной записи без переноса подписи: карточкой становится строка, радиокнопка без рамки', (): void => {
        open({ mode: 'single', titleWrap: false });

        const rows: HTMLElement[] = inSheet('[qa-dataid="dynamic-selector-row"]');
        expect(rows).toHaveLength(3);
        expect(rows.every((row: HTMLElement): boolean => row.classList.contains('rt-dynamic-selector-popup__row--card'))).toBe(true);
        expect(inSheet('.rt-radio-button--card')).toEqual([]);
    });

    it('шторка открыта по высоте содержимого, «Применить» стоит в её шапке, своих кнопок окно не рисует', (): void => {
        open();

        expect(inSheet('[qa-dataid="bottom-sheet-panel"]')[0].classList).not.toContain('rt-bottom-sheet__panel--full');
        const apply: HTMLButtonElement = inSheet(
            '[qa-dataid="bottom-sheet-action"] [qa-dataid="dynamic-selector-sheet-apply"]'
        )[0] as HTMLButtonElement;
        expect(apply.disabled).toBe(true);
        expect(inSheet('.rt-dynamic-selector-popup__foot--empty')).toHaveLength(1);
    });

    it('SC-UKV-1789 — с отметками шторка спрашивает перед закрытием, «Применить» вопроса пишет выбор', (): void => {
        const fixture: TFixture = open();
        inSheet('[qa-dataid="dynamic-selector-option"] [role="checkbox"]')[1].click();
        settle(fixture);

        (inSheet('[qa-dataid="bottom-sheet-close"] button')[0] as HTMLButtonElement).click();
        settle(fixture);

        expect(inSheet('[qa-dataid="bottom-sheet-confirm"]')).toHaveLength(1);
        expect(valueOf(fixture)).toEqual([]);

        inSheet('[qa-dataid="bottom-sheet-confirm-apply"]')[0].click();
        settle(fixture);

        expect(valueOf(fixture)).toEqual([2]);
    });

    it('SC-UKV-1787 — без отметок кнопка закрытия закрывает шторку сразу', (): void => {
        const fixture: TFixture = open();

        (inSheet('[qa-dataid="bottom-sheet-close"] button')[0] as HTMLButtonElement).click();
        settle(fixture);

        expect(inSheet('[qa-dataid="bottom-sheet-confirm"]')).toEqual([]);
        expect(document.querySelector('.rt-popover-sheet .rt-bottom-sheet--open')).toBeNull();
    });

    it('«Применить» в шапке пишет отмеченное и закрывает шторку', (): void => {
        const fixture: TFixture = open();
        inSheet('[qa-dataid="dynamic-selector-option"] [role="checkbox"]')[0].click();
        settle(fixture);

        inSheet('[qa-dataid="dynamic-selector-sheet-apply"]')[0].click();
        settle(fixture);

        expect(valueOf(fixture)).toEqual([1]);
        expect(document.querySelector('.rt-popover-sheet .rt-bottom-sheet--open')).toBeNull();
    });

    it('SC-UKV-1767 — пока список загружается, «Применить» в шапке выключена и с отметками', (): void => {
        const fixture: TFixture = open();
        inSheet('[qa-dataid="dynamic-selector-option"] [role="checkbox"]')[0].click();
        settle(fixture);
        const apply: HTMLButtonElement = inSheet('[qa-dataid="dynamic-selector-sheet-apply"]')[0] as HTMLButtonElement;
        expect(apply.disabled).toBe(false);

        fixture.componentRef.setInput('loading', true);
        settle(fixture);

        expect(apply.disabled).toBe(true);
    });

    it('SC-UKV-1797 — sheetCards=false оставляет в шторке пункты, какими окно стоит у кнопки', (): void => {
        open({ sheetCards: false });

        expect(inSheet('[qa-dataid="dynamic-selector-option"]')).toHaveLength(3);
        expect(inSheet('[qa-dataid="dynamic-selector-options"]')[0].classList).not.toContain('rt-dynamic-selector-popup__list--cards');
        expect(inSheet('.rt-checkbox--card')).toEqual([]);
    });
});
