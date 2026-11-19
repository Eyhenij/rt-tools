import { IRtToggleButtonGroup } from './rt-toggle-button-group.model';

/**
 * Свернуть ли группу в поле выбора. Сворачивается только строка: перенос и столбик помещаются
 * всегда. Место нулевой ширины значит, что группа ещё не разложена, и тогда она остаётся кнопками.
 * Полпикселя запаса гасят дробные ширины: без него группа, вставшая впритык, моргала бы.
 */
export function rtToggleGroupFolds(natural: number, place: number, layout: IRtToggleButtonGroup.Layout, fold: boolean): boolean {
    return fold && layout === 'row' && place > 0 && natural > place + 0.5;
}
