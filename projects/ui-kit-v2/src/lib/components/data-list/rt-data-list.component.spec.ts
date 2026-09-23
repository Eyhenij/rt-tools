import { ChangeDetectionStrategy, Component, EnvironmentProviders, Provider, Signal, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { EFilterOperatorType, IFilterModel, IPageModel } from '@rt-tools/utils';

import { provideRtKitLabels, TRtKitLabelKey, TRtKitLabelParams } from '../../i18n';
import { createRtFixture, el, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtDataTableConfigService } from '../data-table/rt-data-table-config.service';
import { ERtDataTableColumnType, ERtDataTableFilterType, IRtDataTable } from '../data-table/rt-data-table.model';
import { IRtInput } from '../input/rt-input.model';
import { RtDataListComponent } from './rt-data-list.component';

interface IEntity extends Record<string, unknown> {
    id: number;
    title: string;
}

const ROWS: IEntity[] = [{ id: 1, title: 'Анна' }];

const COLUMNS: Array<IRtDataTable.Column<IEntity>> = [
    {
        align: 'left',
        propName: 'title',
        type: ERtDataTableColumnType.TEXT,
        copyable: false,
        filterable: true,
        filterType: ERtDataTableFilterType.TEXT,
        header: { align: 'left', label: 'Название' },
    },
];

/** Двойник службы настроек: заглушка и вид загрузки от состава колонок не зависят. */
interface IConfigStub {
    tableConfig: WritableSignal<IRtDataTable.Config.Data<IEntity>>;
    updateConfig: () => void;
}

function configStub(vertical: boolean = false, horizontal: boolean = true): IConfigStub {
    return {
        tableConfig: signal<IRtDataTable.Config.Data<IEntity>>({
            isVerticalScrollbarShown: vertical,
            isHorizontalScrollbarShown: horizontal,
            columns: COLUMNS,
        }),
        updateConfig: (): void => undefined,
    };
}

const CONFIG_STUB: IConfigStub = configStub();

/** Размер полос список ставит на корень страницы — оттуда его наследует таблица. */
function scrollbarSizes(): { vertical: string; horizontal: string } {
    const style: CSSStyleDeclaration = document.documentElement.style;

    return {
        vertical: style.getPropertyValue('--rt-data-table-scrollbar-vertical-width'),
        horizontal: style.getPropertyValue('--rt-data-table-scrollbar-horizontal-height'),
    };
}

const PAGE: IPageModel = { pageNumber: 1, pageSize: 10, totalCount: 0, hasPrev: false, hasNext: false };

@Component({
    selector: 'rt-test-data-list-host',
    template: `
        <rt-data-list
            tableConfigStorageKey="orders"
            isFiltersShown
            [entities]="rows()"
            [pageModel]="page"
            [currentSortModel]="null"
            [filterModel]="filters()"
            [loading]="loading()"
            [fetching]="fetching()"
            [appearance]="appearance()"
            [filterAppearance]="filterAppearance()" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDataListComponent],
})
class DataListHostComponent {
    public readonly rows: WritableSignal<IEntity[]> = signal<IEntity[]>([]);
    public readonly filters: WritableSignal<Array<IFilterModel<'title'>>> = signal<Array<IFilterModel<'title'>>>([]);
    public readonly loading: WritableSignal<boolean> = signal(false);
    public readonly fetching: WritableSignal<boolean> = signal(false);
    public readonly appearance: WritableSignal<IRtInput.Appearance> = signal<IRtInput.Appearance>('outline');
    public readonly filterAppearance: WritableSignal<IRtInput.Appearance> = signal<IRtInput.Appearance>('outline');
    public readonly page: IPageModel = PAGE;
}

async function setup(
    patch: (host: DataListHostComponent) => void = (): void => undefined,
    extra: Array<EnvironmentProviders | Provider> = []
): Promise<ComponentFixture<DataListHostComponent>> {
    const fixture: ComponentFixture<DataListHostComponent> = createRtFixture(
        DataListHostComponent,
        {},
        { providers: [{ provide: RtDataTableConfigService, useValue: CONFIG_STUB }, ...extra], skipInitialDetect: true }
    );

    patch(fixture.componentInstance);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return fixture;
}

/* Два списка на одной странице: у каждого своя служба настроек и свой ключ хранения — так их
   объявляет приложение. Выбор полос при этом общий, и это приём первого кита. */
const FIRST_STUB: IConfigStub = configStub(false, true);
const SECOND_STUB: IConfigStub = configStub(false, true);

@Component({
    selector: 'rt-test-first-list',
    template: `
        <rt-data-list tableConfigStorageKey="first" [entities]="[]" [pageModel]="page" [currentSortModel]="null" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDataListComponent],
    providers: [{ provide: RtDataTableConfigService, useValue: FIRST_STUB }],
})
class FirstListComponent {
    public readonly page: IPageModel = PAGE;
}

@Component({
    selector: 'rt-test-second-list',
    template: `
        <rt-data-list tableConfigStorageKey="second" [entities]="[]" [pageModel]="page" [currentSortModel]="null" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDataListComponent],
    providers: [{ provide: RtDataTableConfigService, useValue: SECOND_STUB }],
})
class SecondListComponent {
    public readonly page: IPageModel = PAGE;
}

@Component({
    selector: 'rt-test-two-lists-host',
    template: `
        <rt-test-first-list />
        <rt-test-second-list />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FirstListComponent, SecondListComponent],
})
class TwoListsHostComponent {}

