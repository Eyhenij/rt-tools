import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    Signal,
    WritableSignal,
    computed,
    effect,
    inject,
    signal,
    untracked,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';
import { IRtActionBar } from '../../action-bar-config.interface';
import { RtActionBarService } from '../../rt-action-bar.service';
import { RtuiActionBarComponent } from '../bar/rtui-action-bar.component';

const BEM_BLOCK: string = 'rtui-action-bar-container';

/**
 * Сколько панель держится в разметке после закрытия — ровно длительность ухода из стилей.
 *
 * Число живёт здесь, а не только в стилях: разметка снимает панель сама, и, разойдясь с
 * правилом стилей, она обрывает уход на полпути.
 */
const LEAVE_DURATION_MS: number = 300;

@Component({
    selector: 'rtui-action-bar-container',
    host: { class: BEM_BLOCK },
    templateUrl: 'rtui-action-bar-container.component.html',
    styleUrls: ['rtui-action-bar-container.component.scss'],
    imports: [RtuiActionBarComponent, BlockDirective, ElemDirective, ModDirective],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RtuiActionBarContainerComponent {
    readonly #actionBarService: RtActionBarService = inject(RtActionBarService);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    /** Уходит ли панель прямо сейчас: разметка держит её, пока правило стилей не доиграет. */
    readonly #leaving: WritableSignal<boolean> = signal(false);

    #leaveTimer: ReturnType<typeof setTimeout> | null = null;

    public readonly config: Signal<IRtActionBar.Config> = this.#actionBarService.config;

    /** Выбрано ли что-нибудь: этим панель и открывается. */
    public readonly opened: Signal<boolean> = computed(() => !!this.config()?.selected);

    /** Стоит ли панель в разметке: она остаётся в ней и на время ухода. */
    public readonly shown: Signal<boolean> = computed(() => this.opened() || this.#leaving());

    public readonly leaving: Signal<boolean> = this.#leaving.asReadonly();

    constructor() {
        effect(() => {
            const opened: boolean = this.opened();

            untracked(() => {
                this.#clearLeaveTimer();

                if (opened) {
                    this.#leaving.set(false);

                    return;
                }

                if (!this.#leaving() && this.shown()) {
                    this.#startLeaving();
                }
            });
        });

        this.#destroyRef.onDestroy(() => this.#clearLeaveTimer());
    }

    public closeBar(): void {
        this.#actionBarService.closeActionBar();
    }

    /** Панель остаётся в разметке на время ухода и снимается по его концу. */
    #startLeaving(): void {
        this.#leaving.set(true);
        this.#leaveTimer = setTimeout(() => {
            this.#leaving.set(false);
            this.#leaveTimer = null;
        }, LEAVE_DURATION_MS);
    }

    #clearLeaveTimer(): void {
        if (this.#leaveTimer !== null) {
            clearTimeout(this.#leaveTimer);
            this.#leaveTimer = null;
        }
    }
}
