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
import {
    clampSubMenuWidth,
    filterSubMenuItems,
    normalizeFavoriteActionsReserve,
    subMenuIdsToExpand,
    SUB_MENU_WIDTH_MIN,
} from '../side-menu.logic';
import { IRtuiSideMenuHost, ISideMenu, RTUI_SIDE_MENU } from '../side-menu.types';
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
import { DEFAULT_MENU_ID, normalizeMenuId } from '../settings/side-menu-settings.logic';
import { SubMenuResize } from './sub-menu-resize';
import { RtuiSideMenuSettingsService } from '../settings/rtui-side-menu-settings.service';

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
        // Отметку читают стили строк подменю: скрытые кнопки избранного отдают ширину подписи.
        '[class.rtui-side-menu--favorite-actions-none]': "favoriteActionsReserve() === 'none'",
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
export class RtuiSideMenuComponent implements IRtuiSideMenuHost {
    readonly #breakpoints: BreakpointService = inject(BreakpointService);
    readonly #renderer: Renderer2 = inject(Renderer2);
    readonly #hold: RtuiSubMenuHoldService | null = inject(RtuiSubMenuHoldService, { optional: true });
    /** Настройки меню, если приложение их включило: мода и ширина хранятся там под `menuId`. */
    readonly #settings: RtuiSideMenuSettingsService | null = inject(RtuiSideMenuSettingsService, { optional: true });

    /** Тяга правого края: натянутая ширина уходит в настройки меню и наружу. */
    readonly #resize: SubMenuResize = new SubMenuResize({
        listen: (event: 'mousemove' | 'mouseup', handler: (event: MouseEvent) => void): (() => void) =>
            this.#renderer.listen('document', event, handler),
        finish: (width: number): void => {
            this.#settings?.setSubMenuWidth(this.menuId(), width);
            this.subMenuWidthChange.emit(width);
        },
    });

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
     * наружу: иначе на полпути от полосы к полю подменю, живущее наведением, исчезало.
     */
    readonly #searchHeld: WritableSignal<boolean> = signal(false);
    /** Мода и ширина в работе: вход приложения, иначе сохранённые под номером меню. */
    readonly #mode: Signal<ISideMenu.SubMenuMode> = computed(
        (): ISideMenu.SubMenuMode => this.subMenuMode() ?? this.#settings?.subMenuMode(this.menuId())() ?? 'hover'
    );
    readonly #width: Signal<number | null> = computed(
        (): number | null => this.subMenuWidth() ?? this.#settings?.subMenuWidth(this.menuId())() ?? null
    );

    /**
     * Что показывает закреплённое подменю: выбранный человеком раздел, а пока выбора нет — раздел
     * активного адреса. Выбор впереди активности: иначе до соседнего раздела не добраться вовсе.
     * Ставит и снимает выбор `#pickPinnedSubMenu`.
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
        const width: number | null = this.#resize.width() ?? this.#width();

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
    protected readonly isPinned: Signal<boolean> = computed((): boolean => this.#mode() === 'pinned' && !this.narrow());

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
        filterSubMenuItems(this.shownSubMenu(), this.subMenuQuery())
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
    /** Набор, который подменю наполняет сейчас, до отбора поиском; по нему избранное узнаёт свой раздел. */
    public readonly shownSubMenu: Signal<ISideMenu.Item[]> = computed((): ISideMenu.Item[] =>
        this.isPinned() ? this.#pinnedSubMenu() : (this.selectedSubMenu() ?? [])
    );

    public activeMenuIds: InputSignal<Array<string | number>> = input.required();
    public menuItems: InputSignalWithTransform<ISideMenu.Item[], ISideMenu.Item[]> = input<ISideMenu.Item[], ISideMenu.Item[]>([], {
        transform: (value: ISideMenu.Item[]) => transformArrayInput(value),
    });
    /** Мода подменю от приложения. Задана — важнее сохранённой; нет ни той, ни другой — наведение. */
    public subMenuMode: InputSignal<ISideMenu.SubMenuMode | undefined> = input<ISideMenu.SubMenuMode | undefined>(undefined);
    /** Ширина закреплённого подменю в пикселях от приложения. Пусто — берётся сохранённая, её нет — оформление. */
    public subMenuWidth: InputSignal<number | null | undefined> = input<number | null | undefined>(undefined);
    /** Под каким номером меню хранит свои настройки: у двух меню приложения — два номера. */
    public menuId: InputSignalWithTransform<string, string | null | undefined> = input<string, string | null | undefined>(DEFAULT_MENU_ID, {
        transform: normalizeMenuId,
    });
    /**
     * Место под кнопки избранного, ждущие наведения: `none`, по умолчанию, — в покое ширины не
     * занимают, и подпись идёт до края, а под наведением сжимается перед кнопками; `always` —
     * держат ширину и в покое. Незнакомое значение и пустой атрибут — то же, что `none`.
     */
    public favoriteActionsReserve: InputSignalWithTransform<ISideMenu.FavoriteActionsReserve, string | undefined> = input<
        ISideMenu.FavoriteActionsReserve,
        string | undefined
    >('none', { transform: normalizeFavoriteActionsReserve });
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

    /** Выбранная мода: меню пишет её в настройки, если они включены, и сообщает приложению. */
    public readonly subMenuModeChange: OutputEmitterRef<ISideMenu.SubMenuMode> = output<ISideMenu.SubMenuMode>();
    /** Натянутая ширина — так же, как мода. */
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

        if (item === undefined && (this.#searchHeld() || this.#hold?.held())) {
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
        this.#hold?.release();
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

    /** Нажат переключатель моды: выбор уходит в настройки меню и наружу. */
    public onSubMenuModeToggle(): void {
        const mode: ISideMenu.SubMenuMode = this.isPinned() ? 'hover' : 'pinned';

        this.#settings?.setSubMenuMode(this.menuId(), mode);
        this.subMenuModeChange.emit(mode);
    }

    /** Взята ручка правого края закреплённого подменю. */
    public onResizeStart(event: MouseEvent): void {
        if (!this.isPinned() || this.#resize.isActive()) {
            return;
        }

        // Иначе указатель выделяет подписи пунктов, и тяга выглядит выделением текста.
        event.preventDefault();
        this.#resize.start(event.clientX, this.#width() ?? this.#measureSubMenuWidth());
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

    /** Ширина, от которой отсчитывается тяга, когда своего выбора ещё нет: та, что нарисована. */
    #measureSubMenuWidth(): number {
        const panel: ElementRef<HTMLElement> | null = this.subMenuPanelRef() ?? null;
        const width: number = panel?.nativeElement.getBoundingClientRect().width ?? 0;

        return width > 0 ? width : SUB_MENU_WIDTH_MIN;
    }
}
