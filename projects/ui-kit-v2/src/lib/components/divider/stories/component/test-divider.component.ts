import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtDividerComponent } from '../../rt-divider.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое Storybook вешает
 * контролы. Разделитель стоит между двумя строками, а вертикальный — между двумя словами строки:
 * одна линия без соседей не показывает, что она разделяет. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-divider',
    template: `
        @if (vertical) {
            <div class="app-divider-demo__row">
                <span>Номера</span>
                <rt-divider vertical [inset]="inset" />
                <span>Тарифы</span>
            </div>
        } @else {
            <div class="app-divider-demo__column">
                <span>Номера</span>
                <rt-divider [inset]="inset" />
                <span>Тарифы</span>
            </div>
        }
    `,
    // native-ok: раскладка соседей разделителя в витрине, в пакет не уезжает
    styles: `
        .app-divider-demo__column {
            display: flex;
            width: 20rem;
            flex-direction: column;
            gap: var(--rt-space-2);
        }

        .app-divider-demo__row {
            display: flex;
            height: var(--rt-control-height-md);
            align-items: center;
            gap: var(--rt-space-4);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtDividerComponent,
    ],
})
export class TestRtDividerComponent {
    public vertical: boolean = false;
    public inset: boolean = false;
}
