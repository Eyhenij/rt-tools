import { BooleanInput } from '@angular/cdk/coercion';
import { NgComponentOutlet } from '@angular/common';
import {
    afterNextRender,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    ElementRef,
    HostBinding,
    inject,
    Injector,
    input,
    InputSignal,
    InputSignalWithTransform,
    OnDestroy,
    output,
    OutputEmitterRef,
    signal,
    Signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, TRtKitLabelMap } from '@rt-tools/ui-kit-v2/core';
import { INotification, NotificationRef } from '@rt-tools/ui-kit-v2/core';

import { RtButtonDirective } from '@rt-tools/ui-kit-v2/button';
import { RtCopyValueComponent } from '@rt-tools/ui-kit-v2/copy-value';
import { RtProgressBarComponent } from '@rt-tools/ui-kit-v2/progress-bar';
import { RtIconButtonComponent } from '@rt-tools/ui-kit-v2/icon-button';
import { RtIconComponent } from '@rt-tools/ui-kit-v2/icon';
import { IRtIcon } from '@rt-tools/ui-kit-v2/core';
import { RT_TOAST_DATA, RT_TOAST_SEVERITY_ICONS, RT_TOASTER_GAP_PX, IRtToaster } from './rt-toaster.model';

/** Что нужно своему компоненту тоста: данные и ручка. Меняются они реже прочих полей тоста. */
interface IToastComponentInputs {
    readonly data: unknown;
    readonly ref: NotificationRef | undefined;
}

const BEM_BLOCK: string = 'rt-toast';

const UNMOUNT_DELAY_MS: number = 200;

@Component({
    selector: 'rt-toast',
    templateUrl: './rt-toast.component.html',
    styleUrl: './rt-toast.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        NgComponentOutlet,
        RtButtonDirective,
        RtCopyValueComponent,
        RtIconComponent,
        RtIconButtonComponent,
        RtProgressBarComponent,
        BlockDirective,
        ElemDirective,
    ],
    host: {
        class: BEM_BLOCK,
        role: 'status',
        'aria-atomic': 'true',
    },
})
export class RtToastComponent implements AfterViewInit, OnDestroy {
    readonly #host: ElementRef<HTMLElement> = inject(ElementRef);

    readonly #injector: Injector = inject(Injector);

