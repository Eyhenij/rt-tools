import { ChangeDetectionStrategy, Component, InputSignal, Signal, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOption } from '@angular/material/autocomplete';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatSelect } from '@angular/material/select';

import { ElemDirective } from '../../../../../bem';
import { INFO_BADGE_SIZE_ENUM } from '../../../badge-info-enum';
import { InfoBadgeComponent } from '../../../info-badge.component';
import { TestInfoBadgeDirective } from '../../directives/test-info-badge.directive';
import { ICON_SIDE_ENUM, IconSideType } from '../../utils/enum/Icon-side.enum';
import { InfoBadgePropertyType } from '../../utils/enum/info-badge-property.enum';
import { INFO_BADGE_TYPE_ENUM } from '../../utils/enum/info-badge-types.enum';

@Component({
    selector: 'rtui-test-info-badge',
    standalone: true,
    imports: [
        InfoBadgeComponent,
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
    public iconSide: IconSideType = ICON_SIDE_ENUM.RIGHT;

    public readonly badgeSizes: typeof INFO_BADGE_SIZE_ENUM = INFO_BADGE_SIZE_ENUM;
    public readonly badgeTypes: typeof INFO_BADGE_TYPE_ENUM = INFO_BADGE_TYPE_ENUM;
    public readonly iconSides: typeof ICON_SIDE_ENUM = ICON_SIDE_ENUM;

    public toggleFontBold(): void {
        this.isFontBold = !this.isFontBold;
    }

    public toggleWithIcon(): void {
        this.isWithIcon = this.isWithIcon ? '' : 'alternate_email';
    }

    public toggleIconLocation(): void {
        this.iconSide = this.iconSide == ICON_SIDE_ENUM.RIGHT ? ICON_SIDE_ENUM.LEFT : ICON_SIDE_ENUM.RIGHT;
    }
}
