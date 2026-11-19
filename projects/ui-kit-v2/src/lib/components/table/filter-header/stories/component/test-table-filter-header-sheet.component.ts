import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IFilterModel } from '@rt-tools/utils';

import { STORY_TRIGGER_ATTRIBUTE } from '../../../../../../showcase/story-overlay';
import { IRtTable } from '../../../rt-table.model';
import { RtTableFilterHeaderComponent } from '../../rt-table-filter-header.component';

/**
 * Ячейка отбора по колонке «Название» в рамке телефона. Рамка шириной 375 даёт экран эскиза:
 * список видов сравнения, который открывает кнопка условия, встаёт нижней шторкой с заголовком
 * «Фильтры: <вид>». Узкий ответ даёт история подменой службы точек перехода — с первой
 * отрисовки, а не после смены окна.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-table-filter-header-sheet',
    // native-ok: обёртка истории витрины — показ живёт рядом с историей, а не отдельным файлом разметки
    template: `
        <div style="box-sizing: border-box; inline-size: 375px; padding: 16px">
            <rt-table-filter-header
                propertyName="title"
                [filter]="filter"
                [filters]="filters"
                [sheet]="sheet"
                [attr.data-story-trigger]="triggerAttribute" />
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtTableFilterHeaderComponent,
    ],
})
export class TestRtTableFilterHeaderSheetComponent {
    public readonly filter: IRtTable.ColumnFilter = { kind: 'text' };
    public readonly filters: readonly IFilterModel<string>[] = [];

    public readonly triggerAttribute: string = STORY_TRIGGER_ATTRIBUTE;

    public sheet: boolean = true;
}
