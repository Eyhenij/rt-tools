import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, Directive, InputSignal, Signal, TemplateRef, contentChild, input } from '@angular/core';

import { BlockDirective, ElemDirective } from '../../bem';
import { Nullable } from '../../util';

@Directive({
    standalone: true,
    selector: '[rtuiScrollableHeader]',
})
export class RtuiScrollableContainerHeaderDirective {}

@Directive({
    standalone: true,
    selector: '[rtuiScrollableContent]',
})
export class RtuiScrollableContainerContentDirective {}

@Directive({
    standalone: true,
    selector: '[rtuiScrollableFooter]',
})
export class RtuiScrollableContainerFooterDirective {}

@Component({
    standalone: true,
    selector: 'rtui-scrollable',
    templateUrl: './scrollable-container.component.html',
    styleUrls: ['./scrollable-container.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BlockDirective, ElemDirective, NgTemplateOutlet],
})
export class RtuiScrollableContainerComponent {
    public readonly headerTpl: Signal<Nullable<TemplateRef<any>>> = contentChild(RtuiScrollableContainerHeaderDirective, {
        read: TemplateRef,
    });
    public readonly contentTpl: Signal<Nullable<TemplateRef<any>>> = contentChild(RtuiScrollableContainerContentDirective, {
        read: TemplateRef,
    });
    public readonly footerTpl: Signal<Nullable<TemplateRef<any>>> = contentChild(RtuiScrollableContainerFooterDirective, {
        read: TemplateRef,
    });
    public backgroundColor: InputSignal<Nullable<string>> = input();
}
