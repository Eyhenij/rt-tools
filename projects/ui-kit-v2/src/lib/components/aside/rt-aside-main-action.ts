/** Где стоял узел главной кнопки в подвале: туда он возвращается. */
interface IRtAsideMainActionHome {
    readonly node: HTMLElement;
    readonly parent: ParentNode;
    readonly next: Node | null;
}

/**
 * Главная кнопка подвала в шапке шторки. Сам узел кнопки — с её подписью, обработчиком, подсказкой
 * и запретом — переносится из подвала справа в шапку шторки: нажатие на неё делает то же, что
 * нажатие в подвале, потому что это та же кнопка. Вне шторки узел возвращается на прежнее место.
 */
export class RtAsideMainAction {
    #home: IRtAsideMainActionHome | null = null;

    /**
     * Ставит главную кнопку в место шапки. Нет места — шторки нет, и кнопка возвращается в подвал.
     * Место уже занято — кнопка там, и следующая кнопка того же слота остаётся в подвале.
     */
    public place(slot: HTMLElement | null, pick: () => HTMLElement | null): void {
        if (this.#home !== null && slot?.contains(this.#home.node) === true) {
            return;
        }
        // Место сменилось или пропало: кнопка сперва возвращается в подвал, и выбор идёт заново.
        this.restore();
        const node: HTMLElement | null = slot === null ? null : pick();
        if (slot === null || node === null || node.parentNode === null) {
            return;
        }
        this.#home = { node, parent: node.parentNode, next: node.nextSibling };
        slot.appendChild(node);
    }

    /** Возвращает кнопку в подвал, на её место в слоте. */
    public restore(): void {
        const home: IRtAsideMainActionHome | null = this.#home;
        this.#home = null;
        // Узел без родителя снят самим приложением — например, его `@if` погас: возвращать нечего.
        if (home === null || home.node.parentNode === null) {
            return;
        }
        const next: Node | null = home.next !== null && home.next.parentNode === home.parent ? home.next : null;
        home.parent.insertBefore(home.node, next);
    }
}
