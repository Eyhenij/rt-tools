import {
    afterRenderEffect,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    ElementRef,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    Signal,
    signal,
    viewChild,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { BreakpointsService, rtKitLabel, TRtKitLabelParams } from '@rt-tools/ui-kit-v2/core';
import { RtIconComponent } from '@rt-tools/ui-kit-v2/icon';
import { RtMenuComponent, RtMenuItemComponent } from '@rt-tools/ui-kit-v2/menu';
import { RtTooltipDirective } from '@rt-tools/ui-kit-v2/tooltip';

import { rtBreadcrumbsFits, rtBreadcrumbsFold } from './rt-breadcrumbs.logic';
import { IRtBreadcrumbs } from './rt-breadcrumbs.model';

const BEM_BLOCK: string = 'rt-breadcrumbs';

/**
 * Путь до открытой страницы: предки ссылками, текущее звено текстом.
 *
 * Цепочку отдаёт приложение: имя открытой записи приходит с ответом сервера, и знает его только
 * страница. Текущее звено рисуется в строке пути или заголовком строкой ниже — тогда рядом с ним
 * встаёт то, что страница спроецировала. На узком экране середина длинного пути уходит в меню.
 */
@Component({
    selector: 'rt-breadcrumbs',
    templateUrl: './rt-breadcrumbs.component.html',
    styleUrl: './rt-breadcrumbs.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // angular
        RouterLink,

        // standalone components / directives
        BlockDirective,
        ElemDirective,
        ModDirective,
        RtIconComponent,
        RtMenuComponent,
        RtMenuItemComponent,
        RtTooltipDirective,
    ],
    host: {
        class: BEM_BLOCK,
        role: 'navigation',
        '[attr.aria-label]': 'landmarkLabel()',
        '[class.rt-breadcrumbs--heading]': "look() === 'heading'",
    },
})
export class RtBreadcrumbsComponent {
    #itemsWatch: ResizeObserver | null = null;

    readonly #narrow: Signal<boolean> = inject(BreakpointsService).narrow;

    readonly #ancestors: Signal<readonly IRtBreadcrumbs.Crumb[]> = computed((): readonly IRtBreadcrumbs.Crumb[] =>
        this.crumbs().slice(0, -1)
    );

    readonly #backParams: Signal<TRtKitLabelParams> = computed((): TRtKitLabelParams => ({ name: this.backCrumb()?.label ?? '' }));

    /** Строка звеньев: её прокрутку ставит в конец эффект после отрисовки. `#`-поле `viewChild` не принимает. */
    protected readonly list: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement>>('list');

    /** Начало пути уехало влево за край строки. */
    protected readonly clipped: WritableSignal<boolean> = signal<boolean>(false);

    /** Предки помещаются рядом с урезанным текущим звеном: звено сжимается, строка не едет. */
    protected readonly fitted: WritableSignal<boolean> = signal<boolean>(false);

    protected readonly landmarkLabel: Signal<string> = rtKitLabel('breadcrumbsLabel');
    protected readonly foldLabel: Signal<string> = rtKitLabel('breadcrumbsHidden');
    protected readonly backLabel: Signal<string> = rtKitLabel('breadcrumbsBack', this.#backParams);

    protected readonly fold: Signal<IRtBreadcrumbs.Fold> = computed((): IRtBreadcrumbs.Fold =>
        rtBreadcrumbsFold(this.#ancestors(), this.#narrow())
    );

    protected readonly current: Signal<IRtBreadcrumbs.Crumb | null> = computed(
        (): IRtBreadcrumbs.Crumb | null => this.crumbs().at(-1) ?? null
    );

    /** Строка пути нужна, пока в ней есть что рисовать: у одного заголовка её нет. */
    protected readonly rowShown: Signal<boolean> = computed((): boolean => this.look() === 'inline' || this.#ancestors().length > 0);

    /** Куда ведёт кнопка «назад»: к последнему предку, а без предков кнопки нет. */
    protected readonly backCrumb: Signal<IRtBreadcrumbs.Crumb | null> = computed((): IRtBreadcrumbs.Crumb | null =>
        this.back() ? (this.#ancestors().at(-1) ?? null) : null
    );

    /** Путь от верха до открытой страницы; последнее звено — сама страница. */
    public readonly crumbs: InputSignal<readonly IRtBreadcrumbs.Crumb[]> = input.required<readonly IRtBreadcrumbs.Crumb[]>();

    /** Как рисуется текущее звено: в строке пути или заголовком строкой ниже. */
    public readonly look: InputSignal<IRtBreadcrumbs.Look> = input<IRtBreadcrumbs.Look>('inline');

    /** Кнопка «назад» перед путём; ведёт к последнему предку. */
    public readonly back: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });

    /** Знак между звеньями. */
    public readonly separator: InputSignal<string> = input<string>('/');

    constructor() {
        // Длинный путь едет внутри своей строки, и видна должна быть открытая страница, а не верх
        // пути. Строка встаёт в конец при смене цепочки и при смене ширины звеньев: шрифт страницы
        // приходит позже первой отрисовки и раздвигает звенья уже после неё.
        afterRenderEffect((): void => {
            this.crumbs();
            this.fold();
            this.#watchItems();
            this.#scrollToEnd();
        });

        inject(DestroyRef).onDestroy((): void => this.#itemsWatch?.disconnect());
    }

    protected onListScroll(): void {
        const list: HTMLElement | undefined = this.list()?.nativeElement;
        this.clipped.set(list !== undefined && list.scrollLeft > 0);
    }

    #watchItems(): void {
        const list: HTMLElement | undefined = this.list()?.nativeElement;
        if (list === undefined || typeof ResizeObserver === 'undefined') {
            return;
        }
        this.#itemsWatch?.disconnect();
        this.#itemsWatch = new ResizeObserver((): void => this.#scrollToEnd());
        Array.from(list.children).forEach((item: Element): void => this.#itemsWatch?.observe(item));
    }

    #scrollToEnd(): void {
        const list: HTMLElement | undefined = this.list()?.nativeElement;
        if (list !== undefined) {
            this.fitted.set(this.#measureFit(list));
            list.scrollLeft = list.scrollWidth;
            this.clipped.set(list.scrollLeft > 0);
        }
    }

    /**
     * Ширина строки без внутренних полей, предки целиком и полная подпись текущего звена против
     * порога из свойства блока. Без текущего звена в строке сжимать нечего.
     */
    #measureFit(list: HTMLElement): boolean {
        const items: readonly Element[] = Array.from(list.children);
        const current: Element | null = items.at(-1)?.querySelector('.rt-breadcrumbs__current') ?? null;
        if (current === null) {
            return false;
        }
        const listStyle: CSSStyleDeclaration = getComputedStyle(list);
        const room: number = list.clientWidth - parseFloat(listStyle.paddingInlineStart) - parseFloat(listStyle.paddingInlineEnd);
        const ancestors: number = items
            .slice(0, -1)
            .reduce((sum: number, item: Element): number => sum + item.getBoundingClientRect().width, 0);
        const floor: number = parseFloat(listStyle.getPropertyValue('--rt-breadcrumbs-current-min')) || 0;

        return rtBreadcrumbsFits(room, ancestors, current.scrollWidth, floor);
    }
}
