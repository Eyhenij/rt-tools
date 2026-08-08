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
    InputSignal,
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

    /** Экран узкий: значение входа, если приложение его дало, иначе замер кита. */
    protected readonly narrow: Signal<boolean> = computed(() => this.isMobile() ?? !!this.#breakpoints.isMobile());
    /**
     * Признак узкого экрана.
     *
     * @deprecated Кит определяет его сам — `BreakpointService` из `@rt-tools/core`. Вход
     * оставлен ради приложений, которые уже его передают, и уйдёт в следующем крупном выпуске.
     */
    public isMobile: InputSignal<INullable<boolean>> = input<INullable<boolean>>(null);
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