    /**
     * Данные и ручка своего компонента — отдельным сигналом с равенством по ним: живая доля
     * меняет тост на каждом тике, и без этого компонент создавался бы заново вместе с инжектором.
     */
    readonly #componentInputs: Signal<IToastComponentInputs> = computed(
        (): IToastComponentInputs => ({ data: this.toast().data, ref: this.toast().ref }),
        {
            equal: (left: IToastComponentInputs, right: IToastComponentInputs): boolean =>
                left.data === right.data && left.ref === right.ref,
        }
    );

    readonly #severityIcons: Readonly<Record<INotification.Severity, IRtIcon.Name>> = inject(RT_TOAST_SEVERITY_ICONS);

    readonly #mounted: WritableSignal<boolean> = signal<boolean>(false);

    readonly #removed: WritableSignal<boolean> = signal<boolean>(false);

    readonly #offsetBeforeRemove: WritableSignal<number> = signal<number>(0);

    readonly #initialHeight: WritableSignal<number> = signal<number>(0);

    readonly #heightIndex: Signal<number> = computed((): number =>
        this.heights().findIndex((item: IRtToaster.Height): boolean => item.toastId === this.toast().id)
    );

    readonly #heightBefore: Signal<number> = computed((): number =>
        this.heights().reduce(
            (total: number, item: IRtToaster.Height, itemIndex: number): number =>
                itemIndex >= this.#heightIndex() ? total : total + item.height,
            0
        )
    );

    readonly #offset: Signal<number> = computed((): number => Math.round(this.#heightIndex() * RT_TOASTER_GAP_PX + this.#heightBefore()));

    readonly #positionY: Signal<IRtToaster.PositionY> = computed((): IRtToaster.PositionY =>
        this.position().startsWith('top') ? 'top' : 'bottom'
    );

    #timeoutId: ReturnType<typeof setTimeout> | undefined;

    #unmountTimeoutId: ReturnType<typeof setTimeout> | undefined;

    #remainingTimeMs: number = 0;

    #closeTimerStartedAt: number = 0;

    #closeTimerPausedAt: number = 0;

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    /** Свой значок тоста важнее карты severity; `null` у тоста значок снимает. */
    protected readonly icon: Signal<IRtIcon.Name | null> = computed((): IRtIcon.Name | null => {
        const icon: IRtIcon.Name | null | undefined = this.toast().icon;
        return icon === undefined ? this.#severityIcons[this.toast().severity] : icon;
    });

    /** Срок жизни тоста: свой, если задан, иначе тостера; `null` — таймера нет. */
    protected readonly lifetime: Signal<number | null> = computed((): number | null => {
        const duration: number | null | undefined = this.toast().duration;
        return duration === undefined ? this.duration() : duration;
    });

    /** Инжектор своего компонента: данные токеном `RT_TOAST_DATA` и ручка `NotificationRef`. */
    protected readonly componentInjector: Signal<Injector> = computed((): Injector => {
        const inputs: IToastComponentInputs = this.#componentInputs();

        return Injector.create({
            providers: [
                { provide: RT_TOAST_DATA, useValue: inputs.data },
                { provide: NotificationRef, useValue: inputs.ref ?? null },
            ],
            parent: this.#injector,
        });
    });

    /** Живая доля задачи: число 0–100 — полоса стоит, `null` и пусто — её нет. */
    protected readonly progressValue: Signal<number | null> = computed((): number | null => this.toast().progressValue ?? null);

    /** Подробности раскрыты. */
    protected readonly detailsOpen: WritableSignal<boolean> = signal<boolean>(false);

    /** Голый тост: значка, крестика и полосы срока нет, оболочку снимает модификатор. */
    protected readonly bare: Signal<boolean> = computed((): boolean => this.toast().bare === true);

    protected readonly showProgress: Signal<boolean> = computed(
        (): boolean => !this.bare() && this.toast().progress === true && this.lifetime() !== null
    );

    /** Таймер и полоса срока встают от одного признака, чтобы не разойтись. */
    protected readonly paused: Signal<boolean> = computed((): boolean => this.expanded() || this.interacting());

    public readonly toast: InputSignal<IRtToaster.Toast> = input.required<IRtToaster.Toast>();

    public readonly index: InputSignal<number> = input.required<number>();

    public readonly totalToasts: InputSignal<number> = input.required<number>();

    public readonly heights: InputSignal<IRtToaster.Height[]> = input.required<IRtToaster.Height[]>();

    public readonly expanded: InputSignalWithTransform<boolean, BooleanInput> = input.required<boolean, BooleanInput>({
        transform: booleanAttribute,
    });

    public readonly expandByDefault: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    public readonly interacting: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    public readonly position: InputSignal<IRtToaster.Position> = input<IRtToaster.Position>('bottom-right');

    public readonly visibleToasts: InputSignal<number> = input<number>(3);

    public readonly duration: InputSignal<number> = input<number>(4000);

    public readonly heightAdded: OutputEmitterRef<IRtToaster.Height> = output<IRtToaster.Height>();

    public readonly heightRemoved: OutputEmitterRef<number> = output<number>();

    public readonly dismissed: OutputEmitterRef<number> = output<number>();

    @HostBinding('class')
    public get hostModifierClasses(): Record<string, boolean> {
        return {
            [`${BEM_BLOCK}--severity--${this.toast().severity}`]: true,
            [`${BEM_BLOCK}--filled`]: this.toast().filled === true,
            [`${BEM_BLOCK}--bare`]: this.bare(),
            [`${BEM_BLOCK}--y--${this.#positionY()}`]: true,
            [`${BEM_BLOCK}--mounted`]: this.#mounted(),
            [`${BEM_BLOCK}--removed`]: this.#removed(),
            [`${BEM_BLOCK}--front`]: this.index() === 0,
            [`${BEM_BLOCK}--hidden`]: this.index() + 1 > this.visibleToasts(),
            [`${BEM_BLOCK}--expanded`]: this.expanded() || (this.expandByDefault() && this.#mounted()),
            [`${BEM_BLOCK}--paused`]: this.paused(),
        };
    }

    @HostBinding('style')
    public get hostStackStyles(): Record<string, string> {
        return {
            '--index': `${this.index()}`,
            '--toasts-before': `${this.index()}`,
            '--z-index': `${this.totalToasts() - this.index()}`,
            '--offset': `${this.#removed() ? this.#offsetBeforeRemove() : this.#offset()}px`,
            '--initial-height': this.expandByDefault() ? 'auto' : `${this.#initialHeight()}px`,
            '--lifetime': `${this.lifetime() ?? 0}ms`,
        };
    }

    constructor() {
        effect((onCleanup: (cleanup: () => void) => void): void => {
            if (!this.#mounted() || this.#removed() || this.lifetime() === null) {
                return;
            }

            if (this.paused()) {
                this.#pauseTimer();
            } else {
                this.#startTimer();
            }

            onCleanup((): void => clearTimeout(this.#timeoutId));
        });

        // Вытесненный в режиме `replace` уходит тем же путём, что и закрытый крестиком.
        effect((): void => {
            if (this.#mounted() && this.toast().replaced === true) {
                this.#deleteToast('replaced');
            }
        });

        // Закрытый ручкой приложения — тоже.
        effect((): void => {
            if (this.#mounted() && this.toast().dismissRequested === true) {
                this.#deleteToast('dismiss');
            }
        });

        // Новый текст, доля или раскрытые подробности меняют высоту: стопка пересчитывает сдвиги.
        effect((): void => {
            const toast: IRtToaster.Toast = this.toast();
            this.detailsOpen();
            if (!this.#mounted() || toast.replaced === true) {
                return;
            }
            afterNextRender((): void => this.#remeasure(), { injector: this.#injector });
        });
    }

    public ngAfterViewInit(): void {
        this.#remainingTimeMs = this.lifetime() ?? 0;

        const height: number = this.#host.nativeElement.getBoundingClientRect().height;
        this.#initialHeight.set(height);
        this.heightAdded.emit({ toastId: this.toast().id, height });

        this.#mounted.set(true);
    }

    public ngOnDestroy(): void {
        clearTimeout(this.#timeoutId);
        clearTimeout(this.#unmountTimeoutId);
        // Тост ушёл не своим путём — вместе с тостером. Ушедший своим путём ручку уже закрыл, и
        // повторная отметка ничего не делает.
        this.toast().ref?.markClosed('destroyed');
    }

    protected onAction(): void {
        this.toast().action?.handler();
        this.#deleteToast(null);
    }

    protected onSecondaryAction(): void {
        this.toast().secondaryAction?.handler();
        this.#deleteToast(null);
    }

    protected onClose(): void {
        this.#deleteToast('close');
    }

    protected toggleDetails(): void {
        this.detailsOpen.update((open: boolean): boolean => !open);
    }

    /**
     * Уход тоста. Причину получает ручка; колбэк приложения — только уход без действия и без
     * `dismiss()`: действие уже вызвало свой обработчик, а закрыло тост само приложение.
     */
    #deleteToast(reason: INotification.CloseReason | null): void {
        if (this.#removed()) {
            return;
        }

        this.#removed.set(true);

        if (reason !== null && reason !== 'action' && reason !== 'dismiss' && reason !== 'destroyed') {
            this.toast().onDismiss?.(reason);
        }

        this.toast().ref?.markClosed(reason ?? 'action');

        this.#offsetBeforeRemove.set(this.#offset());
        this.heightRemoved.emit(this.toast().id);

        this.#unmountTimeoutId = setTimeout((): void => this.dismissed.emit(this.toast().id), UNMOUNT_DELAY_MS);
    }

    /** Высота по содержимому: своя высота стопки на время замера снимается. */
    #remeasure(): void {
        if (this.#removed()) {
            return;
        }

        const host: HTMLElement = this.#host.nativeElement;
        host.style.height = 'auto';
        const height: number = host.offsetHeight;
        host.style.height = '';

        if (height !== this.#initialHeight()) {
            this.#initialHeight.set(height);
            this.heightAdded.emit({ toastId: this.toast().id, height });
        }
    }

    #startTimer(): void {
        this.#closeTimerStartedAt = Date.now();
        this.#timeoutId = setTimeout((): void => this.#deleteToast('timeout'), this.#remainingTimeMs);
    }

    #pauseTimer(): void {
        if (this.#closeTimerPausedAt < this.#closeTimerStartedAt) {
            const elapsedMs: number = Date.now() - this.#closeTimerStartedAt;
            this.#remainingTimeMs = this.#remainingTimeMs - elapsedMs;
        }

        this.#closeTimerPausedAt = Date.now();
    }
}
