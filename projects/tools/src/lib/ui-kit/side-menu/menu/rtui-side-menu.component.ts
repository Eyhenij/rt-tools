import { NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    Directive,
    InputSignal,
    InputSignalWithTransform,
    OutputEmitterRef,
    Signal,
    TemplateRef,
    Type,
    WritableSignal,
    booleanAttribute,
    computed,
    contentChild,
    inject,
    input,
    output,
    signal,
    viewChild,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatListItem, MatListItemIcon, MatNavList } from '@angular/material/list';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { Router, RouterOutlet } from '@angular/router';

import { BlockDirective, ElemDirective } from '../../../bem';
import { Nullable, RtIconOutlinedDirective, RtScrollToElementDirective, transformArrayInput } from '../../../util';
import { ISideMenu } from '../../../util/interfaces/side-menu.interface';
import {
    RtuiScrollableContainerComponent,
    RtuiScrollableContainerContentDirective,
    RtuiScrollableContainerFooterDirective,
    RtuiScrollableContainerHeaderDirective,
} from '../../scrollable';
import { RtuiSideMenuSubItemComponent } from '../menu-sub-item/rtui-side-menu-sub-item.component';

@Directive({
    standalone: true,
    selector: '[rtuiSideMenuHeader]',
})
export class RtuiSideMenuHeaderDirective {}

@Directive({
    standalone: true,
    selector: '[rtuiSideMenuFooter]',
})
export class RtuiSideMenuFooterDirective {}

@Component({
    standalone: true,
    selector: 'rtui-side-menu',
    templateUrl: './rtui-side-menu.component.html',
    styleUrls: ['./rtui-side-menu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgTemplateOutlet,
        RouterOutlet,
        MatSidenavModule,
        MatIcon,
        MatListItem,
        MatNavList,
        MatListItemIcon,

        // directives
        BlockDirective,
        ElemDirective,
        RtuiScrollableContainerHeaderDirective,
        RtuiScrollableContainerContentDirective,
        RtuiScrollableContainerFooterDirective,
        RtScrollToElementDirective,
        RtIconOutlinedDirective,

        // components
        RtuiScrollableContainerComponent,
        RtuiSideMenuSubItemComponent,
    ],
})
export class RtuiSideMenuComponent {
    readonly #router: Router = inject(Router);

    public readonly headerTpl: Signal<Nullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiSideMenuHeaderDirective, {
        read: TemplateRef,
    });
    public readonly footerTpl: Signal<Nullable<TemplateRef<Type<unknown>>>> = contentChild(RtuiSideMenuFooterDirective, {
        read: TemplateRef,
    });
    public readonly subMenuRef: Signal<Nullable<MatDrawer>> = viewChild(MatDrawer);

    public readonly backToMainMenuButton: Signal<ISideMenu.Item> = signal({ id: 0, icon: 'arrow_back', name: 'Main Menu', link: ' ' });
    public readonly selectedItem: WritableSignal<Nullable<ISideMenu.Item>> = signal(null);
    public readonly selectedSubMenu: WritableSignal<Nullable<ISideMenu.Item[]>> = signal(null);

    public activeMenuIds: InputSignal<Array<string | number>> = input.required();
    public menuItems: InputSignalWithTransform<ISideMenu.Item[], ISideMenu.Item[]> = input<ISideMenu.Item[], ISideMenu.Item[]>([], {
        transform: (value: ISideMenu.Item[]) => transformArrayInput(value),
    });
    public isMobile: InputSignalWithTransform<Nullable<boolean>, Nullable<boolean>> = input<Nullable<boolean>, Nullable<boolean>>(false, {
        transform: booleanAttribute,
    });
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

    public activeMenuId: Signal<number | string> = computed(() => {
        return this.activeMenuIds()?.length ? this.activeMenuIds()[this.activeMenuIds()?.length - 1] : '';
    });

    public readonly closeMobileMenuAction: OutputEmitterRef<void> = output<void>();
    public readonly clickSubMenuAction: OutputEmitterRef<ISideMenu.Item> = output<ISideMenu.Item>();
    public readonly clickSubMenuAdditionalAction: OutputEmitterRef<ISideMenu.ItemData> = output<ISideMenu.ItemData>();

    public onClickMenu(item?: ISideMenu.Item): void {
        this.selectedItem.set(item);

        if (item?.submenu) {
            this.selectedSubMenu.set(item.submenu);
            this.#openSubMenu();
        } else if (this.selectedSubMenu()) {
            this.closeSubMenu();
        }

        if (item?.link) {
            void this.#router.navigate([item.link]);
            this.closeMobileMenu();
        }
    }

    public onClickSubMenu(item: ISideMenu.Item): void {
        if (item?.link) {
            this.clickSubMenuAction.emit(item);
            this.closeSubMenu();
            this.closeMobileMenu();
        }
    }

    public onBackToMainMenu(): void {
        this.selectedItem.set(null);
        this.selectedSubMenu.set(null);
    }

    public toggleSubMenu(item?: ISideMenu.Item): void {
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
        this.subMenuRef()?.close().then();
    }

    public closeMobileMenu(): void {
        if (this.isMobile()) {
            this.closeMobileMenuAction.emit();
        }
    }

    public clickSubMenuAdditional(data: ISideMenu.ItemData): void {
        this.clickSubMenuAdditionalAction.emit(data);
    }

    #openSubMenu(): void {
        this.subMenuRef()?.open().then();
    }
}
