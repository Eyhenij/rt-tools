import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, contentChild, Directive, Signal, TemplateRef, Type } from '@angular/core';

import { BlockDirective, ElemDirective } from '../../bem';
import { Nullable } from '../../util';

@Directive({
    selector: '[rtuiScrollableHeader]',
})
export class RtuiScrollableContainerHeaderDirective {}

@Directive({
    selector: '[rtuiScrollableContent]',
})
export class RtuiScrollableContainerContentDirective {}

@Directive({
    selector: '[rtuiScrollableFooter]',
})
export class RtuiScrollableContainerFooterDirective {}

@Component({
    selector: 'rtui-scrollable',
    templateUrl: './scrollable-container.component.html',
    styleUrls: ['./scrollable-container.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BlockDirective, ElemDirective, NgTemplateOutlet],
})
export class RtuiScrollableContainerComponent {
    public readonly headerTpl: Signal<Nullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiScrollableContainerHeaderDirective, {
        read: TemplateRef,
    });
    public readonly contentTpl: Signal<Nullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiScrollableContainerContentDirective, {
        read: TemplateRef,
    });
    public readonly footerTpl: Signal<Nullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiScrollableContainerFooterDirective, {
        read: TemplateRef,
    });
}
