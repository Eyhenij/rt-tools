import { inject, Directive, InjectionToken, TemplateRef } from '@angular/core';

import { rtSlotTemplate } from '@rt-tools/ui-kit-v2/core';

/**
 * Метка шапки страницы над слотом. Колокольчик `[rtHeaderBell]` остаётся слотом-элементом
 * `rt-header`, и прежняя форма предупреждает только в `rt-page-header`.
 */
const HOST: string = 'rt-page-header';

export const RT_PAGE_HEADER_SLOT_HOST: InjectionToken<boolean> = new InjectionToken<boolean>('RT_PAGE_HEADER_SLOT_HOST');

/** Логотип рейла: `<ng-template rtRailLogo>`, рисуется только при `layout="vertical"`. */
@Directive({ selector: '[rtRailLogo]' })
export class RtRailLogoDirective {
    public readonly template: TemplateRef<unknown> | null = rtSlotTemplate(HOST, 'rtRailLogo');
}

/** Содержимое строки страницы рейла: `<ng-template rtRailPage>`, только при `layout="vertical"`. */
@Directive({ selector: '[rtRailPage]' })
export class RtRailPageDirective {
    public readonly template: TemplateRef<unknown> | null = rtSlotTemplate(HOST, 'rtRailPage');
}

/** Левая часть компактной полосы: `<ng-template rtCompactLeft>`, только в горизонтальном виде. */
@Directive({ selector: '[rtCompactLeft]' })
export class RtCompactLeftDirective {
    public readonly template: TemplateRef<unknown> | null = rtSlotTemplate(HOST, 'rtCompactLeft');
}

/** Середина компактной полосы: `<ng-template rtCompactCenter>`, только в горизонтальном виде. */
@Directive({ selector: '[rtCompactCenter]' })
export class RtCompactCenterDirective {
    public readonly template: TemplateRef<unknown> | null = rtSlotTemplate(HOST, 'rtCompactCenter');
}

/** Правая часть компактной полосы: `<ng-template rtCompactRight>`, только в горизонтальном виде. */
@Directive({ selector: '[rtCompactRight]' })
export class RtCompactRightDirective {
    public readonly template: TemplateRef<unknown> | null = rtSlotTemplate(HOST, 'rtCompactRight');
}

/**
 * Кнопки у правого края шапки страницы: `<ng-template rtHeaderBell>`, только в горизонтальном виде.
 * Несколько шаблонов встают все, в порядке записи, перед профилем.
 */
@Directive({ selector: '[rtHeaderBell]' })
export class RtPageHeaderBellDirective {
    public readonly template: TemplateRef<unknown> | null = rtSlotTemplate(
        HOST,
        'rtHeaderBell',
        inject(RT_PAGE_HEADER_SLOT_HOST, { optional: true }) === true
    );
}
