import { CdkTrapFocus } from '@angular/cdk/a11y';
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
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';

import { BlockDirective, BreakpointService, ElemDirective } from '@rt-tools/core';
import { INullable } from '@rt-tools/utils';
import { transformArrayInput } from '@rt-tools/utils';
import { AsideButtonsType } from '../../aside.enums';
import { IAside } from '../../aside.interfaces';
import {
    RtuiScrollableContainerComponent,
    RtuiScrollableContainerContentDirective,
    RtuiScrollableContainerFooterDirective,
    RtuiScrollableContainerHeaderDirective,
} from '../../../scrollable';
import { RtuiSpinnerComponent } from '../../../spinner';
import { RtuiToolbarCenterDirective, RtuiToolbarComponent, RtuiToolbarLeftDirective, RtuiToolbarRightDirective } from '../../../toolbar';
import { AsideErrorBoxComponent } from '../error-notification/aside-error-box.component';

@Directive({
    selector: '[rtuiAsideHeader]',
})
export class RtuiAsideContainerHeaderDirective {}

const BEM_BLOCK: string = 'c-aside';

@Component({
    selector: 'rtui-aside-container',
    templateUrl: './aside-container.component.html',
    styleUrls: ['./aside-container.component.scss'],
    providers: [BreakpointService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RouterLink,
        NgTemplateOutlet,

        // material
        MatIcon,
        CdkTrapFocus,
        MatIconButton,
        MatTooltip,
        MatButton,

        // standalone components
        AsideErrorBoxComponent,
        RtuiSpinnerComponent,
        RtuiScrollableContainerComponent,
        RtuiToolbarComponent,

        // directives
        RtuiScrollableContainerHeaderDirective,
        RtuiScrollableContainerContentDirective,
        RtuiScrollableContainerFooterDirective,
        RtuiToolbarLeftDirective,
        RtuiToolbarCenterDirective,
        RtuiToolbarRightDirective,

        // bem
        BlockDirective,
        ElemDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtuiAsideContainerComponent {
    readonly #breakpoints: BreakpointService = inject(BreakpointService);

    /** Экран узкий: значение входа, если приложение его дало, иначе замер кита. */
    protected readonly narrow: Signal<boolean> = computed(() => this.isMobile() ?? !!this.#breakpoints.isMobile());
    public title: InputSignal<INullable<string>> = input<INullable<string>>(null);
    /**
     * Признак узкого экрана.
     *
     * @deprecated Кит определяет его сам — `RtuiBreakpointsService`. Вход оставлен ради
     * приложений, которые уже его передают, и уйдёт в следующем крупном выпуске.
     */
    public isMobile: InputSignalWithTransform<INullable<boolean>, INullable<boolean> | string> = input<
        INullable<boolean>,
        INullable<boolean> | string
    >(null, {
        transform: (value: INullable<boolean> | string) => (value === null || value === undefined ? null : booleanAttribute(value)),
    });
    public isSubmitButtonDisabled: InputSignalWithTransform<boolean, boolean> = input.required<boolean, boolean>({
        transform: booleanAttribute,
    });
    public isFooterShown: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(true, {
        transform: booleanAttribute,
    });

    public pending: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    public isRequestErrorShown: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    public headerActionsButtons: InputSignalWithTransform<IAside.HeaderActionButton[], IAside.HeaderActionButton[]> = input<
        IAside.HeaderActionButton[],
        IAside.HeaderActionButton[]
    >([], {
        transform: (value: IAside.HeaderActionButton[]) => transformArrayInput(value),
    });

    public requestError: InputSignal<INullable<unknown>> = input<INullable<unknown>>(null);
    public submitButtonTitle: InputSignal<string> = input<string>('Save');
    public cancelButtonTitle: InputSignal<string> = input<string>('Discard Changes');
    public submitButtonTooltip: InputSignal<string> = input<string>('');

    public readonly submitAction: OutputEmitterRef<void> = output<void>();
    public readonly cancelAction: OutputEmitterRef<void> = output<void>();
    public readonly headerAction: OutputEmitterRef<AsideButtonsType> = output<AsideButtonsType>();

    public readonly headerTpl: Signal<INullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiAsideContainerHeaderDirective, {
        read: TemplateRef,
    });

    public onSubmit(): void {
        this.submitAction.emit();
    }

    public onCancel(): void {
        this.cancelAction.emit();
    }

    public onHeaderActionClick(buttonName: AsideButtonsType): void {
        this.headerAction.emit(buttonName);
    }
}
