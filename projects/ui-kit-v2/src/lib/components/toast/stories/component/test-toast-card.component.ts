import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { NotificationRef } from '../../../../platform/notification-ref';
import { RtIconButtonComponent } from '../../../icon-button/rt-icon-button.component';

/**
 * Своя карточка для голого тоста: фон, скругление, тень, отступы и кнопка закрытия — её, а не
 * тоста. Так приложение рисует закреплённые тосты статуса. В пакет не уезжает.
 */
@Component({
    selector: 'app-toast-card',
    templateUrl: './test-toast-card.component.html',
    // native-ok: карточка своего тоста в витрине — она и показывает, что голый тост оболочки не рисует; в пакет не уезжает
    styles: `
        .app-toast-card {
            display: flex;
            align-items: flex-start;
            padding: var(--rt-space-2) var(--rt-space-4);
            border-radius: var(--rt-radius-lg);
            background: var(--rt-color-bg-surface);
            box-shadow: var(--rt-shadow-dialog);
            gap: var(--rt-space-2);
        }

        .app-toast-card__body {
            display: flex;
            min-width: 0;
            flex: 1 1 auto;
            flex-direction: column;
            gap: var(--rt-space-0-5);
        }

        .app-toast-card__title {
            font-weight: var(--rt-font-weight-semibold);
        }

        .app-toast-card__text {
            color: var(--rt-color-text-muted);
            font-size: var(--rt-text-xs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtIconButtonComponent,
    ],
})
export class TestRtToastCardComponent {
    readonly #ref: NotificationRef | null = inject(NotificationRef);

    public hide(): void {
        this.#ref?.dismiss();
    }
}
