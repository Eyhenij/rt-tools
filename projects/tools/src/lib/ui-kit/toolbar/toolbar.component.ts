import { NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    Directive,
    InputSignalWithTransform,
    Signal,
    TemplateRef,
    Type,
    booleanAttribute,
    contentChild,
    input,
} from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';

import { BlockDirective, ElemDirective } from '../../bem';
import { Nullable } from '../../util';

@Directive({
    standalone: true,
    selector: '[rtuiToolbarLeft]',
})
export class RtuiToolbarLeftDirective {}

@Directive({
    standalone: true,
    selector: '[rtuiToolbarCenter]',
})
export class RtuiToolbarCenterDirective {}

@Directive({
    standalone: true,
    selector: '[rtuiToolbarRight]',
})
export class RtuiToolbarRightDirective {}

@Component({
    standalone: true,
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
    public sticky: InputSignalWithTransform<Nullable<boolean>, boolean> = input<Nullable<boolean>, boolean>(false, {
        transform: booleanAttribute,
    });
}
