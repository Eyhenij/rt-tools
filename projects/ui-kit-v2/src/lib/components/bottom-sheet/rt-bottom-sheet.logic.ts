export const DRAG_DISMISS_THRESHOLD_PX: number = 80;

export function clampDragDelta(deltaY: number): number {
    return Math.max(0, deltaY);
}

export function shouldDismissDrag(deltaY: number): boolean {
    return deltaY > DRAG_DISMISS_THRESHOLD_PX;
}

/** Виды `<input>`, в которые не печатают: фокус в них клавиатуру телефона не открывает. */
const NOT_TYPED_INPUT_TYPES: ReadonlySet<string> = new Set<string>([
    'button',
    'checkbox',
    'color',
    'file',
    'hidden',
    'image',
    'radio',
    'range',
    'reset',
    'submit',
]);

/**
 * В узел печатают: поле ввода текста, многострочное поле или редактируемый узел. Фокус в таком узле
 * на телефоне открывает клавиатуру, и шторка на это время встаёт во всю высоту.
 */
export function isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
        return false;
    }
    if (target instanceof HTMLInputElement) {
        return !NOT_TYPED_INPUT_TYPES.has(target.type) && !target.readOnly;
    }

    // Сравнение со значением, а не само свойство: там, где редактируемость узла не считается, оно пустое.
    return target instanceof HTMLTextAreaElement || target.isContentEditable === true;
}

/** Узел умеет брать фокус. По свойству, а не по классу: на сервере класса узла страницы нет. */
function canFocus(node: Element): node is HTMLElement {
    return typeof Reflect.get(node, 'focus') === 'function';
}

/** Узел в фокусе, если его можно вернуть в фокус; страница без фокуса и сам `body` — не узел. */
function focusedNode(doc: Document): HTMLElement | null {
    const active: Element | null = doc.activeElement;

    return active !== null && active !== doc.body && canFocus(active) ? active : null;
}

/** Узел в фокусе вне шторки: с него шторку открыли, ему фокус и вернётся. */
export function outerFocus(doc: Document, host: HTMLElement): HTMLElement | null {
    const active: HTMLElement | null = focusedNode(doc);

    return active !== null && !host.contains(active) ? active : null;
}

/** Узел в фокусе внутри шторки: с него шторку просили закрыть. */
export function innerFocus(doc: Document, host: HTMLElement): HTMLElement | null {
    const active: HTMLElement | null = focusedNode(doc);

    return active !== null && host.contains(active) ? active : null;
}

/** Фокус остался в шторке или упал с неё на страницу. Фокус, который уже увели в другое место, не трогают. */
export function focusLeftBehind(doc: Document, host: HTMLElement): boolean {
    const active: Element | null = doc.activeElement;

    return active === null || active === doc.body || host.contains(active);
}
