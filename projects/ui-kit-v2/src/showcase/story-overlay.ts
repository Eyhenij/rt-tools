/**
 * Открытие оверлейной панели в витрине.
 *
 * Панель CDK Overlay появляется только по жесту: декларативного входа `open` нет ни у одного
 * оверлейного компонента кита, кроме `rt-bottom-sheet`. Поэтому её открывает `play`-функция —
 * она повторяет жест сразу после монтирования истории, и панель видна без движения мышью.
 *
 * **Открытая панель в истории ровно одна.** Второй жест для CDK — это указатель за пределами
 * первой панели: щелчок мимо закрывает её (`outsidePointerEvents`), а у меню поверх страницы
 * ещё и лежит прозрачный backdrop, который этот щелчок съедает целиком. Поэтому оси содержимого
 * панели показываются не рядом стоящими панелями, а набором внутри одной: список с выбранной,
 * подсвеченной и отключённой опцией; меню со всеми видами пунктов.
 *
 * Обвязка витрины: `tsconfig.lib.json` исключает `src/showcase/**`, в пакет не уезжает.
 */

/** Признак, по которому `play`-функция находит хост, чей оверлей надо открыть. */
export const STORY_TRIGGER_ATTRIBUTE: string = 'data-story-trigger';

/** Чем открывается панель. Всё необязательно: без единого поля жест — обычный щелчок. */
export interface IStoryOverlayGesture {
    /**
     * Клавиша вместо щелчка. Списки открываются и тем и другим, но клавиша заодно подсвечивает
     * первую опцию (`aria-activedescendant`), а щелчок оставляет панель без подсветки:
     * состояние `--active` иначе в витрине не увидеть.
     */
    readonly key?: string;

    /**
     * Набранный текст. Панель поля с подсказками открывает не щелчок, а ввод: компонент считает
     * длину строки и только потом просит подсказки. Значение пишется прямо в поле и объявляется
     * событием `input` — тем же, что приходит от клавиатуры.
     */
    readonly text?: string;

    /**
     * Что именно внутри отмеченного хоста принимает жест. По умолчанию — первая кнопка внутри,
     * а если её нет, то сам хост. Задаётся там, где первая кнопка не триггер: у поля с
     * подсказками ею оказывается крестик очистки.
     */
    readonly within?: string;
}

/**
 * Ждёт, пока нарисованное встанет на место: Angular обновляет вью после микрозадачи, а CDK
 * ставит панель к триггеру в следующем кадре. Без ожидания жест не находит триггера, а сразу
 * после жеста панель ещё стоит в левом верхнем углу.
 */
async function settle(): Promise<void> {
    await new Promise<void>((resolve: () => void): void => {
        requestAnimationFrame((): void => resolve());
    });
    await new Promise<void>((resolve: () => void): void => {
        requestAnimationFrame((): void => resolve());
    });
}

/**
 * Настоящий триггер под признаком.
 *
 * Признак ставится снаружи, на хост компонента, — изнутри его шаблона отметить нечего. А жест
 * ждёт не хост: клавиши слушает `<button>` внутри (`rt-select`), щелчок — кнопка, которую рисует
 * вложенный компонент (`rt-menu`). Событие, посланное хосту, вниз не идёт, и панель не
 * открывалась бы вовсе. Кнопки внутри нет — триггером служит сам отмеченный элемент: так
 * навешиваются директивы подсказки и поповера.
 */
function triggerOf(marked: HTMLElement, within: string): HTMLElement {
    if (within !== '') {
        return marked.querySelector<HTMLElement>(within) ?? marked;
    }

    return marked instanceof HTMLButtonElement ? marked : (marked.querySelector<HTMLElement>('button') ?? marked);
}

/**
 * Повторяет жест, открывающий панель, и ждёт, пока та встанет на место.
 *
 * @param canvasElement — корень истории, его отдаёт `play`.
 * @param gesture — чем открывать: клавишей, набором текста или щелчком (по умолчанию).
 */
export async function openStoryOverlay(canvasElement: HTMLElement, gesture: IStoryOverlayGesture = {}): Promise<void> {
    await settle();

    const marked: HTMLElement | null = canvasElement.querySelector<HTMLElement>(`[${STORY_TRIGGER_ATTRIBUTE}]`);
    if (marked === null) {
        return;
    }

    const trigger: HTMLElement = triggerOf(marked, gesture.within ?? '');
    trigger.focus();

    if (gesture.text !== undefined && trigger instanceof HTMLInputElement) {
        trigger.value = gesture.text;
        trigger.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (gesture.key !== undefined) {
        trigger.dispatchEvent(new KeyboardEvent('keydown', { key: gesture.key, bubbles: true }));
    } else {
        trigger.click();
    }

    await settle();
}
