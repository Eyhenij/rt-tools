import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import {
    afterNextRender,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    inject,
    Injector,
    input,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    Signal,
    viewChildren,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatNavList } from '@angular/material/list';
import { MatTooltip } from '@angular/material/tooltip';

import { BlockDirective, BreakpointService, ElemDirective, ModDirective, RtIconOutlinedDirective } from '@rt-tools/core';
import { RtuiSideMenuSubItemComponent } from '../menu-sub-item/rtui-side-menu-sub-item.component';
import { RtuiSubMenuHoldService } from '../menu/rtui-sub-menu-hold.service';
import { IRtuiSideMenuHost, ISideMenu, RTUI_SIDE_MENU } from '../side-menu.types';
import { favoritesSection, findFavoriteItems, moveVisibleFavorite } from './favorites.logic';
import { RtuiFavoritesService } from './rtui-favorites.service';

const BEM_BLOCK: string = 'rtui-side-menu-favorites';

/**
 * Блок избранного вверху подменю: выбранные человеком разделы в порядке его списка.
 *
 * Строки собираются из пунктов самого меню, а не из хранилища: подпись следует языку пунктов, адрес
 * — объявлению. Номер без пункта в меню не показывается, но из списка не уходит. Строку рисует тот
 * же подпункт, что и в списке, — строка избранного выглядит и открывается так же, как её пункт.
 *
 * Избранное у каждого пункта полосы своё и по умолчанию выключено: блок стоит только в подменю пункта
 * с флагом `favorites` и показывает только его разделы. Список в хранилище один на все пункты.
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
        MatIconButton,
        MatNavList,
        MatTooltip,

        // directives
        BlockDirective,
        ElemDirective,
        ModDirective,
        RtIconOutlinedDirective,

        // components
        RtuiSideMenuSubItemComponent,
    ],
})
export class RtuiSideMenuFavoritesComponent {
    readonly #menu: IRtuiSideMenuHost = inject(RTUI_SIDE_MENU);
    readonly #hold: RtuiSubMenuHoldService | null = inject(RtuiSubMenuHoldService, { optional: true });
    readonly #breakpoints: BreakpointService = inject(BreakpointService);
    readonly #injector: Injector = inject(Injector);
    readonly #section: Signal<ISideMenu.Item | null> = computed(
        (): ISideMenu.Item | null => this.favorites && favoritesSection(this.#menu.menuItems(), this.#menu.shownSubMenu())
    );

    protected readonly favorites: RtuiFavoritesService | null = inject(RtuiFavoritesService, { optional: true });
    protected readonly rows: Signal<ISideMenu.Item[]> = computed((): ISideMenu.Item[] => {
        const section: ISideMenu.Item | null = this.#section();

        if (!this.favorites || !section || this.#menu.subMenuQuery().trim() !== '') {
            return [];
        }

        return findFavoriteItems([section], this.favorites.ids());
    });
    /** Ручки строк по порядку: стрелка возвращает фокус на ручку переставленной строки. */
    protected readonly handles: Signal<ReadonlyArray<ElementRef<HTMLElement>>> = viewChildren<string, ElementRef<HTMLElement>>('handle', {
        read: ElementRef,
    });
    /** Узкий экран: подсказка у ручки не показывается — наводиться там нечем. */
    protected readonly narrow: Signal<boolean> = computed((): boolean => !!this.#breakpoints.isMobile());

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

    /** Строка брошена: удержание снимается, подменю снова закрывается уходом указателя. */
    public onDragEnd(): void {
        this.#hold?.release();
    }

    /**
     * Строка брошена. Брошенная вне блока ничего не меняет — убирает из избранного кнопка, а не
     * перетаскивание.
     */
    public onDrop(event: CdkDragDrop<ISideMenu.Item[]>): void {
        if (event.isPointerOverContainer) {
            this.#move(event.previousIndex, event.currentIndex);
        }
    }

    /** Стрелка на ручке переставляет строку на соседнее место, и фокус едет вместе с ручкой. */
    public onHandleKey(event: Event, index: number, step: number): void {
        // Стрелки не уходят в меню: там они ведут подсветку по списку раздела.
        event.preventDefault();
        event.stopPropagation();

        const target: number = index + step;

        if (target < 0 || target >= this.rows().length) {
            return;
        }

        this.#move(index, target);
        afterNextRender(() => this.handles()[target]?.nativeElement.focus(), { injector: this.#injector });
    }

    /** Место в блоке переводится в место списка: скрытые номера остаются на своих. */
    #move(from: number, to: number): void {
        if (!this.favorites || from === to) {
            return;
        }

        const visible: ISideMenu.FavoriteId[] = this.rows().map((item: ISideMenu.Item): ISideMenu.FavoriteId => item.id);
        this.favorites.set(moveVisibleFavorite(this.favorites.ids(), visible, from, to));
    }
}
