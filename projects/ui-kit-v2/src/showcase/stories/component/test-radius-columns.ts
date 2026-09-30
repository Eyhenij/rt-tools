import { TRtRadius } from '../../../lib/components/radius/rt-radius.model';

/** Столбец сетки: умолчание компонента или названный шаг. */
export type TRtRadiusColumn = TRtRadius | null;

/** Столбцы сетки: умолчание компонента и вся шкала шагов. */
export const RT_RADIUS_COLUMNS: readonly TRtRadiusColumn[] = [null, 'none', 'xs', 'sm', 'ms', 'md', 'lg', 'xl', '2xl', 'full'];

/** Подпись столбца: пустой шаг — это умолчание компонента. */
export function radiusColumnLabel(col: TRtRadiusColumn): string {
    return col ?? 'умолчание';
}
