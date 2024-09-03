import { ChangeDetectionStrategy, Component, InputSignal, Signal, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOption } from '@angular/material/autocomplete';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatSelect } from '@angular/material/select';

import { ElemDirective } from '../../../../../bem';
import { POSITION_ENUM } from '../../../../../util/enums/position.enum';
import { INFO_BADGE_SIZE_ENUM } from '../../../badge-info-enum';
import { IconSideType } from '../../../icon-side.type';
import { INFO_BADGE_TYPE_ENUM } from '../../../info-badge-types.enum';
import { RtuiInfoBadgeComponent } from '../../../info-badge.component';
import { TestInfoBadgeDirective } from '../../directives/test-info-badge.directive';
import { InfoBadgePropertyType } from '../../utils/enum/info-badge-property.enum';

@Component({
    selector: 'rtui-test-info-badge',
    standalone: true,
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
    public property: InputSignal<InfoBadgePropertyType> = input.required();
    public text: Signal<string> = signal('Test info');
    public textLengthy: Signal<string> = signal(
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias autem illo iure nulla porro, reiciendis.'
    );

    public isFontBold: boolean = false;
    public isWithIcon: string = '';
    public iconSide: IconSideType = POSITION_ENUM.RIGHT;

    public readonly badgeSizes: typeof INFO_BADGE_SIZE_ENUM = INFO_BADGE_SIZE_ENUM;
    public readonly badgeTypes: typeof INFO_BADGE_TYPE_ENUM = INFO_BADGE_TYPE_ENUM;
    public readonly positions: typeof POSITION_ENUM = POSITION_ENUM;

    public toggleFontBold(): void {
        this.isFontBold = !this.isFontBold;
    }

    public toggleWithIcon(): void {
        this.isWithIcon = this.isWithIcon ? '' : 'alternate_email';
    }

    public toggleIconLocation(): void {
        this.iconSide = this.iconSide == POSITION_ENUM.RIGHT ? POSITION_ENUM.LEFT : POSITION_ENUM.RIGHT;
    }
}
