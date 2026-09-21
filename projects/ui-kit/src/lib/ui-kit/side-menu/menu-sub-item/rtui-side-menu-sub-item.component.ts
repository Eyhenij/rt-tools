import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    Signal,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { MatListItem, MatListItemIcon, MatListItemTitle, MatNavList } from '@angular/material/list';
import { MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltip } from '@angular/material/tooltip';

import { BlockDirective, BreakpointService, ElemDirective, ModDirective } from '@rt-tools/core';
import { RtIconOutlinedDirective } from '@rt-tools/core';
import { RtHideTooltipDirective } from '../../tooltip';
import { favoritesSection } from '../favorites/favorites.logic';
import { RtuiFavoritesService } from '../favorites/rtui-favorites.service';
import { RtuiSubMenuHoldService } from '../menu/rtui-sub-menu-hold.service';
import { RtuiSubMenuTitlePartsPipe } from './sub-menu-title-parts.pipe';
import { IRtuiSideMenuHost, ISideMenu, RTUI_SIDE_MENU } from '../side-menu.types';

const BEM_BLOCK: string = 'rtui-side-menu-sub-item';
/** Строка блока избранного и кнопка избранного в ней — по ним фокус уходит на соседа после «убрать». */
const FAVORITE_ROW: string = '.rtui-side-menu-favorites__row';
const FAVORITE_BUTTON: string = '.rtui-side-menu-sub-item-title__favorite';

/** Фокус пришёл с клавиатуры. Движок без `:focus-visible` отвечает «нет»: удержание — не обязанность. */
function isKeyboardFocus(target: EventTarget | null): boolean {
    try {
        return target instanceof Element && target.matches(':focus-visible');
    } catch {
        return false;
    }
}

@Component({
    selector: 'rtui-side-menu-sub-item',
    host: { class: BEM_BLOCK },
    templateUrl: './rtui-side-menu-sub-item.component.html',
    styleUrls: ['./rtui-side-menu-sub-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgTemplateOutlet,
        MatIcon,
        MatListItem,
        MatNavList,
        MatListItemIcon,
        MatListItemTitle,
        MatExpansionModule,
        MatTooltip,
        MatIconButton,

        // directives
        BlockDirective,
        ElemDirective,
        ModDirective,
        RtIconOutlinedDirective,
        RtHideTooltipDirective,

        // pipes
        RtuiSubMenuTitlePartsPipe,
    ],
    providers: [
        BreakpointService,
        {
            provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
            useValue: {
                disableTooltipInteractivity: true,
            },
        },
    ],
})
export class RtuiSideMenuSubItemComponent {
    readonly #breakpoints: BreakpointService = inject(BreakpointService);

    /** Избранное включено провайдером приложения; не поставлено — звёзд нет. */
    protected readonly favorites: RtuiFavoritesService | null = inject(RtuiFavoritesService, { optional: true });
    protected readonly hold: RtuiSubMenuHoldService | null = inject(RtuiSubMenuHoldService, { optional: true });
    /** Экран узкий: замер кита, и другого источника у этого признака нет. */
    protected readonly narrow: Signal<boolean> = computed(() => !!this.#breakpoints.isMobile());
    /** Раздел открытого подменю включил избранное: только тогда у пунктов есть звёзды. */
    protected readonly favoritesOn: Signal<boolean> = computed(
        (): boolean => !!this.favorites && favoritesSection(this.menuRef.menuItems(), this.menuRef.shownSubMenu()) !== null
    );
    public readonly menuRef: IRtuiSideMenuHost = inject(RTUI_SIDE_MENU);

    public item: InputSignal<ISideMenu.Item> = input.required<ISideMenu.Item>();
    public isSubMenuXScrollEnabled: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
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
    /**
     * Строка стоит в блоке избранного. У неё нет номера пункта на странице и кольца клавиатуры:
     * доводка активного пункта в видимую часть и подсветка стрелками целятся в строку списка, а
     * второй узел с тем же номером перехватил бы их.
     */
    public inFavorites: InputSignalWithTransform<boolean, boolean> = input<boolean, boolean>(false, {
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

    public onClickSubMenu(item: ISideMenu.Item, event: MouseEvent): void {
        this.clickSubMenuAction.emit({ item, event });
    }

    /**
     * Фокус клавиатуры на кнопке избранного держит подменю, открытое наведением: человек идёт по
     * нему клавишами, и уход указателя за панель его не закрывает. Фокус от нажатия мышью не держит —
     * иначе после одного нажатия подменю перестало бы закрываться уходом указателя.
     */
    public onFavoriteFocus(event: FocusEvent): void {
        if (isKeyboardFocus(event.target)) {
            this.hold?.hold();
        }
    }

    /** Звезда переключает избранное и больше ничего: ни перехода, ни закрытия подменю. */
    public onToggleFavorite(item: ISideMenu.Item, event: MouseEvent): void {
        event.stopPropagation();
        this.favorites?.toggle(item.id);
    }

    /**
     * Кнопка строки избранного убирает пункт из списка, не открывая его. Фокус уходит на такую же
     * кнопку соседней строки до того, как строка исчезнет: иначе он падал бы на страницу, и человек
     * с клавиатуры терял бы место. Соседняя строка переживает удаление — строки ведутся по номеру.
     */
    public onRemoveFavorite(item: ISideMenu.Item, event: MouseEvent): void {
        event.stopPropagation();

        const row: Element | null = event.currentTarget instanceof Element ? event.currentTarget.closest(FAVORITE_ROW) : null;
        const neighbour: Element | null | undefined = row?.nextElementSibling ?? row?.previousElementSibling;

        neighbour?.querySelector<HTMLElement>(FAVORITE_BUTTON)?.focus();
        this.favorites?.remove(item.id);
    }

    public onClickSubMenuAdditional(data: ISideMenu.ItemData, event: MouseEvent): void {
        this.clickSubMenuAdditionalAction.emit({ data, event });
    }
}
