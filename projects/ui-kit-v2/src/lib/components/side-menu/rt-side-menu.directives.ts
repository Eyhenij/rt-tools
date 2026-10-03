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

/**
 * Контекст своего значка: пункт, имя, которое надо нарисовать, и место. Шаблон один на меню и рисует
 * и значок строки, и кнопку строки, поэтому рисунок выбирают по `icon`, а не по `item.icon`: у кнопки
 * это имя её значка.
 */
export interface IRtSideMenuIconContext {
    $implicit: IRtSideMenu.Item;
    /** Имя значка этого места: значка строки или кнопки строки. */
    icon: string;
    /** Место: значок строки или кнопка строки. */
    slot: 'icon' | 'iconButton';
}

/**
 * Помечает `<ng-template>` своего значка пунктов меню — для имён, которых нет ни в наборе кита, ни
 * в перечне имён Material. Шаблон один на меню и рисует и значок строки, и значок кнопки строки; кит
 * ставит его на место значка размером значка и цветом строки. Рисунок выбирают по `icon` контекста.
 * Значок, который кит рисует сам, шаблон не перебивает.
 *
 * ```html
 * <rt-side-menu [menuItems]="items">
 *     <ng-template rtSideMenuIcon let-icon="icon"><img [src]="'/icons/' + icon + '.svg'" alt="" /></ng-template>
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
