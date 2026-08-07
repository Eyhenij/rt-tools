import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtButtonDirective } from '../../../button/rt-button.directive';
import { RtDialogFooterComponent } from '../../footer/rt-dialog-footer.component';
import { RtDialogHeaderComponent } from '../../header/rt-dialog-header.component';
import { IRtDialogSize, RtDialogComponent } from '../../rt-dialog.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 *
 * Внутрь положены шапка, текст и подвал: пустое окно показывало бы одну коробку, а не окно.
 */
@Component({
    selector: 'app-dialog',
    template: `
        <rt-dialog [size]="size" [width]="width" [ariaLabel]="ariaLabel">
            <rt-dialog-header title="Удалить запись?" />
            <p class="app-dialog__text">Действие необратимо: запись исчезнет вместе с приложенными файлами.</p>
            <rt-dialog-footer>
                <button rtButton type="button" theme="secondary" appearance="text" label="Отмена" aria-label="Отмена"></button>
                <button rtButton type="button" theme="danger" label="Удалить" aria-label="Удалить"></button>
            </rt-dialog-footer>
        </rt-dialog>
    `,
    styles: `
        /* Текст окна — демонстрационное содержимое: своих отступов у проекции нет. */
        .app-dialog__text {
            margin: 0;
            color: var(--rt-color-text-primary);
            font-size: var(--rt-text-sm);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtButtonDirective,
        RtDialogComponent,
        RtDialogFooterComponent,
        RtDialogHeaderComponent,
    ],
})
export class TestRtDialogComponent {
    public size: IRtDialogSize = 'md';
    public width: string | null = null;
    public ariaLabel: string | null = null;
}
