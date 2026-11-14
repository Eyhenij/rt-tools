import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { STORY_TRIGGER_ATTRIBUTE } from '../../../../../showcase/story-overlay';
import { IRtSelect } from '../../../select/rt-select.model';
import { RtMultiselectEmptyDirective } from '../../rt-multiselect-empty.directive';
import { RtMultiselectComponent } from '../../rt-multiselect.component';

/**
 * Свой вид пустого списка `rt-multiselect` — по одобренному кадру. Шаблон `rtMultiselectEmpty` стоит в панели
 * вместо строки «Нет вариантов»; сама строка показана историей `PanelEmpty` матрицы.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-multiselect-states',
    templateUrl: './test-multiselect-states.component.html',
    styleUrl: './test-multiselect-states.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        ReactiveFormsModule,

        // components
        RtMultiselectComponent,

        // directives
        RtMultiselectEmptyDirective,
    ],
})
export class TestRtMultiselectStatesComponent {
    public readonly triggerAttribute: string = STORY_TRIGGER_ATTRIBUTE;

    public readonly noOptions: ReadonlyArray<IRtSelect.Option<string>> = [];

    public readonly control: FormControl<readonly string[] | null> = new FormControl<readonly string[] | null>(null);
}
