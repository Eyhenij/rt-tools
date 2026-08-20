import { Directive } from '@angular/core';

/**
 * Маркеры слотов оболочки — своим файлом, а не рядом с панельными директивами.
 *
 * Панельные директивы берут сам компонент оболочки значением, а компонент объявляет маркеры в
 * своих импортах: вместе это круг «оболочка → директивы → оболочка». Маркеры пусты и не знают
 * об оболочке ничего, поэтому расходятся с ней без потерь.
 */

/**
 * Маркер-директива для содержимого хедера `rt-container`.
 *
 * @example
 * ```html
 * <rt-container>
 *     <ng-container *rtContainerHeader>
 *         <rt-header />
 *     </ng-container>
 * </rt-container>
 * ```
 */
@Directive({
    selector: '[rtContainerHeader]',
})
export class RtContainerHeaderDirective {}

/**
 * Маркер-директива для контента левой sidenav в `rt-container`.
 *
 * @example
 * ```html
 * <rt-container>
 *     <ng-container *rtContainerLeftSidenav>
 *         <router-outlet name="lo" />
 *     </ng-container>
 * </rt-container>
 * ```
 */
@Directive({
    selector: '[rtContainerLeftSidenav]',
})
export class RtContainerLeftSidenavDirective {}

/**
 * Маркер-директива для контента правой sidenav в `rt-container`.
 *
 * @example
 * ```html
 * <rt-container>
 *     <ng-container *rtContainerRightSidenav>
 *         <router-outlet name="ro" />
 *     </ng-container>
 * </rt-container>
 * ```
 */
@Directive({
    selector: '[rtContainerRightSidenav]',
})
export class RtContainerRightSidenavDirective {}

/**
 * Маркер-директива для контента в левой секции toolbar.
 *
 * @example
 * ```html
 * <rt-container>
 *     <ng-container *rtContainerToolbarLeft>
 *         <router-outlet name="lb" />
 *     </ng-container>
 * </rt-container>
 * ```
 */
@Directive({
    selector: '[rtContainerToolbarLeft]',
})
export class RtContainerToolbarLeftDirective {}

/**
 * Маркер-директива для контента в центральной секции toolbar.
 *
 * @example
 * ```html
 * <rt-container>
 *     <ng-container *rtContainerToolbarCenter>
 *         <router-outlet name="cb" />
 *     </ng-container>
 * </rt-container>
 * ```
 */
@Directive({
    selector: '[rtContainerToolbarCenter]',
})
export class RtContainerToolbarCenterDirective {}

/**
 * Маркер-директива для контента в правой секции toolbar.
 *
 * @example
 * ```html
 * <rt-container>
 *     <ng-container *rtContainerToolbarRight>
 *         <router-outlet name="rb" />
 *     </ng-container>
 * </rt-container>
 * ```
 */
@Directive({
    selector: '[rtContainerToolbarRight]',
})
export class RtContainerToolbarRightDirective {}

/**
 * Маркер-директива для основного контента `rt-container`.
 *
 * @example
 * ```html
 * <rt-container>
 *     <ng-container *rtContainerContent>
 *         <router-outlet />
 *     </ng-container>
 * </rt-container>
 * ```
 */
@Directive({
    selector: '[rtContainerContent]',
})
export class RtContainerContentDirective {}
