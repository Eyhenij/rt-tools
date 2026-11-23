import { IRtToggleButtonGroup } from './rt-toggle-button-group.model';

/**
 * Свернуть ли группу в поле выбора. Сворачивается только строка: перенос и столбик помещаются
 * всегда. Место нулевой ширины значит, что группа ещё не разложена, и тогда она остаётся кнопками.
 * Полпикселя запаса гасят дробные ширины: без него группа, вставшая впритык, моргала бы.
 */
export function rtToggleGroupFolds(natural: number, place: number, layout: IRtToggleButtonGroup.Layout, fold: boolean): boolean {
    return fold && layout === 'row' && place > 0 && natural > place + 0.5;
}

/** Запас, с которого свёрнутая группа разворачивается обратно: место должно быть шире строки кнопок на столько. */
export const RT_TOGGLE_GROUP_UNFOLD_MARGIN_PX: number = 8;

/**
 * Свёрнута ли группа после очередного замера, с гистерезисом. Свёрнутая группа занимает всё место
 * (`width: 100%`), развёрнутая сжимается по содержимому (`min-width: 0`): у них разные базы во
 * флекс-строке, и после сворачивания места становится больше, чем было. Без запаса группа
 * разворачивалась бы тут же, сжималась и сворачивалась снова — каждый кадр. Поэтому свёрнутая группа
 * разворачивается, только когда место не меньше ширины строки, замеренной до сворачивания, плюс запас.
 *
 * @param naturalAtFold ширина строки кнопок в минуту сворачивания; `null` — группа не сворачивалась.
 */
export function rtToggleGroupNextFolded(
    natural: number,
    place: number,
    layout: IRtToggleButtonGroup.Layout,
    fold: boolean,
    folded: boolean,
    naturalAtFold: number | null
): boolean {
    if (!folded) {
        return rtToggleGroupFolds(natural, place, layout, fold);
    }
    if (!fold || layout !== 'row' || place <= 0) {
        return false;
    }
    return place < (naturalAtFold ?? natural) + RT_TOGGLE_GROUP_UNFOLD_MARGIN_PX;
}

/**
 * Размер свёрнутого поля по размеру группы: поле той же или ближайшей высоты, но не ниже
 * среднего. Группа `sm` в 30 px стоит в строке отборов, где поля по 40, и в макете она
 * сворачивается в поле `md`; `md` и `lg` сохраняют свою высоту.
 */
export function rtToggleGroupFoldedSize(size: IRtToggleButtonGroup.Size): IRtToggleButtonGroup.Size {
    return size === 'sm' ? 'md' : size;
}
