import { InjectionToken } from '@angular/core';

/**
 * Разрешение нижней шторки для всего поддерева или приложения. По умолчанию разрешена: панели выбора,
 * меню и отборы на узком экране открываются в шторке. `{ provide: RT_POPOVER_SHEET, useValue: false }`
 * оставляет их у триггера везде, где значение подставлено. Действует вместе со входом `sheet`
 * самого компонента: шторка нужна, когда её не отключили ни токеном, ни входом.
 */
export const RT_POPOVER_SHEET: InjectionToken<boolean> = new InjectionToken<boolean>('RT_POPOVER_SHEET', {
    providedIn: 'root',
    factory: (): boolean => true,
});
