import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtBadgeDirective } from '../../rt-badge.directive';
import { IRtBadge } from '../../rt-badge.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое Storybook вешает
 * контролы. Входы кита сигнальные и извне не пишутся — поэтому история целится сюда, а не в саму
 * директиву. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-badge',
    template: `
        <span
            style="display: inline-block; padding: 0.25rem 0"
            [rtBadge]="value"
            [rtBadgeOverlap]="overlap"
            [rtBadgeHidden]="hidden"
            [rtBadgePosition]="position"
            [rtBadgeSize]="size"
            [rtBadgeColor]="color">
            {{ label }}
        </span>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // directives
        RtBadgeDirective,
    ],
})
export class TestRtBadgeComponent {
    public label: string = 'Отели';
    public value: IRtBadge.Value = 12;
    public overlap: boolean = false;
    public hidden: boolean = false;
    public position: IRtBadge.Position = 'above-after';
    public size: IRtBadge.Size = 'md';
    public color: IRtBadge.Color = 'primary';
}
