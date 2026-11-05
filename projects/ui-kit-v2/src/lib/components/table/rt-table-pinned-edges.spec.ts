import { hiddenEdges, horizontalScrollParentOf, IRtTablePinnedEdges, RtTablePinnedEdges } from './rt-table-pinned-edges';

describe('rt-table-pinned-edges', (): void => {
    describe('hiddenEdges', (): void => {
        it('SC-UKV-1117 — в начале прокрутки под левым закреплением ничего нет, после сдвига есть', (): void => {
            expect(hiddenEdges(0, 560, 375).start).toBe(false);
            expect(hiddenEdges(120, 560, 375).start).toBe(true);
        });

        it('SC-UKV-1118 — под правым закреплением скрыто содержимое, пока прокрутка не дошла до конца', (): void => {
            expect(hiddenEdges(0, 560, 375).end).toBe(true);
            expect(hiddenEdges(185, 560, 375).end).toBe(false);
        });

        it('SC-UKV-1119 — таблица помещается: скрытых краёв нет', (): void => {
            expect(hiddenEdges(0, 375, 375)).toEqual({ start: false, end: false });
        });

        it('SC-UKV-1118 — дробный остаток прокрутки у края не держит тень', (): void => {
            expect(hiddenEdges(184.5, 560, 375)).toEqual({ start: true, end: false });
            expect(hiddenEdges(0.5, 560, 375).start).toBe(false);
        });

        it('SC-UKV-1117 — при письме справа налево сдвиг отрицательный и считается по величине', (): void => {
            expect(hiddenEdges(-120, 560, 375)).toEqual({ start: true, end: true });
        });
    });

    describe('horizontalScrollParentOf', (): void => {
        it('SC-UKV-1117 — находит ближайшего предка с прокруткой вбок и пропускает остальных', (): void => {
            const outer: HTMLElement = document.createElement('div');
            outer.style.overflowX = 'auto';
            const plain: HTMLElement = document.createElement('div');
            const table: HTMLElement = document.createElement('table');
            plain.appendChild(table);
            outer.appendChild(plain);
            document.body.appendChild(outer);

            expect(horizontalScrollParentOf(table, window)).toBe(outer);

            outer.remove();
        });

        it('SC-UKV-1119 — без прокручиваемого предка контейнера нет', (): void => {
            const table: HTMLElement = document.createElement('table');
            document.body.appendChild(table);

            expect(horizontalScrollParentOf(table, window)).toBeNull();

            table.remove();
        });
    });

    describe('RtTablePinnedEdges', (): void => {
        it('SC-UKV-1117 — сообщает края сразу и после прокрутки контейнера, а после остановки молчит', (): void => {
            const container: HTMLElement = document.createElement('div');
            container.style.overflowX = 'auto';
            const table: HTMLElement = document.createElement('table');
            container.appendChild(table);
            document.body.appendChild(container);
            Object.defineProperty(container, 'scrollWidth', { value: 560 });
            Object.defineProperty(container, 'clientWidth', { value: 375 });
            const seen: IRtTablePinnedEdges[] = [];
            const edges: RtTablePinnedEdges = new RtTablePinnedEdges((next: IRtTablePinnedEdges): void => {
                seen.push(next);
            });

            edges.watch(table, window);
            container.scrollLeft = 120;
            container.dispatchEvent(new Event('scroll'));
            edges.stop();
            container.dispatchEvent(new Event('scroll'));

            expect(seen).toEqual([
                { start: false, end: true },
                { start: true, end: true },
            ]);

            container.remove();
        });
    });
});
