/**
 * Узлы, нажатие по которым — своё действие, а не открытие строки или карточки: кнопка, ссылка,
 * поле и узлы с ролью кнопки или переключателя.
 */
const INTERACTIVE_SELECTOR: string = "button, a, input, select, textarea, label, [role='button'], [role='switch']";

/**
 * Пришло ли событие из интерактивного узла внутри строки или карточки. Такое нажатие открытием
 * не считается — иначе вложенные действия спорили бы с переходом к записи.
 */
export function isFromInteractive(target: EventTarget | null): boolean {
    return target instanceof Element && target.closest(INTERACTIVE_SELECTOR) !== null;
}

/**
 * Строка таблицы, которую показывает карточка с этим номером. Карточки строятся из того же массива,
 * что и строки, и в том же порядке, поэтому номер карточки — номер строки. Строки вложенной
 * таблицы в счёт не идут: берутся только строки, чья ближайшая таблица — эта.
 */
export function cardRowOf(host: Element, index: number): HTMLElement | null {
    const rows: HTMLElement[] = Array.from(host.querySelectorAll<HTMLElement>('.cdk-row')).filter(
        (row: HTMLElement): boolean => row.parentElement?.closest('rt-table, table[rt-table]') === host
    );
    return rows[index] ?? null;
}
