import { Pipe, PipeTransform } from '@angular/core';

import { rowHasAvailableActions } from './rt-table-row-actions.logic';
import { IRtTable } from './rt-table.model';

/**
 * Есть ли у строки доступные действия — гейт кнопки «…» в ячейке действий.
 *
 * Pure-pipe: пересчитывается только при смене строки или предиката, а не на каждом
 * цикле проверки. Значение приходит из контекста шаблона (строка таблицы), поэтому
 * `computed()` здесь неприменим.
 */
@Pipe({ name: 'rtRowHasActions' })
export class RtRowHasActionsPipe implements PipeTransform {
    public transform<TRow>(row: TRow, hasActions: IRtTable.RowActionsPredicate<TRow> | null): boolean {
        return rowHasAvailableActions(row, hasActions);
    }
}
