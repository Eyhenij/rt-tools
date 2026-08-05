import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostBinding,
    InputSignal,
    OnDestroy,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
    WritableSignal,
    computed,
    effect,
    inject,
    input,
    output,
    signal,
} from '@angular/core';

import { TranslocoPipe } from '@jsverse/transloco';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { INotification } from '../../platform';

import { RtButtonDirective } from '../button/rt-button.directive';
import { RtIconButtonComponent } from '../icon-button/rt-icon-button.component';
import { RtIconComponent } from '../icon/rt-icon.component';
import { IRtIcon } from '../icon/rt-icon.model';
import { RT_TOASTER_GAP_PX, IRtToaster } from './rt-toaster.model';

const BEM_BLOCK: string = 'rt-toast';

const UNMOUNT_DELAY_MS: number = 200;

@Component({
    selector: 'rt-toast',
    templateUrl: './rt-toast.component.html',
    styleUrl: './rt-toast.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [RtButtonDirective, RtIconComponent, RtIconButtonComponent, BlockDirective, ElemDirective, TranslocoPipe],
    host: {
        class: BEM_BLOCK,
        role: 'status',
        'aria-atomic': 'true',
    },
})
export class RtToastComponent implements AfterViewInit, OnDestroy {
    readonly #host: ElementRef<HTMLElement> = inject(ElementRef);

    readonly #severityIcon: Readonly<Record<INotification.Severity, IRtIcon.Name>> = {
        info: 'info-circle',
        success: 'check-circle',
        warning: 'exclamation-circle',
        danger: 'times-circle',
    };

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

    protected readonly icon: Signal<IRtIcon.Name> = computed((): IRtIcon.Name => this.#severityIcon[this.toast().severity]);

    public readonly toast: InputSignal<IRtToaster.Toast> = input.required<IRtToaster.Toast>();

    public readonly index: InputSignal<number> = input.required<number>();

    public readonly totalToasts: InputSignal<number> = input.required<number>();

    public readonly heights: InputSignal<IRtToaster.Height[]> = input.required<IRtToaster.Height[]>();

    public readonly expanded: InputSignal<boolean> = input.required<boolean>();

    public readonly expandByDefault: InputSignal<boolean> = input<boolean>(false);

    public readonly interacting: InputSignal<boolean> = input<boolean>(false);

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
            [`${BEM_BLOCK}--y--${this.#positionY()}`]: true,
            [`${BEM_BLOCK}--mounted`]: this.#mounted(),
            [`${BEM_BLOCK}--removed`]: this.#removed(),
            [`${BEM_BLOCK}--front`]: this.index() === 0,
            [`${BEM_BLOCK}--hidden`]: this.index() + 1 > this.visibleToasts(),
            [`${BEM_BLOCK}--expanded`]: this.expanded() || (this.expandByDefault() && this.#mounted()),
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
        };
    }

    constructor() {
        effect((onCleanup: (cleanup: () => void) => void): void => {
            if (!this.#mounted() || this.#removed()) {
                return;
            }

            if (this.expanded() || this.interacting()) {
                this.#pauseTimer();
            } else {
                this.#startTimer();
            }

            onCleanup((): void => clearTimeout(this.#timeoutId));
        });
    }

    public ngAfterViewInit(): void {
        this.#remainingTimeMs = this.duration();

        const height: number = this.#host.nativeElement.getBoundingClientRect().height;
        this.#initialHeight.set(height);
        this.heightAdded.emit({ toastId: this.toast().id, height });

        this.#mounted.set(true);
    }

    public ngOnDestroy(): void {
        clearTimeout(this.#timeoutId);
        clearTimeout(this.#unmountTimeoutId);
    }

    protected onAction(): void {
        this.toast().action?.handler();
        this.#deleteToast();
    }

    protected onSecondaryAction(): void {
        this.toast().secondaryAction?.handler();
        this.#deleteToast();
    }

    protected onClose(): void {
        this.#deleteToast();
    }

    #deleteToast(): void {
        if (this.#removed()) {
            return;
        }

        this.#removed.set(true);
        this.#offsetBeforeRemove.set(this.#offset());
        this.heightRemoved.emit(this.toast().id);

        this.#unmountTimeoutId = setTimeout((): void => this.dismissed.emit(this.toast().id), UNMOUNT_DELAY_MS);
    }

    #startTimer(): void {
        this.#closeTimerStartedAt = Date.now();
        this.#timeoutId = setTimeout((): void => this.#deleteToast(), this.#remainingTimeMs);
    }

    #pauseTimer(): void {
        if (this.#closeTimerPausedAt < this.#closeTimerStartedAt) {
            const elapsedMs: number = Date.now() - this.#closeTimerStartedAt;
            this.#remainingTimeMs = this.#remainingTimeMs - elapsedMs;
        }

        this.#closeTimerPausedAt = Date.now();
    }
}
