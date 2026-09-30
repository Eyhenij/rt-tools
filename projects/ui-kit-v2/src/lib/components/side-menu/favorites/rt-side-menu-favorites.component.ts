import { CdkDrag, CdkDragDrop, CdkDragEnd, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    ElementRef,
    inject,
    Injector,
    linkedSignal,
    output,
    OutputEmitterRef,
    Signal,
    signal,
    viewChildren,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { rtKitLabel } from '../../../i18n';
import { BreakpointsService } from '../../../platform/breakpoints.service';
import { RtExpansionPanelComponent, RtExpansionPanelContentDirective } from '../../expansion-panel';
import { IRtIcon, RtIconComponent } from '../../icon';
import { RtIconButtonComponent } from '../../icon-button';
import { sideMenuFavoritesSection, findSideMenuFavoriteItems, isSideMenuDropOutside } from '../rt-side-menu-favorites.logic';
import { RtSideMenuSettingsService } from '../rt-side-menu-settings.service';
import { filterSideMenuItems } from '../rt-side-menu.logic';
import { IRtSideMenu } from '../rt-side-menu.model';
import { IRtSideMenuHost, RT_SIDE_MENU } from '../rt-side-menu.tokens';
import { RtSideMenuSubItemComponent } from '../sub-item/rt-side-menu-sub-item.component';

const BEM_BLOCK: string = 'rt-side-menu-favorites';
/** Панель подменю: уход указателя с неё закрывает подменю, открытое наведением. */
const SUB_MENU_PANEL: string = '.rt-side-menu__panel';

/**
 * Блок избранного вверху подменю: выбранные человеком разделы в порядке его списка. Перенос блока
 * первого кита на части второго, без Material: блок — раскрывающаяся панель кита, как папка
 * подменю, строки тянутся за ручку перетаскиванием CDK.
 *
 * Строки собираются из пунктов самого меню, а не из хранилища: подпись следует языку пунктов, адрес
 * — объявлению. Номер без пункта в меню не показывается, но из списка не уходит. Строку рисует тот же
 * подпункт, что и в списке.
 *
 * Избранное у каждого пункта полосы своё и по умолчанию выключено: блок стоит только в подменю пункта
 * с флагом `favorites`. Без настроек меню (`provideRtSideMenuSettings()`) блока нет вовсе. Показать
 * нечего — блок места не занимает.
 */
@Component({
    selector: 'rt-side-menu-favorites',
    host: { class: BEM_BLOCK },
    templateUrl: './rt-side-menu-favorites.component.html',
    styleUrls: ['./rt-side-menu-favorites.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        CdkDrag,
        CdkDragHandle,
        CdkDropList,

        // directives
        BlockDirective,
        ElemDirective,
        ModDirective,
        RtExpansionPanelContentDirective,

        // components
        RtExpansionPanelComponent,
        RtIconButtonComponent,
        RtIconComponent,
        RtSideMenuSubItemComponent,
    ],
})
export class RtSideMenuFavoritesComponent {
    readonly #menu: IRtSideMenuHost = inject(RT_SIDE_MENU);
    readonly #settings: RtSideMenuSettingsService | null = inject(RtSideMenuSettingsService, { optional: true });
    readonly #injector: Injector = inject(Injector);
    readonly #host: ElementRef<HTMLElement> = inject(ElementRef);
    /** Строку тянут: подменю держится открытым, пока её не бросят. */
    readonly #dragging: WritableSignal<boolean> = signal(false);
    readonly #section: Signal<IRtSideMenu.Item | null> = computed((): IRtSideMenu.Item | null =>
        this.#settings ? sideMenuFavoritesSection(this.#menu.menuItems(), this.#menu.shownSubMenu()) : null
    );

    /** В поиске что-то набрано: блок показывает совпавшие строки раскрытым, сохранённое не трогая. */
    protected readonly searching: Signal<boolean> = computed((): boolean => this.#menu.subMenuQuery().trim() !== '');
    protected readonly rows: Signal<IRtSideMenu.Item[]> = computed((): IRtSideMenu.Item[] => {
        const section: IRtSideMenu.Item | null = this.#section();

        if (!this.#settings || !section || (this.searching() && !this.#menu.isFavoritesSearchShown())) {
            return [];
        }

        const found: IRtSideMenu.Item[] = findSideMenuFavoriteItems([section], this.#settings.favoriteIds(this.#menu.menuId())());

        return filterSideMenuItems(found, this.#menu.subMenuQuery());
    });
    /**
     * Блок раздела свёрнут: заголовок и черта остаются, строк нет. Состояние своё у каждого раздела и
     * лежит в настройках меню. Поиск его не меняет: на время поиска блок стоит раскрытым.
     */
    protected readonly collapsed: Signal<boolean> = computed((): boolean => {
        const section: IRtSideMenu.Item | null = this.#section();

        return !!section && !!this.#settings?.favoritesCollapsed(this.#menu.menuId())().includes(section.id);
    });
    /**
     * Раскрытие панели блока. Начинается заново с сохранённого выбора при каждой его смене и при
     * входе в поиск и выходе из него: свёрнутый в поиске блок — выбор на время поиска, он не
     * сохраняется и с концом поиска возвращается к сохранённому.
     */
    protected readonly open: WritableSignal<boolean> = linkedSignal({
        source: (): { collapsed: boolean; searching: boolean } => ({ collapsed: this.collapsed(), searching: this.searching() }),
        computation: (state: { collapsed: boolean; searching: boolean }): boolean => !state.collapsed || state.searching,
    });
    /** Заголовок показывает число строк: всегда, у свёрнутого блока или никогда — по входу меню. */
    protected readonly countShown: Signal<boolean> = computed((): boolean => {
        const mode: IRtSideMenu.FavoritesCount = this.#menu.favoritesCount();

        return mode === 'always' || (mode === 'collapsed' && !this.open());
    });
    /** Ручки строк по порядку: стрелка возвращает фокус на ручку переставленной строки. */
    protected readonly handles: Signal<ReadonlyArray<ElementRef<HTMLElement>>> = viewChildren<string, ElementRef<HTMLElement>>('handle', {
        read: ElementRef,
    });
    protected readonly dragIcon: IRtIcon.Name = this.#settings?.favoritesIcons.drag ?? 'arrows-v';
    /** Узкий экран: подсказка у ручки не показывается — наводиться там нечем. */
    protected readonly narrow: Signal<boolean> = inject(BreakpointsService).narrow;
    protected readonly titleLabel: Signal<string> = rtKitLabel('sideMenuFavorites');
    protected readonly dragLabel: Signal<string> = rtKitLabel('sideMenuFavoriteDrag');
    protected readonly expandLabel: Signal<string> = rtKitLabel('sideMenuFavoritesExpand');
    protected readonly collapseLabel: Signal<string> = rtKitLabel('sideMenuFavoritesCollapse');

    public readonly clickSubMenuAction: OutputEmitterRef<{ item: IRtSideMenu.Item; event: MouseEvent }> = output<{
        item: IRtSideMenu.Item;
        event: MouseEvent;
    }>();
    public readonly clickSubMenuAdditionalAction: OutputEmitterRef<{ data: IRtSideMenu.ItemData | undefined; event: MouseEvent }> = output<{
        data: IRtSideMenu.ItemData | undefined;
        event: MouseEvent;
    }>();

    constructor() {
        // Блок уничтожили посреди тяги — указатель увёл подменю на другой раздел. CDK закрывает тягу
        // без события конца, и удержание осталось бы навсегда.
        inject(DestroyRef).onDestroy((): void => this.#release());
    }

    /** Заголовок нажат: выбор ложится в настройки меню. Во время поиска он не сохраняется. */
    public onToggle(expanded: boolean): void {
        const section: IRtSideMenu.Item | null = this.#section();

        if (this.#settings && section && !this.searching()) {
            this.#settings.setFavoritesCollapsed(this.#menu.menuId(), section.id, !expanded);
        }
    }

    /** Строка в руке: подменю, открытое наведением, не закрывается, когда рука выходит за панель. */
    public onDragStart(): void {
        this.#dragging.set(true);
        this.#menu.holdSubMenu(true);
    }

    /** Строка брошена за панелью: уход указателя, пропущенный за время тяги, срабатывает сейчас. */
    public onDragEnd(event: CdkDragEnd): void {
        this.#release();

        const panel: Element | null = this.#host.nativeElement.closest(SUB_MENU_PANEL);

        if (panel && isSideMenuDropOutside(panel.getBoundingClientRect(), event.dropPoint)) {
            this.#menu.toggleSubMenu();
        }
    }

    /** Брошенная вне блока строка ничего не меняет: убирает из избранного кнопка, а не перетаскивание. */
    public onDrop(event: CdkDragDrop<IRtSideMenu.Item[]>): void {
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
        afterNextRender((): void => this.handles()[target]?.nativeElement.querySelector<HTMLElement>('button')?.focus(), {
            injector: this.#injector,
        });
    }

    /** Нажатие ручки — не переход по строке: она стоит внутри ссылки пункта. */
    public onHandleClick(event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();
    }

    #release(): void {
        if (!this.#dragging()) {
            return;
        }

        this.#dragging.set(false);
        this.#menu.holdSubMenu(false);
    }

    /** Место в блоке переводится в место списка по свежей записи хранилища: скрытые номера остаются на своих. */
    #move(from: number, to: number): void {
        if (!this.#settings || from === to) {
            return;
        }

        const visible: IRtSideMenu.FavoriteId[] = this.rows().map((item: IRtSideMenu.Item): IRtSideMenu.FavoriteId => item.id);
        this.#settings.moveVisibleSideMenuFavorite(this.#menu.menuId(), visible, from, to);
    }
}
