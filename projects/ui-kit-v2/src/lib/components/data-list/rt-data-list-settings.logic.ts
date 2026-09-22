import { IRtDataTable } from '../data-table/rt-data-table.model';
import { IRtTable } from '../table/rt-table.model';

/**
 * Колонки — в пункты готового редактора списка колонок кита. Подпись берётся так же, как её
 * берёт первый кит: имя для настроек, а без него — имя свойства.
 */
export function dataListSettingItems<ENTITY_TYPE>(columns: ReadonlyArray<IRtDataTable.Column<ENTITY_TYPE>>): IRtTable.ColumnSettingItem[] {
    return columns.map((column: IRtDataTable.Column<ENTITY_TYPE>) => ({
        key: String(column.propName),
        label: column.displayName ?? String(column.propName),
        hidden: !!column.hidden,
    }));
}

/** Обратно: порядок и видимость из пунктов редактора — в описания колонок. */
export function dataListColumnsFromItems<ENTITY_TYPE>(
    columns: ReadonlyArray<IRtDataTable.Column<ENTITY_TYPE>>,
    items: ReadonlyArray<IRtTable.ColumnSettingItem>
): Array<IRtDataTable.Column<ENTITY_TYPE>> {
    const byKey: Map<string, IRtDataTable.Column<ENTITY_TYPE>> = new Map(
        columns.map((column: IRtDataTable.Column<ENTITY_TYPE>) => [String(column.propName), column])
    );

    return items
        .map((item: IRtTable.ColumnSettingItem, index: number) => {
            const column: IRtDataTable.Column<ENTITY_TYPE> | undefined = byKey.get(item.key);

            return column ? { ...column, hidden: item.hidden, orderIndex: index } : null;
        })
        .filter((column: IRtDataTable.Column<ENTITY_TYPE> | null): column is IRtDataTable.Column<ENTITY_TYPE> => column !== null);
}

/** Слепок настройки: порядок колонок, их видимость и два признака полос прокрутки. */
function dataListSettingsShape<ENTITY_TYPE>(config: IRtDataTable.Config.Data<ENTITY_TYPE>): string {
    return JSON.stringify([
        config.isVerticalScrollbarShown,
        config.isHorizontalScrollbarShown,
        config.columns.map((column: IRtDataTable.Column<ENTITY_TYPE>) => [String(column.propName), !!column.hidden]),
    ]);
}

/** В панели что-то изменилось: порядок колонок, их видимость или признаки полос прокрутки. */
export function dataListSettingsChanged<ENTITY_TYPE>(
    saved: IRtDataTable.Config.Data<ENTITY_TYPE>,
    current: IRtDataTable.Config.Data<ENTITY_TYPE>
): boolean {
    return dataListSettingsShape(saved) !== dataListSettingsShape(current);
}
