import { ApplicationRef, Provider, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createRtFixture, qa } from '../../../testing/rt-kit-testing';
import { BreakpointsService } from '../../platform';
import { IRtSelect } from '../select/rt-select.model';
import { RtMultiselectComponent } from './rt-multiselect.component';
import { rtMultiselectKnownCount } from './rt-multiselect-toggles.logic';
import { rtPreloadPopoverSheet } from '../popover/rt-popover-sheet.helper';

const OPTIONS: ReadonlyArray<IRtSelect.Option<string>> = [
    { label: 'Москва', value: 'msk' },
    { label: 'Минск', value: 'msq', disabled: true },
    { label: 'Казань', value: 'kzn' },
];

/** Подмена наблюдателя ширины: сам он в тестовой среде ничего не измеряет. */
class BreakpointsStub {
    public readonly viewportNarrow: WritableSignal<boolean> = signal<boolean>(true);
    public readonly phone: WritableSignal<boolean> = signal<boolean>(true);
    public readonly narrow: WritableSignal<boolean> = signal<boolean>(true);
}

let stub: BreakpointsStub;

function setup(narrow: boolean, chosen: ReadonlyArray<string>): ComponentFixture<RtMultiselectComponent<string>> {
    stub = new BreakpointsStub();
    stub.phone.set(narrow);
    stub.viewportNarrow.set(narrow);
    stub.narrow.set(narrow);
    const providers: Provider[] = [{ provide: BreakpointsService, useValue: stub }];
    const fixture: ComponentFixture<RtMultiselectComponent<string>> = createRtFixture(
        RtMultiselectComponent<string>,
        { options: OPTIONS },
        { providers }
    );
    fixture.componentInstance.writeValue([...chosen]);
    fixture.detectChanges();
    return fixture;
}

function settle<T>(fixture: ComponentFixture<T>): void {
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
    fixture.detectChanges();
}

function openPanel(fixture: ComponentFixture<RtMultiselectComponent<string>>): void {
    (qa(fixture, 'multiselect-trigger')?.nativeElement as HTMLElement).click();
    settle(fixture);
}

describe('Мультиселект в нижней шторке — замечания ревью', (): void => {
    beforeAll(async (): Promise<void> => {
        await rtPreloadPopoverSheet();
    });

    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
    });

    it('SC-UKV-1618 — порог ширины, пересечённый при открытой шторке, не убирает из неё подвал', (): void => {
        const fixture: ComponentFixture<RtMultiselectComponent<string>> = setup(true, ['msk']);
        openPanel(fixture);
        expect(document.querySelector('[qa-dataid="multiselect-sheet-footer"]')).not.toBeNull();

        stub.phone.set(false);
        settle(fixture);

        expect(document.querySelector('[qa-dataid="multiselect-sheet-footer"]')).not.toBeNull();
    });

    it('SC-UKV-1618 — порог ширины, пересечённый при открытой панели у поля, не добавляет в неё подвал шторки', (): void => {
        const fixture: ComponentFixture<RtMultiselectComponent<string>> = setup(false, ['msk']);
        openPanel(fixture);
        expect(document.querySelector('[qa-dataid="multiselect-sheet-footer"]')).toBeNull();

        stub.phone.set(true);
        settle(fixture);

        expect(document.querySelector('[qa-dataid="multiselect-sheet-footer"]')).toBeNull();
    });

    it('SC-UKV-1626 — «Выбрано: N» считает только значения среди опций, отключённые тоже', (): void => {
        const fixture: ComponentFixture<RtMultiselectComponent<string>> = setup(true, ['msk', 'msq', 'нет-такого']);

        openPanel(fixture);

        expect(document.querySelector('[qa-dataid="multiselect-sheet-count"]')?.textContent?.trim()).toBe('Selected: 2');
        expect(rtMultiselectKnownCount(OPTIONS, ['msk', 'msq', 'нет-такого'])).toBe(2);
        expect(rtMultiselectKnownCount(OPTIONS, [])).toBe(0);
    });
});
