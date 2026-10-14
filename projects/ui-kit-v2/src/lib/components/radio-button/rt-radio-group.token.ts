import { InjectionToken } from '@angular/core';

/**
 * Что группа знает о радиокнопке. Отдельным описанием, а не классом радиокнопки: радиокнопка
 * импортирует токен, и прямой импорт в обе стороны замкнул бы файлы в круг.
 */
export interface IRtRadioGroupMember {
    /** Узел радиокнопки: по нему группа ставит радиокнопки в порядок страницы. */
    readonly element: HTMLElement;
    readonly selected: () => boolean;
    readonly off: () => boolean;
    readonly setTabStop: (on: boolean) => void;
    readonly contains: (target: EventTarget | null) => boolean;
    readonly selectFromKeyboard: () => void;
}

/**
 * Что радиокнопка сообщает группе, в которой стоит. Радиокнопка встаёт в группу сама, через
 * внедрение: так в группу попадает и радиокнопка из шаблона обёртки потребителя, до которой запрос
 * по содержимому не дотянулся бы.
 */
export interface IRtRadioGroupHost {
    /** Ориентация группы. */
    readonly orientation: () => string;
    readonly register: (radio: IRtRadioGroupMember) => void;
    readonly unregister: (radio: IRtRadioGroupMember) => void;
}

export const RT_RADIO_GROUP: InjectionToken<IRtRadioGroupHost> = new InjectionToken<IRtRadioGroupHost>('RT_RADIO_GROUP');
