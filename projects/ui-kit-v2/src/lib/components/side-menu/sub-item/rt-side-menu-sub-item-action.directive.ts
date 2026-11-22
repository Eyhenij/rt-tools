import { Directive, TemplateRef } from '@angular/core';

import { rtSlotTemplate } from '@rt-tools/ui-kit-v2/core';

/**
 * Действие строки подменю: `<ng-template rtSideMenuSubItemAction>`. Рисуется в строке глубины ноль,
 * когда эта строка — ссылка; строка папки и строки её пунктов действия не несут. Блок избранного
 * кладёт сюда ручку перетаскивания.
 */
@Directive({ selector: '[rtSideMenuSubItemAction]' })
export class RtSideMenuSubItemActionDirective {
    public readonly template: TemplateRef<unknown> | null = rtSlotTemplate('rt-side-menu-sub-item', 'rtSideMenuSubItemAction');
}
