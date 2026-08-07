import {
    ChangeDetectionStrategy,
    Component,
    HostBinding,
    InputSignal,
    InputSignalWithTransform,
    Signal,
    ViewEncapsulation,
    WritableSignal,
    booleanAttribute,
    computed,
    inject,
    input,
    linkedSignal,
    numberAttribute,
    signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { rtKitLabel } from '../../i18n';
import { INotification, NotificationBus } from '../../platform';

import { RtToastComponent } from './rt-toast.component';
import { RT_TOASTER_GAP_PX, IRtToaster } from './rt-toaster.model';

const BEM_BLOCK: string = 'rt-toaster';

const DEFAULT_DURATION_MS: number = 4000;

const DEFAULT_VISIBLE_TOASTS: number = 3;

@Component({
    selector: 'rt-toaster',
    templateUrl: './rt-toaster.component.html',
    styleUrl: './rt-toaster.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [RtToastComponent],
    host: {
        class: BEM_BLOCK,
        role: 'region',
        '[attr.aria-label]': 'ariaLabel()',
        '(mouseenter)': 'onStackEnter()',
        '(mousemove)': 'onStackEnter()',
        '(mouseleave)': 'onStackLeave()',
        '(pointerdown)': 'onStackPointerDown()',
        '(pointerup)': 'onStackPointerUp()',
    },
})
export class RtToasterComponent {
    readonly #notificationBus: NotificationBus = inject(NotificationBus);

    protected readonly ariaLabel: Signal<string> = rtKitLabel('uiNotifications');

    #toastCounter: number = 0;

    protected readonly toasts: WritableSignal<IRtToaster.Toast[]> = signal<IRtToaster.Toast[]>([]);

    protected readonly heights: WritableSignal<IRtToaster.Height[]> = signal<IRtToaster.Height[]>([]);

    protected readonly expanded: WritableSignal<boolean> = linkedSignal<IRtToaster.Toast[], boolean>({
        source: this.toasts,
        computation: (toasts: IRtToaster.Toast[]): boolean => toasts.length < 1,
    });

    protected readonly interacting: WritableSignal<boolean> = signal<boolean>(false);

    protected readonly positionY: Signal<IRtToaster.PositionY> = computed((): IRtToaster.PositionY =>
        this.position().startsWith('top') ? 'top' : 'bottom'
    );

    protected readonly positionX: Signal<IRtToaster.PositionX> = computed((): IRtToaster.PositionX => {
        if (this.position().endsWith('left')) {
            return 'left';
        }
        return this.position().endsWith('center') ? 'center' : 'right';
    });

    public readonly position: InputSignal<IRtToaster.Position> = input<IRtToaster.Position>('bottom-right');

    public readonly duration: InputSignalWithTransform<number, number | string> = input<number, number | string>(DEFAULT_DURATION_MS, {
        transform: numberAttribute,
    });

    public readonly visibleToasts: InputSignalWithTransform<number, number | string> = input<number, number | string>(
        DEFAULT_VISIBLE_TOASTS,
        { transform: numberAttribute }
    );

    public readonly expand: InputSignalWithTransform<boolean, boolean | string> = input<boolean, boolean | string>(false, {
        transform: booleanAttribute,
    });

    @HostBinding('class')
    public get hostModifierClasses(): Record<string, boolean> {
        return {
            [`${BEM_BLOCK}--y--${this.positionY()}`]: true,
            [`${BEM_BLOCK}--x--${this.positionX()}`]: true,
        };
    }

    @HostBinding('style')
    public get hostStackStyles(): Record<string, string> {
        return {
            '--front-toast-height': `${this.heights()[0]?.height ?? 0}px`,
            '--gap': `${RT_TOASTER_GAP_PX}px`,
        };
    }

    constructor() {
        this.#notificationBus
            .onEmit()
            .pipe(takeUntilDestroyed())
            .subscribe((event: INotification.Event): void => this.#addToast(event));
    }

    protected onStackEnter(): void {
        if (this.toasts().length > 0) {
            this.expanded.set(true);
        }
    }

    protected onStackLeave(): void {
        if (!this.interacting()) {
            this.expanded.set(false);
        }
    }

    protected onStackPointerDown(): void {
        this.interacting.set(true);
    }

    protected onStackPointerUp(): void {
        this.interacting.set(false);
    }

    protected onHeightAdded(height: IRtToaster.Height): void {
        this.heights.update((items: IRtToaster.Height[]): IRtToaster.Height[] =>
            this.#sortHeights([height, ...items.filter((item: IRtToaster.Height): boolean => item.toastId !== height.toastId)])
        );
    }

    protected onHeightRemoved(toastId: number): void {
        this.heights.update((items: IRtToaster.Height[]): IRtToaster.Height[] =>
            items.filter((item: IRtToaster.Height): boolean => item.toastId !== toastId)
        );
    }

    protected onDismissed(toastId: number): void {
        this.onHeightRemoved(toastId);
        this.toasts.update((items: IRtToaster.Toast[]): IRtToaster.Toast[] =>
            items.filter((item: IRtToaster.Toast): boolean => item.id !== toastId)
        );
    }

    #addToast(event: INotification.Event): void {
        this.#toastCounter += 1;
        const toast: IRtToaster.Toast = {
            id: this.#toastCounter,
            severity: event.payload.severity,
            message: event.payload.message,
            description: event.payload.description,
            meta: event.payload.meta,
            action: event.payload.action,
            secondaryAction: event.payload.secondaryAction,
            filled: event.payload.filled,
        };
        this.toasts.update((items: IRtToaster.Toast[]): IRtToaster.Toast[] => [toast, ...items]);
    }

    #sortHeights(items: IRtToaster.Height[]): IRtToaster.Height[] {
        const order: number[] = this.toasts().map((toast: IRtToaster.Toast): number => toast.id);
        return [...items].sort(
            (left: IRtToaster.Height, right: IRtToaster.Height): number => order.indexOf(left.toastId) - order.indexOf(right.toastId)
        );
    }
}
