/**
 * Состояние переписки как слово запроса.
 *
 * Набор закрыт двумя словами, и третьего в коде не появляется раньше, чем в договорённости:
 * значение, которого не знает экран, показывается на нём машинной строкой. Сам набор объявлен
 * общей либой — той же, которой описана форма строки списка: свой набор на каждой стороне
 * разошёлся бы с другим молча.
 */
import { EChatTalkState } from '@rt/message-bus-common';

/** Слова набора: по ним разбирается и отбор списка, и смена состояния. */
const STATES: readonly string[] = [EChatTalkState.Live, EChatTalkState.Closed];

/** Состояние из строки запроса. Пусто — слово не из набора или его не прислали вовсе. */
export function chatStateOf(value: unknown): EChatTalkState | null {
    if (typeof value !== 'string') {
        return null;
    }

    const said: string = value.trim();

    return STATES.includes(said) ? (said as EChatTalkState) : null;
}
