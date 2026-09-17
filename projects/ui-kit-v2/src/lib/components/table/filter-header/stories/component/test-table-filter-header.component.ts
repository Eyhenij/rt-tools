import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IFilterModel } from '@rt-tools/utils';

import { IRtTable } from '../../../rt-table.model';
import { RtTableFilterHeaderComponent } from '../../rt-table-filter-header.component';

/**
 * Демонстрационная обёртка для витрины: держит набор условий, который ячейка меняет, и показывает
 * его рядом. Входы кита сигнальные и извне не пишутся — поэтому история целится сюда, а не в сам
 * компонент. В пакет обёртка не уезжает.
 *
 * Набор условий здесь и держится: сам отбор его не держит вовсе — он только сообщает наружу.
 */
@Component({
    selector: 'app-table-filter-header',
    // native-ok: обёртка истории витрины — показ живёт рядом с историей, а не отдельным файлом разметки
    template: `
        <div class="app-table-filter-header-box" data-story-root>
            <rt-table-filter-header propertyName="title" [filter]="filterOf()" [filters]="filters" (filtersChange)="onFilters($event)" />

            <small>{{ happened }}</small>
        </div>
    `,
    // native-ok: обёртка истории витрины — правила коробки живут рядом с показом, а не отдельным файлом
    styles: `
        /* Корень показа: по нему обвязка снимков берёт область кадра — иначе кадр берётся
           страницей целиком, и показ занимает в нём угол. См. STORY_SNAPSHOT_ROOT_ATTRIBUTE. */
        .app-table-filter-header-box {
            display: grid;
            padding: var(--rt-space-4);
            inline-size: 20rem;
            gap: var(--rt-space-2);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtTableFilterHeaderComponent,
    ],
})
export class TestRtTableFilterHeaderComponent {
    public kind: IRtTable.FilterKind = 'text';
    public filters: readonly IFilterModel<string>[] = [];
    public happened: string = 'Набор условий пуст';

    /**
     * Настройка собирается вызовом, а не полем: вид приходит от витрины отдельной ручкой, а
     * геттера у компонента тут не завести — правило состояния его запрещает.
     */
    public filterOf(): IRtTable.ColumnFilter {
        return this.kind === 'select'
            ? {
                  kind: 'select',
                  options: [
                      { value: 'new', label: 'Новая' },
                      { value: 'done', label: 'Закрыта' },
                  ],
              }
            : { kind: this.kind };
    }

    public onFilters(next: readonly IFilterModel<string>[]): void {
        this.filters = next;
        this.happened =
            next.length === 0
                ? 'Набор условий пуст'
                : next
                      .map((filter: IFilterModel<string>): string => `${filter.propertyName} ${filter.operatorType} ${filter.value}`)
                      .join('; ');
    }
}
