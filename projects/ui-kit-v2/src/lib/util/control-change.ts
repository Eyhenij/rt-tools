/** Что несёт событие правки поля кита: значение после правки и значение до неё. */
export interface IRtControlChange {
    readonly value: unknown;
    readonly previous: unknown;
}

/** Нынешние значения полей кита по их тегам: значение читается у самого поля, без событий. */
const CONTROL_VALUES: WeakMap<Element, () => unknown> = new WeakMap<Element, () => unknown>();

/** Поля ввода браузера, чьи значения читаются по узлу. */
const NATIVE_FIELDS: string = 'input, select, textarea';

function nativeValue(field: Element): string {
    if (field instanceof HTMLInputElement && (field.type === 'checkbox' || field.type === 'radio')) {
        return String(field.checked);
    }

    return field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement
        ? field.value
        : '';
}

function sameValue(left: unknown, right: unknown): boolean {
    if (Object.is(left, right)) {
        return true;
    }
    try {
        return JSON.stringify(left) === JSON.stringify(right);
    } catch {
        return false;
    }
}

/** Значения полей под узлом; поле кита читается целиком, поля ввода внутри него не читаются. */
function collectValues(node: Element, values: unknown[]): void {
    for (const child of Array.from(node.children)) {
        const read: (() => unknown) | undefined = CONTROL_VALUES.get(child);
        if (read !== undefined) {
            values.push(read());
            continue;
        }
        if (child.matches(NATIVE_FIELDS)) {
            values.push(nativeValue(child));
        }
        collectValues(child, values);
    }
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

/**
 * Поле кита отдаёт своё нынешнее значение по своему тегу: его читает `rtFieldValues`. Значение,
 * записанное кодом, читается так же, как правка человека.
 */
export function rtRegisterControlValue(host: Element, read: () => unknown): void {
    CONTROL_VALUES.set(host, read);
}

/**
 * Значения полей под узлом в порядке разметки: у поля ввода браузера — отметка флажка или текст
 * значения, у поля кита — его значение. Два набора сравнивает `rtSameFieldValues`: так форма
 * отличает правку от возврата к значению при открытии.
 */
export function rtFieldValues(root: Element): unknown[] {
    const values: unknown[] = [];
    collectValues(root, values);

    return values;
}

/** Наборы значений полей равны: у списков и диапазонов дат сравнивается содержимое, а не ссылка. */
export function rtSameFieldValues(left: readonly unknown[], right: readonly unknown[]): boolean {
    return left.length === right.length && left.every((value: unknown, at: number): boolean => sameValue(value, right[at]));
}
