import { CdkTrapFocus } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import { NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    contentChild,
    Directive,
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

import { BlockDirective, ElemDirective } from '../../../../bem';
import { AsideButtonsType, IAside, Nullable, transformArrayInput } from '../../../../util';
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

@Component({
    selector: 'rtui-aside-container',
    templateUrl: './aside-container.component.html',
    styleUrls: ['./aside-container.component.scss'],
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
        class: 'c-aside',
    },
})
export class RtuiAsideContainerComponent {
    public title: InputSignal<Nullable<string>> = input<Nullable<string>>(null);
    public isMobile: InputSignalWithTransform<boolean, BooleanInput> = input.required<boolean, BooleanInput>({
        transform: booleanAttribute,
    });
    public isSubmitButtonDisabled: InputSignalWithTransform<boolean, BooleanInput> = input.required<boolean, BooleanInput>({
        transform: booleanAttribute,
    });
    public pending: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
    public isRequestErrorShown: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });
    public headerActionsButtons: InputSignalWithTransform<IAside.HeaderActionButton[], IAside.HeaderActionButton[]> = input<
        IAside.HeaderActionButton[],
        IAside.HeaderActionButton[]
    >([], {
        transform: (value: IAside.HeaderActionButton[]) => transformArrayInput(value),
    });

    public requestError: InputSignal<Nullable<HttpErrorResponse>> = input<Nullable<HttpErrorResponse>>(null);
    public submitButtonTitle: InputSignal<string> = input<string>('Save');
    public cancelButtonTitle: InputSignal<string> = input<string>('Discard Changes');
    public submitButtonTooltip: InputSignal<string> = input<string>('');

    public readonly submitAction: OutputEmitterRef<void> = output<void>();
    public readonly cancelAction: OutputEmitterRef<void> = output<void>();
    public readonly headerAction: OutputEmitterRef<AsideButtonsType> = output<AsideButtonsType>();

    public readonly headerTpl: Signal<Nullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiAsideContainerHeaderDirective, {
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
