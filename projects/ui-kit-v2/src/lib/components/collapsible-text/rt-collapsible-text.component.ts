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

import { RT_KIT_LABELS, RtKitLabelMap } from '../../i18n';

const BEM_BLOCK: string = 'rt-collapsible-text';

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
    },
})
export class RtCollapsibleTextComponent implements OnDestroy {
    #resizeObserver: ResizeObserver | null = null;

    protected readonly t: Signal<RtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly textRef: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement>>('text');

    protected readonly expanded: WritableSignal<boolean> = signal<boolean>(false);

    protected readonly overflowing: WritableSignal<boolean> = signal<boolean>(false);

    public readonly paragraphs: InputSignal<readonly string[]> = input.required<readonly string[]>();

    public readonly clampLines: InputSignalWithTransform<number, number | string> = input<number, number | string>(6, {
        transform: numberAttribute,
    });

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
