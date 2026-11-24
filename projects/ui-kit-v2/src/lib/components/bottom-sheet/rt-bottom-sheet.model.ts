/**
 * Что получает свой шаблон шапки или подвала шторки: просьбу закрыть и просьбу применить. Первую
 * зовёт своя кнопка закрытия; шторка с неприменённым выбором на неё сначала спрашивает, как и на
 * свою кнопку «×». Вторую зовёт своя кнопка действия: наружу уходит то же событие, что по ответу
 * «Применить», и шторка остаётся открытой, пока хозяин её не закроет.
 */
export interface IRtSheetTemplateContext {
    readonly $implicit: () => void;
    readonly close: () => void;
    readonly apply: () => void;
}

/**
 * Слова вопроса перед закрытием, когда у шторки свой вопрос, а не про неприменённый выбор: заголовок,
 * пояснение и три ответа в порядке шторки — согласие первым, затем отказ, затем «остаться».
 */
export interface IRtSheetConfirmLabels {
    readonly title: string;
    readonly message: string;
    readonly apply: string;
    readonly discard: string;
    readonly stay: string;
}
