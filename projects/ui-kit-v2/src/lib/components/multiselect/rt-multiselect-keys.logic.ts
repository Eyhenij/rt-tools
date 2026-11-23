import { RtOptionList, TRtOptionListAction } from '@rt-tools/ui-kit-v2/core';

/** Что открытый список мультиселекта делает по клавише сам: остальное ведёт подсветка списка. */
export interface IRtMultiselectKeyHandlers {
    /** Enter и пробел: отметить подсвеченную строку. */
    readonly choose: () => void;
    /** Escape: закрыть панель. */
    readonly close: () => void;
    /** Боковые стрелки: раскрыть или свернуть ветку дерева. */
    readonly side: (key: string) => void;
}

/**
 * Клавиша при открытом списке мультиселекта. Стрелки, Home и End двигают подсветку списка; выбор,
 * закрытие и боковые стрелки уходят полю. Клавиша, которую список не знает, остаётся браузеру.
 */
export function rtMultiselectOpenKey(event: KeyboardEvent, list: RtOptionList, handlers: IRtMultiselectKeyHandlers): void {
    const action: TRtOptionListAction = list.actionOf(event.key);
    if (action === 'none') {
        return;
    }
    event.preventDefault();
    switch (action) {
        case 'next':
            list.move(1);
            break;
        case 'previous':
            list.move(-1);
            break;
        case 'first':
            list.first();
            break;
        case 'last':
            list.last();
            break;
        case 'choose':
            handlers.choose();
            break;
        case 'close':
            // Escape закрывает один слой: панель. Без остановки событие всплывает до document,
            // и оверлей под панелью — боковая панель, окно — закрывается вместе с ней.
            event.stopPropagation();
            handlers.close();
            break;
        case 'side':
            handlers.side(event.key);
            break;
    }
}
