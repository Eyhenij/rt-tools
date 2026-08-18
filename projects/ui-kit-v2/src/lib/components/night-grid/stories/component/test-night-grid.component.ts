import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtNightGridComponent } from '../../rt-night-grid.component';
import { IRtNightGrid } from '../../rt-night-grid.model';

/** Раздаёт видам занятости по кругу: каждая седьмая ночь занята, каждая пятая — под вопросом. */
function nightState(day: number): IRtNightGrid.State {
    if (day % 7 === 0) {
        return 'primary';
    }

    return day % 5 === 0 ? 'secondary' : 'free';
}

/** Занятость марта: свободные ночи вперемежку с двумя видами занятых. */
const MARCH: readonly IRtNightGrid.Cell[] = Array.from({ length: 31 }, (_: unknown, index: number): IRtNightGrid.Cell => {
    const day: number = index + 1;
    const state: IRtNightGrid.State = nightState(day);

    return {
        state,
        id: `2026-03-${String(day).padStart(2, '0')}`,
        title: state === 'free' ? `${day} марта — свободно` : `${day} марта — занято`,
    };
});

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 *
 * Месяц задан здесь, а не значением истории: сетка без клеток не рисует ничего, и такой показ
 * покрытием не считается.
 */
@Component({
    selector: 'app-night-grid',
    template: `
        <rt-night-grid [cells]="cells" [ariaLabel]="ariaLabel" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtNightGridComponent,
    ],
})
export class TestRtNightGridComponent {
    public cells: ReadonlyArray<IRtNightGrid.Cell> = MARCH;
    public ariaLabel: string = 'Март';
}
