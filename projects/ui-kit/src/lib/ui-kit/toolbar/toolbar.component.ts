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
    Type,
} from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';
import { INullable } from '@rt-tools/utils';

@Directive({
    selector: '[rtuiToolbarLeft]',
})
export class RtuiToolbarLeftDirective {}

@Directive({
    selector: '[rtuiToolbarCenter]',
})
export class RtuiToolbarCenterDirective {}

@Directive({
    selector: '[rtuiToolbarRight]',
})
export class RtuiToolbarRightDirective {}

const BEM_BLOCK: string = 'rtui-toolbar';

@Component({
    selector: 'rtui-toolbar',
    host: { class: BEM_BLOCK },
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatToolbar, NgTemplateOutlet, BlockDirective, ElemDirective, ModDirective],
})
export class RtuiToolbarComponent {
    public isVisibleToolbar: Signal<boolean> = input(true);

    public readonly leftToolTpl: Signal<INullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiToolbarLeftDirective, {
        read: TemplateRef,
    });
    public readonly centerToolTpl: Signal<INullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiToolbarCenterDirective, {
        read: TemplateRef,
    });
    public readonly rightToolTpl: Signal<INullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiToolbarRightDirective, {
        read: TemplateRef,
    });
    public sticky: InputSignalWithTransform<INullable<boolean>, boolean> = input<INullable<boolean>, boolean>(false, {
        transform: booleanAttribute,
    });
}
