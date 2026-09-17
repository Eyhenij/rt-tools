import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    Signal,
    ViewEncapsulation,
    WritableSignal,
    computed,
    effect,
    inject,
    signal,
    untracked,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RtActionBarComponent } from './rt-action-bar.component';
import { IRtActionBar, RT_ACTION_BAR_LEAVE_MS } from './rt-action-bar.model';
import { RtActionBarService } from './rt-action-bar.service';

const BEM_BLOCK: string = 'rt-action-bar-holder';

/**
 * Держатель полосы массовых действий: решает, стоит ли она в разметке, и прикалывает
 * её над страницей. Настройку читает у службы, которую потребитель объявил на своём
 * уровне — там, где у него живёт список.
 *
 * Полоса открывается счётом выбранного, а не своим признаком: два источника одного
 * признака расходятся молча, и признак, оставшийся поднятым над опустевшим выбором,
 * держал бы полосу над страницей, где ничего не выбрано.
 *
 * После закрытия полоса остаётся в разметке ровно на длительность ухода — число одно
 * и лежит в договоре рядом. Разойдясь с правилом стиля, держатель обрывал бы уход на
 * полпути.
 */
@Component({
    selector: 'rt-action-bar-holder',
    templateUrl: './rt-action-bar-holder.component.html',
    styleUrl: './rt-action-bar-holder.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [RtActionBarComponent, BlockDirective, ElemDirective, ModDirective],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtActionBarHolderComponent {
    readonly #service: RtActionBarService = inject(RtActionBarService);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    /** Уходит ли полоса прямо сейчас: разметка держит её, пока правило стиля не доиграет. */
    readonly #leaving: WritableSignal<boolean> = signal<boolean>(false);

    #leaveTimer: ReturnType<typeof setTimeout> | null = null;

    /**
     * Была ли полоса открыта до этой перемены. Без этого признака уходу не с чего начаться:
     * к минуте, когда выбранное обнулилось, и «открыта», и «стоит в разметке» уже ложь, так
     * что условие по ним не срабатывает никогда. В первом ките оно написано именно так, и
     * уход там не заводится вовсе — образец прочитан, а не перенесён.
     */
    #wasOpened: boolean = false;

    protected readonly config: Signal<IRtActionBar.Config> = this.#service.config;

    /** Выбрано ли что-нибудь: этим полоса и открывается. */
    protected readonly opened: Signal<boolean> = computed((): boolean => this.config().selected > 0);

    /** Стоит ли полоса в разметке: она остаётся в ней и на время ухода. */
    protected readonly shown: Signal<boolean> = computed((): boolean => this.opened() || this.#leaving());

    protected readonly leaving: Signal<boolean> = this.#leaving.asReadonly();

    constructor() {
        effect((): void => {
            const opened: boolean = this.opened();

            untracked((): void => {
                this.#clearLeaveTimer();

                if (opened) {
                    this.#wasOpened = true;
                    this.#leaving.set(false);

                    return;
                }

                if (this.#wasOpened) {
                    this.#wasOpened = false;
                    this.#startLeaving();
                }
            });
        });

        this.#destroyRef.onDestroy((): void => this.#clearLeaveTimer());
    }

    /** Крестик сообщает наружу; выбранное отпускает служба, которой список и владеет. */
    protected onClosed(): void {
        this.#service.clearSelection();
    }

    /** Полоса остаётся в разметке на время ухода и снимается по его концу. */
    #startLeaving(): void {
        this.#leaving.set(true);
        this.#leaveTimer = setTimeout((): void => {
            this.#leaving.set(false);
            this.#leaveTimer = null;
        }, RT_ACTION_BAR_LEAVE_MS);
    }

    #clearLeaveTimer(): void {
        if (this.#leaveTimer !== null) {
            clearTimeout(this.#leaveTimer);
            this.#leaveTimer = null;
        }
    }
}
