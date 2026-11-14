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
    template: `
        <div class="app-multiselect-states__panel-slot">
            <rt-multiselect
                ariaLabel="Список со своим видом пустого"
                placeholder="Выберите города"
                [attr.data-story-trigger]="triggerAttribute"
                [options]="noOptions"
                [formControl]="control">
                <ng-template rtMultiselectEmpty>
                    <div [style]="slotStyle">
                        <strong>Свой вид пустого</strong>
                        <span [style]="slotHintStyle">Разметка приложения</span>
                    </div>
                </ng-template>
            </rt-multiselect>
        </div>
    `,
    styles: `
        /* Панель уезжает в контейнер оверлеев и ложится поверх страницы: без запаса снизу
           она вышла бы за нижний край окна. */
        .app-multiselect-states__panel-slot {
            width: 20rem;
            padding-bottom: 12rem;
        }
    `,
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

    /** Рамка своего шаблона: пунктир показывает, где кончается разметка приложения. */
    public readonly slotStyle: string =
        'display: grid; gap: var(--rt-space-1); margin: calc(var(--rt-space-2) + var(--rt-space-1)); padding: calc(var(--rt-space-2) + var(--rt-space-1)); border: 1px dashed var(--rt-color-border-strong); border-radius: var(--rt-radius-md); text-align: center';

    public readonly slotHintStyle: string = 'color: var(--rt-color-text-muted); font-size: var(--rt-text-sm)';
}
