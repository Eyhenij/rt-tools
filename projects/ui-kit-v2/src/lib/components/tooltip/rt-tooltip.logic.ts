/** Размеры узла, по которым судят об обрезке: видимая ширина и ширина содержимого. */
export interface IRtTooltipBox {
    readonly clientWidth: number;
    readonly scrollWidth: number;
}

/**
 * Текст узла обрезан: содержимое шире видимой коробки. Высота не судится — узел с видимым
 * переполнением по высоте показывает всё, и его подсказка только повторяла бы текст.
 */
export function isTooltipTextCut(box: IRtTooltipBox): boolean {
    return box.scrollWidth > box.clientWidth;
}
