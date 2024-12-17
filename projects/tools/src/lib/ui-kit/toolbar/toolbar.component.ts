import { BooleanInput } from '@angular/cdk/coercion';
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

import { BlockDirective, ElemDirective } from '../../bem';
import { Nullable } from '../../util';

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

@Component({
    selector: 'rtui-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatToolbar, NgTemplateOutlet, BlockDirective, ElemDirective],
})
export class RtuiToolbarComponent {
    public isVisibleToolbar: Signal<boolean> = input(true);

    public readonly leftToolTpl: Signal<Nullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiToolbarLeftDirective, {
        read: TemplateRef,
    });
    public readonly centerToolTpl: Signal<Nullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiToolbarCenterDirective, {
        read: TemplateRef,
    });
    public readonly rightToolTpl: Signal<Nullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiToolbarRightDirective, {
        read: TemplateRef,
    });
    public sticky: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
}
