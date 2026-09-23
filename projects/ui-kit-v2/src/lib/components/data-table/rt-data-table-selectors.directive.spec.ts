import { ChangeDetectionStrategy, Component, signal, Signal, viewChild, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { TNullable } from '@rt-tools/utils';

import { createRtFixture, el, els, qa, qaAll } from '../../../testing/rt-kit-testing';
import { RtDataTableConfigService } from './rt-data-table-config.service';
import { RtDataTableComponent } from './rt-data-table.component';
import { ERtDataTableColumnType, IRtDataTable } from './rt-data-table.model';
import { RtDataTableSelectorsDirective } from './rt-data-table-selectors.directive';

interface IEntity extends Record<string, unknown> {
    id: number;
    title: string;
}

const PAGE_ONE: IEntity[] = [
    { id: 1, title: 'Анна' },
    { id: 2, title: 'Борис' },
];

const PAGE_TWO: IEntity[] = [{ id: 3, title: 'Вера' }];

const COLUMNS: Array<IRtDataTable.Column<IEntity>> = [
    {
        align: 'left',
        propName: 'title',
        type: ERtDataTableColumnType.TEXT,
        copyable: false,
        header: { align: 'left', label: 'Название' },
    },
];

/** Двойник службы настроек: состав колонок у выбора строк ничего не решает. */
const CONFIG_STUB: { tableConfig: Signal<IRtDataTable.Config.Data<IEntity>> } = {
    tableConfig: signal({ isVerticalScrollbarShown: false, isHorizontalScrollbarShown: true, columns: COLUMNS }),
};

@Component({
    selector: 'rt-test-selectors-host',
    template: `
        <rt-data-table
            rtDataTableSelectors
            [entities]="rows()"
            [currentSortModel]="null"
            [isMultiSelect]="multiple()"
            [isSelectorColumnShown]="columnShown()"
            [isSelectorsColumnDisabled]="columnDisabled()"
            [selectedEntitiesKeys]="presetKeys()" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDataTableComponent, RtDataTableSelectorsDirective],
})
class SelectorsHostComponent {
    public readonly rows: WritableSignal<IEntity[]> = signal<IEntity[]>(PAGE_ONE);
    public readonly multiple: WritableSignal<boolean> = signal(true);
    public readonly columnShown: WritableSignal<boolean> = signal(true);
    public readonly columnDisabled: WritableSignal<boolean> = signal(false);
    public readonly presetKeys: WritableSignal<number[]> = signal<number[]>([]);

    public readonly selectors: Signal<TNullable<RtDataTableSelectorsDirective<IEntity, 'title', 'id'>>> =
        viewChild<RtDataTableSelectorsDirective<IEntity, 'title', 'id'>>(RtDataTableSelectorsDirective);
}

function setup(patch: (host: SelectorsHostComponent) => void = (): void => undefined): ComponentFixture<SelectorsHostComponent> {
    const fixture: ComponentFixture<SelectorsHostComponent> = createRtFixture(
        SelectorsHostComponent,
        {},
        { providers: [{ provide: RtDataTableConfigService, useValue: CONFIG_STUB }], skipInitialDetect: true }
    );

    patch(fixture.componentInstance);
    fixture.detectChanges();

    return fixture;
}

function selectors(fixture: ComponentFixture<SelectorsHostComponent>): RtDataTableSelectorsDirective<IEntity, 'title', 'id'> {
    return fixture.componentInstance.selectors() as RtDataTableSelectorsDirective<IEntity, 'title', 'id'>;
}

/** Флажок строки — кнопка кита; отмечен он или нет, читается её словом для скринридера. */
function rowCheckbox(fixture: ComponentFixture<SelectorsHostComponent>, index: number): HTMLButtonElement {
    return els(fixture, '[qa-dataid="data-table-row-checkbox"] [qa-dataid="checkbox-control"]')[index]?.nativeElement;
}

function markRow(fixture: ComponentFixture<SelectorsHostComponent>, index: number): void {
    rowCheckbox(fixture, index).click();
    fixture.detectChanges();
}

function pageCheckbox(fixture: ComponentFixture<SelectorsHostComponent>): HTMLButtonElement {
    return el(fixture, '[qa-dataid="data-table-page-checkbox"] [qa-dataid="checkbox-control"]')?.nativeElement;
}

describe('RtDataTableSelectorsDirective', () => {
    it('SC-UKV-236 — при выборе многих у каждой строки флажок, а в шапке флажок страницы', () => {
        const fixture: ComponentFixture<SelectorsHostComponent> = setup();

        expect(qaAll(fixture, 'data-table-row-checkbox').length).toBe(2);
        expect(qa(fixture, 'data-table-page-checkbox')).not.toBeNull();
        expect(qaAll(fixture, 'data-table-row-radio').length).toBe(0);
    });

    it('SC-UKV-237 — отметка строки отдаёт приложению саму запись', () => {
        const fixture: ComponentFixture<SelectorsHostComponent> = setup();

        markRow(fixture, 0);

        expect(selectors(fixture).selectedEntities()).toEqual([PAGE_ONE[0]]);
        expect(selectors(fixture).selectedEntitiesIds()).toEqual([1]);
    });

    it('SC-UKV-238 и SC-UKV-239 — флажок страницы промежуточен на части строк и отмечен на всех', () => {
        const fixture: ComponentFixture<SelectorsHostComponent> = setup();

        markRow(fixture, 0);

        expect(selectors(fixture).isPageEntitiesSelected()).toBe(false);
        expect(selectors(fixture).isPageEntitiesIndeterminate()).toBe(true);

        markRow(fixture, 1);

        expect(selectors(fixture).isPageEntitiesSelected()).toBe(true);
    });

    it('SC-UKV-240 — отметка на другой странице держит флажок страницы промежуточным', () => {
        const fixture: ComponentFixture<SelectorsHostComponent> = setup();

        markRow(fixture, 0);
        fixture.componentInstance.rows.set(PAGE_TWO);
        fixture.detectChanges();
        markRow(fixture, 0);
        markRow(fixture, 0);

        expect(selectors(fixture).selectedEntitiesIds()).toEqual([1]);
        expect(selectors(fixture).isPageEntitiesSelected()).toBe(false);
        expect(selectors(fixture).isPageEntitiesIndeterminate()).toBe(true);
    });

    it('SC-UKV-241 и SC-UKV-242 — флажок страницы отмечает только её строки, и отметки переживают смену страницы', async () => {
        const fixture: ComponentFixture<SelectorsHostComponent> = setup();

        pageCheckbox(fixture).click();
        fixture.detectChanges();

        expect(selectors(fixture).selectedEntitiesIds()).toEqual([1, 2]);

        fixture.componentInstance.rows.set(PAGE_TWO);
        fixture.detectChanges();
        markRow(fixture, 0);

        expect(selectors(fixture).selectedEntitiesIds()).toEqual([1, 2, 3]);

        fixture.componentInstance.rows.set(PAGE_ONE);
        fixture.detectChanges();

        expect(selectors(fixture).selectedEntitiesIds()).toEqual([1, 2, 3]);

        await fixture.whenStable();
        fixture.detectChanges();

        expect(rowCheckbox(fixture, 0).getAttribute('aria-checked')).toBe('true');
    });

    it('SC-UKV-243 — снятие выбора не оставляет ни отметок, ни отмеченного флажка', async () => {
        const fixture: ComponentFixture<SelectorsHostComponent> = setup();

        pageCheckbox(fixture).click();
        fixture.detectChanges();
        selectors(fixture).clearSelectedList();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(selectors(fixture).selectedEntities()).toEqual([]);
        expect(selectors(fixture).isPageEntitiesSelected()).toBe(false);
        expect(pageCheckbox(fixture).getAttribute('aria-checked')).toBe('false');
    });

    it('SC-UKV-245 и SC-UKV-246 — при выборе по одной строки берут радиокнопку, а прежняя отметка уходит', () => {
        const fixture: ComponentFixture<SelectorsHostComponent> = setup((host: SelectorsHostComponent) => host.multiple.set(false));

        expect(qa(fixture, 'data-table-page-checkbox')).toBeNull();
        expect(qaAll(fixture, 'data-table-row-radio').length).toBe(2);

        const radios: HTMLElement[] = els(fixture, '[qa-dataid="data-table-row-radio"] [qa-dataid="radio-button-control"]').map(
            (node: { nativeElement: HTMLElement }) => node.nativeElement
        );

        radios[0].click();
        fixture.detectChanges();
        radios[1].click();
        fixture.detectChanges();

        expect(selectors(fixture).selectedEntitiesIds()).toEqual([2]);
    });

    it('SC-UKV-247 и SC-UKV-248 — отметки, названные заранее, ставятся раз и не переписывают выбранное', () => {
        const fixture: ComponentFixture<SelectorsHostComponent> = setup((host: SelectorsHostComponent) => host.presetKeys.set([2]));

        expect(selectors(fixture).selectedEntitiesIds()).toEqual([2]);

        markRow(fixture, 0);
        fixture.componentInstance.presetKeys.set([1, 2]);
        fixture.detectChanges();

        expect(selectors(fixture).selectedEntitiesIds()).toEqual([2, 1]);
    });

    it('SC-UKV-249 — выключенная колонка выбора отметки показывает и менять не даёт', async () => {
        const fixture: ComponentFixture<SelectorsHostComponent> = setup((host: SelectorsHostComponent) => {
            host.presetKeys.set([1]);
            host.columnDisabled.set(true);
        });

        await fixture.whenStable();
        fixture.detectChanges();

        expect(rowCheckbox(fixture, 0).getAttribute('aria-checked')).toBe('true');

        markRow(fixture, 1);

        expect(selectors(fixture).selectedEntitiesIds()).toEqual([1]);
        expect(rowCheckbox(fixture, 1).disabled).toBe(true);
    });

    it('SC-UKV-244 — нажатие в ячейке выбора строку не трогает', () => {
        const fixture: ComponentFixture<SelectorsHostComponent> = setup();
        const cell: HTMLElement = qaAll(fixture, 'data-table-row-checkbox')[0].nativeElement.closest('td');

        expect(cell.getAttribute('rt-data-table-stop-row-click')).toBe('');
    });
});
