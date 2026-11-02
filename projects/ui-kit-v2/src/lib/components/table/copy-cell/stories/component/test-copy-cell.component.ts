import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtCopyCellComponent } from '../../rt-copy-cell.component';
import { IRtIconButton } from '../../../../icon-button/rt-icon-button.model';
import { StoryRowComponent } from '../../../../../../showcase/story-row.component';

/** Какой показ рисовать: управляемую ячейку или ряд ячеек в рамке. */
export type TCopyCellStoryPart = 'playground' | 'framed';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 *
 * Ряд `framed` стоит в ячейках узкой ширины: короткое значение помещается в строку, длинный
 * адрес переносится на вторую, как в форме панели подключения на телефоне.
 */
@Component({
    selector: 'app-copy-cell',
    // native-ok: обёртка истории витрины — показ живёт рядом с историей, а не отдельным файлом разметки
    template: `
        @switch (part) {
            @case ('framed') {
                <app-story-row caption="Ячейка в рамке поля" [items]="framedValues" [slotWidth]="framedWidth">
                    <ng-template let-framedValue>
                        <rt-copy-cell framed>{{ framedValue }}</rt-copy-cell>
                    </ng-template>
                </app-story-row>
            }

            @default {
                <rt-copy-cell [value]="value" [variant]="variant" [revealOnHover]="revealOnHover" [framed]="framed" />
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtCopyCellComponent,

        // showcase
        StoryRowComponent,
    ],
})
export class TestRtCopyCellComponent {
    public part: TCopyCellStoryPart = 'playground';
    public value: string | number | null = null;
    public variant: IRtIconButton.Variant = 'ghost';
    public revealOnHover: boolean = true;
    public framed: boolean = false;

    /** Ширина ячейки ряда: узкая, как форма панели на телефоне, чтобы длинный адрес перенёсся. */
    public readonly framedWidth: string = '20rem';

    public readonly framedValues: readonly string[] = ['sk_test_51Hx', 'https://example.com/payments/hooks/platform'];
}
