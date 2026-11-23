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
