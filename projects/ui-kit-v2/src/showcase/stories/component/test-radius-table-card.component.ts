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
import { ChangeDetectionStrategy, Component, input, InputSignal, signal } from '@angular/core';

import { TRtRadius } from '../../../lib/components/radius/rt-radius.model';
import { RtTableComponent } from '../../../lib/components/table/rt-table.component';
import { BreakpointsService } from '../../../lib/platform';

/** Признак узкого экрана, который таблица читает у службы порогов. Здесь он включён всегда. */
const NARROW: Pick<BreakpointsService, 'narrow'> = { narrow: signal<boolean>(true).asReadonly() };

/**
 * Таблица сетки скруглений в узком показе: шаг входа `radius` виден только на карточке.
 *
 * Карточку таблица рисует по признаку службы порогов, а не по ширине ячейки, поэтому обёртка
 * подменяет службу у себя: так карточка стоит на каждом шаге в обычном кадре сетки. Широкий показ
 * углов не имеет, и его показывает матрица самой таблицы.
 *
 * В пакет обёртка не уезжает: `tsconfig.lib.json` исключает `src/showcase/**`.
 */
@Component({
    selector: 'app-radius-table-card',
    templateUrl: './test-radius-table-card.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: BreakpointsService, useValue: NARROW }],
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
export class TestRtRadiusTableCardComponent {
    protected readonly columns: readonly string[] = ['title'];

    protected readonly rows: readonly { title: string }[] = [{ title: 'Тур в Сочи' }];

    /** Шаг шкалы; пусто — умолчание таблицы. */
    public readonly radius: InputSignal<TRtRadius | null> = input<TRtRadius | null>(null);
}
