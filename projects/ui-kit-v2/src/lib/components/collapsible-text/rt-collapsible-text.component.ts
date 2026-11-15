import {
    afterRenderEffect,
    inject,
    input,
    numberAttribute,
    signal,
    viewChild,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    InputSignal,
    InputSignalWithTransform,
    OnDestroy,
    Signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, TRtKitLabelMap } from '@rt-tools/ui-kit-v2/core';

const BEM_BLOCK: string = 'rt-collapsible-text';

/** Тон текста: основной цвет — по умолчанию; приглушённый — для пояснения под названием. */
export type TRtCollapsibleTextTone = 'default' | 'muted';

@Component({
    selector: 'rt-collapsible-text',
    templateUrl: './rt-collapsible-text.component.html',
    styleUrl: './rt-collapsible-text.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    host: {
        class: BEM_BLOCK,
        '[class.rt-collapsible-text--muted]': "tone() === 'muted'",
    },
})
export class RtCollapsibleTextComponent implements OnDestroy {
    #resizeObserver: ResizeObserver | null = null;

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly textRef: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement>>('text');

    protected readonly expanded: WritableSignal<boolean> = signal<boolean>(false);

    protected readonly overflowing: WritableSignal<boolean> = signal<boolean>(false);

    public readonly paragraphs: InputSignal<readonly string[]> = input.required<readonly string[]>();

    public readonly clampLines: InputSignalWithTransform<number, number | string> = input<number, number | string>(6, {
        transform: numberAttribute,
    });

    /** Тон текста абзацев. Кнопка «Ещё»/«Свернуть» остаётся цветом ссылки при любом тоне. */
    public readonly tone: InputSignal<TRtCollapsibleTextTone> = input<TRtCollapsibleTextTone>('default');

    constructor() {
        afterRenderEffect((): void => {
            this.paragraphs();
            this.#observeText();
            this.#measure();
        });
    }

    public ngOnDestroy(): void {
        this.#resizeObserver?.disconnect();
    }

    protected toggle(): void {
        this.expanded.update((expanded: boolean): boolean => !expanded);
    }

    #observeText(): void {
        const el: HTMLElement | undefined = this.textRef()?.nativeElement;
        if (el === undefined || this.#resizeObserver !== null) {
            return;
        }
        if (typeof ResizeObserver === 'undefined') {
            return;
        }
        this.#resizeObserver = new ResizeObserver((): void => this.#measure());
        this.#resizeObserver.observe(el);
    }

    #measure(): void {
        if (this.expanded()) {
            return;
        }
        const el: HTMLElement | undefined = this.textRef()?.nativeElement;
        if (el === undefined) {
            return;
        }
        this.overflowing.set(el.scrollHeight > el.clientHeight + 1);
    }
}
