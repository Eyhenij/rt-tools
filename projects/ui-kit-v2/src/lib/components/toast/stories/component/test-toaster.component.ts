import { afterNextRender, ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { NotificationBus } from '../../../../platform/notification-bus.service';
import { RtButtonDirective } from '../../../button/rt-button.directive';
import { RtToasterComponent } from '../../rt-toaster.component';
import { IRtToaster } from '../../rt-toaster.model';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 *
 * Стопка показывает то, что пришло шиной, — входом плашки в неё не положить. Поэтому обёртка
 * сама шлёт три уведомления после первой отрисовки: без них в кадре не было бы ни одной плашки,
 * и показ ничего бы не подтверждал. Отправка идёт после отрисовки, а не в конструкторе: стопка
 * подписывается на шину при подъёме, и посланное раньше до неё не доедет.
 */
@Component({
    selector: 'app-toaster',
    template: `
        <p>Уведомления посланы шиной — стопка показывает их в углу показа.</p>
        <p>
            <button rtButton qa-dataid="toaster-send-progress" size="sm" type="button" (click)="sendWithProgress()">С полосой срока</button>
            <button rtButton qa-dataid="toaster-send-sticky" size="sm" theme="secondary" type="button" (click)="sendSticky()">
                До крестика
            </button>
        </p>
        <rt-toaster [position]="position" [duration]="duration" [visibleToasts]="visibleToasts" [expand]="expand" [mode]="mode" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtButtonDirective,
        RtToasterComponent,
    ],
})
export class TestRtToasterComponent {
    readonly #bus: NotificationBus = inject(NotificationBus);

    public position: IRtToaster.Position = 'bottom-right';
    public duration: number = 4000;
    public visibleToasts: number = 3;
    public expand: boolean = false;
    public mode: IRtToaster.Mode = 'stack';

    constructor() {
        afterNextRender((): void => {
            this.#bus.info('Договор сохранён');
            this.#bus.warning('Черновик не сохранён');
            this.#bus.error('Не удалось отправить письмо');
        });
    }

    public sendWithProgress(): void {
        this.#bus.info('Отчёт формируется', 'info', { progress: true, duration: 6000, description: 'Полоса сжимается вместе с таймером' });
    }

    public sendSticky(): void {
        this.#bus.warning('Нужен ваш ответ', 'warning', { duration: null, description: 'Тост уйдёт только по крестику' });
    }
}
