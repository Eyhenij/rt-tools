import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    Directive,
    ElementRef,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    Renderer2,
    Signal,
    signal,
    TemplateRef,
    Type,
    viewChild,
    WritableSignal,
} from '@angular/core';
import { MatFormField, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatListItem, MatListItemIcon, MatNavList } from '@angular/material/list';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';

import { BlockDirective, BreakpointService, ElemDirective, ModDirective } from '@rt-tools/core';
import { TNullable } from '@rt-tools/utils';
import { transformArrayInput } from '@rt-tools/utils';
import { RtIconOutlinedDirective, RtNavigationDirective, RtScrollToElementDirective } from '@rt-tools/core';
import { clampSubMenuWidth, filterSubMenuItems, subMenuIdsToExpand, SUB_MENU_WIDTH_MIN } from '../side-menu.logic';
import { ISideMenu, RTUI_SIDE_MENU } from '../side-menu.types';
import {
    RtuiScrollableContainerComponent,
    RtuiScrollableContainerContentDirective,
    RtuiScrollableContainerFooterDirective,
    RtuiScrollableContainerHeaderDirective,
} from '../../scrollable';
import { RtuiButtonComponent } from '../../buttons/unified-button/rtui-button.component';
import { RtuiClearButtonComponent } from '../../table/components/clear-search-button/rtui-clear-button.component';
import { RtuiSideMenuSubItemComponent } from '../menu-sub-item/rtui-side-menu-sub-item.component';
import { pressSubMenuRow, SubMenuKeyboard } from './sub-menu-keyboard';
import { RtuiSubMenuHoldService } from './rtui-sub-menu-hold.service';
import { RtuiSideMenuFavoritesComponent } from '../favorites/rtui-side-menu-favorites.component';

@Directive({
    selector: '[rtuiSideMenuHeader]',
})
export class RtuiSideMenuHeaderDirective {}

@Directive({
    selector: '[rtuiSideMenuFooter]',
})
export class RtuiSideMenuFooterDirective {}

const BEM_BLOCK: string = 'rtui-side-menu';

@Component({
    selector: 'rtui-side-menu',
    host: {
        class: BEM_BLOCK,
        // Раскладка хоста меняется только у закреплённой моды: у всех, кто ставит меню
        // по-старому, она обязана остаться прежней до пикселя.
        '[class.rtui-side-menu--pinned]': 'isPinned()',
        // Ширина подменю приходит переменной оформления: правило стилей стоит на ней в трёх
        // местах разом, и правка одной переменной двигает их все.
        '[style.--rt-side-menu-sub-menu-dragged-width]': 'subMenuWidthStyle()',
    },
    templateUrl: './rtui-side-menu.component.html',
    styleUrls: ['./rtui-side-menu.component.scss'],
    providers: [BreakpointService, RtuiSubMenuHoldService, { provide: RTUI_SIDE_MENU, useExisting: RtuiSideMenuComponent }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgTemplateOutlet,
        MatSidenavModule,
        MatFormField,
        MatPrefix,
        MatSuffix,
        MatIcon,
        MatInput,
        MatListItem,
        MatNavList,
        MatListItemIcon,

        // directives
        BlockDirective,
        ElemDirective,
        ModDirective,
        RtuiScrollableContainerHeaderDirective,
        RtuiScrollableContainerContentDirective,
        RtuiScrollableContainerFooterDirective,
        RtScrollToElementDirective,
        RtIconOutlinedDirective,
        RtNavigationDirective,

        // components
        RtuiScrollableContainerComponent,
        RtuiButtonComponent,
        RtuiClearButtonComponent,
        RtuiSideMenuSubItemComponent,
        RtuiSideMenuFavoritesComponent,
    ],
})
export class RtuiSideMenuComponent {
    readonly #breakpoints: BreakpointService = inject(BreakpointService);
    readonly #renderer: Renderer2 = inject(Renderer2);
    readonly #hold: RtuiSubMenuHoldService = inject(RtuiSubMenuHoldService);

    /**
     * Ширина, пока край держат указателем. Наружу она уходит одной просьбой на отпускании: вход
     * потребителя за каждым движением мыши не угнаться, а хранилище незачем писать сотней раз.
     */
    readonly #draggedWidth: WritableSignal<number | null> = signal(null);
    /** Снятие слушателей документа. Ведут и отпускают за пределами самой ручки. */
    #stopDrag: (() => void) | null = null;

