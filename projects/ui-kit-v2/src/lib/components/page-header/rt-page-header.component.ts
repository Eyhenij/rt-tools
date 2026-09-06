import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
    afterNextRender,
    booleanAttribute,
    computed,
    effect,
    inject,
    input,
    numberAttribute,
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
    TemplateRef,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Event as RouterEvent, NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';

import { filter, map } from 'rxjs';

import { BlockDirective, ElemDirective, ModDirective, WINDOW } from '@rt-tools/core';

import { RT_KIT_LABELS, RT_KIT_TRANSLATOR, RtKitLabelPipe, TRtKitLabelMap, TRtKitTranslator, rtKitLabel } from '../../i18n';
import { BreakpointsService } from '../../platform';

import { RtIconComponent } from '../icon';
import { RtPopoverDirective } from '../popover';
import { RtTooltipDirective } from '../tooltip';
import { activeSectionIds, compactSectionsOf, ERtPageHeaderEntry, IRtPageHeaderView, isStuck, toSections } from './rt-page-header.logic';
import { IRtPageHeader } from './rt-page-header.model';

const BEM_BLOCK: string = 'rt-page-header';

/**
 * Верхняя горизонтальная плашка-навигация для первого уровня доменных страниц.
 *
 * Контракт:
 * - `items` — `Item[]`. Анкор для пунктов с `route`; `<button>` для недоступных
 *   и для тех, кто обрабатывается снаружи (`itemClick`). Пункт с `columns` —
 *   кнопка-триггер: панель второго уровня открывается наведением ([rtPopover]).
 * - `user` — необязательный блок справа. Если задан `userMenu` (TemplateRef) —
 *   блок становится hover-триггером попапа с этим контентом (клик — touch-fallback,
 *   панель прижата к правому краю); иначе по клику emit'ит `userClick`.
 *
 * Active state — через `RouterLinkActive` с классом `rt-page-header__link--is-active`;
 * для раздела с панелью — вычисляется по текущему URL (своего route у него нет).
 */
