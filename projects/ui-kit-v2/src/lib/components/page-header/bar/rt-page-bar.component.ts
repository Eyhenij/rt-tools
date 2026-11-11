import { BooleanInput } from '@angular/cdk/coercion';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
    afterRenderEffect,
    booleanAttribute,
    computed,
    contentChild,
    contentChildren,
    inject,
    input,
    linkedSignal,
    output,
    signal,
    viewChild,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    InputSignal,
    InputSignalWithTransform,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective, WINDOW } from '@rt-tools/core';

import { RT_KIT_LABELS, TRtKitLabelMap } from '@rt-tools/ui-kit-v2/core';

import { RtBottomSheetComponent } from '@rt-tools/ui-kit-v2/bottom-sheet';
import { RtButtonDirective } from '@rt-tools/ui-kit-v2/button';
import { RtIconButtonComponent } from '@rt-tools/ui-kit-v2/icon-button';
import { RtMenuComponent, RtMenuItemComponent } from '@rt-tools/ui-kit-v2/menu';
import { RtPopoverDirective } from '@rt-tools/ui-kit-v2/popover';
import { RtPageBarFilterDirective, RtPageBarSearchDirective } from './rt-page-bar-slots.directive';
import { actionsWidthOf, pageBarFit, IRtPageBarFit } from './rt-page-bar.logic';
import { IRtPageBar } from './rt-page-bar.model';

const BEM_BLOCK: string = 'rt-page-bar';

/**
 * Компактная шапка страницы: одна строка 56 или две строки 104. Вид считается по ширине самой
 * шапки, а не окна: страница, суженная ассистентом, уводит отборы так же, как телефон. Шапка
 * отдельная часть: страница без неё остаётся со своим заголовком.
 */
@Component({
    selector: 'rt-page-bar',
    templateUrl: './rt-page-bar.component.html',
    styleUrl: './rt-page-bar.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        NgTemplateOutlet,
        RtBottomSheetComponent,
        RtButtonDirective,
        RtIconButtonComponent,
        RtMenuComponent,
        RtMenuItemComponent,
        RtPopoverDirective,
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    host: { class: BEM_BLOCK, '[class.rt-page-bar--narrow]': 'isNarrow()' },
})
export class RtPageBarComponent {
    readonly #host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    readonly #window: Window & typeof globalThis = inject(WINDOW) as Window & typeof globalThis;

    readonly #width: WritableSignal<number> = signal<number>(0);

    readonly #titleWidth: WritableSignal<number> = signal<number>(0);

    /** Сколько раз догружались шрифты: заголовок, замеренный запасным шрифтом, меряется снова. */
    readonly #fontLoads: WritableSignal<number> = signal<number>(0);

    readonly #fit: Signal<IRtPageBarFit.Result> = computed((): IRtPageBarFit.Result =>
        pageBarFit({
            width: this.#width(),
            titleWidth: this.#titleWidth(),
            actionsWidth: actionsWidthOf(this.actions().length),
            filterCount: this.filters().length,
            hasSearch: this.search() !== undefined,
        })
    );

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly titleRef: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement>>('title');

    protected readonly filters: Signal<ReadonlyArray<RtPageBarFilterDirective>> = contentChildren(RtPageBarFilterDirective);

    protected readonly search: Signal<RtPageBarSearchDirective | undefined> = contentChild(RtPageBarSearchDirective);

    protected readonly mode: Signal<IRtPageBarFit.Mode> = computed((): IRtPageBarFit.Mode => this.#fit().mode);

    protected readonly isNarrow: Signal<boolean> = computed((): boolean => this.mode() === 'narrow');

    protected readonly rowFilters: Signal<ReadonlyArray<RtPageBarFilterDirective>> = computed((): ReadonlyArray<RtPageBarFilterDirective> =>
        this.filters().slice(0, this.#fit().rowFilters)
    );

    protected readonly moreFilters: Signal<ReadonlyArray<RtPageBarFilterDirective>> = computed(
        (): ReadonlyArray<RtPageBarFilterDirective> => this.filters().slice(this.#fit().rowFilters)
    );

    /** Шторка отборов узкого вида: смена вида её закрывает, и при возврате в узкий она не открывается сама. */
    protected readonly sheetOpen: WritableSignal<boolean> = linkedSignal<boolean, boolean>({
        source: this.isNarrow,
        computation: (): boolean => false,
    });

    public readonly pageTitle: InputSignal<string> = input.required<string>();

    public readonly actions: InputSignal<ReadonlyArray<IRtPageBar.Action>> = input<ReadonlyArray<IRtPageBar.Action>>([]);

    /** Отборы применены: на кнопке отборов узкого вида горит точка. */
    public readonly filtersActive: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    public readonly actionClick: OutputEmitterRef<string> = output<string>();

    /** Нажата «Применить» в шторке отборов узкого вида. */
    public readonly filtersApply: OutputEmitterRef<void> = output<void>();

    constructor() {
        const destroyRef: DestroyRef = inject(DestroyRef);
        let watch: ResizeObserver | null = null;

        // Заголовок меряется в широком виде и заново после смены текста, шрифтов и возврата из узкого.
        // В узком виде он растянут и мельче, и замер дал бы ширину строки, а не текста.
        afterRenderEffect((): void => {
            if (watch === null && 'ResizeObserver' in this.#window) {
                watch = new this.#window.ResizeObserver((): void => this.#width.set(this.#host.getBoundingClientRect().width));
                watch.observe(this.#host);
            }
            this.pageTitle();
            this.#fontLoads();
            const title: HTMLElement | undefined = this.titleRef()?.nativeElement;
            if (title !== undefined && !this.isNarrow()) {
                this.#titleWidth.set(title.scrollWidth);
            }
        });

        const doc: Document = inject(DOCUMENT);
        const fonts: FontFaceSet | null = 'fonts' in doc ? doc.fonts : null;
        const onFontsLoaded: () => void = (): void => this.#fontLoads.update((count: number): number => count + 1);
        fonts?.addEventListener('loadingdone', onFontsLoaded);

        destroyRef.onDestroy((): void => {
            watch?.disconnect();
            fonts?.removeEventListener('loadingdone', onFontsLoaded);
        });
    }

    protected onApply(): void {
        this.filtersApply.emit();
        this.sheetOpen.set(false);
    }
}
