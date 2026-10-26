import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal, WritableSignal } from '@angular/core';

import { RtButtonDirective } from '../../../button/rt-button.directive';
import { RtProgressBarComponent } from '../../rt-progress-bar.component';

/** Шаг живого прогресса: столько процентов прибавляет один тик. */
const STEP: number = 7;

/** Пауза между тиками, мс: полоса успевает доиграть движение до следующего. */
const TICK_MS: number = 400;

/**
 * Живой прогресс для витрины: доля растёт тиками, как приходит из потока задачи, и полоса идёт
 * следом. Кнопка запускает заново. Показ — отдельный компонент, чтобы у каждой половины пары
 * наборов был свой счётчик. В пакет не уезжает.
 */
@Component({
    selector: 'app-progress-bar-live',
    templateUrl: './test-progress-bar-live.component.html',
    // native-ok: раскладка показа витрины, в пакет не уезжает
    styles: `
        .app-progress-bar-live {
            display: flex;
            width: 20rem;
            flex-direction: column;
            align-items: flex-start;
            gap: var(--rt-space-2);
        }

        .app-progress-bar-live rt-progress-bar {
            align-self: stretch;
        }

        .app-progress-bar-live__note {
            color: var(--rt-color-text-muted);
            font-size: var(--rt-text-xs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtProgressBarComponent,

        // directives
        RtButtonDirective,
    ],
})
export class TestRtProgressBarLiveComponent {
    #timer: ReturnType<typeof setInterval> | null = null;

    public readonly value: WritableSignal<number> = signal(0);

    constructor() {
        inject(DestroyRef).onDestroy((): void => this.#stop());
    }

    public run(): void {
        this.#stop();
        this.value.set(0);
        this.#timer = setInterval((): void => {
            this.value.update((value: number): number => Math.min(100, value + STEP));
            if (this.value() >= 100) {
                this.#stop();
            }
        }, TICK_MS);
    }

    #stop(): void {
        if (this.#timer !== null) {
            clearInterval(this.#timer);
            this.#timer = null;
        }
    }
}