    /** Подменю открыл указатель. У закреплённой моды открытость считается не так. */
    readonly #hoverOpened: WritableSignal<boolean> = signal(false);

    /**
     * Ходьба по подменю с клавиатуры. Открывает подсвеченный пункт настоящим нажатием его строки:
     * так переход идёт ровно той же дорогой, что и у мыши, — вместе с закрытием подменю и уходом
     * просьбы наружу.
     */
    readonly #keyboard: SubMenuKeyboard = new SubMenuKeyboard({
        open: (item: ISideMenu.Item): void => pressSubMenuRow(this.subMenuPanelRef()?.nativeElement ?? null, item),
        clearQuery: (): void => this.onSubMenuSearch(''),
    });

    /**
     * Человек работает с полем поиска, и подменю держится открытым, пока он не уйдёт нажатием
     * наружу.
     *
     * Заведено потому, что незакреплённое подменю живёт наведением: увести указатель к полю и
     * набрать в нём запрос — движение той же руки, и на полпути список исчезал. Уход фокуса
     * удержания не снимает: человек переходит от поля к пунктам того же подменю.
     */
    readonly #searchHeld: WritableSignal<boolean> = signal(false);

    /**
     * Что показывает закреплённое подменю: выбранный человеком раздел, а пока выбора нет —
     * раздел активного адреса. Само закрепление содержимого не меняет: человек закрепляет то
     * подменю, которое перед ним, и нажатие переключателя его не отнимает.
     *
     * Выбор стоит впереди активности, а не позади неё, потому что иначе до соседнего раздела не
     * добраться вовсе: пока активный пункт несёт своё подменю, оно возвращалось на любое нажатие
     * полосы, и закреплённый человек оставался запертым в том разделе, с которого начал. Ставит и
     * снимает выбор `#pickPinnedSubMenu`.
     */
    readonly #pinnedSubMenu: Signal<ISideMenu.Item[]> = computed((): ISideMenu.Item[] => {
        if (!this.isPinned()) {
            return [];
        }

        const picked: TNullable<ISideMenu.Item[]> = this.selectedSubMenu();

        if (picked?.length) {
            return picked;
        }

        const active: Array<string | number> = this.activeMenuIds();
        const activeItem: TNullable<ISideMenu.Item> =
            this.menuItems().find((item: ISideMenu.Item): boolean => active.includes(item.id) && !!item.submenu?.length) ?? null;

        return activeItem?.submenu ?? [];
    });

    /**
     * Натянутая ширина панели. Своего выбора нет — переменная не ставится вовсе, и ширину берёт
     * набор токенов: своё число здесь подменило бы его молча.
     * Кладётся своим свойством, а не тем, каким ширину задаёт
     * потребитель: панель берёт наибольшее из двух, и заданная оформлением ширина остаётся нижним
     * пределом сама по себе. Числом в ките этот предел назвать нечем — ширину знает потребитель.
     */
    protected readonly subMenuWidthStyle: Signal<string | null> = computed((): string | null => {
        const width: number | null = this.#draggedWidth() ?? this.subMenuWidth();

        return width === null ? null : `${clampSubMenuWidth(width)}px`;
    });

    /** Экран узкий: замер кита, и другого источника у этого признака нет. */
    protected readonly narrow: Signal<boolean> = computed(() => !!this.#breakpoints.isMobile());

    /** Подписи зашиты: словаря у кита нет, и кнопка возврата рядом названа тем же способом. */
    protected readonly searchLabel: string = 'Search';
    protected readonly pinLabel: string = 'Pin submenu';
    protected readonly unpinLabel: string = 'Unpin submenu';
    protected readonly nothingFoundLabel: string = 'Nothing found';
    protected readonly resizeLabel: string = 'Resize submenu';

    /**
     * Закрепление действует. На узком экране подменю занимает экран целиком, закреплять там
     * нечего — и переключателя в узкой разметке нет.
     */
    protected readonly isPinned: Signal<boolean> = computed((): boolean => this.subMenuMode() === 'pinned' && !this.narrow());

    /**
     * Подменю держится набором запроса: на это время оно шире и уходом указателя не закрывается.
     * Читает это оформление — модификатор на контейнере, — и разметка меню.
     */
    protected readonly isSearchHeld: Signal<boolean> = computed((): boolean => this.#searchHeld() && !this.isPinned());

    /** Закреплённое подменю открыто, пока ему есть что показать: указатель на это не влияет. */
    protected readonly subMenuOpened: Signal<boolean> = computed((): boolean =>
        this.isPinned() ? this.#pinnedSubMenu().length > 0 : this.#hoverOpened()
    );

    /** Что видно в подменю: отобранные пункты того набора, который его сейчас наполняет. */
    protected readonly visibleSubMenuItems: Signal<ISideMenu.Item[]> = computed((): ISideMenu.Item[] =>
        filterSubMenuItems(this.isPinned() ? this.#pinnedSubMenu() : (this.selectedSubMenu() ?? []), this.subMenuQuery())
    );

    /**
     * Какие папки подменю стоят раскрытыми. Публично: подпункт берёт раскрытость отсюда — своей у
     * него нет, а его собственная разметка вложена в него же на любую глубину.
     *
     * Пустой запрос отдаёт прежнюю раскрытость, ту, что была до набора: раскрытым остаётся только
     * раздел текущего адреса. Непустой добавляет к ней все папки, в которых нашлось совпадение, —
     * иначе результат поиска лежит за закрытым заголовком и человеку нужно нажать ещё раз, чтобы
     * увидеть то, что он уже нашёл.
     */
    public readonly expandedMenuIds: Signal<Array<string | number>> = computed((): Array<string | number> => {
        const active: Array<string | number> = this.activeMenuIds();
        const found: Array<string | number> = this.subMenuQuery().trim() === '' ? [] : subMenuIdsToExpand(this.visibleSubMenuItems());
        const closed: Array<string | number> = this.#keyboard.closedIds();

        return [...active, ...found, ...this.#keyboard.openedIds()].filter((id: string | number): boolean => !closed.includes(id));
    });

    /** Пункт под подсветкой клавиатуры. Публично: отмечает его подпункт, своего состояния у него нет. */
    public readonly highlightedMenuId: Signal<string | number | null> = this.#keyboard.highlightedId;
    public readonly headerTpl: Signal<TNullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiSideMenuHeaderDirective, {
        read: TemplateRef,
    });
    public readonly footerTpl: Signal<TNullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiSideMenuFooterDirective, {
        read: TemplateRef,
    });
    /** Что набрано в поиске. Публично: подпункт берёт запрос отсюда, чтобы отметить совпавшее. */
    public readonly subMenuQuery: WritableSignal<string> = signal('');
    public readonly subMenuRef: Signal<TNullable<MatDrawer>> = viewChild(MatDrawer);
    public readonly subMenuPanelRef: Signal<TNullable<ElementRef<HTMLElement>>> = viewChild('subMenuPanel', { read: ElementRef });

    public readonly backToMainMenuButton: Signal<ISideMenu.Item> = signal({ id: 0, icon: 'arrow_back', name: 'Main Menu', link: ' ' });
    public readonly selectedItem: WritableSignal<TNullable<ISideMenu.Item>> = signal(null);
    public readonly selectedSubMenu: WritableSignal<TNullable<ISideMenu.Item[]>> = signal(null);

    public activeMenuIds: InputSignal<Array<string | number>> = input.required();
    public menuItems: InputSignalWithTransform<ISideMenu.Item[], ISideMenu.Item[]> = input<ISideMenu.Item[], ISideMenu.Item[]>([], {
        transform: (value: ISideMenu.Item[]) => transformArrayInput(value),
    });
    /** Мода подменю. Умолчание — сегодняшнее поведение: открывается наведением. */
    public subMenuMode: InputSignal<ISideMenu.SubMenuMode> = input<ISideMenu.SubMenuMode>('hover');
    /**
     * Ширина закреплённого подменю в пикселях. Пустая — ширину ставит оформление; хранит выбор
     * потребитель, как и моду.
     */
    public subMenuWidth: InputSignal<number | null> = input<number | null>(null);
    public isSubMenuXScrollEnabled: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(true, {
        transform: booleanAttribute,
    });
    public isMainMenuIconsOutlined: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    public isSubMenuIconsOutlined: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    public isSubMenuButtonIconsOutlined: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });
    public isSubMenuTooltipsShown: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
        transform: booleanAttribute,
    });

    public activeMenuId: Signal<number | string> = computed(() =>
        this.activeMenuIds()?.length ? this.activeMenuIds()[this.activeMenuIds()?.length - 1] : ''
    );

    /**
     * Просьба о моде, а не смена моды: предпочтение хранит потребитель кита и возвращает его
     * входом. Своего состояния о нём меню не заводит.
     */
    public readonly subMenuModeChange: OutputEmitterRef<ISideMenu.SubMenuMode> = output<ISideMenu.SubMenuMode>();
    /** Просьба о ширине — по той же причине, что и просьба о моде: своего состояния меню не держит. */
    public readonly subMenuWidthChange: OutputEmitterRef<number> = output<number>();
    public readonly closeMobileMenuAction: OutputEmitterRef<void> = output<void>();
    public readonly clickSubMenuAction: OutputEmitterRef<{ item: ISideMenu.Item; event: MouseEvent }> = output<{
        item: ISideMenu.Item;
        event: MouseEvent;
    }>();
    public readonly clickSubMenuAdditionalAction: OutputEmitterRef<{ data: ISideMenu.ItemData; event: MouseEvent }> = output<{
        data: ISideMenu.ItemData;
        event: MouseEvent;
    }>();

    public onClickMenu(item: ISideMenu.Item): void {
        if (this.isPinned()) {
            this.#pickPinnedSubMenu(item);
            this.closeMobileMenu();

            return;
        }

        this.selectedItem.set(item);

        if (item?.submenu) {
            this.selectedSubMenu.set(item.submenu);
            this.#openSubMenu();
        } else if (this.selectedSubMenu()) {
            this.closeSubMenu();
        } else {
            // У пункта нет подменю, и открытого подменю тоже нет — закрывать нечего.
        }

        if (item?.link) {
            this.closeMobileMenu();
        }
    }

    public onClickSubMenu({ item, event }: { item: ISideMenu.Item; event: MouseEvent }): void {
        if (!item?.link) {
            return;
        }

        this.clickSubMenuAction.emit({ item, event });

        if (!this.isPinned()) {
            this.closeSubMenu();
        }

        this.closeMobileMenu();
    }

    public onBackToMainMenu(): void {
        this.selectedItem.set(null);
        this.selectedSubMenu.set(null);
    }

    public toggleSubMenu(item?: ISideMenu.Item): void {
        if (this.isPinned()) {
            // Закреплённое подменю не открывается и не закрывается указателем.
            return;
        }

        if (item === undefined && (this.#searchHeld() || this.#hold.held())) {
            // Указатель ушёл с панели, а человек работает с полем, звездой или строкой избранного.
            return;
        }

        if (item?.submenu) {
            this.selectedSubMenu.set(item.submenu);
            this.#openSubMenu();
        } else if (this.selectedItem()?.submenu) {
            this.selectedSubMenu.set(this.selectedItem()?.submenu);
        } else {
            this.closeSubMenu();
        }
    }

    public closeSubMenu(): void {
        this.selectedItem.set(null);
        this.selectedSubMenu.set(null);
        this.subMenuQuery.set('');
        this.#hoverOpened.set(false);
        this.#searchHeld.set(false);
        this.#hold.release();
        this.#keyboard.reset();
    }

    /**
     * Человек взялся за поле поиска. Дальше подменю держится открытым, и увести его уходом
     * указателя нельзя — закрывает нажатие снаружи, то есть подложка под незакреплённой панелью.
     */
    public onSearchHold(): void {
        if (!this.isPinned()) {
            this.#searchHeld.set(true);
        }
    }

    /** Нажат переключатель моды: наружу уходит просьба, вход остаётся прежним. */
    public onSubMenuModeToggle(): void {
        this.subMenuModeChange.emit(this.isPinned() ? 'hover' : 'pinned');
    }

    /**
     * Взята ручка правого края. Слушатели вешаются на документ: рука уходит с узкой полоски
     * ручки в первое же движение, и слушатель на ней самой терял бы тягу сразу.
     */
    public onResizeStart(event: MouseEvent): void {
        if (!this.isPinned() || this.#stopDrag !== null) {
            return;
        }

        // Иначе указатель выделяет подписи пунктов, и тяга выглядит выделением текста.
        event.preventDefault();

        const startX: number = event.clientX;
        const startWidth: number = this.subMenuWidth() ?? this.#measureSubMenuWidth();

        const stopMove: () => void = this.#renderer.listen('document', 'mousemove', (moveEvent: MouseEvent): void => {
            this.#draggedWidth.set(clampSubMenuWidth(startWidth + moveEvent.clientX - startX));
        });
        const stopUp: () => void = this.#renderer.listen('document', 'mouseup', (): void => this.#finishResize());

        this.#stopDrag = (): void => {
            stopMove();
            stopUp();
            this.#stopDrag = null;
        };
    }

    public onSubMenuSearch(query: string): void {
        this.subMenuQuery.set(query);
        this.onSearchHold();
        // Видимый список пересобрался: подсветка и раскрытое стрелками к нему больше не относятся.
        this.#keyboard.reset();
    }

    /**
     * Нажата клавиша в поле поиска. Поле фокуса не теряет и раздаёт клавиши списку: иначе набор
     * запроса прерывался бы на первой же стрелке. Умолчание отменяется только у съеденной клавиши —
     * буквы уходят полю нетронутыми.
     */
    public onSearchKeydown(event: KeyboardEvent): void {
        if (!this.#keyboard.press(event.key, this.visibleSubMenuItems(), this.expandedMenuIds())) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
    }

    public closeMobileMenu(): void {
        if (this.narrow()) {
            this.closeMobileMenuAction.emit();
        }
    }

    public clickSubMenuAdditional({ data, event }: { data: ISideMenu.ItemData; event: MouseEvent }): void {
        this.clickSubMenuAdditionalAction.emit({ data, event });
    }

    #openSubMenu(): void {
        this.#hoverOpened.set(true);
    }

    /**
     * Нажат пункт полосы, пока подменю закреплено. Наведение здесь по-прежнему не делает ничего:
     * рука идёт вдоль полосы к подвалу и к самой панели, и переставленное наведением подменю
     * мелькало бы разделами по дороге. Нажатие — выбор человека, и для раздела без своего адреса
     * это единственный способ его открыть.
     *
     * Пункт со своим адресом и без разделов выбор снимает: человек ушёл на страницу, разделов у
     * которой нет, и оставленная от прежнего раздела панель врала бы о том, где он стоит.
     */
    #pickPinnedSubMenu(item: ISideMenu.Item): void {
        if (item?.submenu?.length) {
            this.selectedItem.set(item);
            this.selectedSubMenu.set(item.submenu);
            this.subMenuQuery.set('');
        } else if (item?.link) {
            this.selectedItem.set(null);
            this.selectedSubMenu.set(null);
            this.subMenuQuery.set('');
        } else {
            // Пункт без разделов и без своего адреса: нажимать в нём нечего, и выбор остаётся прежним.
        }
    }

    /**
     * Конец тяги. Наружу уходит натянутая ширина, а не та, что получилась на экране: нижний
     * предел держит оформление — панель не бывает уже той ширины, какую задал потребитель, — и
     * замерить применённое можно только там, где раскладка уже посчитана. Хранит потребитель
     * выбор человека; вид от этого не меняется, потому что предел стоит в самом оформлении.
     */
    #finishResize(): void {
        const width: number | null = this.#draggedWidth();

        this.#stopDrag?.();
        this.#draggedWidth.set(null);

        if (width !== null) {
            this.subMenuWidthChange.emit(width);
        }
    }

    /** Ширина, от которой отсчитывается тяга, когда своего выбора ещё нет: та, что нарисована. */
    #measureSubMenuWidth(): number {
        const panel: ElementRef<HTMLElement> | null = this.subMenuPanelRef() ?? null;
        const width: number = panel?.nativeElement.getBoundingClientRect().width ?? 0;

        return width > 0 ? width : SUB_MENU_WIDTH_MIN;
    }
}
