import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { NotificationRef } from '../../../../platform/notification-ref';
import { RtButtonDirective } from '../../../button/rt-button.directive';
import { RT_TOAST_DATA } from '../../rt-toaster.model';

/** Данные своего тоста: какой набор обновляется. */
export interface IToastRefreshData {
    readonly dataset: string;
}

/**
 * Свой компонент тоста для витрины: набор берёт из данных `RT_TOAST_DATA`, а кнопка закрывает
 * тост ручкой `NotificationRef`, полученной инъекцией. В пакет не уезжает.
 */
@Component({
    selector: 'app-toast-refresh',
    template: `
        <div class="app-toast-refresh">
            <span class="app-toast-refresh__title">Набор «{{ data.dataset }}» обновляется</span>
            <span class="app-toast-refresh__text">Отчёты покажут новые цифры после обновления.</span>
            <button rtButton qa-dataid="toast-refresh-hide" size="sm" theme="secondary" appearance="text" type="button" (click)="hide()">
                Скрыть
            </button>
        </div>
    `,
    // native-ok: раскладка своего содержимого тоста в витрине, в пакет не уезжает
    styles: `
        .app-toast-refresh {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: var(--rt-space-0-5);
        }

        .app-toast-refresh__title {
            font-weight: var(--rt-font-weight-semibold);
        }

        .app-toast-refresh__text {
            color: var(--rt-color-text-muted);
            font-size: var(--rt-text-xs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // directives
        RtButtonDirective,
    ],
})
export class TestRtToastRefreshComponent {
    readonly #ref: NotificationRef | null = inject(NotificationRef);

    public readonly data: IToastRefreshData = inject(RT_TOAST_DATA) as IToastRefreshData;

    public hide(): void {
        this.#ref?.dismiss();
    }
}
