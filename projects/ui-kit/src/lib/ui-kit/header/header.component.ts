import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    Directive,
    inject,
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

import { BlockDirective, BreakpointService, ElemDirective } from '@rt-tools/core';
import { TNullable } from '@rt-tools/utils';
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

const BEM_BLOCK: string = 'rtui-header';

@Component({
    selector: 'rtui-header',
    host: { class: BEM_BLOCK },
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    providers: [BreakpointService],
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
    readonly #breakpoints: BreakpointService = inject(BreakpointService);

    /** Экран узкий: замер кита, и другого источника у этого признака нет. */
    protected readonly narrow: Signal<boolean> = computed(() => !!this.#breakpoints.isMobile());
    public isMobileMenuButtonShown: InputSignalWithTransform<TNullable<boolean>, TNullable<boolean>> = input<
        TNullable<boolean>,
        TNullable<boolean>
    >(true, {
        transform: booleanAttribute,
    });

    public readonly leftHeaderTpl: Signal<TNullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiHeaderLeftDirective, {
        read: TemplateRef,
    });
    public readonly centerHeaderTpl: Signal<TNullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiHeaderCenterDirective, {
        read: TemplateRef,
    });
    public readonly rightHeaderTpl: Signal<TNullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiHeaderRightDirective, {
        read: TemplateRef,
    });

    public readonly openMobileMenuAction: OutputEmitterRef<void> = output<void>();

    public openSideMenu(): void {
        if (this.narrow() && this.isMobileMenuButtonShown()) {
            this.openMobileMenuAction.emit();
        }
    }
}
