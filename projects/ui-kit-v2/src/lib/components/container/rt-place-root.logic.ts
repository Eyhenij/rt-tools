/**
 * Класс на корне документа, пока на странице стоит контейнер — место страницы. Запасной порог
 * по окну в стилях кита стоит под `html:not(.rt-has-place)`. Условие `:has()` от корня
 * заставляло браузер пересчитывать стили всего документа на любую правку страницы.
 */
export const RT_PLACE_ROOT_CLASS: string = 'rt-has-place';

const CONTAINER_SELECTOR: string = '.rt-container';

/**
 * Ставит класс места на корень документа и возвращает снятие. Снятие убирает класс, только
 * когда на странице не осталось другого контейнера.
 */
export function rtMarkPlaceRoot(host: HTMLElement): () => void {
    const doc: Document = host.ownerDocument;
    doc.documentElement.classList.add(RT_PLACE_ROOT_CLASS);

    return (): void => {
        const containers: Element[] = Array.from(doc.querySelectorAll(CONTAINER_SELECTOR));
        if (containers.some((node: Element): boolean => node !== host)) {
            return;
        }
        doc.documentElement.classList.remove(RT_PLACE_ROOT_CLASS);
    };
}
