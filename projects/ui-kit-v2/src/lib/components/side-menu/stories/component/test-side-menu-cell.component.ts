import {
    afterNextRender,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    inject,
    Injector,
    input,
    InputSignal,
    InputSignalWithTransform,
    Signal,
    viewChild,
} from '@angular/core';

import { RtSideMenuFooterDirective, RtSideMenuHeaderDirective, RtSideMenuIconDirective } from '../../rt-side-menu.directives';
import { RtSideMenuComponent } from '../../rt-side-menu.component';
import { IRtSideMenu } from '../../rt-side-menu.model';

/**
 * Ячейка витрины: меню в коробке заданного размера. Коробка — экран показа: меню берёт высоту от
 * родителя, а незакреплённая панель и подложка считают своё место от неё.
 *
 * После первой отрисовки ячейка доводит меню до нужного вида тем же путём, что и человек: открывает
 * раздел нажатием его пункта и набирает запрос в поле поиска. Входом этого не сделать — раздел и
 * запрос меню держит само.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-side-menu-cell',
    templateUrl: './test-side-menu-cell.component.html',
    styleUrls: ['./test-side-menu-cell.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtSideMenuComponent, RtSideMenuHeaderDirective, RtSideMenuFooterDirective, RtSideMenuIconDirective],
})
export class TestRtSideMenuCellComponent {
    readonly #host: ElementRef<HTMLElement> = inject(ElementRef);
    readonly #injector: Injector = inject(Injector);

    protected readonly menu: Signal<RtSideMenuComponent | undefined> = viewChild(RtSideMenuComponent);

    public readonly items: InputSignal<readonly IRtSideMenu.Item[]> = input.required<readonly IRtSideMenu.Item[]>();
    public readonly activeIds: InputSignal<ReadonlyArray<string | number>> = input<ReadonlyArray<string | number>>([]);
    public readonly mode: InputSignal<IRtSideMenu.SubMenuMode> = input<IRtSideMenu.SubMenuMode>('hover');
    public readonly width: InputSignal<number | null> = input<number | null>(null);
    /** Пункт полосы, чей раздел открыть нажатием. */
    public readonly openId: InputSignal<string | number | null> = input<string | number | null>(null);
    /** Запрос, набранный в поле поиска. */
    public readonly query: InputSignal<string> = input<string>('');
    /** Номер меню в настройках: у ячеек с избранным свой список, у остальных — общий. */
    public readonly menuId: InputSignal<string | null> = input<string | null>(null);
    public readonly favoritesCount: InputSignal<IRtSideMenu.FavoritesCount> = input<IRtSideMenu.FavoritesCount>('collapsed');
    public readonly favoriteActionsReserve: InputSignal<IRtSideMenu.FavoriteActionsReserve> =
        input<IRtSideMenu.FavoriteActionsReserve>('none');
    /** Шапка и подвал полосы. */
    public readonly slots: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, { transform: booleanAttribute });
    /** Свой значок меню для имён, которых кит не рисует. */
    public readonly ownIcon: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, { transform: booleanAttribute });

    constructor() {
        afterNextRender((): void => {
            const item: IRtSideMenu.Item | undefined = this.items().find((entry: IRtSideMenu.Item): boolean => entry.id === this.openId());

            if (item) {
                this.menu()?.onClickMenu(item);
            }

            if (this.query() !== '') {
                // Поле появляется вместе с панелью: запрос набирается на следующем кадре.
                afterNextRender((): void => this.#type(this.query()), { injector: this.#injector });
            }
        });
    }

    #type(query: string): void {
        const field: HTMLInputElement | null = this.#host.nativeElement.querySelector('.rt-side-menu__search input');

        if (field) {
            field.value = query;
            field.dispatchEvent(new Event('input'));
        }
    }
}
