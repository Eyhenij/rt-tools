/**
 * Строки груза с текстом состояния.
 *
 * Маппер кладёт в строку само состояние, а не слово о нём: перевод идёт один раз на ответ
 * приёмника, и текст, взятый там, остаётся на прежнем языке до перезагрузки страницы. Слово
 * собирается здесь — производным от выбора языка, на каждой отрисовке.
 *
 * Одна на оба раздела груза: разборы происшествий и предложения показывают одно и то же состояние
 * одним и тем же столбцом, и собранное порознь оно разошлось бы молча.
 */
import { computed, inject, Signal } from '@angular/core';
import { ECargoState } from '@rt/message-bus-common';

import { AdminTextService } from './admin-text.service';
import { cargoStateKey } from './cargo-state.logic';

/** Строка, в которой состояние лежит значением набора: из него и берётся слово. */
export interface IAdminStatedRow {
    readonly state: ECargoState;
}

/** Что помощница добавляет к строке: состояние словом на выбранном языке. */
export interface IAdminStateWord {
    readonly stateLabel: string;
}

/**
 * Строки раздела со словом состояния.
 *
 * Зовётся в поле экрана: словарь она спрашивает у инжектора, и вне заведения компонента его взять
 * негде. Значение производное — переключение языка меняет столбец состояния на месте.
 */
export function adminStatedRows<TRow extends IAdminStatedRow>(rows: Signal<readonly TRow[]>): Signal<readonly (TRow & IAdminStateWord)[]> {
    const text: AdminTextService = inject(AdminTextService);

    return computed((): readonly (TRow & IAdminStateWord)[] =>
        rows().map((row: TRow): TRow & IAdminStateWord => ({ ...row, stateLabel: text.text(cargoStateKey(row.state)) }))
    );
}
