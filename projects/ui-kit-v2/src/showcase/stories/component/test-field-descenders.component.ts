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
    template: `
        <app-story-presets caption="Хвосты букв в полях кита, увеличение вдвое">
            <ng-template>
                <app-story-row [items]="sizes" [itemLabel]="sizeLabel" [slotWidth]="cellWidth">
                    <ng-template let-size>
                        <div class="app-field-descenders">
                            <rt-select [size]="size" [placeholder]="text" [options]="[]" />
                            <rt-multiselect [size]="size" [placeholder]="text" [options]="[]" />
                            <rt-input [size]="size" [placeholder]="text" />
                            <rt-autocomplete [size]="size" [placeholder]="text" />
                            <rt-input-number [size]="size" [placeholder]="text" />
                            <rt-date-picker [size]="size" />
                        </div>
                    </ng-template>
                </app-story-row>
            </ng-template>
        </app-story-presets>
    `,
    styles: [
        `
            .app-field-descenders {
                display: grid;
                width: 12rem;
                gap: 0.5rem;
                zoom: 2;
            }
        `,
    ],
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
