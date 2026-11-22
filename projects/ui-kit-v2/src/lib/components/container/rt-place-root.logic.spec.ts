import { join } from 'node:path';

import * as sass from 'sass';

import { RT_PLACE_ROOT_CLASS, rtMarkPlaceRoot } from './rt-place-root.logic';

function container(): HTMLElement {
    const element: HTMLElement = document.createElement('div');
    element.className = 'rt-container';
    document.body.append(element);
    return element;
}

function rootMarked(): boolean {
    return document.documentElement.classList.contains(RT_PLACE_ROOT_CLASS);
}

describe('rtMarkPlaceRoot', (): void => {
    afterEach((): void => {
        document.body.innerHTML = '';
        document.documentElement.classList.remove(RT_PLACE_ROOT_CLASS);
    });

    it('SC-UKV-1635 — класс места стоит на корне, пока на странице есть контейнер', (): void => {
        const first: HTMLElement = container();
        const releaseFirst: () => void = rtMarkPlaceRoot(first);
        expect(rootMarked()).toBe(true);

        const second: HTMLElement = container();
        const releaseSecond: () => void = rtMarkPlaceRoot(second);

        releaseFirst();
        first.remove();
        expect(rootMarked()).toBe(true);

        releaseSecond();
        second.remove();
        expect(rootMarked()).toBe(false);
    });

    it('SC-UKV-1635 — снятие единственного контейнера убирает класс, пока узел ещё в разметке', (): void => {
        const release: () => void = rtMarkPlaceRoot(container());

        release();

        expect(rootMarked()).toBe(false);
    });

    it('SC-UKV-1635 — запасной порог по окну спрашивает класс корня, а не `:has()`', (): void => {
        const css: string = sass.compileString(
            "@use 'breakpoints' as bp; .rt-x { @include bp.place-max(480px) { color: red; } @include bp.place-min(480px) { color: blue; } }",
            { loadPaths: [join(__dirname, '../../../styles')] }
        ).css;

        expect(css).toContain(`:where(html:not(.${RT_PLACE_ROOT_CLASS})) .rt-x`);
        expect(css).toContain('@container rt-place');
        expect(css).not.toContain(':has(');
    });
});
