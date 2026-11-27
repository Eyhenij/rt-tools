import { ApplicationRef, Provider, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createRtFixture, qa } from '../../../testing/rt-kit-testing';
import { BreakpointsService } from '../../platform';
import { IRtSelect } from '../select/rt-select.model';
import { RtMultiselectComponent } from './rt-multiselect.component';
import { rtPreloadPopoverSheet } from '../popover/rt-popover-sheet.helper';

const OPTIONS: ReadonlyArray<IRtSelect.Option<string>> = [
    { label: 'Москва', value: 'msk' },
    { label: 'Минск', value: 'msq', disabled: true },
    { label: 'Казань', value: 'kzn' },
];

/** Подмена наблюдателя ширины: сам он в тестовой среде ничего не измеряет. */
class BreakpointsStub {
    public readonly viewportNarrow: WritableSignal<boolean>;
    public readonly phone: WritableSignal<boolean>;
    public readonly narrow: WritableSignal<boolean>;

    constructor(narrow: boolean) {
        this.viewportNarrow = signal<boolean>(narrow);
        this.phone = signal<boolean>(narrow);
        this.narrow = signal<boolean>(narrow);
    }
}

interface ISetup {
    readonly fixture: ComponentFixture<RtMultiselectComponent<string>>;
    readonly events: Array<ReadonlyArray<string>>;
    readonly formValues: Array<ReadonlyArray<string>>;
}

function setup(narrow: boolean, chosen: ReadonlyArray<string>, look: 'list' | 'toggles'): ISetup {
    const providers: Provider[] = [{ provide: BreakpointsService, useValue: new BreakpointsStub(narrow) }];
    const fixture: ComponentFixture<RtMultiselectComponent<string>> = createRtFixture(
        RtMultiselectComponent<string>,
        { options: OPTIONS, look },
        { providers }
    );
    const events: Array<ReadonlyArray<string>> = [];
    const formValues: Array<ReadonlyArray<string>> = [];
    fixture.componentInstance.registerOnChange((value: ReadonlyArray<string>): void => {
        formValues.push(value);
    });
    fixture.componentInstance.selectionChange.subscribe((value: ReadonlyArray<string>): void => {
        events.push(value);
    });
    fixture.componentInstance.writeValue([...chosen]);
    fixture.detectChanges();
    return { fixture, events, formValues };
}

function settle<T>(fixture: ComponentFixture<T>): void {
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
    fixture.detectChanges();
}

function click(selector: string): void {
    (document.querySelector(selector) as HTMLElement).click();
}

describe('Мультиселект — selectionChange на «Показать все» и «Сбросить»', (): void => {
    beforeAll(async (): Promise<void> => {
        await rtPreloadPopoverSheet();
    });

    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
    });

    it('SC-UKV-1709 — «Показать все» даёт событие с тем же массивом, что получила форма', (): void => {
        const { fixture, events, formValues }: ISetup = setup(false, ['msq'], 'toggles');
        (qa(fixture, 'multiselect-trigger')?.nativeElement as HTMLElement).click();
        settle(fixture);

        click('[qa-dataid="multiselect-show-all"]');
        settle(fixture);
        click('[qa-dataid="multiselect-show-all"]');
        settle(fixture);

        expect(events).toEqual([['msq', 'msk', 'kzn'], ['msq']]);
        expect(events).toEqual(formValues);
        expect(events[1]).toBe(formValues[1]);
    });

    it('SC-UKV-1709 — «Сбросить» в подвале шторки даёт событие, отключённое значение остаётся', (): void => {
        const { fixture, events, formValues }: ISetup = setup(true, ['msk', 'msq'], 'list');
        (qa(fixture, 'multiselect-trigger')?.nativeElement as HTMLElement).click();
        settle(fixture);

        click('[qa-dataid="multiselect-sheet-reset"]');
        settle(fixture);

        expect(events).toEqual([['msq']]);
        expect(events[0]).toBe(formValues[0]);
    });
});
