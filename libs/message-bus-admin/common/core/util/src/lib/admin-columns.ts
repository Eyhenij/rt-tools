/**
 * Объявление столбцов таблицы раздела: подпись стоит ключом словаря, а не готовым текстом.
 *
 * Объявление читают трое — таблица, панель настройки столбцов и экран, — и живёт оно постоянной
 * в файле раздела: текст, взятый там, приходит на языке той минуты, когда файл загрузился, и на
 * нём же остаётся до перезагрузки страницы. Ключ такого срока не имеет: по нему словарь
 * спрашивают на каждой отрисовке.
 */
import { computed, inject, Signal } from '@angular/core';
import { IRtTable } from '@rt-tools/ui-kit-v2';

import { TAdminLabelKey } from './admin-labels';
import { AdminTextService } from './admin-text.service';

/** Столбец, названный ключом. Всё остальное о нём то же, что знает о столбце кит. */
export interface IAdminColumn extends Omit<IRtTable.ColumnConfig, 'label'> {
    readonly label: TAdminLabelKey;
}

/**
 * Столбцы раздела с подписями на выбранном языке.
 *
 * Зовётся в поле экрана: словарь она спрашивает у инжектора, и вне заведения компонента его
 * взять негде. Значение производное, и переключение языка меняет заголовки таблицы на месте.
 */
export function adminColumns(declared: readonly IAdminColumn[]): Signal<readonly IRtTable.ColumnConfig[]> {
    const text: AdminTextService = inject(AdminTextService);

    return computed((): readonly IRtTable.ColumnConfig[] =>
        declared.map((column: IAdminColumn): IRtTable.ColumnConfig => ({ ...column, label: text.text(column.label) }))
    );
}
