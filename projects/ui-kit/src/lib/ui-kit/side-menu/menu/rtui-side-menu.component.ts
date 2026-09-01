import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    Directive,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
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
    host: { class: BEM_BLOCK },
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

    /** Экран узкий: замер кита, и другого источника у этого признака нет. */
    protected readonly narrow: Signal<boolean> = computed(() => !!this.#breakpoints.isMobile());

    /** Подписи зашиты: словаря у кита нет, и кнопка возврата рядом названа тем же способом. */
    protected readonly searchLabel: string = 'Search';
    protected readonly pinLabel: string = 'Pin submenu';
    protected readonly unpinLabel: string = 'Unpin submenu';
    protected readonly nothingFoundLabel: string = 'Nothing found';

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

    public readonly backToMainMenuButton: Signal<ISideMenu.Item> = signal({ id: 0, icon: 'arrow_back', name: 'Main Menu', link: ' ' });
    public readonly selectedItem: WritableSignal<TNullable<ISideMenu.Item>> = signal(null);
    public readonly selectedSubMenu: WritableSignal<TNullable<ISideMenu.Item[]>> = signal(null);

    public activeMenuIds: InputSignal<Array<string | number>> = input.required();
    public menuItems: InputSignalWithTransform<ISideMenu.Item[], ISideMenu.Item[]> = input<ISideMenu.Item[], ISideMenu.Item[]>([], {
        transform: (value: ISideMenu.Item[]) => transformArrayInput(value),
    });
    /** Мода подменю. Умолчание — сегодняшнее поведение: открывается наведением. */
    public subMenuMode: InputSignal<ISideMenu.SubMenuMode> = input<ISideMenu.SubMenuMode>('hover');
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
}
