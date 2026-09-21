import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    Signal,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatNavList } from '@angular/material/list';

import { BlockDirective, ElemDirective } from '@rt-tools/core';
import { RtuiSideMenuSubItemComponent } from '../menu-sub-item/rtui-side-menu-sub-item.component';
import { RtuiSubMenuHoldService } from '../menu/rtui-sub-menu-hold.service';
import { IRtuiSideMenuHost, ISideMenu, RTUI_SIDE_MENU } from '../side-menu.types';
import { findFavoriteItems, moveVisibleFavorite } from './favorites.logic';
import { RtuiFavoritesService } from './rtui-favorites.service';

const BEM_BLOCK: string = 'rtui-side-menu-favorites';

/**
 * Блок избранного вверху подменю: выбранные человеком разделы в порядке его списка.
 *
 * Строки собираются из пунктов самого меню, а не из хранилища: подпись следует языку пунктов, адрес
 * — объявлению. Номер без пункта в меню не показывается, но из списка не уходит. Строку рисует тот
 * же подпункт, что и в списке, — строка избранного выглядит и открывается так же, как её пункт.
 *
 * Пока в поиске что-то набрано, блока нет: поиск принадлежит разделу. Показать нечего — блок места
 * не занимает.
 */
@Component({
    selector: 'rtui-side-menu-favorites',
    host: { class: BEM_BLOCK },
    templateUrl: './rtui-side-menu-favorites.component.html',
    styleUrls: ['./rtui-side-menu-favorites.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CdkDropList,
        CdkDrag,
        CdkDragHandle,
        MatIcon,
        MatNavList,

        // directives
        BlockDirective,
        ElemDirective,

        // components
        RtuiSideMenuSubItemComponent,
    ],
})
export class RtuiSideMenuFavoritesComponent {
    readonly #menu: IRtuiSideMenuHost = inject(RTUI_SIDE_MENU);
    readonly #hold: RtuiSubMenuHoldService | null = inject(RtuiSubMenuHoldService, { optional: true });

    protected readonly favorites: RtuiFavoritesService | null = inject(RtuiFavoritesService, { optional: true });
    protected readonly rows: Signal<ISideMenu.Item[]> = computed((): ISideMenu.Item[] => {
        if (!this.favorites || this.#menu.subMenuQuery().trim() !== '') {
            return [];
        }

        return findFavoriteItems(this.#menu.menuItems(), this.favorites.ids());
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

    public readonly clickSubMenuAction: OutputEmitterRef<{ item: ISideMenu.Item; event: MouseEvent }> = output<{
        item: ISideMenu.Item;
        event: MouseEvent;
    }>();
    public readonly clickSubMenuAdditionalAction: OutputEmitterRef<{ data: ISideMenu.ItemData; event: MouseEvent }> = output<{
        data: ISideMenu.ItemData;
        event: MouseEvent;
    }>();

    /** Строка в руке: подменю, открытое наведением, не закрывается, когда рука выходит за панель. */
    public onDragStart(): void {
        this.#hold?.hold();
    }

    /**
     * Строка брошена. Брошенная вне блока ничего не меняет — убирает из избранного звезда, а не
     * перетаскивание. Место в блоке переводится в место списка: скрытые номера остаются на своих.
     */
    public onDrop(event: CdkDragDrop<ISideMenu.Item[]>): void {
        if (!this.favorites || !event.isPointerOverContainer || event.previousIndex === event.currentIndex) {
            return;
        }

        const visible: ISideMenu.FavoriteId[] = this.rows().map((item: ISideMenu.Item): ISideMenu.FavoriteId => item.id);
        this.favorites.set(moveVisibleFavorite(this.favorites.ids(), visible, event.previousIndex, event.currentIndex));
    }
}
