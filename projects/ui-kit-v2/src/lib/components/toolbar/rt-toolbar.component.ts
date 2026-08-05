import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    contentChild,
    Directive,
    input,
    InputSignalWithTransform,
    Signal,
    TemplateRef,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

/**
 * Маркер-директива для контента в левой секции тулбара.
 *
 * @example
 * ```html
 * <rt-toolbar>
 *     <ng-template rtToolbarLeft>
 *         <button rtButton label="Создать" />
 *     </ng-template>
 * </rt-toolbar>
 * ```
 */
@Directive({
    selector: '[rtToolbarLeft]',
})
export class RtToolbarLeftDirective {}

/**
 * Маркер-директива для контента в центральной секции тулбара.
 *
 * @example
 * ```html
 * <rt-toolbar>
 *     <ng-template rtToolbarCenter>
 *         <span>Заголовок страницы</span>
 *     </ng-template>
 * </rt-toolbar>
 * ```
 */
@Directive({
    selector: '[rtToolbarCenter]',
})
export class RtToolbarCenterDirective {}

/**
 * Маркер-директива для контента в правой секции тулбара.
 *
 * @example
 * ```html
 * <rt-toolbar>
 *     <ng-template rtToolbarRight>
 *         <input type="search" placeholder="Поиск" />
 *     </ng-template>
 * </rt-toolbar>
 * ```
 */
@Directive({
    selector: '[rtToolbarRight]',
})
export class RtToolbarRightDirective {}

/**
 * Универсальный тулбар с тремя секциями: left, center, right.
 * Секции задаются `<ng-template>` с директивами-маркерами и подставляются через `ngTemplateOutlet`.
 * Каждый модуль/фича подключает `rt-toolbar` в своём layout и наполняет нужные секции.
 *
 * @example
 * ```html
 * <rt-toolbar>
 *     <ng-template rtToolbarLeft>
 *         <button rtButton label="Создать" />
 *         <button rtButton label="Удалить" appearance="text" />
 *     </ng-template>
 *
 *     <ng-template rtToolbarCenter>
 *         <span>Заявки</span>
 *     </ng-template>
 *
 *     <ng-template rtToolbarRight>
 *         <input type="search" [formControl]="searchCtrl" />
 *     </ng-template>
 * </rt-toolbar>
 * ```
 */
const BEM_BLOCK: string = 'rt-toolbar';

@Component({
    selector: 'rt-toolbar',
    templateUrl: './rt-toolbar.component.html',
    styleUrls: ['./rt-toolbar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // Angular
        NgTemplateOutlet,

        // standalone components / directives
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    host: {
        class: BEM_BLOCK,
        '[class.rt-toolbar--dense]': 'dense()',
    },
})
export class RtToolbarComponent {
    protected readonly leftTpl: Signal<TemplateRef<unknown> | undefined> = contentChild(RtToolbarLeftDirective, { read: TemplateRef });

    protected readonly centerTpl: Signal<TemplateRef<unknown> | undefined> = contentChild(RtToolbarCenterDirective, { read: TemplateRef });

    protected readonly rightTpl: Signal<TemplateRef<unknown> | undefined> = contentChild(RtToolbarRightDirective, { read: TemplateRef });

    /**
     * Компактная шапка (заголовок + иконки-действия): зоны остаются в одну строку
     * даже на мобилке. Без этого трёхзонный list-тулбар стекается в колонку на
     * ≤768px, что для узкой шапки (напр. rt-chat) неверно.
     */
    public readonly dense: InputSignalWithTransform<boolean, boolean | string> = input<boolean, boolean | string>(false, {
        transform: booleanAttribute,
    });
}
