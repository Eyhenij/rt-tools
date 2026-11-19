import { ApplicationRef, EnvironmentProviders, Provider, signal, Type, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { BreakpointsService } from '../../platform';
import { RtActionBarComponent } from '../action-bar/rt-action-bar.component';
import { RtColorPaletteComponent } from '../color-palette/rt-color-palette.component';
import { RtDynamicSelectorComponent } from '../dynamic-selector/rt-dynamic-selector.component';
import { RtSpeedMenuComponent } from '../speed-menu/rt-speed-menu.component';
import { RtSplitButtonComponent } from '../split-button/rt-split-button.component';
import { RtTableFilterHeaderComponent } from '../table/filter-header/rt-table-filter-header.component';

/** Подмена наблюдателя ширины: сам он в тестовой среде ничего не измеряет. */
class BreakpointsStub {
    public readonly viewportNarrow: WritableSignal<boolean> = signal<boolean>(true);
    public readonly narrow: WritableSignal<boolean> = signal<boolean>(true);
}

/** Часть набора: как её поднять и что нажать, чтобы открылась её панель. */
interface ISetPart {
    name: string;
    component: Type<unknown>;
    inputs: Readonly<Record<string, unknown>>;
    press: (host: HTMLElement) => HTMLElement | null;
    /** Значение до нажатия: у части, которой без него нечего показать. */
    value?: unknown;
}

function byAnchor(anchor: string, inner: string | null = null): (host: HTMLElement) => HTMLElement | null {
    return (host: HTMLElement): HTMLElement | null => {
        const node: HTMLElement | null = host.querySelector<HTMLElement>(`[qa-dataid="${anchor}"]`);
        return inner === null ? node : (node?.querySelector<HTMLElement>(inner) ?? null);
    };
}

const PARTS: readonly ISetPart[] = [
    {
        name: 'rt-split-button',
        component: RtSplitButtonComponent,
        inputs: { label: 'Сохранить', menuItems: [{ value: 'copy', label: 'Копией' }] },
        press: byAnchor('split-button-toggle'),
    },
    {
        name: 'rt-speed-menu',
        component: RtSpeedMenuComponent,
        inputs: { actions: [{ value: 'call', icon: 'phone', label: 'Позвонить' }] },
        press: byAnchor('speed-menu-trigger', 'button'),
    },
    {
        name: 'rt-color-palette',
        component: RtColorPaletteComponent,
        inputs: {},
        press: byAnchor('color-palette-custom'),
    },
    {
        name: 'rt-action-bar',
        component: RtActionBarComponent,
        inputs: { config: { selected: 1, total: 2, actions: [{ label: 'Отправить', menu: [{ label: 'Письмом' }] }] } },
        press: byAnchor('action-bar-action'),
    },
    {
        name: 'rt-dynamic-selector',
        component: RtDynamicSelectorComponent,
        inputs: {
            keyExp: 'id',
            displayExp: 'name',
            entities: [
                { id: 1, name: 'Анна' },
                { id: 2, name: 'Борис' },
            ],
        },
        press: byAnchor('dynamic-selector-add'),
        value: [1],
    },
    {
        name: 'rt-table-filter-header',
        component: RtTableFilterHeaderComponent,
        inputs: { propertyName: 'title', filter: { kind: 'text' } },
        press: byAnchor('table-filter-operator'),
    },
];

function providersFor(narrow: boolean): Array<Provider | EnvironmentProviders> {
    const stub: BreakpointsStub = new BreakpointsStub();
    stub.viewportNarrow.set(narrow);
    stub.narrow.set(narrow);
    return [{ provide: BreakpointsService, useValue: stub }, provideRouter([])];
}

function open(part: ISetPart, narrow: boolean, sheet: boolean): void {
    const fixture: ComponentFixture<unknown> = createRtFixture(
        part.component,
        { ...part.inputs, sheet },
        { providers: providersFor(narrow) }
    );
    if (part.value !== undefined) {
        const writeValue: (value: unknown) => void = Reflect.get(fixture.componentInstance as object, 'writeValue');
        writeValue.call(fixture.componentInstance, part.value);
    }
    fixture.detectChanges();
    const trigger: HTMLElement | null = part.press(fixture.nativeElement as HTMLElement);
    expect(trigger).not.toBeNull();
    trigger?.click();
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
    fixture.detectChanges();
}

function sheetDrawn(): boolean {
    return document.querySelector('.rt-popover-sheet') !== null;
}

function panelBySide(): boolean {
    return document.querySelector('.rt-popover-panel') !== null;
}

describe('Нижняя шторка у остальных частей набора', (): void => {
    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
    });

    describe.each(PARTS)('$name', (part: ISetPart): void => {
        it('SC-UKV-1439 — на узком экране панель открывается в шторке', (): void => {
            open(part, true, true);

            expect(sheetDrawn()).toBe(true);
            expect(panelBySide()).toBe(false);
        });

        it('SC-UKV-1440 — выключенная шторка оставляет панель у кнопки', (): void => {
            open(part, true, false);

            expect(sheetDrawn()).toBe(false);
            expect(panelBySide()).toBe(true);
        });
    });
});
