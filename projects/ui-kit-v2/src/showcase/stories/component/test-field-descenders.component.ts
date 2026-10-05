import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtAutocompleteComponent } from '../../../lib/components/autocomplete/rt-autocomplete.component';
import { RtDatePickerComponent } from '../../../lib/components/date-picker/rt-date-picker.component';
import { RtInputComponent } from '../../../lib/components/input/rt-input.component';
import { RtInputNumberComponent } from '../../../lib/components/input-number/rt-input-number.component';
import { RtMultiselectComponent } from '../../../lib/components/multiselect/rt-multiselect.component';
import { RtSelectComponent } from '../../../lib/components/select/rt-select.component';
import { StoryPresetsComponent } from '../../story-presets.component';
import { StoryRowComponent } from '../../story-row.component';

/** Размер полей ряда. */
export type TFieldDescenderSize = 'sm' | 'md' | 'lg';

/**
 * Демонстрационная обёртка для витрины: текст с нижними выносными — «у», «р», «д» — во всех полях
 * кита и во всех размерах, увеличенный вдвое. Срезанный хвост буквы в обычном кадре занимает
 * пиксель-два и прячется в сглаживании; в увеличенном он виден сразу.
 *
 * В пакет обёртка не уезжает: `tsconfig.lib.json` исключает `src/showcase/**`.
 */
@Component({
    selector: 'app-field-descenders',
    templateUrl: './test-field-descenders.component.html',
    styleUrl: './test-field-descenders.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtAutocompleteComponent,
        RtDatePickerComponent,
        RtInputComponent,
        RtInputNumberComponent,
        RtMultiselectComponent,
        RtSelectComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
    ],
})
export class TestRtFieldDescendersComponent {
    /** Слова, где хвосты у каждой второй буквы. */
    public readonly text: string = 'Группу уроков';

    public readonly sizes: readonly TFieldDescenderSize[] = ['sm', 'md', 'lg'];

    /** Ширина ячейки: поле при увеличении вдвое занимает 24rem. */
    public readonly cellWidth: string = '25rem';

    public readonly sizeLabel: (size: TFieldDescenderSize) => string = (size: TFieldDescenderSize): string => size;
}
