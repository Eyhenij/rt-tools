import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtFileDropComponent } from '../../rt-file-drop.component';
import { IRtFileDrop } from '../../rt-file-drop.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 *
 * Внутрь положено содержимое: область его только оборачивает, и без содержимого история
 * показывала бы пустое место, над которым нечего перетаскивать.
 */
@Component({
    selector: 'app-file-drop',
    template: `
        <rt-file-drop [disabled]="disabled" [overlayLabel]="overlayLabel" [zones]="zones" [accept]="accept">
            <div class="app-file-drop__content">Перетащите сюда файл</div>
        </rt-file-drop>
    `,
    styles: `
        /* Содержимое области — демонстрационное: сама область его только оборачивает. */
        .app-file-drop__content {
            display: flex;
            height: 8rem;
            align-items: center;
            justify-content: center;
            border: 1px dashed var(--rt-color-border-subtle);
            border-radius: var(--rt-radius-sm);
            color: var(--rt-color-text-muted);
            font-size: var(--rt-text-sm);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtFileDropComponent,
    ],
})
export class TestRtFileDropComponent {
    public disabled: boolean = false;
    public overlayLabel: string = '';
    public zones: readonly IRtFileDrop.Zone[] = [];
    public accept: string = '';
}
