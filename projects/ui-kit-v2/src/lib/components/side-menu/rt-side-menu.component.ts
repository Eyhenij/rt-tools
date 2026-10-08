import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    DestroyRef,
    ElementRef,
    effect,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    isDevMode,
    output,
    OutputEmitterRef,
    Renderer2,
    Signal,
    signal,
    TemplateRef,
    viewChild,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { IRtInput, rtKitLabel } from '@rt-tools/ui-kit-v2/core';
import { BreakpointsService } from '@rt-tools/ui-kit-v2/core';
import { RtIconComponent } from '@rt-tools/ui-kit-v2/icon';
import { RtIconButtonComponent } from '@rt-tools/ui-kit-v2/icon-button';
import { RtInputComponent } from '@rt-tools/ui-kit-v2/input';
import {
    RtScrollAreaComponent,
    RtScrollAreaContentDirective,
    RtScrollAreaFooterDirective,
    RtScrollAreaHeaderDirective,
} from '@rt-tools/ui-kit-v2/scroll-area';
import { RtTooltipDirective } from '@rt-tools/ui-kit-v2/tooltip';
import { RtSideMenuFavoritesComponent } from './favorites/rt-side-menu-favorites.component';
import { RtSubMenuKeyboard } from './rt-side-menu-keyboard';
import { RtSideMenuResize } from './rt-side-menu-resize';
import { normalizeSideMenuId, RT_SIDE_MENU_DEFAULT_ID } from './rt-side-menu-settings.logic';
import { RtSideMenuSettingsService } from './rt-side-menu-settings.service';
import { unpairedSideMenuIcons } from './rt-side-menu-icon.logic';
import { RtSideMenuIconPipe } from './rt-side-menu-icon.pipe';
import {
    IRtSideMenuIconContext,
    RtSideMenuFooterDirective,
    RtSideMenuHeaderDirective,
    RtSideMenuIconDirective,
} from './rt-side-menu.directives';
import {
    clampSideMenuWidth,
    drawnSideMenuWidth,
    filterSideMenuItems,
    pinnedSideMenuItems,
    RT_SIDE_MENU_WIDTH_MAX,
    RT_SIDE_MENU_WIDTH_MIN,
    sideMenuIdsToExpand,
} from './rt-side-menu.logic';
import { IRtSideMenu } from './rt-side-menu.model';
import { IRtSideMenuHost, RT_SIDE_MENU } from './rt-side-menu.tokens';
import { RtSideMenuSubItemComponent } from './sub-item/rt-side-menu-sub-item.component';

const BEM_BLOCK: string = 'rt-side-menu';

/**
 * Боковая навигация: полоса пунктов и подменю раздела рядом. Перенос бокового меню первого кита на
 * части второго; `rt-menu` — другое семейство, выпадающее меню действий.
 */
@Component({
    selector: 'rt-side-menu',
    host: {
        class: BEM_BLOCK,
        // Раскладка хоста меняется только у закреплённого режима: панель встаёт в поток рядом с полосой.
        '[class.rt-side-menu--pinned]': 'isPinned()',
        // Натянутая ширина подменю приходит своим свойством: панель берёт наибольшее из него и ширины оформления.
        '[style.--rt-side-menu-panel-dragged-width]': 'panelWidthStyle()',
        // Кнопки избранного, ждущие наведения, в покое ширины не занимают.
        '[class.rt-side-menu--favorite-actions-none]': "favoriteActionsReserve() === 'none'",
    },
    templateUrl: './rt-side-menu.component.html',
    styleUrls: ['./rt-side-menu.component.scss'],
    providers: [{ provide: RT_SIDE_MENU, useExisting: RtSideMenuComponent }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        NgTemplateOutlet,
        ReactiveFormsModule,
        RouterLink,
        BlockDirective,
        ElemDirective,
        ModDirective,
        RtIconComponent,
        RtIconButtonComponent,
        RtInputComponent,
        RtScrollAreaComponent,
        RtScrollAreaContentDirective,
        RtScrollAreaFooterDirective,
        RtScrollAreaHeaderDirective,
        RtTooltipDirective,
        RtSideMenuFavoritesComponent,
        RtSideMenuIconPipe,
        RtSideMenuSubItemComponent,
    ],
})
export class RtSideMenuComponent implements IRtSideMenuHost {
    readonly #breakpoints: BreakpointsService = inject(BreakpointsService);
    readonly #renderer: Renderer2 = inject(Renderer2);
    /** Настройки меню, если приложение их включило: режим и ширина хранятся там под `menuId`. */
    readonly #settings: RtSideMenuSettingsService | null = inject(RtSideMenuSettingsService, { optional: true });

