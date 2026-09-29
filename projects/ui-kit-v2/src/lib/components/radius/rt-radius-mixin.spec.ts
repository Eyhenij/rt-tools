import { join } from 'node:path';

import { compileString } from 'sass';

import { RT_RADIUS_STEPS } from './rt-radius.model';

interface ICompiledRule {
    selector: string;
    body: string;
}

/** Папка общего слоя стилей кита, откуда берётся примесь. */
const STYLES_DIR: string = join(__dirname, '..', '..', '..', 'styles');

/** Правила примеси для карточки: свойство объявлено на корне шаблона, прямом ребёнке хоста. */
const compileCard: () => string = (): string =>
    compileString("@use 'mixins' as kv; rt-card { @include kv.radius-steps('--rt-card-radius', '> .rt-card'); }", {
        loadPaths: [STYLES_DIR],
    }).css;

/** Правила примеси для компонента, чьё свойство объявлено на самом хосте. */
const compileTag: () => string = (): string =>
    compileString("@use 'mixins' as kv; rt-tag { @include kv.radius-steps('--rt-tag-radius'); }", { loadPaths: [STYLES_DIR] }).css;

/**
 * Селекторы и тела правил из скомпилированного текста. Кавычки в значении
 * атрибута снимаются: Sass ставит их у шага `2xl`, который не может быть словом CSS.
 */
const rules: (css: string) => ICompiledRule[] = (css: string): ICompiledRule[] =>
    [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)].map((m: RegExpMatchArray): ICompiledRule => ({
        selector: m[1].trim().replaceAll('"', ''),
        body: m[2].trim(),
    }));

describe('примесь radius-steps', (): void => {
    it('SC-UKV-386 — правило шага называет хост с атрибутом и поверхность прямым ребёнком', (): void => {
        const found: ICompiledRule[] = rules(compileCard());
        const selectors: string[] = found.map((r: ICompiledRule): string => r.selector);

        expect(found).toHaveLength(RT_RADIUS_STEPS.length);
        for (const step of RT_RADIUS_STEPS) {
            expect(selectors).toContain(`rt-card[data-rt-radius=${step}] > .rt-card`);
        }
    });

    it('SC-UKV-386 — без поверхности правило шага стоит на самом хосте', (): void => {
        const found: ICompiledRule[] = rules(compileTag());

        expect(found).toHaveLength(RT_RADIUS_STEPS.length);
        expect(found.map((r: ICompiledRule): string => r.selector)).toContain('rt-tag[data-rt-radius=full]');
    });

    it('SC-UKV-387 — правило шага переназначает только собственное свойство', (): void => {
        const found: ICompiledRule[] = rules(compileCard());

        for (const step of RT_RADIUS_STEPS) {
            const rule: ICompiledRule | undefined = found.find((r: ICompiledRule): boolean => r.selector.includes(`=${step}]`));
            expect(rule?.body).toBe(`--rt-card-radius: var(--rt-radius-${step});`);
        }
    });
});
