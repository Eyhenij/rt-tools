import {
    computed,
    effect,
    inject,
    input,
    output,
    signal,
    viewChild,
    ChangeDetectionStrategy,
    Component,
    InputSignal,
    OutputEmitterRef,
    Signal,
    TemplateRef,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Event as RouterEvent, NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';

import { filter, map } from 'rxjs';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, RT_KIT_TRANSLATOR, RtKitLabelMap, RtKitTranslator, rtKitLabel } from '../../i18n';
import { BreakpointsService } from '../../platform';

import { RtIconComponent } from '../icon';
import { RtPopoverDirective } from '../popover';
import { RtTooltipDirective } from '../tooltip';
import { activeSectionIds, ERtPageHeaderEntry, IRtPageHeaderView, toSections } from './rt-page-header.logic';
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
    styleUrls: ['./rt-page-header.component.scss', './rt-page-header-submenu.scss', './rt-page-header-mobile.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
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
    },
})
export class RtPageHeaderComponent {
    readonly #router: Router = inject(Router);

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

    readonly #translate: Signal<RtKitTranslator> = inject(RT_KIT_TRANSLATOR);

    protected readonly t: Signal<RtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly mobileNavPopoverRef: Signal<RtPopoverDirective | undefined> = viewChild('mobileNavPopover', {
        read: RtPopoverDirective,
    });

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
    }

    /**
     * Подпись раздела в разработке. Методом, а не сигналом: имя раздела приходит
     * элементом цикла, и до него подписи ещё нет. Метод читает сигнал
     * переводчика, поэтому смена языка перерисовывает разметку и зовёт его заново.
     */
    protected sectionInProgressLabel(label: string): string {
        return this.#translate()('uiSectionInProgress', { label });
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
        this.mobileNavPopoverRef()?.close();
    }
}
