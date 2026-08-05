/**
 * Модель `<rt-autocomplete>`: один корневой неймспейс с префиксом
 * `I`. Generic-параметр `TItem` — тип каждой подсказки и selected value.
 */
export namespace IRtAutocomplete {
    /**
     * Событие запроса подсказок. Подписчик использует `query` для server-side
     * фильтрации (HTTP-запрос → patchState suggestions); `originalEvent`
     * прокидывается для случаев, когда нужно отличить `input` от `focus`-trigger.
     */
    export interface CompleteEvent {
        query: string;
        originalEvent: Event;
    }
}
