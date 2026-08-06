import {
    CdkCell,
    CdkCellDef,
    CdkColumnDef,
    CdkHeaderCell,
    CdkHeaderCellDef,
    CdkHeaderRow,
    CdkHeaderRowDef,
    CdkRow,
    CdkRowDef,
} from '@angular/cdk/table';
import { ChangeDetectionStrategy, Component, DebugElement, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { BreakpointsService } from '../../platform';
import { classesOf, createRtFixture, el, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { IRtTable } from './rt-table.model';
import { RtTableComponent } from './rt-table.component';

interface ITourRow {
    readonly id: number;
    readonly title: string;
    readonly city: string;
}

const ROWS: ReadonlyArray<ITourRow> = [
    { id: 1, title: 'Тур в Сочи', city: 'Сочи' },
    { id: 2, title: 'Тур в Казань', city: 'Казань' },
];

const COLUMNS: ReadonlyArray<string> = ['title', 'city'];

/** Колонки объявляются директивами CDK — таблицу без host-обёртки не поднять. */
@Component({
    selector: 'rt-table-host',
    template: `
        <table
            rt-table
            ariaLabel="Туры"
            [dataSource]="rows()"
            [columns]="columns"
            [density]="density()"
            [cards]="cards()"
            [loading]="loading()"
            [fetching]="fetching()"
            [emptyMessage]="emptyMessage()">
            <ng-container cdkColumnDef="title">
                <th *cdkHeaderCellDef cdk-header-cell>Название</th>
                <td *cdkCellDef="let row" cdk-cell qa-dataid="cell-title">{{ row.title }}</td>
            </ng-container>
            <ng-container cdkColumnDef="city">
                <th *cdkHeaderCellDef cdk-header-cell>Город</th>
                <td *cdkCellDef="let row" cdk-cell qa-dataid="cell-city">{{ row.city }}</td>
            </ng-container>
            <tr *cdkHeaderRowDef="columns" cdk-header-row></tr>
            <tr *cdkRowDef="let row; columns: columns" cdk-row qa-dataid="table-row"></tr>
        </table>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RtTableComponent,
        CdkColumnDef,
        CdkHeaderCellDef,
        CdkHeaderCell,
        CdkCellDef,
        CdkCell,
        CdkHeaderRowDef,
        CdkHeaderRow,
        CdkRowDef,
        CdkRow,
    ],
})
class TableHostComponent {
    public readonly columns: ReadonlyArray<string> = COLUMNS;
    public readonly rows: WritableSignal<ReadonlyArray<ITourRow>> = signal<ReadonlyArray<ITourRow>>(ROWS);
    public readonly density: WritableSignal<IRtTable.Density> = signal<IRtTable.Density>('default');
    public readonly cards: WritableSignal<boolean> = signal<boolean>(true);
    public readonly loading: WritableSignal<boolean> = signal<boolean>(false);
    public readonly fetching: WritableSignal<boolean> = signal<boolean>(false);
    public readonly emptyMessage: WritableSignal<string> = signal<string>('');
}

/** Подмена наблюдателя ширины: в тестовой среде он ничего не измеряет. */
class NarrowBreakpointsService {
    public readonly narrow: () => boolean = (): boolean => true;
}

function setup(): ComponentFixture<TableHostComponent> {
    return createRtFixture(TableHostComponent, {}, { skipInitialDetect: true });
}

/** Карточки рисуются только на узком экране — ширину подменяем. */
function setupNarrow(): ComponentFixture<TableHostComponent> {
    return createRtFixture(
        TableHostComponent,
        {},
        { skipInitialDetect: true, providers: [{ provide: BreakpointsService, useClass: NarrowBreakpointsService }] }
    );
}

function render(fixture: ComponentFixture<TableHostComponent>): ComponentFixture<TableHostComponent> {
    fixture.detectChanges();
    return fixture;
}

function table(fixture: ComponentFixture<TableHostComponent>): HTMLElement {
    return el(fixture, 'table')?.nativeElement as HTMLElement;
}

describe('RtTableComponent', (): void => {
    it('рисует строки по переданному источнику', (): void => {
        const fixture: ComponentFixture<TableHostComponent> = render(setup());

        expect(qaAll(fixture, 'cell-title').map((node: DebugElement): string => textOf(node))).toEqual(['Тур в Сочи', 'Тур в Казань']);
    });

    it('несёт свой BEM-блок на самом теге таблицы', (): void => {
        expect(classesOf(table(render(setup())))).toContain('rt-table');
    });

    it('подпись для скринридера уезжает на таблицу', (): void => {
        expect(table(render(setup())).getAttribute('aria-label')).toBe('Туры');
    });

    describe('состояния', (): void => {
        it('первая загрузка рисует заглушки строк вместо данных', (): void => {
            const fixture: ComponentFixture<TableHostComponent> = setup();
            fixture.componentInstance.rows.set([]);
            fixture.componentInstance.loading.set(true);
            render(fixture);

            expect(qaAll(fixture, 'table-skeleton-row').length).toBeGreaterThan(0);
            expect(qa(fixture, 'table-empty-row')).toBeNull();
        });

        it('пустой ответ рисует заглушку с переведённым текстом', (): void => {
            const fixture: ComponentFixture<TableHostComponent> = setup();
            fixture.componentInstance.rows.set([]);
            render(fixture);

            expect(qa(fixture, 'table-empty-row')).not.toBeNull();
            expect(textOf(qa(fixture, 'empty-state-title'))).toBe('No data');
        });

        it('свой текст пустоты перебивает переведённый', (): void => {
            const fixture: ComponentFixture<TableHostComponent> = setup();
            fixture.componentInstance.rows.set([]);
            fixture.componentInstance.emptyMessage.set('Туров пока нет');
            render(fixture);

            expect(textOf(qa(fixture, 'empty-state-title'))).toBe('Туров пока нет');
        });

        it('догрузка поверх готовых строк заглушками их не подменяет', (): void => {
            // Иначе таблица мигала бы при каждой смене страницы.
            const fixture: ComponentFixture<TableHostComponent> = setup();
            fixture.componentInstance.fetching.set(true);
            render(fixture);

            expect(qaAll(fixture, 'table-skeleton-row').length).toBe(0);
            expect(qaAll(fixture, 'cell-title').length).toBe(2);
        });
    });

    describe('карточки для узкого экрана', (): void => {
        it('на широком экране карточек нет — строки таблицы помещаются', (): void => {
            expect(qa(render(setup()), 'table-cards')).toBeNull();
        });

        it('на узком экране те же строки рисуются карточками', (): void => {
            // Таблица не перестраивается стилями: узкая разметка — это другая
            // разметка, и решает про неё сам компонент по ширине вьюпорта.
            const fixture: ComponentFixture<TableHostComponent> = render(setupNarrow());

            expect(qa(fixture, 'table-cards')).not.toBeNull();
            expect(qaAll(fixture, 'table-card').length).toBe(2);
        });

        it('в карточке подписью служит имя колонки — заголовок таблицы туда не переносится', (): void => {
            // Заголовки живут в шаблонах ячеек CDK, до которых карточка не
            // дотягивается: подписью становится ключ колонки. Осмысленную
            // подпись даёт описание колонок (`columnsConfig`).
            const fixture: ComponentFixture<TableHostComponent> = render(setupNarrow());

            expect(qaAll(fixture, 'table-card-label').map((node: DebugElement): string => textOf(node))).toEqual([
                'title',
                'city',
                'title',
                'city',
            ]);
        });

        it('карточки выключаются входом даже на узком экране', (): void => {
            const fixture: ComponentFixture<TableHostComponent> = setupNarrow();
            fixture.componentInstance.cards.set(false);
            render(fixture);

            expect(qa(fixture, 'table-cards')).toBeNull();
        });
    });

    describe('плотность', (): void => {
        it('обычный режим класса не выводит — он и есть умолчание', (): void => {
            expect(classesOf(table(render(setup())))).not.toContain('rt-table--density--compact');
        });

        it('плотный режим помечает таблицу', (): void => {
            const fixture: ComponentFixture<TableHostComponent> = setup();
            fixture.componentInstance.density.set('compact');
            render(fixture);

            expect(classesOf(table(fixture))).toContain('rt-table--density--compact');
        });
    });

    describe('настройка колонок', (): void => {
        it('без описания колонок и идентификатора таблицы настройка недоступна', (): void => {
            // Настройки надо где-то хранить: без идентификатора таблицы их
            // некуда положить, поэтому кнопка не показывается.
            const fixture: ComponentFixture<TableHostComponent> = render(setup());
            const instance: RtTableComponent<ITourRow> = el(fixture, 'table')?.componentInstance as RtTableComponent<ITourRow>;

            expect(instance.canConfigure()).toBe(false);
        });

        it('видимые колонки по умолчанию совпадают с переданными', (): void => {
            const fixture: ComponentFixture<TableHostComponent> = render(setup());
            const instance: RtTableComponent<ITourRow> = el(fixture, 'table')?.componentInstance as RtTableComponent<ITourRow>;

            expect(instance.displayedColumns()).toEqual(COLUMNS);
        });
    });

    it('смена источника перерисовывает и строки, и карточки', (): void => {
        const fixture: ComponentFixture<TableHostComponent> = render(setupNarrow());

        fixture.componentInstance.rows.set([{ id: 3, title: 'Тур в Москву', city: 'Москва' }]);
        fixture.detectChanges();

        // Шаблон ячейки один на обе разметки, поэтому на узком экране он
        // отрисован дважды: в строке таблицы и в карточке.
        expect(qaAll(fixture, 'table-card-value').map((node: DebugElement): string => textOf(node))).toEqual(['Тур в Москву', 'Москва']);
        expect(qaAll(fixture, 'table-card').length).toBe(1);
    });
});
