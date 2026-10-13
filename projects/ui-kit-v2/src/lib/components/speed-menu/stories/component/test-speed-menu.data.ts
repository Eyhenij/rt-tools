import { IRtSpeedMenu } from '../../rt-speed-menu.model';

/** Меню масштаба, как у приложения: значки — имена Material, кит переводит их парами. */
export const SPEED_MENU_ZOOM: readonly IRtSpeedMenu.Action[] = [
    { value: 'zoom-in', icon: 'add', label: 'Приблизить' },
    { value: 'zoom-out', icon: 'remove', label: 'Отдалить' },
    { value: 'reset', icon: 'undo', label: 'Сбросить масштаб' },
];

/** То же меню с недоступным действием посередине. */
export const SPEED_MENU_ZOOM_UNAVAILABLE: readonly IRtSpeedMenu.Action[] = [
    { value: 'zoom-in', icon: 'add', label: 'Приблизить' },
    { value: 'zoom-out', icon: 'remove', label: 'Отдалить', disabled: true },
    { value: 'reset', icon: 'undo', label: 'Сбросить масштаб' },
];
