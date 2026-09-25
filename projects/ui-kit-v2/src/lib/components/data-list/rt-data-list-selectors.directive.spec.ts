import { ChangeDetectionStrategy, Component, signal, Signal, viewChild, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { IPageModel, TNullable } from '@rt-tools/utils';

import { createRtFixture, el, els, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtDataTableConfigService } from '../data-table/rt-data-table-config.service';
import { ERtDataTableColumnType, IRtDataTable } from '../data-table/rt-data-table.model';
import { RtDataListComponent } from './rt-data-list.component';
import { RtDataListSelectorsDirective } from './rt-data-list-selectors.directive';

interface IEntity extends Record<string, unknown> {
    id: number;
    title: string;
}

const PAGE_ONE: IEntity[] = [
    { id: 1, title: 'Анна' },
    { id: 2, title: 'Борис' },
    { id: 3, title: 'Вера' },
];

const PAGE_TWO: IEntity[] = [
    { id: 4, title: 'Глеб' },
    { id: 5, title: 'Дарья' },
];

const COLUMNS: Array<IRtDataTable.Column<IEntity>> = [
    {
        align: 'left',
        propName: 'title',
        type: ERtDataTableColumnType.TEXT,
        copyable: false,
        header: { align: 'left', label: 'Название' },
    },
];

/** Двойник службы настроек: состав колонок выбору записей ничего не решает. */
const CONFIG_STUB: { tableConfig: Signal<IRtDataTable.Config.Data<IEntity>>; updateConfig: () => void } = {
    tableConfig: signal({ isVerticalScrollbarShown: false, isHorizontalScrollbarShown: true, columns: COLUMNS }),
    updateConfig: (): void => undefined,
};

function pageOf(patch: Partial<IPageModel> = {}): IPageModel {
    return { pageNumber: 1, pageSize: 3, totalCount: 5, hasPrev: false, hasNext: true, ...patch };
}

@Component({
    selector: 'rt-test-data-list-selectors-host',
    template: `
        <rt-data-list
            rtDataListSelectors
            tableConfigStorageKey="orders"
            [entities]="rows()"
            [pageModel]="page()"
            [currentSortModel]="null"
            [isMultiSelectExtendedMod]="extended()"
            [isSelectAllSelectorShown]="selectAllShown()" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDataListComponent, RtDataListSelectorsDirective],
})
class SelectorsHostComponent {
    public readonly rows: WritableSignal<IEntity[]> = signal<IEntity[]>(PAGE_ONE);
    public readonly page: WritableSignal<IPageModel> = signal<IPageModel>(pageOf());
    public readonly extended: WritableSignal<boolean> = signal(true);
    public readonly selectAllShown: WritableSignal<boolean> = signal(true);

    public readonly selectors: Signal<TNullable<RtDataListSelectorsDirective<IEntity, 'title', 'id'>>> =
        viewChild<RtDataListSelectorsDirective<IEntity, 'title', 'id'>>(RtDataListSelectorsDirective);
}

/** Флажки кита ведутся через `ngModel`, и его запись доходит микрозадачей позже показа. */
async function settle(fixture: ComponentFixture<SelectorsHostComponent>): Promise<void> {
    await fixture.whenStable();
    fixture.detectChanges();
}

async function setup(
    patch: (host: SelectorsHostComponent) => void = (): void => undefined
): Promise<ComponentFixture<SelectorsHostComponent>> {
    const fixture: ComponentFixture<SelectorsHostComponent> = createRtFixture(
        SelectorsHostComponent,
        {},
        { providers: [{ provide: RtDataTableConfigService, useValue: CONFIG_STUB }], skipInitialDetect: true }
    );

    patch(fixture.componentInstance);
    fixture.detectChanges();
    await settle(fixture);

    return fixture;
}

function selectors(fixture: ComponentFixture<SelectorsHostComponent>): RtDataListSelectorsDirective<IEntity, 'title', 'id'> {
    return fixture.componentInstance.selectors() as RtDataListSelectorsDirective<IEntity, 'title', 'id'>;
}

/** «Отметить все» в полосе действий — флажок кита; отмечен он или нет, читается словом для скринридера. */
function selectAll(fixture: ComponentFixture<SelectorsHostComponent>): HTMLButtonElement {
    return el(fixture, '[qa-dataid="data-list-select-all"] [qa-dataid="checkbox-control"]')?.nativeElement;
}

function pageCheckbox(fixture: ComponentFixture<SelectorsHostComponent>): HTMLButtonElement {
    return el(fixture, '[qa-dataid="data-table-page-checkbox"] [qa-dataid="checkbox-control"]')?.nativeElement;
}

function rowCheckbox(fixture: ComponentFixture<SelectorsHostComponent>, index: number): HTMLButtonElement {
    return els(fixture, '[qa-dataid="data-table-row-checkbox"] [qa-dataid="checkbox-control"]')[index]?.nativeElement;
}

async function click(fixture: ComponentFixture<SelectorsHostComponent>, node: HTMLElement): Promise<void> {
    node.click();
    fixture.detectChanges();
    await settle(fixture);
}

async function goToPage(fixture: ComponentFixture<SelectorsHostComponent>, rows: IEntity[], pageNumber: number): Promise<void> {
    fixture.componentInstance.rows.set(rows);
    fixture.componentInstance.page.set(pageOf({ pageNumber, hasPrev: pageNumber > 1, hasNext: pageNumber < 2 }));
    fixture.detectChanges();
    await settle(fixture);
}

describe('RtDataListSelectorsDirective', () => {
    it('SC-UKV-250 — «отметить все» отмечает показанные строки и каждую пришедшую следом страницу', async (): Promise<void> => {
        const fixture: ComponentFixture<SelectorsHostComponent> = await setup();

        await click(fixture, selectAll(fixture));

        expect(selectors(fixture).selectedEntitiesIds()).toEqual([1, 2, 3]);

        await goToPage(fixture, PAGE_TWO, 2);

        expect(selectors(fixture).selectedEntitiesIds()).toEqual([1, 2, 3, 4, 5]);
        expect(selectors(fixture).isAllEntitiesSelected()).toBe(true);
    });

    it('SC-UKV-251 — снятая под «отметить все» строка уходит в исключения', async (): Promise<void> => {
        const fixture: ComponentFixture<SelectorsHostComponent> = await setup();

        await click(fixture, selectAll(fixture));
        await click(fixture, rowCheckbox(fixture, 1));

        expect(selectors(fixture).excludedEntitiesIds()).toEqual([2]);
        expect(selectors(fixture).isAllEntitiesSelected()).toBe(false);
        expect(selectors(fixture).selectedEntitiesIds()).toEqual([1, 3]);
    });

    it('SC-UKV-252 — отмеченная заново единственная исключённая запись возвращает «отметить все»', async (): Promise<void> => {
        const fixture: ComponentFixture<SelectorsHostComponent> = await setup();

        await click(fixture, selectAll(fixture));
        await click(fixture, rowCheckbox(fixture, 1));
        await click(fixture, rowCheckbox(fixture, 1));

        expect(selectors(fixture).excludedEntitiesIds()).toEqual([]);
        expect(selectors(fixture).isAllEntitiesSelected()).toBe(true);
    });

    it('SC-UKV-253 — исключённая запись приходит неотмеченной, когда её страница возвращается', async () => {
        const fixture: ComponentFixture<SelectorsHostComponent> = await setup();

        await click(fixture, selectAll(fixture));
        await click(fixture, rowCheckbox(fixture, 1));
        await goToPage(fixture, PAGE_TWO, 2);
        await goToPage(fixture, PAGE_ONE, 1);

        expect(selectors(fixture).selectedEntitiesIds()).toEqual([1, 3, 4, 5]);

        expect(rowCheckbox(fixture, 0).getAttribute('aria-checked')).toBe('true');
        expect(rowCheckbox(fixture, 1).getAttribute('aria-checked')).toBe('false');
        expect(rowCheckbox(fixture, 2).getAttribute('aria-checked')).toBe('true');
    });

    it('SC-UKV-254 — снятый под «отметить все» флажок страницы уводит её записи в исключения', async (): Promise<void> => {
        const fixture: ComponentFixture<SelectorsHostComponent> = await setup();

        await click(fixture, selectAll(fixture));
        await click(fixture, pageCheckbox(fixture));

        expect(selectors(fixture).excludedEntitiesIds()).toEqual([1, 2, 3]);
        expect(selectors(fixture).selectedEntitiesIds()).toEqual([]);
        expect(selectors(fixture).isAllEntitiesSelected()).toBe(false);
    });

    it('признак всех страниц читается и под именем первого кита isMultiSelectExtendedModEnabled', async (): Promise<void> => {
        const fixture: ComponentFixture<SelectorsHostComponent> = await setup();

        expect([selectors(fixture).isAcrossPagesEnabled(), selectors(fixture).isMultiSelectExtendedModEnabled()]).toEqual([false, false]);

        await click(fixture, selectAll(fixture));

        expect([selectors(fixture).isAcrossPagesEnabled(), selectors(fixture).isMultiSelectExtendedModEnabled()]).toEqual([true, true]);
    });

    it('SC-UKV-255 — снятое «отметить все» убирает и отметки, и отметку всех страниц', async (): Promise<void> => {
        const fixture: ComponentFixture<SelectorsHostComponent> = await setup();

        await click(fixture, selectAll(fixture));
        await click(fixture, selectAll(fixture));

        expect(selectors(fixture).selectedEntities()).toEqual([]);
        expect(selectors(fixture).isAcrossPagesEnabled()).toBe(false);
        expect(selectors(fixture).isAllEntitiesSelected()).toBe(false);
    });

    it('SC-UKV-256 — с выключенным разведённым видом «отметить все» берёт только показанные строки', async (): Promise<void> => {
        const fixture: ComponentFixture<SelectorsHostComponent> = await setup((host: SelectorsHostComponent) => host.extended.set(false));

        await click(fixture, selectAll(fixture));

        expect(selectors(fixture).selectedEntitiesIds()).toEqual([1, 2, 3]);

        await goToPage(fixture, PAGE_TWO, 2);

        expect(selectors(fixture).selectedEntitiesIds()).toEqual([1, 2, 3]);
        expect(selectors(fixture).isAcrossPagesEnabled()).toBe(false);
    });

    it('SC-UKV-314 — вместо скрытого «отметить все» стоит счётчик отмеченных', async (): Promise<void> => {
        const fixture: ComponentFixture<SelectorsHostComponent> = await setup((host: SelectorsHostComponent) =>
            host.selectAllShown.set(false)
        );

        await click(fixture, rowCheckbox(fixture, 0));
        await click(fixture, rowCheckbox(fixture, 1));

        expect(qa(fixture, 'data-list-select-all')).toBeNull();
        expect(textOf(qa(fixture, 'data-list-selected-count'))).toBe('Selected: 2');
    });

    it('SC-UKV-323 — пустая страница оставляет флажок страницы отмеченным, как в первом ките', async (): Promise<void> => {
        const fixture: ComponentFixture<SelectorsHostComponent> = await setup((host: SelectorsHostComponent) => host.rows.set([]));

        expect(selectors(fixture).selectedEntitiesIds()).toEqual([]);
        expect(selectors(fixture).isPageEntitiesSelected()).toBe(true);
        expect(selectors(fixture).isPageEntitiesIndeterminate()).toBe(false);
    });
});
