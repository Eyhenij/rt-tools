import { ApplicationRef, Provider, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { createRtFixture, qa } from '../../../testing/rt-kit-testing';
import { BreakpointsService } from '../../platform';
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
    const providers: Provider[] = [{ provide: BreakpointsService, useValue: new BreakpointsStub() }, provideRouter([])];
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

/** Шторка и её пункты живут в оверлее CDK — ищем их в документе. */
function inSheet(selector: string): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>(`.rt-popover-sheet ${selector}`));
}

describe('Динамический селектор в нижней шторке (вход sheetCards)', (): void => {
    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
    });

    it('SC-UKV-1718 — выбор нескольких: каждый пункт — карточка с флажком кита', (): void => {
        open();

        expect(inSheet('[qa-dataid="dynamic-selector-options"]')[0].classList).toContain('rt-dynamic-selector-popup__list--cards');
        const boxes: HTMLElement[] = inSheet('[qa-dataid="dynamic-selector-option"] [role="checkbox"]');
        expect(boxes).toHaveLength(3);
        expect(boxes.every((box: HTMLElement): boolean => box.classList.contains('rt-checkbox--card'))).toBe(true);
    });

    it('SC-UKV-1718 — выбор одной записи: каждый пункт — карточка с радиокнопкой кита', (): void => {
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

    it('SC-UKV-1717 — sheetCards=false оставляет в шторке пункты, какими окно стоит у кнопки', (): void => {
        open({ sheetCards: false });

        expect(inSheet('[qa-dataid="dynamic-selector-option"]')).toHaveLength(3);
        expect(inSheet('[qa-dataid="dynamic-selector-options"]')[0].classList).not.toContain('rt-dynamic-selector-popup__list--cards');
        expect(inSheet('.rt-checkbox--card')).toEqual([]);
    });
});
