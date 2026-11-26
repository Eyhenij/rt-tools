import { join } from 'node:path';

import * as sass from 'sass';

/**
 * Раскладка шторки телефона живёт в стилях: jsdom не раскладывает страницу, и высоту, ширину и
 * обрезку заголовка видно только по правилам. Правила собираются из исходников, как их собирает
 * сборка кита.
 */

function compiled(file: string): string {
    return sass.compile(join(__dirname, file)).css;
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

describe('стили панели-шторки', (): void => {
    const overlay: string = compiled('_rt-aside-overlay.scss');
    const frame: string = compiled('rt-aside.component.scss');
    const header: string = compiled('header/rt-aside-header.component.scss');
    const sheet: string = compiled('../bottom-sheet/rt-bottom-sheet.component.scss');
    const confirm: string = compiled('../bottom-sheet/confirm/rt-bottom-sheet-confirm.component.scss');

    it('SC-UKV-1802 — коробка оверлея шторки во всё окно и без сдвига: шторка стоит от окна', (): void => {
        const body: string = ruleBody(overlay, '.rt-aside-overlay.rt-aside-overlay--sheet');

        expect(body).toContain('width: 100dvw');
        expect(body).toContain('height: 100dvh');
        expect(body).toContain('transform: none');
    });

    it('SC-UKV-1802 — шторка во всю высоту оставляет сверху полосу 12 и стоит во всю ширину', (): void => {
        expect(ruleBody(sheet, '.rt-bottom-sheet__panel--full')).toContain('height: calc(100% - var(--rt-space-2) - var(--rt-space-1))');
        expect(ruleBody(sheet, '.rt-bottom-sheet__panel')).toContain('left: 0');
        expect(ruleBody(sheet, '.rt-bottom-sheet__panel')).toContain('right: 0');
    });

    it('SC-UKV-1810 — рамка в шторке тянется на всё тело, ширина и размер панели к ней не относятся', (): void => {
        const body: string = ruleBody(frame, 'rt-aside .rt-aside.rt-aside--sheet');

        expect(body).toContain('flex: 1 1 auto');
        expect(body).toContain('width: 100%');
        expect(body).toContain('min-height: 0');
    });

    it('SC-UKV-1861 — заголовок шторки стоит по центру и режется многоточием в одну строку', (): void => {
        const title: string = ruleBody(header, '.rt-aside-header__title > rt-skeleton-wrapper');

        expect(ruleBody(header, '.rt-aside-header__content--sheet')).toContain(
            'grid-template-columns: minmax(max-content, 1fr) auto minmax(max-content, 1fr)'
        );
        expect(ruleBody(header, '.rt-aside-header__content--sheet .rt-aside-header__heading')).toContain('text-align: center');
        expect(title).toContain('text-overflow: ellipsis');
        expect(title).toContain('white-space: nowrap');
    });

    it('SC-UKV-1861 — колонки шапки панели-шторки те же, что у шапки шторки кита', (): void => {
        const columns: string = 'grid-template-columns: minmax(max-content, 1fr) auto minmax(max-content, 1fr)';

        expect(ruleBody(sheet, '.rt-bottom-sheet__header')).toContain(columns);
        expect(ruleBody(header, '.rt-aside-header__content--sheet')).toContain(columns);
    });

    it('SC-UKV-1811 — надзаголовок и бэйджи под шапкой шторки стоят по краю содержимого', (): void => {
        const meta: string = ruleBody(header, '.rt-aside-header__sheet-meta');

        expect(meta).toContain('flex-direction: column');
        // 12 шапки шторки и 8 блока — край содержимого шторки в 20.
        expect(meta).toContain('padding-inline: var(--rt-space-2)');
        expect(ruleBody(sheet, '.rt-bottom-sheet__header')).toContain('padding: 0 calc(var(--rt-space-2) + var(--rt-space-1))');
        expect(ruleBody(frame, 'rt-aside .rt-aside.rt-aside--sheet')).toContain('--rt-aside-inset: var(--rt-space-5)');
        expect(ruleBody(frame, 'rt-aside .rt-aside.rt-aside--sheet > .rt-aside__content')).toContain(
            'padding-top: calc(var(--rt-space-2) + var(--rt-space-1))'
        );
    });

    it('SC-UKV-1811 — заголовок шторки строкой 24, значки шапки шторки 32 со значком 16', (): void => {
        expect(ruleBody(header, '.rt-aside-header__content--sheet .rt-aside-header__title')).toContain(
            'line-height: var(--rt-aside-header-title-leading, var(--rt-leading-normal))'
        );
        const icons: string = ruleBody(header, '.rt-aside-header__content--sheet .rt-aside-header__actions .rt-icon-button');

        expect(icons).toContain('--rt-icon-button-size-step: var(--rt-control-height-sm)');
        expect(icons).toContain('--rt-icon-step-md: var(--rt-size-4)');
    });

    it('SC-UKV-1812 — «Сохранить» настроек списка в шапке шторки пишется строчными, как главные кнопки других панелей', (): void => {
        const settings: string = compiled('../data-list/settings/rt-data-list-settings-aside.component.scss');

        expect(ruleBody(settings, '.rt-aside-header__content--sheet .rt-data-list-settings-aside__save')).toContain('text-transform: none');
    });

    it('SC-UKV-1851 — нижняя строка карточки вопроса скруглена как карточка: кольцо фокуса не срезается углом', (): void => {
        expect(ruleBody(confirm, '.rt-bottom-sheet__confirm-row:last-child')).toContain(
            'border-radius: 0 0 var(--rt-bottom-sheet-confirm-radius) var(--rt-bottom-sheet-confirm-radius)'
        );
        expect(ruleBody(confirm, '.rt-bottom-sheet__confirm-row:only-child')).toContain(
            'border-radius: var(--rt-bottom-sheet-confirm-radius)'
        );
    });

    it('SC-UKV-1810 — подвал панели-шторки — подвал шторки кита: 12 над кнопками и под ними, своего правила у панели нет', (): void => {
        expect(ruleBody(frame, 'rt-aside > rt-bottom-sheet > .rt-bottom-sheet__panel > .rt-bottom-sheet__footer')).toBe('');
        expect(ruleBody(sheet, '.rt-bottom-sheet__footer')).toContain(
            'padding: calc(var(--rt-space-2) + var(--rt-space-1)) var(--rt-space-5) calc(var(--rt-space-2) + var(--rt-space-1) + env(safe-area-inset-bottom))'
        );
    });

    it('SC-UKV-1810 — под шапкой панели-шторки черта подвала шторки: та же толщина, тот же цвет, на всю ширину', (): void => {
        const divider: string = ruleBody(frame, 'rt-aside > rt-bottom-sheet > .rt-bottom-sheet__panel > .rt-bottom-sheet__header');
        const footerLine: string = 'var(--rt-bottom-sheet-footer-border-width) solid var(--rt-color-border-default)';

        expect(ruleBody(sheet, '.rt-bottom-sheet__footer')).toContain(`border-top: ${footerLine}`);
        expect(divider).toContain(`border-bottom: ${footerLine}`);
        // Черта идёт по краю шапки, а у шапки нет внешних полей — значит, на всю ширину панели.
        expect(ruleBody(sheet, '.rt-bottom-sheet__header')).not.toContain('margin');
    });
});
