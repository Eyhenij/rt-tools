import { TitleCasePipe } from '@angular/common';

import { BreakStringPipe } from '@rt-tools/core';

import { IRtDataTable } from '../data-table/rt-data-table.model';
import { IRtTable } from '../table/rt-table.model';

const breakString: BreakStringPipe = new BreakStringPipe();
const titleCase: TitleCasePipe = new TitleCasePipe();

/**
 * Колонки — в пункты готового редактора списка колонок кита. Подпись берётся так же, как её
 * берёт первый кит: имя для настроек, а без него — имя свойства, разбитое по словам и с
 * заглавных: `userIcon` → «User Icon».
 */
export function dataListSettingItems<ENTITY_TYPE>(columns: ReadonlyArray<IRtDataTable.Column<ENTITY_TYPE>>): IRtTable.ColumnSettingItem[] {
    return columns.map((column: IRtDataTable.Column<ENTITY_TYPE>): IRtTable.ColumnSettingItem => {
        const propName: string = String(column.propName);
        const isNamed: boolean = !!column.displayName?.length && column.displayName !== propName;

        return {
            key: propName,
            label: isNamed ? String(column.displayName) : titleCase.transform(breakString.transform(propName)),
            hidden: !!column.hidden,
        };
    });
}

/** Обратно: порядок и видимость из пунктов редактора — в описания колонок. */
export function dataListColumnsFromItems<ENTITY_TYPE>(
    columns: ReadonlyArray<IRtDataTable.Column<ENTITY_TYPE>>,
    items: ReadonlyArray<IRtTable.ColumnSettingItem>
): Array<IRtDataTable.Column<ENTITY_TYPE>> {
    const byKey: Map<string, IRtDataTable.Column<ENTITY_TYPE>> = new Map(
        columns.map((column: IRtDataTable.Column<ENTITY_TYPE>) => [String(column.propName), column])
    );

    return items.flatMap((item: IRtTable.ColumnSettingItem, index: number): Array<IRtDataTable.Column<ENTITY_TYPE>> => {
        const column: IRtDataTable.Column<ENTITY_TYPE> | undefined = byKey.get(item.key);

        return column ? [{ ...column, hidden: item.hidden, orderIndex: index }] : [];
    });
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

/**
 * Колонка перетащена на новое место — новый порядок пунктов. Индексы — по всему списку, как их
 * отдаёт перетаскивание; место, совпавшее со старым, возвращает тот же список.
 */
export function dataListMoveItem(
    items: ReadonlyArray<IRtTable.ColumnSettingItem>,
    from: number,
    to: number
): ReadonlyArray<IRtTable.ColumnSettingItem> {
    if (from === to || !items[from]) {
        return items;
    }
    const next: IRtTable.ColumnSettingItem[] = [...items];
    const moved: IRtTable.ColumnSettingItem = next.splice(from, 1)[0];

    next.splice(Math.min(Math.max(to, 0), next.length), 0, moved);

    return next;
}

/** Видимость колонки переключена кнопкой-глазом. Закреплённую колонку кнопка не трогает. */
export function dataListToggleHidden(
    items: ReadonlyArray<IRtTable.ColumnSettingItem>,
    key: string
): ReadonlyArray<IRtTable.ColumnSettingItem> {
    return items.map((item: IRtTable.ColumnSettingItem) =>
        item.key === key && item.locked !== true ? { ...item, hidden: !item.hidden } : item
    );
}
