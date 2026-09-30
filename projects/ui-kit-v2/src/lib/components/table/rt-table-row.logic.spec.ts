import { cardRowOf, isFromInteractive } from './rt-table-row.logic';
import { hasRowsIn } from './rt-table-cards.logic';

function html(markup: string): HTMLElement {
    const root: HTMLElement = document.createElement('div');
    root.innerHTML = markup;
    return root;
}

describe('rt-table-row.logic', (): void => {
    describe('isFromInteractive', (): void => {
        it('кнопка, ссылка, поле и узлы с ролью кнопки или переключателя — своё действие', (): void => {
            const root: HTMLElement = html(
                '<button id="b"><span id="in-button">x</span></button><a id="a" href="#">x</a><input id="i" />' +
                    '<div role="button" id="rb"></div><div role="switch" id="rs"></div><span id="plain">x</span>'
            );
            const byId: (id: string) => Element | null = (id: string): Element | null => root.querySelector(`#${id}`);

            expect(['b', 'in-button', 'a', 'i', 'rb', 'rs'].map((id: string): boolean => isFromInteractive(byId(id)))).toEqual([
                true,
                true,
                true,
                true,
                true,
                true,
            ]);
            expect(isFromInteractive(byId('plain'))).toBe(false);
            expect(isFromInteractive(null)).toBe(false);
        });
    });

    describe('cardRowOf', (): void => {
        it('номер карточки — номер строки этой таблицы, строки вложенной таблицы не считаются', (): void => {
            const root: HTMLElement = html(
                '<rt-table id="outer"><div class="cdk-row" id="r0"><rt-table><div class="cdk-row" id="nested"></div></rt-table></div>' +
                    '<div class="cdk-row" id="r1"></div></rt-table>'
            );
            const host: Element = root.querySelector('#outer') as Element;

            expect(cardRowOf(host, 0)?.id).toBe('r0');
            expect(cardRowOf(host, 1)?.id).toBe('r1');
            expect(cardRowOf(host, 2)).toBeNull();
        });
    });

    describe('hasRowsIn', (): void => {
        it('про массив отвечает точно, про поток и свой объект — «есть»', (): void => {
            expect(hasRowsIn([])).toBe(false);
            expect(hasRowsIn([{ id: 1 }])).toBe(true);
            expect(hasRowsIn({ connect: (): void => undefined })).toBe(true);
        });
    });
});