    /** Тяга ширины: просьба уходит одна, на отпускании — в настройки меню и наружу. */
    readonly #resize: RtSideMenuResize = new RtSideMenuResize(
        (target: HTMLElement, name: string, handler: (event: PointerEvent) => void): (() => void) =>
            this.#renderer.listen(target, name, handler),
        {
            askWidth: (width: number): void => {
                this.#settings?.setSubMenuWidth(this.menuId(), width);
                this.subMenuWidthChange.emit(width);
            },
            started: (): void => this.subMenuResizeStart.emit(),
            ended: (): void => this.subMenuResizeEnd.emit(),
            panel: (): HTMLElement | null => this.panelRef()?.nativeElement ?? null,
            namedWidth: (): number | null => this.#width(),
        },
        inject(DestroyRef)
    );

    /** Ходьба с клавиатуры открывает пункт настоящим нажатием его строки — той же дорогой, что и мышь. */
    readonly #keyboard: RtSubMenuKeyboard = new RtSubMenuKeyboard({
        open: (item: IRtSideMenu.Item): void => this.#pressRow(item),
        clearQuery: (): void => this.searchControl.setValue(''),
    });

    /** Подменю открыл указатель. У закреплённого режима открытость считается иначе. */
    readonly #hoverOpened: WritableSignal<boolean> = signal(false);
    /** Человек в поле поиска: подменю держится открытым до нажатия снаружи. */
    readonly #searchHeld: WritableSignal<boolean> = signal(false);
    /** Строку избранного тянут: уход указателя за панель подменю не закрывает. */
    readonly #dragHeld: WritableSignal<boolean> = signal(false);
    /**
     * Режим и ширина в работе: вход приложения, иначе сохранённые под номером меню. Без кнопки
     * закрепления сохранённый режим не читается: открепить меню, закреплённое раньше, было бы нечем.
     */
    readonly #mode: Signal<IRtSideMenu.SubMenuMode> = computed(
        (): IRtSideMenu.SubMenuMode =>
            this.subMenuMode() ?? (this.pinShown() ? this.#settings?.subMenuMode(this.menuId())() : undefined) ?? 'hover'
    );
    readonly #width: Signal<number | null> = computed(
        (): number | null => this.subMenuWidth() ?? this.#settings?.subMenuWidth(this.menuId())() ?? null
    );
    readonly #pinnedSubMenu: Signal<IRtSideMenu.Item[]> = computed((): IRtSideMenu.Item[] =>
        this.isPinned() ? pinnedSideMenuItems(this.selectedSubMenu(), this.activeMenuIds(), this.menuItems()) : []
    );

    protected readonly searchControl: FormControl<string | null> = new FormControl<string | null>('');
    protected readonly panelRef: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement>>('panel');
    protected readonly headerTpl: Signal<TemplateRef<unknown> | undefined> = contentChild(RtSideMenuHeaderDirective, { read: TemplateRef });
    protected readonly footerTpl: Signal<TemplateRef<unknown> | undefined> = contentChild(RtSideMenuFooterDirective, { read: TemplateRef });

    protected readonly searchLabel: Signal<string> = rtKitLabel('sideMenuSearch');
    protected readonly pinLabel: Signal<string> = rtKitLabel('sideMenuPin');
    protected readonly unpinLabel: Signal<string> = rtKitLabel('sideMenuUnpin');
    protected readonly nothingFoundLabel: Signal<string> = rtKitLabel('sideMenuNothingFound');
    protected readonly resizeLabel: Signal<string> = rtKitLabel('sideMenuResize');
    protected readonly backLabel: Signal<string> = rtKitLabel('sideMenuBack');

    /** Экран узкий: замер кита, и другого источника у этого признака нет. */
    protected readonly narrow: Signal<boolean> = this.#breakpoints.narrow;
    protected readonly resizeValueNow: Signal<number | null> = this.#resize.valueNow;
    protected readonly resizeValueMin: number = RT_SIDE_MENU_WIDTH_MIN;
    protected readonly resizeValueMax: number = RT_SIDE_MENU_WIDTH_MAX;

    /** Натянутая ширина панели. Своего выбора нет — свойство не ставится, и ширину берёт оформление. */
    protected readonly panelWidthStyle: Signal<string | null> = computed((): string | null => {
        const width: number | null = this.#resize.draggedWidth() ?? this.#width();

        return width === null ? null : `${clampSideMenuWidth(width)}px`;
    });

    /** Закрепление действует только на широком экране: на узком подменю занимает экран целиком. */
    protected readonly isPinned: Signal<boolean> = computed((): boolean => this.#mode() === 'pinned' && !this.narrow());
    /** Подменю держится набором запроса: уходом указателя не закрывается. */
    protected readonly isSearchHeld: Signal<boolean> = computed((): boolean => this.#searchHeld() && !this.isPinned());
    /** Закреплённое подменю открыто, пока ему есть что показать: указатель на это не влияет. */
    protected readonly subMenuOpened: Signal<boolean> = computed((): boolean =>
        this.isPinned() ? this.#pinnedSubMenu().length > 0 : this.#hoverOpened()
    );
    protected readonly visibleSubMenuItems: Signal<IRtSideMenu.Item[]> = computed((): IRtSideMenu.Item[] =>
        filterSideMenuItems(this.shownSubMenu(), this.subMenuQuery())
    );
    protected readonly isNothingFound: Signal<boolean> = computed(
        (): boolean => this.subMenuQuery().trim() !== '' && this.visibleSubMenuItems().length === 0
    );
    /** Пункт полосы подсвечен активным: выбранный человеком, а без выбора — пункт текущего адреса. */
    protected readonly activeRailIds: Signal<ReadonlyArray<string | number>> = computed((): ReadonlyArray<string | number> => {
        const selected: IRtSideMenu.Item | null = this.selectedItem();

        return selected ? [selected.id] : this.activeMenuIds();
    });

    /** Набор, который подменю наполняет сейчас, до отбора поиском. */
    public readonly shownSubMenu: Signal<IRtSideMenu.Item[]> = computed((): IRtSideMenu.Item[] =>
        this.isPinned() ? this.#pinnedSubMenu() : (this.selectedSubMenu() ?? [])
    );
    public readonly selectedItem: WritableSignal<IRtSideMenu.Item | null> = signal(null);
    public readonly selectedSubMenu: WritableSignal<IRtSideMenu.Item[] | null> = signal(null);
    /** Что набрано в поиске: строка берёт запрос отсюда, чтобы отметить совпавшее. */
    public readonly subMenuQuery: WritableSignal<string> = signal('');
    public readonly highlightedMenuId: Signal<string | number | null> = this.#keyboard.highlightedId;

    /**
     * Какие папки раскрыты. Пустой запрос оставляет раздел текущего адреса; непустой добавляет
     * папки с совпадением — иначе найденное лежит за закрытым заголовком.
     */
    public readonly expandedMenuIds: Signal<ReadonlyArray<string | number>> = computed((): ReadonlyArray<string | number> => {
        const found: Array<string | number> = this.subMenuQuery().trim() === '' ? [] : sideMenuIdsToExpand(this.visibleSubMenuItems());
        const closed: ReadonlyArray<string | number> = this.#keyboard.closedIds();

        return [...this.activeMenuIds(), ...found, ...this.#keyboard.openedIds()].filter(
            (id: string | number): boolean => !closed.includes(id)
        );
    });

    public readonly activeMenuIds: InputSignal<ReadonlyArray<string | number>> = input.required<ReadonlyArray<string | number>>();
    public readonly menuItems: InputSignal<ReadonlyArray<IRtSideMenu.Item>> = input<ReadonlyArray<IRtSideMenu.Item>>([]);
    /** Режим подменю от приложения. Задан — важнее сохранённого; нет ни того, ни другого — наведение. */
    public readonly subMenuMode: InputSignal<IRtSideMenu.SubMenuMode | undefined> = input<IRtSideMenu.SubMenuMode | undefined>(undefined);
    /** Ширина закреплённого подменю в пикселях. Пусто — сохранённая, её нет — оформление. */
    public readonly subMenuWidth: InputSignal<number | null | undefined> = input<number | null | undefined>(undefined);
    /** Номер, под которым меню хранит свои настройки: у двух меню приложения — два номера. */
    public readonly menuId: InputSignalWithTransform<string, string | null | undefined> = input<string, string | null | undefined>(
        RT_SIDE_MENU_DEFAULT_ID,
        { transform: normalizeSideMenuId }
    );

    /** Число строк в заголовке блока избранного: всегда, у свёрнутого блока или никогда. */
    public readonly favoritesCount: InputSignal<IRtSideMenu.FavoritesCount> = input<IRtSideMenu.FavoritesCount>('collapsed');
    /** Место под кнопки избранного, ждущие наведения: держать всегда или отдавать подписи. */
    public readonly favoriteActionsReserve: InputSignal<IRtSideMenu.FavoriteActionsReserve> =
        input<IRtSideMenu.FavoriteActionsReserve>('none');
    /** Поиск показывает совпавшие строки избранного; выключено — на время поиска блока нет. */
    public readonly isFavoritesSearchShown: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });
    /** Кнопка закрепления в шапке подменю; выключено — подменю только всплывает, если режим не задан входом. */
    public readonly pinShown: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });
    /** Подсказки строк подменю — у подписей и у кнопок строк. Доступные имена остаются. */
    public readonly subMenuTooltipsShown: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });
    /**
     * Подписи под значками полосы. Выключено — имя пункта уходит в подсказку справа от значка, а
     * подсказка подчиняется `subMenuTooltipsShown`; доступное имя пункт держит всегда.
     */
    public readonly railTitlesShown: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });
    /** Залитые значки полосы — залитый рисунок материального набора и заливка шрифта лигатуры. */
    public readonly railIconFill: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    /** Размер поля поиска подменю — ступень `rt-input`. */
    public readonly searchSize: InputSignal<IRtInput.Size> = input<IRtInput.Size>('sm');
    /** Вид поля поиска подменю — вид `rt-input`. */
    public readonly searchAppearance: InputSignal<IRtInput.Appearance> = input<IRtInput.Appearance>('outline');

    public readonly subMenuModeChange: OutputEmitterRef<IRtSideMenu.SubMenuMode> = output<IRtSideMenu.SubMenuMode>();
    public readonly subMenuWidthChange: OutputEmitterRef<number> = output<number>();
    /** Начало и конец тяги: по ним потребитель накрывает чужие кадры и снимает накрытие. */
    public readonly subMenuResizeStart: OutputEmitterRef<void> = output<void>();
    public readonly subMenuResizeEnd: OutputEmitterRef<void> = output<void>();
    public readonly closeMobileMenuAction: OutputEmitterRef<void> = output<void>();
    public readonly clickSubMenuAction: OutputEmitterRef<{ item: IRtSideMenu.Item; event: MouseEvent }> = output<{
        item: IRtSideMenu.Item;
        event: MouseEvent;
    }>();
    public readonly clickSubMenuAdditionalAction: OutputEmitterRef<{ data: IRtSideMenu.ItemData | undefined; event: MouseEvent }> = output<{
        data: IRtSideMenu.ItemData | undefined;
        event: MouseEvent;
    }>();
    /** Свой значок пунктов, чьё имя кит не рисует; подпункты читают его через токен меню. */
    public readonly ownIconTpl: Signal<TemplateRef<IRtSideMenuIconContext> | undefined> = contentChild(RtSideMenuIconDirective, {
        read: TemplateRef,
    });

    constructor() {
        this.searchControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((query: string | null): void => {
            this.subMenuQuery.set(query ?? '');
            this.onSearchHold();
            // Видимый список пересобрался: подсветка и раскрытое стрелками к нему больше не относятся.
            this.#keyboard.reset();
        });

        // Имя без значка кита и без пары рисует пункт без значка, и пропуск без предупреждения не заметен.
        if (isDevMode()) {
            effect((): void => {
                const unpaired: string[] = unpairedSideMenuIcons(this.menuItems(), this.ownIconTpl() !== undefined);
                if (unpaired.length) {
                    const names: string = unpaired.map((name: string): string => `«${name}»`).join(', ');
                    // eslint-disable-next-line no-console -- предупреждение разработчику приложения: другого канала у кита нет
                    console.warn(
                        `rt-side-menu «${this.menuId()}»: значков ${names} нет ни в наборе кита, ни в перечне имён Material. ` +
                            'Задайте имя кита или свой значок через <ng-template rtSideMenuIcon>.'
                    );
                }
            });
        }
    }

    public onClickMenu(item: IRtSideMenu.Item): void {
        if (this.isPinned()) {
            this.#pickPinnedSubMenu(item);
            this.closeMobileMenu();

            return;
        }

        this.selectedItem.set(item);

        if (item.submenu) {
            this.selectedSubMenu.set(item.submenu);
            this.#hoverOpened.set(true);
        } else if (this.selectedSubMenu()) {
            this.closeSubMenu();
        } else {
            // У пункта нет подменю, и открытого подменю тоже нет — закрывать нечего.
        }

        if (item.link) {
            this.closeMobileMenu();
        }
    }

    public onClickSubMenu({ item, event }: { item: IRtSideMenu.Item; event: MouseEvent }): void {
        if (!item.link) {
            return;
        }

        this.clickSubMenuAction.emit({ item, event });

        if (!this.isPinned()) {
            this.closeSubMenu();
        }

        this.closeMobileMenu();
    }

    public onClickSubMenuAdditional(payload: { data: IRtSideMenu.ItemData | undefined; event: MouseEvent }): void {
        this.clickSubMenuAdditionalAction.emit(payload);
    }

    public onBackToMainMenu(): void {
        this.selectedItem.set(null);
        this.selectedSubMenu.set(null);
        this.searchControl.setValue('', { emitEvent: false });
        this.subMenuQuery.set('');
    }

    /** Наведение на пункт полосы открывает его подменю; уход указателя с панели — без пункта. */
    public toggleSubMenu(item?: IRtSideMenu.Item): void {
        if (this.isPinned() || (item === undefined && (this.#searchHeld() || this.#dragHeld()))) {
            return;
        }

        if (item?.submenu) {
            this.selectedSubMenu.set(item.submenu);
            this.#hoverOpened.set(true);
        } else if (this.selectedItem()?.submenu) {
            this.selectedSubMenu.set(this.selectedItem()?.submenu ?? null);
        } else {
            this.closeSubMenu();
        }
    }

    public closeSubMenu(): void {
        this.selectedItem.set(null);
        this.selectedSubMenu.set(null);
        this.searchControl.setValue('', { emitEvent: false });
        this.subMenuQuery.set('');
        this.#hoverOpened.set(false);
        this.#searchHeld.set(false);
        this.#keyboard.reset();
    }

    public holdSubMenu(held: boolean): void {
        this.#dragHeld.set(held);
    }

    public toggleFolder(item: IRtSideMenu.Item): void {
        this.#keyboard.setFolderOpen(item, !this.expandedMenuIds().includes(item.id));
    }

    /** Человек взялся за поле поиска: дальше подменю закрывает нажатие снаружи, а не уход указателя. */
    public onSearchHold(): void {
        if (!this.isPinned()) {
            this.#searchHeld.set(true);
        }
    }

    /** Клавиши поля поиска раздаются списку; умолчание отменяется только у съеденной. */
    public onSearchKeydown(event: KeyboardEvent): void {
        if (this.#keyboard.press(event.key, this.visibleSubMenuItems(), this.expandedMenuIds())) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    /** Нажат переключатель режима: выбор уходит в настройки меню и наружу. */
    public onSubMenuModeToggle(): void {
        const mode: IRtSideMenu.SubMenuMode = this.isPinned() ? 'hover' : 'pinned';

        this.#settings?.setSubMenuMode(this.menuId(), mode);
        this.subMenuModeChange.emit(mode);
    }

    public onResizeStart(event: PointerEvent): void {
        if (!this.isPinned() || this.#resize.isRunning() || event.button !== 0) {
            return;
        }

        // Иначе указатель выделяет подписи пунктов, и тяга выглядит выделением текста.
        event.preventDefault();
        this.#resize.start(event, this.#width() ?? drawnSideMenuWidth(this.panelRef()?.nativeElement ?? null));
    }

    public onResizeKeydown(event: KeyboardEvent): void {
        const from: number = this.#width() ?? drawnSideMenuWidth(this.panelRef()?.nativeElement ?? null);

        if (this.isPinned() && this.#resize.pressKey(event.key, from)) {
            event.preventDefault();
        }
    }

    public closeMobileMenu(): void {
        if (this.narrow()) {
            this.closeMobileMenuAction.emit();
        }
    }

    /**
     * Нажат пункт полосы, пока подменю закреплено: нажатие — выбор раздела. Пункт со своим адресом и
     * без разделов выбор снимает: у страницы нет разделов, и панель прежнего раздела врала бы.
     */
    #pickPinnedSubMenu(item: IRtSideMenu.Item): void {
        if (item.submenu?.length) {
            this.selectedItem.set(item);
            this.selectedSubMenu.set(item.submenu);
        } else if (item.link) {
            this.selectedItem.set(null);
            this.selectedSubMenu.set(null);
        } else {
            return;
        }

        this.searchControl.setValue('', { emitEvent: false });
        this.subMenuQuery.set('');
    }

    /**
     * Строка ищется по номеру среди узлов панели с id и нажимается как мышью: у ссылки номер стоит
     * на ней самой, у папки — на кнопке заголовка её раскрывающейся панели.
     */
    #pressRow(item: IRtSideMenu.Item): void {
        const rows: HTMLElement[] = Array.from(this.panelRef()?.nativeElement.querySelectorAll<HTMLElement>('[id]') ?? []);

        rows.find((row: HTMLElement): boolean => row.id === String(item.id))?.click();
    }
}
