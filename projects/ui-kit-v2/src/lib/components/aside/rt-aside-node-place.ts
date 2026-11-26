/** Где стоял узел до переноса: туда он возвращается. */
interface IRtAsideNodeHome {
    readonly node: Node;
    readonly parent: ParentNode;
    readonly next: Node | null;
}

/**
 * Перенос узлов панели в шторку телефона и обратно. Проекция панели объявлена один раз и не стоит
 * под условием, поэтому шторка получает не копию разметки, а те же узлы: рамку, шапку, подвал,
 * содержимое колонки заголовка. Место `null` снимает узлы со страницы — так шторка без подвала не
 * рисует подвал панели. Вне шторки узлы возвращаются туда, где стояли, в прежнем порядке.
 */
export class RtAsideNodePlace {
    #homes: readonly IRtAsideNodeHome[] = [];
    #place: HTMLElement | null = null;
    #moved: boolean = false;

    /**
     * Ставит узлы в конец места; `null` снимает их со страницы. Узлы уже там — ничего не делает.
     * Узел, которого в списке больше нет, снят приложением — например, его `@if` погас: возвращать
     * его некуда, и он забывается.
     */
    public move(nodes: readonly Node[], place: HTMLElement | null): void {
        if (this.#moved && this.#place === place && this.#holds(nodes)) {
            return;
        }
        this.#homes = this.#homes.filter((home: IRtAsideNodeHome): boolean => nodes.includes(home.node));
        // Место сменилось: узлы сперва возвращаются домой, и дом каждого записывается заново.
        this.restore();
        const homes: IRtAsideNodeHome[] = [];
        for (const node of nodes) {
            const parent: ParentNode | null = node.parentNode;
            if (parent !== null) {
                homes.push({ node, parent, next: node.nextSibling });
            }
        }
        for (const { node } of homes) {
            if (place === null) {
                node.parentNode?.removeChild(node);
            } else {
                place.appendChild(node);
            }
        }
        this.#homes = homes;
        this.#place = place;
        this.#moved = true;
    }

    /** Возвращает узлы на их места. С конца: каждый узел встаёт перед соседом, который уже на месте. */
    public restore(): void {
        const homes: readonly IRtAsideNodeHome[] = this.#homes;
        this.#homes = [];
        this.#place = null;
        this.#moved = false;
        for (const home of [...homes].reverse()) {
            const next: Node | null = home.next !== null && home.next.parentNode === home.parent ? home.next : null;
            home.parent.insertBefore(home.node, next);
        }
    }

    /** Перенесены ровно эти узлы. */
    #holds(nodes: readonly Node[]): boolean {
        return (
            nodes.length === this.#homes.length && nodes.every((node: Node, index: number): boolean => this.#homes[index]?.node === node)
        );
    }
}
