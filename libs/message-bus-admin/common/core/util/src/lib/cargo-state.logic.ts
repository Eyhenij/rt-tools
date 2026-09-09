/**
 * Слова состояния записи груза.
 *
 * Живут в основании семейства, а не в разделе: состояние есть и у разбора происшествия, и у
 * предложения, и написанное дважды оно разошлось бы между двумя столбцами молча.
 *
 * Функция чистая и каркаса не знает: её зовут мапперы обоих разделов и спека — последней ни
 * `TestBed`, ни подмены не нужны.
 */
import { ECargoState } from '@rt/message-bus-common';

import { adminLabel } from './admin-labels';

/**
 * Состояние записи груза по-русски.
 *
 * Набор закрыт, и ветка на каждое его значение стоит здесь, а не в шаблоне: состояние приезжает
 * машинной строкой, и показанное как есть человек читает по-английски.
 */
export function cargoStateLabel(state: ECargoState): string {
    switch (state) {
        case ECargoState.InWork:
            return adminLabel('cargoStateInWork');
        case ECargoState.Fixed:
            return adminLabel('cargoStateFixed');
        case ECargoState.Released:
            return adminLabel('cargoStateReleased');
        case ECargoState.Quarantined:
            return adminLabel('cargoStateQuarantined');
        default:
            return adminLabel('cargoStateNew');
    }
}
