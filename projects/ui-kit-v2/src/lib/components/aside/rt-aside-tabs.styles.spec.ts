import { join } from 'node:path';

import * as sass from 'sass';

/**
 * Раскладка `tabs` объявлена стилями: jsdom раскладку не считает, поэтому спека компилирует файл
 * панели и читает собранный CSS.
 */

const STYLES: string = join(__dirname, 'rt-aside.component.scss');
const STYLES_ROOT: string = join(__dirname, '../../../styles');

describe('раскладка вкладок боковой панели', (): void => {
    it('SC-UKV-1254 — в раскладке вкладок полоса вкладок стоит сразу под шапкой', (): void => {
        const css: string = sass.compile(STYLES, { style: 'expanded', loadPaths: [STYLES_ROOT] }).css;

        expect(css).toMatch(/\.rt-aside--content--tabs \.rt-aside__content \{\s+overflow: hidden;\s+padding-block: 0;/);
    });
});
