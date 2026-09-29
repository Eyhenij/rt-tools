import { InjectionToken } from '@angular/core';

/** Один шаг шкалы скругления. Значения шагов лежат в токенах `--rt-radius-<шаг>`. */
export type TRtRadius = 'none' | 'xs' | 'sm' | 'ms' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

/** Шаги скругления кита — вся шкала, от квадрата до полного круга, по порядку. */
export const RT_RADIUS_STEPS: readonly TRtRadius[] = ['none', 'xs', 'sm', 'ms', 'md', 'lg', 'xl', '2xl', 'full'];

/**
 * Шаг, который компонент берёт, когда вход скругления пуст.
 *
 * Большинству компонентов он не нужен: их скругление по умолчанию стоит в их
 * собственных стилях. Токен нужен тому, у кого умолчание задаёт приложение, —
 * кнопке, чья настройка кита называет шаг для всех кнопок сразу.
 */
export const RT_RADIUS_DEFAULT: InjectionToken<TRtRadius | null> = new InjectionToken<TRtRadius | null>('RT_RADIUS_DEFAULT');