describe('RtDataListComponent', () => {
    it('SC-UKV-354 — вид поиска и вид полей отбора задаются порознь и доходят до полей', async (): Promise<void> => {
        const fixture: ComponentFixture<DataListHostComponent> = await setup((host: DataListHostComponent): void => {
            host.rows.set(ROWS);
        });
        const isFill: (anchor: string) => boolean | undefined = (anchor: string): boolean | undefined =>
            (qa(fixture, anchor)?.nativeElement as HTMLElement | undefined)?.className.includes('--appearance--fill');

        expect([isFill('data-list-search'), isFill('data-table-filter-input')]).toEqual([false, false]);

        fixture.componentInstance.appearance.set('fill');
        fixture.detectChanges();

        expect([isFill('data-list-search'), isFill('data-table-filter-input')]).toEqual([true, false]);

        fixture.componentInstance.filterAppearance.set('fill');
        fixture.detectChanges();

        expect([isFill('data-list-search'), isFill('data-table-filter-input')]).toEqual([true, true]);
    });

    it('SC-UKV-309 — заглушка стоит только без строк и без условий отбора', async (): Promise<void> => {
        const fixture: ComponentFixture<DataListHostComponent> = await setup();

        expect(textOf(qa(fixture, 'data-list-placeholder'))).toContain('No Data Found');
        expect(qa(fixture, 'data-table-filter-row')).toBeNull();

        fixture.componentInstance.filters.set([{ propertyName: 'title', value: 'Анна', operatorType: EFilterOperatorType.CONTAINS }]);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(qa(fixture, 'data-list-placeholder')).toBeNull();
        expect(qa(fixture, 'data-table-filter-row')).not.toBeNull();
    });

    it('SC-UKV-316 — первая загрузка и дозагрузка выглядят по-разному', async (): Promise<void> => {
        const fixture: ComponentFixture<DataListHostComponent> = await setup((host: DataListHostComponent) => host.loading.set(true));

        expect(qa(fixture, 'data-list-loading')).not.toBeNull();
        expect(qa(fixture, 'data-table-row')).toBeNull();

        fixture.componentInstance.loading.set(false);
        fixture.componentInstance.rows.set(ROWS);
        fixture.componentInstance.fetching.set(true);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(qa(fixture, 'data-list-loading')).toBeNull();
        expect(qa(fixture, 'data-list-fetching')).not.toBeNull();
        expect(qa(fixture, 'data-table-row')).not.toBeNull();
    });

    it('SC-UKV-315 — слова семьи идут за языком страницы', async (): Promise<void> => {
        /* Немецкий словарь приложения: кит своего языка не знает, и каждое слово идёт через него. */
        const german: Readonly<Partial<Record<TRtKitLabelKey, string>>> = {
            dataListPlaceholder: 'Keine Daten gefunden',
            dataListRefresh: 'Aktualisieren',
            dataListSearchPlaceholder: 'Suchen...',
            dataTableFilterValuePlaceholder: 'Wert eingeben',
        };
        const translator: Signal<(key: TRtKitLabelKey, params?: TRtKitLabelParams) => string> = signal(
            (key: TRtKitLabelKey): string => german[key] ?? key
        );
        const fixture: ComponentFixture<DataListHostComponent> = await setup(
            (host: DataListHostComponent) => host.rows.set(ROWS),
            [provideRtKitLabels({ translator })]
        );

        expect(el(fixture, '[qa-dataid="data-list-search"] input')?.nativeElement.placeholder).toBe('Suchen...');
        expect(el(fixture, '[qa-dataid="data-list-refresh"] button')?.nativeElement.getAttribute('aria-label')).toBe('Aktualisieren');

        fixture.componentInstance.rows.set([]);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(textOf(qa(fixture, 'data-list-placeholder'))).toContain('Keine Daten gefunden');
    });

    it('SC-UKV-269 — размер полос идёт с корня страницы: горизонтальная видна, вертикальной нет', async (): Promise<void> => {
        await setup();

        expect(scrollbarSizes()).toEqual({ vertical: '0', horizontal: 'var(--rt-size-3)' });
    });

    it('SC-UKV-270 — скрытая полоса — это нулевой размер, а не запрет прокрутки', async (): Promise<void> => {
        const stub: IConfigStub = configStub(false, false);
        const fixture: ComponentFixture<DataListHostComponent> = await setup(undefined, [
            { provide: RtDataTableConfigService, useValue: stub },
        ]);

        expect(scrollbarSizes()).toEqual({ vertical: '0', horizontal: '0' });

        stub.tableConfig.set({ isVerticalScrollbarShown: true, isHorizontalScrollbarShown: true, columns: COLUMNS });
        fixture.detectChanges();

        expect(scrollbarSizes()).toEqual({ vertical: 'var(--rt-size-3)', horizontal: 'var(--rt-size-3)' });
    });

    it('SC-UKV-273 — выбор полос, сохранённый одним списком, достаётся каждому списку страницы', async (): Promise<void> => {
        const fixture: ComponentFixture<TwoListsHostComponent> = createRtFixture(TwoListsHostComponent, {}, { skipInitialDetect: true });

        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(scrollbarSizes().horizontal).toBe('var(--rt-size-3)');

        // Человек спрятал горизонтальную полосу у первого списка и сохранил.
        FIRST_STUB.tableConfig.set({ isVerticalScrollbarShown: false, isHorizontalScrollbarShown: false, columns: COLUMNS });
        fixture.detectChanges();

        expect(scrollbarSizes().horizontal).toBe('0');
        expect(SECOND_STUB.tableConfig().isHorizontalScrollbarShown).toBe(true);
    });
});
