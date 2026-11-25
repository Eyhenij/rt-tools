/** Что несёт событие правки поля кита: значение после правки и значение до неё. */
export interface IRtControlChange {
    readonly value: unknown;
    readonly previous: unknown;
}

/**
 * Поле кита сообщает о правке человека всплывающим событием `change` со своего тега, как поле ввода
 * браузера. У выпадающего списка, поля даты, флажка, переключателя и радиокнопки поля ввода нет, и
 * без события тот, кто слушает правки формы по событиям, — панель отборов полосы, — их не видел.
 * Событие несёт значения до и после правки: по ним слушатель отличает правку от возврата назад.
 */
export function rtAnnounceChange(host: HTMLElement, value: unknown, previous: unknown): void {
    host.dispatchEvent(new CustomEvent<IRtControlChange>('change', { bubbles: true, detail: { value, previous } }));
}

/** Правка поля кита: событие `change`, пришедшее с тега поля, а не от поля ввода браузера. */
export function rtControlChangeOf(event: Event): IRtControlChange | null {
    const detail: unknown = event instanceof CustomEvent ? event.detail : null;
    if (typeof detail !== 'object' || detail === null) {
        return null;
    }

    return 'value' in detail && 'previous' in detail ? detail : null;
}
