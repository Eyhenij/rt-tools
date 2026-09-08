import { join } from 'node:path';

import * as sass from 'sass';

/**
 * Словарь формы панели объявлен классами, а не компонентом: поднять его спекой не на чем, и
 * единственное, что о нём можно спросить, — собранный CSS. Поэтому спека компилирует его сама.
 *
 * Проверяется ровно то, что ломается молча: отступ, написанный элементу, число вместо ступени,
 * правило, уехавшее мимо слоя, и потерянная строка в агрегаторе. Вид от каждого из них едет у
 * потребителя, а ни сборка, ни линтер стилей ни одного не видят.
 *
 * О том, как словарь выглядит, спека молчит: это показывает история витрины и её снимок.
 */

const SOURCE: string = join(__dirname, '_form.scss');
const AGGREGATOR: string = join(__dirname, '_index.scss');
const PANEL: string = join(__dirname, '..', 'lib', 'components', 'aside', 'rt-aside.component.scss');

/** Тело слоя оформления кита и всё, что осталось снаружи него. */
function split(css: string): { inLayer: string; outsideLayer: string } {
    const opened: number = css.indexOf('{', css.indexOf('@layer rt-kit.components'));
    let depth: number = 1;
    let index: number = opened + 1;

    while (depth > 0) {
        const char: string = css[index];
        if (char === '{') {
            depth += 1;
        }
        if (char === '}') {
            depth -= 1;
        }
        index += 1;
    }

    return { inLayer: css.slice(opened + 1, index - 1), outsideLayer: css.slice(index) };
}

/** Тело правила с таким селектором, без вложенных в него правил. */
function ruleBody(css: string, selector: string): string {
    const at: number = css.indexOf(`${selector} {`);
    if (at < 0) {
        return '';
    }

    const opened: number = css.indexOf('{', at);

    return css.slice(opened + 1, css.indexOf('}', opened));
}

/** Порог узкого экрана, объявленный в собранном файле. */
function threshold(css: string): string | undefined {
    return css.match(/@media\s*\(width <= (\d+px)\)/)?.[1];
}

describe('стили словаря формы панели', (): void => {
    const css: string = sass.compile(SOURCE).css;
    const parts: { inLayer: string; outsideLayer: string } = split(css);

    it('SC-UKV-99 — своего отступа нет ни у одного элемента словаря', (): void => {
        expect(css).not.toMatch(/\bmargin-top\s*:/);
        expect(css).not.toMatch(/\bmargin-left\s*:/);
        expect(css).not.toMatch(/\bmargin-block/);
        expect(css).not.toMatch(/\bmargin-inline/);
    });

    it('SC-UKV-100 — блок формы и раздел объявляют зазор ступенью xl', (): void => {
        expect(ruleBody(css, '.rt-form')).toContain('gap: var(--rt-space-xl)');
        expect(ruleBody(css, '.rt-form__item')).toContain('gap: var(--rt-space-xl)');
    });

    it('SC-UKV-100 — колонка контролов объявляет зазор ступенью md', (): void => {
        expect(ruleBody(css, '.rt-form__controls')).toContain('gap: var(--rt-space-md)');
    });

    it('SC-UKV-100 — строка контрола разводит элементы в ряду своим зазором', (): void => {
        expect(ruleBody(css, '.rt-form__control-item')).toContain('gap: var(--rt-space-xl)');
    });

    it('SC-UKV-101 — каждый зазор словаря взят токеном, а не числом', (): void => {
        const gaps: readonly string[] = css.match(/\bgap\s*:[^;]+;/g) ?? [];

        expect(gaps.length).toBeGreaterThan(0);
        gaps.forEach((declaration: string): void => {
            expect(declaration).toContain('var(--rt-space-');
        });
    });

    it('SC-UKV-106 — виды строки и элемента объявлены все, и карточка просмотра размечается', (): void => {
        // Пары «подпись — значение» держатся на этих видах: без них половина панелей
        // потребителя объявит раскладку у себя, ради снятия которой словарь и переехал.
        ['--split', '--stack'].forEach((view: string): void => {
            expect(css).toContain(`.rt-form__control-item${view}`);
        });
        ['--label', '--value', '--grow', '--gone', '--warning'].forEach((view: string): void => {
            expect(css).toContain(`.rt-form__control-sub-item${view}`);
        });
    });

    it('SC-UKV-107 — имена, стоящие в панели рядом с полями, объявлены словарём', (): void => {
        ['__label', '__related', '__tags', '__framed-list', '__code', '__preview', '__sentinel'].forEach((name: string): void => {
            expect(css).toContain(`.rt-form${name}`);
        });
    });

    it('SC-UKV-108 — элемент в ряду умеет сжиматься, иначе длинное значение ломает строку', (): void => {
        // Без нулевой нижней границы ширины соседи сжимаются до столбика по одной букве:
        // так разъехалась вкладка документа в рабочем приложении.
        expect(ruleBody(css, '.rt-form__control-sub-item')).toContain('min-width: 0');
    });

    it('SC-UKV-102 — все правила словаря стоят внутри подслоя оформления', (): void => {
        expect(parts.inLayer).toContain('.rt-form');
        expect(parts.outsideLayer).not.toContain('.rt-form');
    });

    it('SC-UKV-103 — словарь доезжает до потребителя агрегатором стилей', (): void => {
        expect(sass.compile(AGGREGATOR).css).toContain('.rt-form__control-sub-item');
    });

    it('SC-UKV-104 — на узком экране зазор формы и раздела сжимается до ступени md', (): void => {
        const at: number = css.indexOf('@media');

        expect(css.slice(at)).toContain('gap: var(--rt-space-md)');
    });

    it('SC-UKV-104 — порог узкого экрана в словаре один с порогом самой панели', (): void => {
        expect(threshold(css)).toBe(threshold(sass.compile(PANEL).css));
    });

    it('SC-UKV-109 — разделы внутри вкладки отбиты ритмом формы, а не ритмом вкладок', (): void => {
        expect(ruleBody(css, '.rt-form .rt-tabs__content')).toContain('gap: var(--rt-space-xl)');
    });

    it('SC-UKV-111 — запись в общей рамке несёт свой внутренний отступ', (): void => {
        expect(ruleBody(css, '.rt-form__framed-item')).toContain('padding');
    });

    it('SC-UKV-110 — поле, стоящее в строке одно, занимает её целиком', (): void => {
        expect(ruleBody(css, '.rt-form__control-item > rt-field')).toContain('flex: 1 1 auto');
    });

    it('SC-UKV-112 — поле внутри элемента ряда занимает элемент целиком', (): void => {
        expect(ruleBody(css, '.rt-form__control-sub-item > rt-field')).toContain('flex: 1 1 auto');
    });

    it('SC-UKV-109 — на узком экране зона вкладок сжимается вместе с формой', (): void => {
        const at: number = css.indexOf('@media');

        expect(css.slice(at)).toContain('.rt-form .rt-tabs__content');
    });
});
