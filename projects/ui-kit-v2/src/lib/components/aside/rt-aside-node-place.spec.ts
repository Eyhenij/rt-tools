import { RtAsideNodePlace } from './rt-aside-node-place';

/** Рамка панели с узлами по порядку и место шторки, куда узлы переносятся. */
interface IStage {
    readonly frame: HTMLElement;
    readonly place: HTMLElement;
    readonly nodes: Record<string, HTMLElement>;
}

function stage(...names: string[]): IStage {
    const frame: HTMLElement = document.createElement('div');
    const place: HTMLElement = document.createElement('div');
    const nodes: Record<string, HTMLElement> = {};
    for (const name of names) {
        const node: HTMLElement = document.createElement('span');
        node.setAttribute('data-name', name);
        nodes[name] = node;
        frame.appendChild(node);
    }
    document.body.append(frame, place);

    return { frame, place, nodes };
}

function order(parent: HTMLElement): string[] {
    return Array.from(parent.children).map((child: Element): string => child.getAttribute('data-name') ?? '');
}

describe('Перенос узлов панели в шторку', (): void => {
    afterEach((): void => {
        document.body.innerHTML = '';
    });

    it('SC-UKV-1811 — в шторке те же узлы встают в конец её места, в своём порядке', (): void => {
        const { frame, place, nodes }: IStage = stage('header', 'body', 'extra');
        place.appendChild(document.createElement('i'));

        new RtAsideNodePlace().move([nodes['header'], nodes['extra']], place);

        expect(order(frame)).toEqual(['body']);
        expect(order(place)).toEqual(['', 'header', 'extra']);
        expect(place.lastElementChild).toBe(nodes['extra']);
    });

    it('SC-UKV-1803 — вне шторки узлы возвращаются туда, где стояли, в прежнем порядке', (): void => {
        const { frame, place, nodes }: IStage = stage('header', 'extra', 'body', 'footer');
        const move: RtAsideNodePlace = new RtAsideNodePlace();

        move.move([nodes['header'], nodes['extra']], place);
        move.restore();

        expect(order(frame)).toEqual(['header', 'extra', 'body', 'footer']);
        expect(place.children).toHaveLength(0);
    });

    it('SC-UKV-1835 — место `null` снимает узел со страницы, возврат ставит его обратно', (): void => {
        const { frame, nodes }: IStage = stage('body', 'footer');
        const move: RtAsideNodePlace = new RtAsideNodePlace();

        move.move([nodes['footer']], null);

        expect(nodes['footer']?.isConnected).toBe(false);
        expect(order(frame)).toEqual(['body']);

        move.restore();

        expect(order(frame)).toEqual(['body', 'footer']);
    });

    it('SC-UKV-1810 — подвал, снятый без кнопок, встаёт в подвал шторки, когда кнопка появилась', (): void => {
        const { frame, place, nodes }: IStage = stage('body', 'footer');
        const move: RtAsideNodePlace = new RtAsideNodePlace();

        move.move([nodes['footer']], null);
        move.move([nodes['footer']], place);
        move.restore();

        expect(order(frame)).toEqual(['body', 'footer']);
        expect(place.children).toHaveLength(0);
    });

    it('SC-UKV-1811 — повторный перенос на то же место узлы не трогает', (): void => {
        const { place, nodes }: IStage = stage('header');
        const move: RtAsideNodePlace = new RtAsideNodePlace();
        const records: MutationRecord[] = [];
        const observer: MutationObserver = new MutationObserver((list: MutationRecord[]): number => records.push(...list));

        move.move([nodes['header']], place);
        observer.observe(document.body, { childList: true, subtree: true });
        move.move([nodes['header']], place);

        expect(observer.takeRecords().concat(records)).toHaveLength(0);
        observer.disconnect();
    });

    it('SC-UKV-1868 — узел, снятый приложением в шторке, не возвращается в рамку', (): void => {
        const { frame, place, nodes }: IStage = stage('header', 'body');
        const move: RtAsideNodePlace = new RtAsideNodePlace();

        move.move([nodes['header']], place);
        nodes['header']?.remove();
        move.move([], place);
        move.restore();

        expect(order(frame)).toEqual(['body']);
    });
});
