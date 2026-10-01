import { Directive, inject, TemplateRef } from '@angular/core';

import { IRtSideMenu } from './rt-side-menu.model';

/** Шапка бокового меню: над полосой пунктов. */
@Directive({
    selector: '[rtSideMenuHeader]',
})
export class RtSideMenuHeaderDirective {}

/** Подвал бокового меню: под полосой пунктов. */
@Directive({
    selector: '[rtSideMenuFooter]',
})
export class RtSideMenuFooterDirective {}

/** Контекст своего значка пункта: сам пункт — по нему приложение выбирает рисунок. */
export interface IRtSideMenuIconContext {
    $implicit: IRtSideMenu.Item;
}

/**
 * Помечает `<ng-template>` своего значка пунктов меню — для имён, которых нет ни в наборе кита, ни
 * в перечне имён Material. Шаблон один на меню и получает пункт; кит ставит его на место значка
 * размером значка и цветом строки. Значок, который кит рисует сам, шаблон не перебивает.
 *
 * ```html
 * <rt-side-menu [menuItems]="items">
 *     <ng-template rtSideMenuIcon let-item><img [src]="'/icons/' + item.icon + '.svg'" alt="" /></ng-template>
 * </rt-side-menu>
 * ```
 */
@Directive({
    selector: 'ng-template[rtSideMenuIcon]',
})
export class RtSideMenuIconDirective {
    public readonly templateRef: TemplateRef<IRtSideMenuIconContext> = inject<TemplateRef<IRtSideMenuIconContext>>(TemplateRef);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- второй довод стража контекста шаблона стоит только в типе-предикате; убрать его нечем, подпись задаёт каркас
    public static ngTemplateContextGuard(_directive: RtSideMenuIconDirective, context: unknown): context is IRtSideMenuIconContext {
        return true;
    }
}
