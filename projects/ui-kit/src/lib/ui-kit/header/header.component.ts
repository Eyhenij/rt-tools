import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    contentChild,
    Directive,
    input,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    Signal,
    TemplateRef,
    Type,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';

import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { INullable } from '@rt-tools/utils';
import { RtuiToolbarCenterDirective, RtuiToolbarComponent, RtuiToolbarLeftDirective, RtuiToolbarRightDirective } from '../toolbar';

@Directive({
    selector: '[rtuiHeaderLeft]',
})
export class RtuiHeaderLeftDirective {}

@Directive({
    selector: '[rtuiHeaderCenter]',
})
export class RtuiHeaderCenterDirective {}

@Directive({
    selector: '[rtuiHeaderRight]',
})
export class RtuiHeaderRightDirective {}

@Component({
    selector: 'rtui-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgTemplateOutlet,

        // Material
        MatToolbar,
        MatIconButton,
        MatIcon,

        // BEM
        BlockDirective,
        ElemDirective,

        // Ui-kit
        RtuiToolbarComponent,
        RtuiToolbarLeftDirective,
        RtuiToolbarCenterDirective,
        RtuiToolbarRightDirective,
    ],
})
export class RtuiHeaderComponent {
    public isMobile: InputSignalWithTransform<INullable<boolean>, INullable<boolean>> = input<INullable<boolean>, INullable<boolean>>(
        false,
        {
            transform: booleanAttribute,
        }
    );
    public isMobileMenuButtonShown: InputSignalWithTransform<INullable<boolean>, INullable<boolean>> = input<
        INullable<boolean>,
        INullable<boolean>
    >(true, {
        transform: booleanAttribute,
    });

    public readonly leftHeaderTpl: Signal<INullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiHeaderLeftDirective, {
        read: TemplateRef,
    });
    public readonly centerHeaderTpl: Signal<INullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiHeaderCenterDirective, {
        read: TemplateRef,
    });
    public readonly rightHeaderTpl: Signal<INullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiHeaderRightDirective, {
        read: TemplateRef,
    });

    public readonly openMobileMenuAction: OutputEmitterRef<void> = output<void>();

    public openSideMenu(): void {
        if (this.isMobile() && this.isMobileMenuButtonShown()) {
            this.openMobileMenuAction.emit();
        }
    }
}
