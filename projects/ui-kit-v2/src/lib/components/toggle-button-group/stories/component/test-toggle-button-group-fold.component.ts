import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtToggleButtonGroupComponent } from '../../rt-toggle-button-group.component';
import { IRtToggleButtonGroup } from '../../rt-toggle-button-group.model';

/**
 * Группа в рамке телефона. Рамка шириной ровно 375 (а не `max-width`): свёртка идёт по замеру
 * `ResizeObserver` ширины места группы, и место должно быть жёстко заданным, иначе рамка
 * растянется по кнопкам и группе нечего сворачивать. Отступ по бокам 16, как в эскизе.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-toggle-button-group-fold',
    templateUrl: './test-toggle-button-group-fold.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtToggleButtonGroupComponent,
    ],
})
export class TestRtToggleButtonGroupFoldComponent {
    public options: ReadonlyArray<IRtToggleButtonGroup.Option<string>> = [];
    public multiple: boolean = false;
    public value: string | undefined = undefined;
    public values: ReadonlyArray<string> = [];
    public fold: boolean = true;
}
