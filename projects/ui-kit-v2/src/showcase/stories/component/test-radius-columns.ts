import { TRtRadius } from '../../../lib/components/radius/rt-radius.model';

/** Столбец сетки: умолчание компонента или названный шаг. */
export type TRtRadiusColumn = TRtRadius | null;

/** Часть шкалы: десять столбцов не влезают в кадр, и сетка идёт тремя историями. */
export type TRtRadiusPart = 'small' | 'middle' | 'large';

/** Столбцы каждой части: умолчание компонента с малыми шагами, средние шаги, большие шаги. */
export const RT_RADIUS_PARTS: Readonly<Record<TRtRadiusPart, readonly TRtRadiusColumn[]>> = {
    small: [null, 'none', 'xs', 'sm'],
    middle: ['ms', 'md', 'lg'],
    large: ['xl', '2xl', 'full'],
};

/** Подпись столбца: пустой шаг — это умолчание компонента. */
export function radiusColumnLabel(col: TRtRadiusColumn): string {
    return col ?? 'умолчание';
}
