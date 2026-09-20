/**
 * Состояние переписки как слово запроса.
 *
 * Набор закрыт двумя словами, и третьего в коде не появляется раньше, чем в договорённости:
 * значение, которого не знает экран, показывается на нём машинной строкой.
 */

/** Состояние переписки: жива она или закрыта оператором. */
export enum EChatConversationState {
    Live = 'live',
    Closed = 'closed',
}

/** Слова набора: по ним разбирается и отбор списка, и смена состояния. */
const STATES: readonly string[] = [EChatConversationState.Live, EChatConversationState.Closed];

/** Состояние из строки запроса. Пусто — слово не из набора или его не прислали вовсе. */
export function chatStateOf(value: unknown): EChatConversationState | null {
    if (typeof value !== 'string') {
        return null;
    }

    const said: string = value.trim();

    return STATES.includes(said) ? (said as EChatConversationState) : null;
}
