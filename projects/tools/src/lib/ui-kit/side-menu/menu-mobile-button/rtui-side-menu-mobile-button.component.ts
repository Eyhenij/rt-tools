import {
    ChangeDetectionStrategy,
    Component,
    InputSignal,
    InputSignalWithTransform,
    OutputEmitterRef,
    booleanAttribute,
    input,
    output,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';

import { Nullable } from '../../../util';

@Component({
    standalone: true,
    selector: 'rtui-side-menu-mobile-button',
    templateUrl: './rtui-side-menu-mobile-button.component.html',
    styleUrls: ['./rtui-side-menu-mobile-button.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatIcon],
})
export class RtuiSideMenuMobileButtonComponent {
    public isVisible: InputSignalWithTransform<Nullable<boolean>, Nullable<boolean>> = input<Nullable<boolean>, Nullable<boolean>>(false, {
        transform: booleanAttribute,
    });
    public icon: InputSignal<string> = input('menu');

    public readonly toggleSideMenuAction: OutputEmitterRef<void> = output<void>();

    public toggleSideMenu(): void {
        this.toggleSideMenuAction.emit();
    }
}
