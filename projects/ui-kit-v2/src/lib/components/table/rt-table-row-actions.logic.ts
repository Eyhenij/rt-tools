import { IRtTable } from './rt-table.model';

/**
 * Есть ли у строки хотя бы одно доступное действие.
 *
 * Признак приходит предикатом от экрана, а не подсчётом отрисованных пунктов меню:
 * содержимое спроецированного шаблона известно только после отрисовки, и кнопка
 * успевала бы мигнуть на первом кадре.
 *
 * Предикат не задан — у строки есть действия: экран, который ничего не гейтит,
 * показывает кнопку меню, как и раньше.
 */
export function rowHasAvailableActions<TRow>(row: TRow, hasActions: IRtTable.RowActionsPredicate<TRow> | null): boolean {
    return hasActions === null ? true : hasActions(row);
}
