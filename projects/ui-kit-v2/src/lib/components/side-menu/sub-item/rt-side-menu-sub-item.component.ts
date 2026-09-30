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
    ViewEncapsulation,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RtExpansionPanelComponent, RtExpansionPanelContentDirective } from '../../expansion-panel';
import { RtIconComponent } from '../../icon';
import { RtIconButtonComponent } from '../../icon-button';
import { rtKitLabel } from '../../../i18n';
import { BreakpointsService } from '../../../platform/breakpoints.service';
import { RtTooltipDirective } from '../../tooltip';
import { sideMenuFavoritesSection } from '../rt-side-menu-favorites.logic';
import { RtSideMenuSettingsService } from '../rt-side-menu-settings.service';
import { RtSideMenuTitlePartsPipe } from '../rt-side-menu-title-parts.pipe';
import { IRtSideMenu } from '../rt-side-menu.model';
import { IRtSideMenuHost, RT_SIDE_MENU } from '../rt-side-menu.tokens';

const BEM_BLOCK: string = 'rt-side-menu-sub-item';
/** Строка блока избранного и кнопка избранного в ней: фокус уходит на соседнюю до удаления строки. */
const FAVORITE_ROW: string = '.rt-side-menu-favorites__row';
const FAVORITE_BUTTON: string = '.rt-side-menu-sub-item__favorite button';

/**
 * Строка подменю: пункт со ссылкой или папка со своими пунктами. Раскрытость, подсветку и запрос
 * строка берёт у меню — своего состояния у неё нет.
 *
 * В разделе, где приложение включило избранное, у пункта со ссылкой стоит звезда; в строке блока
 * избранного — кнопка «убрать» и слот `[rtSideMenuSubItemAction]`, куда блок кладёт ручку.
 */
@Component({
    selector: 'rt-side-menu-sub-item',
    host: { class: BEM_BLOCK },
    templateUrl: './rt-side-menu-sub-item.component.html',
    styleUrls: ['./rt-side-menu-sub-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        NgTemplateOutlet,
        RouterLink,
        BlockDirective,
        ElemDirective,
        ModDirective,
        RtExpansionPanelComponent,
        RtExpansionPanelContentDirective,
        RtIconComponent,
        RtIconButtonComponent,
        RtTooltipDirective,
        RtSideMenuTitlePartsPipe,
    ],
})
export class RtSideMenuSubItemComponent {
    readonly #settings: RtSideMenuSettingsService | null = inject(RtSideMenuSettingsService, { optional: true });

    protected readonly menuRef: IRtSideMenuHost = inject(RT_SIDE_MENU);
    protected readonly narrow: Signal<boolean> = inject(BreakpointsService).narrow;
    /** Значки кнопок избранного: из настроек провайдера, иначе из набора кита. */
    protected readonly favoritesIcons: RtSideMenuSettingsService['favoritesIcons'] | null = this.#settings?.favoritesIcons ?? null;
    protected readonly addLabel: Signal<string> = rtKitLabel('sideMenuFavoriteAdd');
    protected readonly removeLabel: Signal<string> = rtKitLabel('sideMenuFavoriteRemove');
    /** Избранное включено у раздела, чьё подменю показано, и приложение поставило настройки меню. */
    protected readonly favoritesOn: Signal<boolean> = computed(
        (): boolean => !!this.#settings && sideMenuFavoritesSection(this.menuRef.menuItems(), this.menuRef.shownSubMenu()) !== null
    );
    protected readonly favoriteIds: Signal<ReadonlyArray<IRtSideMenu.FavoriteId>> = computed(
        (): ReadonlyArray<IRtSideMenu.FavoriteId> => this.#settings?.favoriteIds(this.menuRef.menuId())() ?? []
    );

    public readonly item: InputSignal<IRtSideMenu.Item> = input.required<IRtSideMenu.Item>();
    /** Строка стоит в блоке избранного: вместо звезды — «убрать», без номера и подсветки клавиатуры. */
    public readonly inFavorites: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    public readonly clickSubMenuAction: OutputEmitterRef<{ item: IRtSideMenu.Item; event: MouseEvent }> = output<{
        item: IRtSideMenu.Item;
        event: MouseEvent;
    }>();
    public readonly clickSubMenuAdditionalAction: OutputEmitterRef<{ data: IRtSideMenu.ItemData | undefined; event: MouseEvent }> = output<{
        data: IRtSideMenu.ItemData | undefined;
        event: MouseEvent;
    }>();

    public onClickSubMenu(item: IRtSideMenu.Item, event: MouseEvent): void {
        this.clickSubMenuAction.emit({ item, event });
    }

    /** Кнопка потребителя в строке: ни перехода по ссылке строки, ни закрытия подменю. */
    public onClickSubMenuAdditional(item: IRtSideMenu.Item, event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.clickSubMenuAdditionalAction.emit({ data: item.iconButton?.data, event });
    }

    /** Звезда переключает избранное и больше ничего: ни перехода, ни закрытия подменю. */
    public onToggleFavorite(item: IRtSideMenu.Item, event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.#settings?.toggleFavorite(this.menuRef.menuId(), item.id);
    }

    /**
     * «Убрать» в строке блока. Фокус уходит на такую же кнопку соседней строки до того, как строка
     * исчезнет: иначе он падал бы на страницу, и человек с клавиатуры терял бы место.
     */
    public onRemoveFavorite(item: IRtSideMenu.Item, event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();

        const row: Element | null = event.target instanceof Element ? event.target.closest(FAVORITE_ROW) : null;
        const neighbour: Element | null | undefined = row?.nextElementSibling ?? row?.previousElementSibling;

        neighbour?.querySelector<HTMLElement>(FAVORITE_BUTTON)?.focus();
        this.#settings?.removeFavorite(this.menuRef.menuId(), item.id);
    }

    public onToggleFolder(item: IRtSideMenu.Item): void {
        this.menuRef.toggleFolder(item);
    }
}
