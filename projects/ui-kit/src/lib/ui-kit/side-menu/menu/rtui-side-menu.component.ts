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
import { MatIcon } from '@angular/material/icon';
import { MatListItem, MatListItemIcon, MatNavList } from '@angular/material/list';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';

import { BlockDirective, BreakpointService, ElemDirective, ModDirective } from '@rt-tools/core';
import { TNullable } from '@rt-tools/utils';
import { transformArrayInput } from '@rt-tools/utils';
import { RtIconOutlinedDirective, RtNavigationDirective, RtScrollToElementDirective } from '@rt-tools/core';
import { clampSubMenuWidth, SUB_MENU_WIDTH_MIN } from '../side-menu.logic';
import { filterSubMenuItems } from '../side-menu.logic';
import { ISideMenu, RTUI_SIDE_MENU } from '../side-menu.types';
import {
    RtuiScrollableContainerComponent,
    RtuiScrollableContainerContentDirective,
    RtuiScrollableContainerFooterDirective,
    RtuiScrollableContainerHeaderDirective,
} from '../../scrollable';
import { RtuiSideMenuSubItemComponent } from '../menu-sub-item/rtui-side-menu-sub-item.component';

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
        '[style.--rt-side-menu-sub-menu-width]': 'subMenuWidthStyle()',
    },
    templateUrl: './rtui-side-menu.component.html',
    styleUrls: ['./rtui-side-menu.component.scss'],
    providers: [BreakpointService, { provide: RTUI_SIDE_MENU, useExisting: RtuiSideMenuComponent }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgTemplateOutlet,
        MatSidenavModule,
        MatIcon,
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
        RtuiSideMenuSubItemComponent,
    ],
})
export class RtuiSideMenuComponent {
    readonly #breakpoints: BreakpointService = inject(BreakpointService);
    readonly #renderer: Renderer2 = inject(Renderer2);

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
     * Что показывает закреплённое подменю: пункт активного адреса, а если активного нет — то,
     * что открыто сейчас. Закрепление содержимого не меняет: человек закрепляет то подменю,
     * которое перед ним, и потерять его нажатием он не должен.
     */
    readonly #pinnedSubMenu: Signal<ISideMenu.Item[]> = computed((): ISideMenu.Item[] => {
        if (!this.isPinned()) {
            return [];
        }

        const active: Array<string | number> = this.activeMenuIds();
        const activeItem: TNullable<ISideMenu.Item> =
            this.menuItems().find((item: ISideMenu.Item): boolean => active.includes(item.id) && !!item.submenu?.length) ?? null;

        return activeItem?.submenu ?? this.selectedSubMenu() ?? [];
    });

    /**
     * Ширина подменю в оформлении. Своего выбора нет — переменная не ставится вовсе, и ширину
     * берёт набор токенов: своё число здесь подменило бы его молча.
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

    protected readonly subMenuQuery: WritableSignal<string> = signal('');
    /**
     * Закрепление действует. На узком экране подменю занимает экран целиком, закреплять там
     * нечего — и переключателя в узкой разметке нет.
     */
    protected readonly isPinned: Signal<boolean> = computed((): boolean => this.subMenuMode() === 'pinned' && !this.narrow());

    /** Закреплённое подменю открыто, пока ему есть что показать: указатель на это не влияет. */
    protected readonly subMenuOpened: Signal<boolean> = computed((): boolean =>
        this.isPinned() ? this.#pinnedSubMenu().length > 0 : this.#hoverOpened()
    );

    /** Что видно в подменю: отобранные пункты того набора, который его сейчас наполняет. */
    protected readonly visibleSubMenuItems: Signal<ISideMenu.Item[]> = computed((): ISideMenu.Item[] =>
        filterSubMenuItems(this.isPinned() ? this.#pinnedSubMenu() : (this.selectedSubMenu() ?? []), this.subMenuQuery())
    );
    public readonly headerTpl: Signal<TNullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiSideMenuHeaderDirective, {
        read: TemplateRef,
    });
    public readonly footerTpl: Signal<TNullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiSideMenuFooterDirective, {
        read: TemplateRef,
    });
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
            // Закреплённое подменю ведёт вход активности: нажатие пункта его не переставляет.
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

    /** Отпускание: слушатели снимаются, а ширина уходит просьбой наружу. */
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
