import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

import { RtAutocompleteComponent } from '../../../lib/components/autocomplete/rt-autocomplete.component';
import { RtButtonDirective } from '../../../lib/components/button/rt-button.directive';
import { RtCheckboxComponent } from '../../../lib/components/checkbox/rt-checkbox.component';
import { RtDatePickerComponent } from '../../../lib/components/date-picker/rt-date-picker.component';
import { RtIconButtonComponent } from '../../../lib/components/icon-button/rt-icon-button.component';
import { RtInputNumberComponent } from '../../../lib/components/input-number/rt-input-number.component';
import { RtInputComponent } from '../../../lib/components/input/rt-input.component';
import { RtMultiselectComponent } from '../../../lib/components/multiselect/rt-multiselect.component';
import { RtRadioButtonComponent } from '../../../lib/components/radio-button/rt-radio-button.component';
import { RtSelectComponent } from '../../../lib/components/select/rt-select.component';
import { RtSkeletonComponent } from '../../../lib/components/skeleton/rt-skeleton.component';
import { RtSplitButtonComponent } from '../../../lib/components/split-button/rt-split-button.component';
import { IRtSplitButton } from '../../../lib/components/split-button/rt-split-button.model';
import { RtTagComponent } from '../../../lib/components/tag/rt-tag.component';
import { RtTextareaComponent } from '../../../lib/components/textarea/rt-textarea.component';
import { RtToggleButtonGroupComponent } from '../../../lib/components/toggle-button-group/rt-toggle-button-group.component';
import { RtToggleSwitchComponent } from '../../../lib/components/toggle-switch/rt-toggle-switch.component';
import { StoryGridComponent } from '../../story-grid.component';
import { RT_RADIUS_COLUMNS, radiusColumnLabel, TRtRadiusColumn } from './test-radius-columns';

/** Контролы сетки скруглений, по строке на компонент. */
const ROWS: readonly string[] = [
    'button',
    'icon-button',
    'split-button',
    'tag',
    'skeleton',
    'toggle-button-group',
    'toggle-switch',
    'checkbox',
    'radio-button',
    'input',
    'textarea',
    'input-number',
    'select',
    'multiselect',
    'autocomplete',
    'date-picker',
];

/**
 * Демонстрационная обёртка для витрины: каждый контрол на каждом шаге входа `radius`.
 *
 * В пакет обёртка не уезжает: `tsconfig.lib.json` исключает `src/showcase/**`.
 */
@Component({
    selector: 'app-radius-controls',
    templateUrl: './test-radius-controls.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        StoryGridComponent,
        RtAutocompleteComponent,
        RtButtonDirective,
        RtCheckboxComponent,
        RtDatePickerComponent,
        RtIconButtonComponent,
        RtInputComponent,
        RtInputNumberComponent,
        RtMultiselectComponent,
        RtRadioButtonComponent,
        RtSelectComponent,
        RtSkeletonComponent,
        RtSplitButtonComponent,
        RtTagComponent,
        RtTextareaComponent,
        RtToggleButtonGroupComponent,
        RtToggleSwitchComponent,
    ],
})
export class TestRtRadiusControlsComponent {
    protected readonly rows: readonly string[] = ROWS;

    protected readonly columns: readonly TRtRadiusColumn[] = RT_RADIUS_COLUMNS;

    protected readonly columnLabel: (col: TRtRadiusColumn) => string = radiusColumnLabel;

    protected readonly options: readonly { label: string; value: string }[] = [
        { label: 'Москва', value: 'msk' },
        { label: 'Казань', value: 'kzn' },
    ];

    protected readonly menuItems: readonly IRtSplitButton.MenuItem[] = [];
}
