import { join } from 'node:path';

import * as sass from 'sass';

/**
 * Правила видимости подложки и закрытой панели объявлены вне слоя оформления.
 *
 * CDK Overlay объявляет свои правила той же подложки вне слоёв, а неслоевое правило сильнее
 * любого слоевого независимо от специфичности. Вернувшись в слой, оба правила проигрывают, и
 * подложка закрытой панели накрывает экран целиком у потребителя, который берёт стили кита
 * слоями. Ни сборка, ни линтер стилей, ни проверка слоя каскада этого не видят.
 */

const SOURCE: string = join(__dirname, '_rt-aside-overlay.scss');

/** Делит собранный CSS на то, что лежит в слое оформления, и то, что стоит вне него. */
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

describe('стили оверлея панели', (): void => {
    const css: string = sass.compile(SOURCE).css;
    const parts: { inLayer: string; outsideLayer: string } = split(css);

    it('прозрачность и нажатия закрытой подложки объявлены вне слоя', (): void => {
        const body: string = ruleBody(parts.outsideLayer, '.cdk-overlay-backdrop.rt-aside-backdrop');

        expect(body).toContain('opacity: 0');
        expect(body).toContain('pointer-events: none');
    });

    it('открытая подложка возвращает себе видимость там же, вне слоя', (): void => {
        const body: string = ruleBody(parts.outsideLayer, '.cdk-overlay-backdrop.rt-aside-backdrop.rt-aside-backdrop--visible');

        expect(body).toContain('opacity: 1');
        expect(body).toContain('pointer-events: auto');
    });

    it('закрытая панель нажатий не ловит, и это правило тоже вне слоя', (): void => {
        expect(ruleBody(parts.outsideLayer, '.rt-aside-overlay:not(.rt-aside-overlay--open)')).toContain('pointer-events: none');
    });

    it('оформление подложки осталось в слое: приложение переопределяет его своими правилами', (): void => {
        const body: string = ruleBody(parts.inLayer, '.cdk-overlay-backdrop.rt-aside-backdrop');

        expect(body).toContain('background: var(--rt-aside-backdrop-bg)');
        expect(body).toContain('backdrop-filter: blur(var(--rt-aside-backdrop-blur))');
        expect(body).toContain('transition: opacity var(--rt-aside-animation-duration) ease');
    });

    it('вне слоя стоят только правила видимости', (): void => {
        expect(parts.outsideLayer).not.toContain('background:');
        expect(parts.outsideLayer).not.toContain('transition:');
    });
});
