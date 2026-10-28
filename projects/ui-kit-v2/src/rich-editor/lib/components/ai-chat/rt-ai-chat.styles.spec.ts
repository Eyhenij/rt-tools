import { join } from 'node:path';

import * as sass from 'sass';

/**
 * Остановка прокрутки на краю объявлена стилем, и спросить о ней можно только собранный CSS.
 *
 * Без неё свайп с края ленты или списка бесед уходит странице под чатом. На телефоне чат стоит
 * поверх страницы, и она едет под ним.
 */

const CHAT: string = join(__dirname, 'rt-ai-chat.component.scss');
const THREADS: string = join(__dirname, '../../../../lib/components/thread-list/rt-thread-list.component.scss');

/** Тело правила с таким селектором, без вложенных в него правил. */
function ruleBody(css: string, selector: string): string {
    const at: number = css.indexOf(`${selector} {`);
    if (at < 0) {
        return '';
    }

    const opened: number = css.indexOf('{', at);

    return css.slice(opened + 1, css.indexOf('}', opened));
}

describe('стили прокрутки чата', (): void => {
    it('SC-UKV-1054 —лента держит прокрутку у себя на краю', (): void => {
        const body: string = ruleBody(sass.compile(CHAT).css, '.rt-ai-chat__feed');

        expect(body).toContain('overflow-y: auto');
        expect(body).toContain('overscroll-behavior: contain');
    });

    it('SC-UKV-1054 —список бесед держит прокрутку у себя на краю', (): void => {
        const body: string = ruleBody(sass.compile(THREADS).css, '.rt-thread-list__rows');

        expect(body).toContain('overflow-y: auto');
        expect(body).toContain('overscroll-behavior: contain');
    });
});
