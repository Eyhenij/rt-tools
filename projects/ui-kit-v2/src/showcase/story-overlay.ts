/**
 * Открытие оверлейной панели в витрине.
 *
 * Панель CDK Overlay появляется только по жесту: декларативного входа `open` нет ни у одного
 * оверлейного компонента кита, кроме `rt-bottom-sheet`. Поэтому её открывает `play`-функция —
 * она повторяет жест сразу после монтирования истории, и панель видна без движения мышью.
 *
 * **Раскрывающихся панелей в истории по одной.** Второй жест для CDK — это указатель за
 * пределами первой панели: щелчок мимо закрывает её (`outsidePointerEvents`), а у меню поверх
 * страницы ещё и лежит прозрачный backdrop, который этот щелчок съедает целиком. Поэтому оси
 * содержимого панели показываются не рядом стоящими панелями, а набором внутри одной: список с
 * выбранной, подсвеченной и отключённой опцией; меню со всеми видами пунктов.
 *
 * Исключение — подсказка: её панель не закрывается ни щелчком мимо, ни backdrop'ом, и несколько
 * подсказок держатся на экране разом. Для неё есть `openStoryOverlays`.
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
     * Имя события вместо щелчка — `mouseenter` для того, что раскрывается наведением. Щелчок там
     * не годится: подсказка по нему как раз прячется, чтобы не закрывать результат нажатия.
     */
    readonly event?: string;

    /**
     * Сколько ещё подождать после жеста, миллисекунды. Нужно тому, что появляется с задержкой:
     * подсказка ждёт 300 мс, гася мелькание при быстром проходе курсора по ряду кнопок.
     */
    readonly wait?: number;

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

/** Пауза для того, что появляется с задержкой. */
async function pause(ms: number): Promise<void> {
    await new Promise<void>((resolve: () => void): void => {
        setTimeout((): void => resolve(), ms);
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

/** Повторяет жест на одном отмеченном хосте. */
function fire(marked: HTMLElement, gesture: IStoryOverlayGesture): void {
    const trigger: HTMLElement = triggerOf(marked, gesture.within ?? '');
    trigger.focus();

    if (gesture.text !== undefined && trigger instanceof HTMLInputElement) {
        trigger.value = gesture.text;
        trigger.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (gesture.key !== undefined) {
        trigger.dispatchEvent(new KeyboardEvent('keydown', { key: gesture.key, bubbles: true }));
    } else if (gesture.event !== undefined) {
        trigger.dispatchEvent(new Event(gesture.event, { bubbles: true }));
    } else {
        trigger.click();
    }
}

/**
 * Повторяет жест на первом отмеченном хосте и ждёт, пока панель встанет на место.
 *
 * @param canvasElement — корень истории, его отдаёт `play`.
 * @param gesture — чем открывать: клавишей, набором текста, событием или щелчком (по умолчанию).
 */
export async function openStoryOverlay(canvasElement: HTMLElement, gesture: IStoryOverlayGesture = {}): Promise<void> {
    await settle();

    const marked: HTMLElement | null = canvasElement.querySelector<HTMLElement>(`[${STORY_TRIGGER_ATTRIBUTE}]`);
    if (marked !== null) {
        fire(marked, gesture);
    }

    await settle();
    if (gesture.wait !== undefined) {
        await pause(gesture.wait);
    }
}

/**
 * То же на **всех** отмеченных хостах сразу.
 *
 * Годится только там, где панель не закрывается от чужого жеста, — то есть подсказке: её
 * оверлей не слушает ни указателя снаружи, ни backdrop'а, и десяток подсказок держится на
 * экране разом. Списку или меню это дало бы ровно одну открытую панель — последнюю.
 */
export async function openStoryOverlays(canvasElement: HTMLElement, gesture: IStoryOverlayGesture = {}): Promise<void> {
    await settle();

    const marked: readonly HTMLElement[] = Array.from(canvasElement.querySelectorAll<HTMLElement>(`[${STORY_TRIGGER_ATTRIBUTE}]`));
    for (const host of marked) {
        fire(host, gesture);
    }

    await settle();
    if (gesture.wait !== undefined) {
        await pause(gesture.wait);
    }
}
