import { ChangeDetectionStrategy, Component, signal, Signal, viewChild, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { TNullable } from '@rt-tools/utils';

import { createRtFixture, el, qa, textOf } from '../../../../testing/rt-kit-testing';
import { IRtInput } from '../../input/rt-input.model';
import { RtDataListToolbarActionsDirective, RtDataListToolbarSelectorsDirective } from '../rt-data-list-toolbar.directive';
import { RtDataListToolbarComponent } from './rt-data-list-toolbar.component';

@Component({
    selector: 'rt-test-data-list-toolbar-host',
    template: `
        <rt-data-list-toolbar
            [searchAppearance]="searchAppearance()"
            [isFiltersShown]="filtersShown()"
            [isFiltersEmpty]="filtersEmpty()"
            [isPlaceholderShown]="placeholderShown()"
            (searchChange)="searches.push($event)"
            (refreshAction)="refreshes = refreshes + 1"
            (clearFiltersAction)="cleared = cleared + 1"
            (openConfigAction)="configs = configs + 1">
            @if (withActions()) {
                <ng-template rtDataListToolbarActions>
                    <b qa-dataid="own-action">Экспорт</b>
                </ng-template>
            }

            @if (withSelectors()) {
                <ng-template rtDataListToolbarSelectors>
                    <b qa-dataid="own-selector">Только мои</b>
                </ng-template>
            }
        </rt-data-list-toolbar>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDataListToolbarComponent, RtDataListToolbarActionsDirective, RtDataListToolbarSelectorsDirective],
})
class ToolbarHostComponent {
    public readonly searchAppearance: WritableSignal<IRtInput.Appearance> = signal<IRtInput.Appearance>('outline');
    public readonly filtersShown: WritableSignal<boolean> = signal(false);
    public readonly filtersEmpty: WritableSignal<boolean> = signal(true);
    public readonly placeholderShown: WritableSignal<boolean> = signal(false);
    public readonly withActions: WritableSignal<boolean> = signal(false);
    public readonly withSelectors: WritableSignal<boolean> = signal(false);
    public readonly searches: string[] = [];
    public refreshes: number = 0;
    public cleared: number = 0;
    public configs: number = 0;

    public readonly toolbar: Signal<TNullable<RtDataListToolbarComponent>> = viewChild(RtDataListToolbarComponent);
}

function setup(patch: (host: ToolbarHostComponent) => void = (): void => undefined): ComponentFixture<ToolbarHostComponent> {
    const fixture: ComponentFixture<ToolbarHostComponent> = createRtFixture(ToolbarHostComponent, {}, { skipInitialDetect: true });

    patch(fixture.componentInstance);
    fixture.detectChanges();

    return fixture;
}

function toolbar(fixture: ComponentFixture<ToolbarHostComponent>): RtDataListToolbarComponent {
    return fixture.componentInstance.toolbar() as RtDataListToolbarComponent;
}

function typeSearch(fixture: ComponentFixture<ToolbarHostComponent>, text: string): void {
    const field: HTMLInputElement = el(fixture, '[qa-dataid="data-list-search"] [qa-dataid="input-control"]')?.nativeElement;

    field.value = text;
    field.dispatchEvent(new Event('input'));
    fixture.detectChanges();
}

function press(fixture: ComponentFixture<ToolbarHostComponent>, anchor: string): void {
    el(fixture, `[qa-dataid="${anchor}"] [qa-dataid="icon-button-control"]`)?.nativeElement.click();
    fixture.detectChanges();
}

describe('RtDataListToolbarComponent', () => {
    beforeEach(() => jest.useFakeTimers());

    afterEach(() => jest.useRealTimers());

    it('SC-UKV-310 — поиск спрашивают один раз, без пробелов по краям и после остановки набора', () => {
        const fixture: ComponentFixture<ToolbarHostComponent> = setup();

        typeSearch(fixture, ' ан');
        typeSearch(fixture, ' анн ');

        expect(fixture.componentInstance.searches).toEqual([]);

        jest.advanceTimersByTime(500);

        expect(fixture.componentInstance.searches).toEqual(['анн']);
    });

    it.each(['outline', 'fill'] as const)(
        'SC-UKV-356 — поиск в виде %s одного размера: высоту ему даёт набор оформления, а не вид',
        (appearance: IRtInput.Appearance) => {
            const fixture: ComponentFixture<ToolbarHostComponent> = setup((host: ToolbarHostComponent): void =>
                host.searchAppearance.set(appearance)
            );

            expect(el(fixture, '[qa-dataid="data-list-search"]')?.nativeElement.classList).toContain('rt-input--size--sm');
        }
    );

    it('очищенное поле спрашивает пустой поиск сразу, а тот же текст — не спрашивает вовсе', () => {
        const fixture: ComponentFixture<ToolbarHostComponent> = setup();

        typeSearch(fixture, 'анна');
        jest.advanceTimersByTime(500);
        typeSearch(fixture, 'анна ');
        jest.advanceTimersByTime(500);
        typeSearch(fixture, '');
        jest.advanceTimersByTime(0);

        expect(fixture.componentInstance.searches).toEqual(['анна', '']);
    });

    it('кнопка снятия отбора видна со строкой отбора и недоступна, пока условий нет', () => {
        const fixture: ComponentFixture<ToolbarHostComponent> = setup();

        expect(qa(fixture, 'data-list-clear-filters')).toBeNull();

        fixture.componentInstance.filtersShown.set(true);
        fixture.detectChanges();

        expect(el(fixture, '[qa-dataid="data-list-clear-filters"] [qa-dataid="icon-button-control"]')?.nativeElement.disabled).toBe(true);

        fixture.componentInstance.filtersEmpty.set(false);
        fixture.detectChanges();
        press(fixture, 'data-list-clear-filters');

        expect(fixture.componentInstance.cleared).toBe(1);
    });

    it('обновление и настройка колонок просят приложение', () => {
        const fixture: ComponentFixture<ToolbarHostComponent> = setup();

        press(fixture, 'data-list-refresh');
        press(fixture, 'data-list-table-config');

        expect(fixture.componentInstance.refreshes).toBe(1);
        expect(fixture.componentInstance.configs).toBe(1);
    });

    it('SC-UKV-314 — вместо скрытого «отметить все» стоит счётчик отмеченных', () => {
        const fixture: ComponentFixture<ToolbarHostComponent> = setup();

        toolbar(fixture).isMultiSelect.set(true);
        toolbar(fixture).selectedEntitiesCount.set(3);
        fixture.detectChanges();

        expect(qa(fixture, 'data-list-select-all')).not.toBeNull();
        expect(qa(fixture, 'data-list-selected-count')).toBeNull();

        toolbar(fixture).isSelectAllSelectorShown.set(false);
        fixture.detectChanges();

        expect(qa(fixture, 'data-list-select-all')).toBeNull();
        expect(textOf(qa(fixture, 'data-list-selected-count'))).toBe('Selected: 3');
    });

    it('действия и селекторы приложения стоят в панели', () => {
        const fixture: ComponentFixture<ToolbarHostComponent> = setup((host: ToolbarHostComponent) => {
            host.withActions.set(true);
            host.withSelectors.set(true);
        });

        expect(textOf(qa(fixture, 'own-action'))).toBe('Экспорт');
        expect(textOf(qa(fixture, 'own-selector'))).toBe('Только мои');
    });

    it('на заглушке поле поиска показывают только после набора', () => {
        const fixture: ComponentFixture<ToolbarHostComponent> = setup((host: ToolbarHostComponent) => host.placeholderShown.set(true));

        expect(qa(fixture, 'data-list-search')).toBeNull();

        toolbar(fixture).searchControl.setValue('анна');
        fixture.detectChanges();

        expect(qa(fixture, 'data-list-search')).not.toBeNull();
    });
});
