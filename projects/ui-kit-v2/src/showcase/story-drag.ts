/**
 * Перетаскивание файла над областью приёма — для витрины.
 *
 * Подсветку области рисует не вход, а признак, который компонент поднимает сам, поймав
 * перетаскивание. Ни контролом, ни ячейкой сетки до неё не добраться: приходится повторить
 * жест — послать `dragenter` с файлом внутри, как это делает браузер.
 *
 * Областей можно подсветить сколько угодно: оверлея CDK здесь нет, и одна область о другой
 * ничего не знает.
 *
 * Обвязка витрины: `tsconfig.lib.json` исключает `src/showcase/**`, в пакет не уезжает.
 */

/**
 * Признак, по которому `play`-функция находит область приёма файла.
 *
 * Свой, а не общий с признаком триггера перекрытия: по триггеру обвязка снимков требует
 * открытой панели CDK, а перетаскивание её не открывает вовсе — область подсвечивает саму себя.
 * Общий признак ронял бы каждую историю области приёма требованием панели, которой там нет.
 */
export const STORY_DRAG_ATTRIBUTE: string = 'data-story-drag';

/**
 * Ждёт кадр: Angular обновляет вью после микрозадачи, а подсветка появляется уже от события.
 */
async function settle(): Promise<void> {
    await new Promise<void>((resolve: () => void): void => {
        requestAnimationFrame((): void => resolve());
    });
}

/**
 * Начинает перетаскивание файла над каждой отмеченной областью.
 *
 * Событие несёт настоящий `File`: область проверяет, что тащат именно файл, — по перечню типов
 * переноса, а он появляется только когда файл в переносе есть. Пустое событие она пропустит,
 * и подсветки не будет.
 *
 * @param canvasElement — корень истории, его отдаёт `play`.
 * @param ratio — доля высоты области, на которой «висит» курсор. Ею выбирается активная зона в
 *   многозонном режиме: зоны — стопка равных полос, и зона считается от координаты курсора.
 */
export async function startStoryFileDrag(canvasElement: HTMLElement, ratio: number = 0.5): Promise<void> {
    await settle();

    const areas: readonly HTMLElement[] = Array.from(canvasElement.querySelectorAll<HTMLElement>(`[${STORY_DRAG_ATTRIBUTE}]`));

    for (const area of areas) {
        const transfer: DataTransfer = new DataTransfer();
        transfer.items.add(new File(['демонстрация'], 'договор.pdf', { type: 'application/pdf' }));

        const box: DOMRect = area.getBoundingClientRect();
        area.dispatchEvent(
            new DragEvent('dragenter', {
                bubbles: true,
                cancelable: true,
                dataTransfer: transfer,
                clientX: box.left + box.width / 2,
                clientY: box.top + box.height * ratio,
            })
        );
    }

    await settle();
}
