import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, contentChild, Directive, Signal, TemplateRef, Type } from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { INullable } from '@rt-tools/utils';

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

const BEM_BLOCK: string = 'rtui-scrollable';

@Component({
    selector: 'rtui-scrollable',
    host: { class: BEM_BLOCK },
    templateUrl: './scrollable-container.component.html',
    styleUrls: ['./scrollable-container.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BlockDirective, ElemDirective, NgTemplateOutlet],
})
export class RtuiScrollableContainerComponent {
    public readonly headerTpl: Signal<INullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiScrollableContainerHeaderDirective, {
        read: TemplateRef,
    });
    public readonly contentTpl: Signal<INullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiScrollableContainerContentDirective, {
        read: TemplateRef,
    });
    public readonly footerTpl: Signal<INullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiScrollableContainerFooterDirective, {
        read: TemplateRef,
    });
}
