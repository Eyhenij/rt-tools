import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { mergeMap, Subject } from 'rxjs';

import { INotification } from '../../../../platform/notification.model';
import { NotificationBus } from '../../../../platform/notification-bus.service';
import { NotificationRef } from '../../../../platform/notification-ref';
import { RtButtonDirective } from '../../../button/rt-button.directive';
import { RtToasterComponent } from '../../rt-toaster.component';
import { TestRtToastRefreshComponent } from './test-toast-refresh.component';

/** Шаг живой доли за тик и пауза между тиками. */
const STEP: number = 9;
const TICK_MS: number = 500;

/**
 * Ручка тоста вживую: доля задачи идёт тиками и закрывает тост на ста, ошибка несёт подробности
 * с копированием, свой компонент закрывает себя сам. Строка внизу пишет, почему ушёл последний
 * тост, — это ответ `afterDismissed()`. В пакет не уезжает.
 */
@Component({
    selector: 'app-toaster-handle',
    template: `
        <div class="app-toaster-handle">
            <div class="app-toaster-handle__buttons">
                <button rtButton qa-dataid="toaster-handle-progress" size="sm" type="button" (click)="runRefresh()">Обновить набор</button>
                <button rtButton qa-dataid="toaster-handle-network" size="sm" theme="secondary" type="button" (click)="toggleNetwork()">
                    {{ offline() ? 'Сеть вернулась' : 'Сеть пропала' }}
                </button>
                <button rtButton qa-dataid="toaster-handle-details" size="sm" theme="secondary" type="button" (click)="sendError()">
                    Ошибка с подробностями
                </button>
                <button rtButton qa-dataid="toaster-handle-component" size="sm" theme="secondary" type="button" (click)="sendComponent()">
                    Свой компонент
                </button>
            </div>
            <span class="app-toaster-handle__log" qa-dataid="toaster-handle-log">Последний ушёл: {{ lastReason() }}</span>
        </div>
        <rt-toaster position="bottom-right" />
    `,
    // native-ok: раскладка кнопок показа витрины, в пакет не уезжает
    styles: `
        .app-toaster-handle {
            display: flex;
            flex-direction: column;
            gap: var(--rt-space-2);
        }

        .app-toaster-handle__buttons {
            display: flex;
            flex-wrap: wrap;
            gap: var(--rt-space-2);
        }

        .app-toaster-handle__log {
            color: var(--rt-color-text-muted);
            font-size: var(--rt-text-xs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtToasterComponent,

        // directives
        RtButtonDirective,
    ],
})
export class TestRtToasterHandleComponent {
    readonly #bus: NotificationBus = inject(NotificationBus);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    /** Ручки открытых тостов: подписка на их уход объявлена один раз, в конструкторе. */
    readonly #trackSource: Subject<NotificationRef> = new Subject<NotificationRef>();

    #timer: ReturnType<typeof setInterval> | null = null;
    #networkRef: NotificationRef | null = null;

    public readonly lastReason: WritableSignal<string> = signal('—');
    public readonly offline: WritableSignal<boolean> = signal(false);

    constructor() {
        this.#destroyRef.onDestroy((): void => this.#stopTimer());
        this.#trackSource
            .pipe(
                mergeMap((ref: NotificationRef) => ref.afterDismissed()),
                takeUntilDestroyed()
            )
            .subscribe((reason: INotification.CloseReason): void => this.lastReason.set(reason));
    }

    /** Доля идёт тиками; на ста тост меняется на «готово» и закрывается ручкой. */
    public runRefresh(): void {
        this.#stopTimer();
        let value: number = 0;
        const ref: NotificationRef = this.#track(
            this.#bus.open({ message: 'Обновление набора «Продажи»', severity: 'info', duration: null, progressValue: 0 })
        );

        this.#timer = setInterval((): void => {
            value = Math.min(100, value + STEP);
            ref.update({ progressValue: value });
            if (value >= 100) {
                this.#stopTimer();
                ref.update({ message: 'Набор «Продажи» обновлён', severity: 'success', progressValue: null });
                setTimeout((): void => ref.dismiss(), 1500);
            }
        }, TICK_MS);
    }

    /** Сеть пропала — тост висит; вернулась — тот же тост закрывается ручкой. */
    public toggleNetwork(): void {
        if (this.#networkRef === null) {
            this.#networkRef = this.#track(
                this.#bus.open({
                    message: 'Нет соединения',
                    severity: 'warning',
                    duration: null,
                    description: 'Изменения сохранятся позже',
                })
            );
            this.offline.set(true);
            return;
        }

        this.#networkRef.dismiss();
        this.#networkRef = null;
        this.offline.set(false);
    }

    public sendError(): void {
        this.#track(
            this.#bus.open({
                message: 'Токен отчёта отклонён',
                severity: 'danger',
                duration: null,
                description: 'Войдите заново, чтобы обновить доступ',
                details: 'HTTP 401 Unauthorized\nrequest-id: 7f3a-91c2\nat ReportEmbed.refreshToken (report-embed.ts:118)',
            })
        );
    }

    public sendComponent(): void {
        this.#track(
            this.#bus.openFromComponent(TestRtToastRefreshComponent, {
                message: 'Обновление набора',
                data: { dataset: 'Гости' },
                duration: null,
            })
        );
    }

    #track(ref: NotificationRef): NotificationRef {
        this.#trackSource.next(ref);
        return ref;
    }

    #stopTimer(): void {
        if (this.#timer !== null) {
            clearInterval(this.#timer);
            this.#timer = null;
        }
    }
}
