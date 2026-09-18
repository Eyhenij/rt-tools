/**
 * Слова состояния записи груза.
 *
 * Живут в основании семейства, а не в разделе: состояние есть и у разбора происшествия, и у
 * предложения, и написанное дважды оно разошлось бы между двумя столбцами молча.
 *
 * Функция чистая и каркаса не знает: её зовут экраны обоих разделов, отбор по состоянию и спека —
 * последней ни `TestBed`, ни подмены не нужны.
 */
import { ECargoState } from '@rt/message-bus-common';

import { TAdminLabelKey } from './admin-labels';

/**
 * Каким ключом словаря названо состояние записи груза.
 *
 * Набор закрыт, и ветка на каждое его значение стоит здесь, а не в шаблоне: состояние приезжает
 * машинной строкой, и показанное как есть человек читает по-английски. Отдаётся ключ, а не текст:
 * текст, взятый здесь, приходит на языке той минуты и до перезагрузки остаётся прежним.
 */
export function cargoStateKey(state: ECargoState): TAdminLabelKey {
    switch (state) {
        case ECargoState.InWork:
            return 'cargoStateInWork';
        case ECargoState.Fixed:
            return 'cargoStateFixed';
        case ECargoState.Released:
            return 'cargoStateReleased';
        case ECargoState.Quarantined:
            return 'cargoStateQuarantined';
        default:
            return 'cargoStateNew';
    }
}
