import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { STORY_TRIGGER_ATTRIBUTE } from '../../../../../showcase/story-overlay';
import { RtSelectEmptyDirective } from '../../rt-select-empty.directive';
import { RtSelectComponent } from '../../rt-select.component';
import { IRtSelect } from '../../rt-select.model';

/**
 * Свой вид пустого списка `rt-select` — по одобренному кадру. Шаблон `rtSelectEmpty` стоит в панели
 * вместо строки «Нет вариантов»; сама строка показана историей `PanelEmpty` матрицы.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-select-states',
    templateUrl: './test-select-states.component.html',
    styleUrl: './test-select-states.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        ReactiveFormsModule,

        // components
        RtSelectComponent,

        // directives
        RtSelectEmptyDirective,
    ],
})
export class TestRtSelectStatesComponent {
    public readonly triggerAttribute: string = STORY_TRIGGER_ATTRIBUTE;

    public readonly noOptions: ReadonlyArray<IRtSelect.Option<string>> = [];

    public readonly control: FormControl<string | null> = new FormControl<string | null>(null);
}
