import { ChangeDetectionStrategy, Component, input, InputSignal, Signal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOption } from '@angular/material/autocomplete';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatSelect } from '@angular/material/select';

import { EPosition } from '@rt-tools/core';
import { ElemDirective } from '@rt-tools/core';
import { EInfoBadgeSize } from '../../../badge-info-enum';
import { TIconSideType } from '../../../icon-side.type';
import { RtuiInfoBadgeComponent } from '../../../info-badge.component';
import { EInfoBadgeType } from '../../../info-badge-types.enum';
import { TestInfoBadgeDirective } from '../../directives/test-info-badge.directive';
import { TInfoBadgePropertyType } from '../../utils/enum/info-badge-property.enum';

@Component({
    selector: 'rtui-test-info-badge',
    imports: [
        RtuiInfoBadgeComponent,
        TestInfoBadgeDirective,
        ElemDirective,
        MatCheckbox,
        FormsModule,
        MatOption,
        MatSelect,
        MatRadioGroup,
        MatRadioButton,
    ],
    templateUrl: './test-info-badge.component.html',
    styleUrl: './test-info-badge.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestInfoBadgeComponent {
    public property: InputSignal<TInfoBadgePropertyType> = input.required();
    public text: Signal<string> = signal('Test info');
    public textLengthy: Signal<string> = signal(
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias autem illo iure nulla porro, reiciendis.'
    );

    public isFontBold: boolean = false;
    public isWithIcon: string = '';
    public iconSide: TIconSideType = EPosition.RIGHT;

    public readonly badgeSizes: typeof EInfoBadgeSize = EInfoBadgeSize;
    public readonly badgeTypes: typeof EInfoBadgeType = EInfoBadgeType;
    public readonly positions: typeof EPosition = EPosition;

    public toggleFontBold(): void {
        this.isFontBold = !this.isFontBold;
    }

    public toggleWithIcon(): void {
        this.isWithIcon = this.isWithIcon ? '' : 'alternate_email';
    }

    public toggleIconLocation(): void {
        this.iconSide = this.iconSide == EPosition.RIGHT ? EPosition.LEFT : EPosition.RIGHT;
    }
}
