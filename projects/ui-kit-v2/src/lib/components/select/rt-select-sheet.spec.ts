import { ApplicationRef, ChangeDetectionStrategy, Component, Provider, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createRtFixture, hostClasses, qa } from '../../../testing/rt-kit-testing';
import { BreakpointsService } from '../../platform';
import { RtFieldComponent } from '../field/rt-field.component';
import { RtMultiselectComponent } from '../multiselect/rt-multiselect.component';
import { RtSelectComponent } from './rt-select.component';
import { IRtSelect } from './rt-select.model';

const OPTIONS: ReadonlyArray<IRtSelect.Option<string>> = [
    { label: 'Москва', value: 'msk' },
    { label: 'Минск', value: 'msq' },
    { label: 'Казань', value: 'kzn' },
];

/** Подмена наблюдателя ширины: сам он в тестовой среде ничего не измеряет. */
class BreakpointsStub {
    public readonly viewportNarrow: WritableSignal<boolean> = signal<boolean>(true);
    public readonly narrow: WritableSignal<boolean> = signal<boolean>(true);
}

@Component({
    selector: 'rt-select-sheet-field-host',
    template: `
        <rt-field label="Страна">
            <rt-select [options]="opts" />
        </rt-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtFieldComponent, RtSelectComponent],
})
class FieldHostComponent {
    public readonly opts: ReadonlyArray<IRtSelect.Option<string>> = OPTIONS;
}

function providersFor(narrow: boolean): Provider[] {
    const stub: BreakpointsStub = new BreakpointsStub();
    stub.viewportNarrow.set(narrow);
    stub.narrow.set(narrow);
    return [{ provide: BreakpointsService, useValue: stub }];
}

/** Шторка, панель у поля и пункты живут в оверлеях CDK — ищем их в документе. */
function sheet(): HTMLElement | null {
    return document.querySelector('.rt-popover-sheet');
}

function sheetOpen(): boolean {
    return document.querySelector('.rt-popover-sheet .rt-bottom-sheet--open') !== null;
}

function panelBySide(): HTMLElement | null {
    return document.querySelector('.rt-popover-panel');
}

function settle<T>(fixture: ComponentFixture<T>): void {
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
    fixture.detectChanges();
}

function press<T>(fixture: ComponentFixture<T>, anchor: string): void {
    (qa(fixture, anchor)?.nativeElement as HTMLElement).click();
    settle(fixture);
}

function pick(anchor: string, index: number): void {
    (document.querySelectorAll(`[qa-dataid="${anchor}"]`)[index] as HTMLElement).click();
}

function setupSelect(narrow: boolean, inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtSelectComponent<string>> {
    return createRtFixture(RtSelectComponent<string>, { options: OPTIONS, ...inputs }, { providers: providersFor(narrow) });
}

describe('Панель выбора в нижней шторке', (): void => {
    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
    });

    it('SC-UKV-1382 — на узком экране список открывается в шторке, а у поля панели нет', (): void => {
        const fixture: ComponentFixture<RtSelectComponent<string>> = setupSelect(true);

        press(fixture, 'select-trigger');

        expect(sheet()).not.toBeNull();
        expect(sheetOpen()).toBe(true);
        expect(document.querySelectorAll('.rt-popover-sheet [qa-dataid="select-option"]').length).toBe(3);
        expect(panelBySide()).toBeNull();
    });

    it('SC-UKV-1383 — выключенная шторка оставляет список у поля', (): void => {
        const fixture: ComponentFixture<RtSelectComponent<string>> = setupSelect(true, { sheet: false });

        press(fixture, 'select-trigger');

        expect(sheet()).toBeNull();
        expect(panelBySide()).not.toBeNull();
    });

    it('SC-UKV-1384 — на широком экране список открывается у поля', (): void => {
        const fixture: ComponentFixture<RtSelectComponent<string>> = setupSelect(false);

        press(fixture, 'select-trigger');

        expect(sheet()).toBeNull();
        expect(panelBySide()).not.toBeNull();
    });

    it('SC-UKV-1385 — заголовок шторки — подпись поля', (): void => {
        const fixture: ComponentFixture<FieldHostComponent> = createRtFixture(FieldHostComponent, {}, { providers: providersFor(true) });

        press(fixture, 'select-trigger');

        expect(document.querySelector('[qa-dataid="popover-sheet-title"]')?.textContent?.trim()).toBe('Страна');
    });

    it('SC-UKV-1386 — выбор в селекте ставит значение и закрывает шторку', (): void => {
        const fixture: ComponentFixture<RtSelectComponent<string>> = setupSelect(true);
        let chosen: string | null = null;
        fixture.componentInstance.registerOnChange((value: string | null): void => {
            chosen = value;
        });
        press(fixture, 'select-trigger');

        pick('select-option', 1);
        settle(fixture);

        expect(chosen).toBe('msq');
        expect(sheet()).toBeNull();
    });

    it('SC-UKV-1387 — выбор в мультиселекте оставляет шторку открытой', (): void => {
        const fixture: ComponentFixture<RtMultiselectComponent<string>> = createRtFixture(
            RtMultiselectComponent<string>,
            { options: OPTIONS },
            { providers: providersFor(true) }
        );
        let chosen: ReadonlyArray<string> = [];
        fixture.componentInstance.registerOnChange((value: ReadonlyArray<string>): void => {
            chosen = value;
        });
        press(fixture, 'multiselect-trigger');

        pick('multiselect-option', 0);
        settle(fixture);
        pick('multiselect-option', 2);
        settle(fixture);

        expect(chosen).toEqual(['msk', 'kzn']);
        expect(sheetOpen()).toBe(true);
    });

    it('SC-UKV-1388 — подложка шторки закрывает список', (): void => {
        const fixture: ComponentFixture<RtSelectComponent<string>> = setupSelect(true);
        press(fixture, 'select-trigger');

        (document.querySelector('.rt-popover-sheet [qa-dataid="bottom-sheet-backdrop"]') as HTMLElement).click();
        settle(fixture);

        expect(sheet()).toBeNull();
        expect(hostClasses(fixture)).not.toContain('rt-select--open');
    });

    it('SC-UKV-1389 — список в шторке не берёт ширину поля', (): void => {
        const fixture: ComponentFixture<RtSelectComponent<string>> = setupSelect(true, { panelWidth: 'trigger' });

        press(fixture, 'select-trigger');

        const pane: HTMLElement | null = document.querySelector('.rt-popover-sheet-pane');
        expect(pane).not.toBeNull();
        expect(pane?.style.width).toBe('');
    });
});
