import { RT_RADIUS_STEPS, TRtRadius } from '../../../lib/components/radius/rt-radius.model';

/** Столбцы сетки: умолчание компонента, затем каждый шаг шкалы. */
export const RT_RADIUS_COLUMNS: readonly TRtRadiusColumn[] = [null, ...RT_RADIUS_STEPS];

/** Столбец сетки: умолчание компонента или названный шаг. */
export type TRtRadiusColumn = TRtRadius | null;

/** Подпись столбца: пустой шаг — это умолчание компонента. */
export function radiusColumnLabel(col: TRtRadiusColumn): string {
    return col ?? 'умолчание';
}
