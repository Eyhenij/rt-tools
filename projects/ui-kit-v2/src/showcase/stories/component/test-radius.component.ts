import { ChangeDetectionStrategy, Component, input, InputSignal, ViewEncapsulation } from '@angular/core';

import { TestRtRadiusControlsComponent } from './test-radius-controls.component';
import { TestRtRadiusSurfacesComponent } from './test-radius-surfaces.component';

/** Какие компоненты показывает сетка: контролы и поверхности идут разными историями. */
export type TRtRadiusGroup = 'controls' | 'surfaces';

/**
 * Демонстрационная обёртка для витрины: каждый компонент с поверхностью на каждом шаге входа
 * `radius`. Первый столбец — умолчание компонента, без входа: по нему видно, что шаг меняет, а
 * что компонент держит своим. Контролы и поверхности лежат в двух обёртках: одна сетка на все
 * компоненты перерастает предел сложности шаблона.
 *
 * В пакет обёртка не уезжает: `tsconfig.lib.json` исключает `src/showcase/**`.
 */
@Component({
    selector: 'app-radius',
    templateUrl: './test-radius.component.html',
    styleUrl: './test-radius.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [TestRtRadiusControlsComponent, TestRtRadiusSurfacesComponent],
})
export class TestRtRadiusComponent {
    /** Какие компоненты показывает сетка. */
    public readonly group: InputSignal<TRtRadiusGroup> = input<TRtRadiusGroup>('controls');
}