@Component({
    selector: 'rt-page-header',
    templateUrl: './rt-page-header.component.html',
    // Панель второго уровня и панель узкого экрана рисуются в CDK Overlay, вне
    // хоста, поэтому это отдельные корневые блоки — и отдельные файлы: бюджет
    // стилей компонента считается на каждый файл, и одним они его перебирают.
    styleUrls: [
        './rt-page-header.component.scss',
        './rt-page-header-submenu.scss',
        './rt-page-header-mobile.scss',
        './rt-page-header-compact.scss',
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        RtKitLabelPipe,
        // Angular
        RouterLink,
        RouterLinkActive,

        // standalone components / directives
        RtIconComponent,
        RtPopoverDirective,
        RtTooltipDirective,
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    host: {
        class: BEM_BLOCK,
        '[class.rt-page-header--sticky]': 'stickyCompact()',
        '[class.rt-page-header--is-compact]': 'compact()',
    },
})
export class RtPageHeaderComponent {
    readonly #router: Router = inject(Router);

    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    readonly #host: ElementRef<HTMLElement> = inject<ElementRef<HTMLElement>>(ElementRef);

    // Конструктор наблюдателя пересечения объявлен на globalThis, а не на интерфейсе Window —
    // токен отдаёт тот же объект, тип лишь уточняется.
    readonly #window: Window & typeof globalThis = inject(WINDOW) as Window & typeof globalThis;

    /**
     * Прилипла ли шапка к краю прокрутки. Считается наблюдателем пересечения, а не смещением
     * окна: страница у потребителя прокручивается и внутри контейнера, и окно об этом не знает.
     */
    readonly #stuck: WritableSignal<boolean> = signal<boolean>(false);

    readonly #t_uiMainNav: Signal<string> = rtKitLabel('uiMainNav');

    /* Реактивный URL для подсветки раздела: у раздела с панелью нет своего
       route, поэтому RouterLinkActive не применим — сравниваем по факту навигации. */
    readonly #currentUrl: Signal<string> = toSignal(
        this.#router.events.pipe(
            filter((e: RouterEvent): e is NavigationEnd => e instanceof NavigationEnd),
            map((): string => this.#router.url)
        ),
        { initialValue: this.#router.url }
    );

    readonly #breakpoints: BreakpointsService = inject(BreakpointsService);

    readonly #translate: Signal<TRtKitTranslator> = inject(RT_KIT_TRANSLATOR);

    /** Переводчик для чистого пайпа подписи: шаблон отдаёт его вторым доводом. */
    protected readonly translate: Signal<TRtKitTranslator> = this.#translate;

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly mobileNavPopoverRef: Signal<RtPopoverDirective | undefined> = viewChild('mobileNavPopover', {
        read: RtPopoverDirective,
    });

    /** Кнопка «ещё» сжатой полосы открывает ту же панель, что и бургер, своим поповером. */
    protected readonly compactNavPopoverRef: Signal<RtPopoverDirective | undefined> = viewChild('compactNavPopover', {
        read: RtPopoverDirective,
    });

    /** Сжатое состояние: шапка липкая и прилипла к верху. */
    protected readonly compact: Signal<boolean> = computed((): boolean => this.stickyCompact() && this.#stuck());

    /** Разделы в кругах сжатой полосы: первые с иконкой, число — по входу. */
    protected readonly compactSections: Signal<ReadonlyArray<IRtPageHeaderView.Section>> = computed(
        (): ReadonlyArray<IRtPageHeaderView.Section> => compactSectionsOf(this.sections(), this.compactVisibleCount())
    );

    /** Форма пункта решается один раз здесь, а не ветвлениями в шаблоне. */
    protected readonly sections: Signal<ReadonlyArray<IRtPageHeaderView.Section>> = computed((): ReadonlyArray<IRtPageHeaderView.Section> =>
        toSections(this.items())
    );

    /**
     * id разделов с активным вложенным адресом — для O(1) lookup в шаблоне.
     * Зависит от #currentUrl + items (сигналы) → подсветка реактивна на навигацию.
     */
    protected readonly activeSectionIds: Signal<ReadonlySet<string>> = computed((): ReadonlySet<string> =>
        activeSectionIds(this.sections(), this.#currentUrl())
    );

    protected readonly userAvatar: Signal<string> = computed((): string => {
        const u: IRtPageHeader.User | null = this.user();
        if (!u) {
            return '';
        }
        if (u.avatar && u.avatar.length > 0) {
            return u.avatar.charAt(0).toUpperCase();
        }
        return u.name.charAt(0).toUpperCase();
    });

    /** Узкий вьюпорт (≤1080px): инлайн-навигация прячется, показывается гамбургер. */
    protected readonly isNarrow: Signal<boolean> = this.#breakpoints.narrow;

    /**
     * id раскрытых разделов-аккордеонов в мобильной панели. Ключ — только раздел:
     * группы внутри раскрытого раздела показаны сразу, и совпасть идентификаторам
     * раздела и группы в этом множестве негде.
     */
    protected readonly expandedSectionIds: WritableSignal<ReadonlySet<string>> = signal<ReadonlySet<string>>(new Set<string>());

    protected readonly EntryKind: typeof ERtPageHeaderEntry = ERtPageHeaderEntry;

    public readonly items: InputSignal<ReadonlyArray<IRtPageHeader.Item>> = input<ReadonlyArray<IRtPageHeader.Item>>([]);

    public readonly user: InputSignal<IRtPageHeader.User | null> = input<IRtPageHeader.User | null>(null);

    public readonly userTitle: InputSignal<string> = input<string>('');

    public readonly userMenu: InputSignal<TemplateRef<unknown> | null> = input<TemplateRef<unknown> | null>(null);

    /** Пусто — берётся переведённая подпись по умолчанию */
    public readonly ariaLabel: InputSignal<string> = input<string>('');

    /**
     * Шапка липнет к верху окна и, прилипнув, сжимается в полосу: круги первых разделов,
     * кнопка «ещё» и три слота потребителя. Выключено — поведение прежнее.
     */
    public readonly stickyCompact: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Сколько разделов с иконкой показывать кругами в сжатой полосе; остальные — под «ещё». */
    public readonly compactVisibleCount: InputSignalWithTransform<number, NumberInput> = input<number, NumberInput>(2, {
        transform: numberAttribute,
    });

    /** Своё имя навигации важнее умолчания */
    public readonly navAriaLabel: Signal<string> = computed((): string => this.ariaLabel() || this.#t_uiMainNav());

    public readonly itemClick: OutputEmitterRef<string> = output<string>();

    public readonly userClick: OutputEmitterRef<void> = output<void>();

    constructor() {
        // Ресайз обратно в десктоп — гамбургер скрывается CSS'ом; открытую
        // мобильную панель закрываем, иначе overlay зависнет без якоря.
        effect((): void => {
            if (!this.isNarrow()) {
                this.mobileNavPopoverRef()?.close();
            }
        });

        afterNextRender((): void => this.#observeStuck());
    }

    /**
     * Липкая шапка стоит на пиксель выше края прокрутки и, прилипнув, теряет его из видимой
     * области: наблюдатель пересечения с порогом в единицу ловит ровно этот момент — и в окне,
     * и внутри прокручиваемого контейнера, о котором окно не знает.
     */
    #observeStuck(): void {
        const observer: IntersectionObserver = new this.#window.IntersectionObserver(
            (entries: IntersectionObserverEntry[]): void => {
                const entry: IntersectionObserverEntry | undefined = entries.at(-1);
                if (entry !== undefined) {
                    this.#stuck.set(isStuck(entry.intersectionRatio, entry.isIntersecting));
                }
            },
            { threshold: [0, 1] }
        );
        observer.observe(this.#host.nativeElement);
        this.#destroyRef.onDestroy((): void => observer.disconnect());
    }

    /** Панель разделов открывают и бургер, и кнопка «ещё»: закрываются обе. */
    protected closeNavPanels(): void {
        this.mobileNavPopoverRef()?.close();
        this.compactNavPopoverRef()?.close();
    }

    /** Круг раздела без адреса: раздел с панелью открывает общую панель, прочий — сообщает наружу. */
    protected onCompactSectionClick(section: IRtPageHeaderView.Section): void {
        if (section.kind === ERtPageHeaderEntry.Panel) {
            this.compactNavPopoverRef()?.open();
            return;
        }
        this.itemClick.emit(section.id);
    }

    protected onItemClick(id: string): void {
        this.itemClick.emit(id);
    }

    protected onUserClick(): void {
        this.userClick.emit();
    }

    /** Аккордеон мобильной панели: тумблер раскрытия раздела по его id. */
    protected toggleSection(id: string): void {
        this.expandedSectionIds.update((prev: ReadonlySet<string>): ReadonlySet<string> => {
            const next: Set<string> = new Set<string>(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }

    /** Клик по плоскому пункту мобильной панели: emit + закрыть панель. */
    protected onMobileItemClick(id: string): void {
        this.itemClick.emit(id);
        this.closeNavPanels();
    }
}
