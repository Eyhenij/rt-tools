import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    input,
    InputSignal,
    InputSignalWithTransform,
    linkedSignal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RtButtonDirective } from '../../../button';
import { RtIconComponent } from '../../../icon';
import { RtSideMenuFooterDirective, RtSideMenuHeaderDirective } from '../../rt-side-menu.directives';
import { RtSideMenuComponent } from '../../rt-side-menu.component';
import { IRtSideMenu } from '../../rt-side-menu.model';
import { SIDE_MENU_STORY_ITEMS } from './side-menu-story-data';

const BEM_BLOCK: string = 'app-side-menu';

/**
 * Живое меню витрины во всю высоту окна — как в истории бокового меню первого кита: шапка со
 * значком, разделы, профиль и «Logout» внизу. Разделы открываются наведением и нажатием, поиск,
 * закрепление, папки и тяга ширины работают так же, как у приложения. Моду и ширину, выбранные
 * человеком, обёртка держит до перезагрузки, как приложение без своих настроек.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-side-menu',
    templateUrl: './test-side-menu.component.html',
    styleUrls: ['./test-side-menu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // directives
        BlockDirective,
        ElemDirective,
        RtButtonDirective,
        RtSideMenuFooterDirective,
        RtSideMenuHeaderDirective,

        // components
        RtIconComponent,
        RtSideMenuComponent,
    ],
    host: { class: BEM_BLOCK, '[class.app-side-menu--short]': 'short()' },
})
export class TestRtSideMenuComponent {
    /** Мода, выбранная человеком кнопкой закрепления; новый довод истории снова берёт верх. */
    protected readonly shownMode: WritableSignal<IRtSideMenu.SubMenuMode> = linkedSignal((): IRtSideMenu.SubMenuMode => this.mode());

    /** Ширина, натянутая человеком; новый довод истории снова берёт верх. */
    protected readonly shownWidth: WritableSignal<number | null> = linkedSignal((): number | null => this.width());

    public readonly items: InputSignal<readonly IRtSideMenu.Item[]> = input<readonly IRtSideMenu.Item[]>(SIDE_MENU_STORY_ITEMS);
    public readonly activeIds: InputSignal<ReadonlyArray<string | number>> = input<ReadonlyArray<string | number>>([]);
    public readonly mode: InputSignal<IRtSideMenu.SubMenuMode> = input<IRtSideMenu.SubMenuMode>('hover');
    public readonly width: InputSignal<number | null> = input<number | null>(null);
    /** Задержка закрытия подменю наведения, мс: у первого кита 500. */
    public readonly closeDelay: InputSignal<number> = input<number>(0);
    /** Номер меню в настройках: истории избранного держат список под своим номером. */
    public readonly menuId: InputSignal<string> = input<string>('main');
    public readonly favoritesCount: InputSignal<IRtSideMenu.FavoritesCount> = input<IRtSideMenu.FavoritesCount>('collapsed');
    public readonly favoriteActionsReserve: InputSignal<IRtSideMenu.FavoriteActionsReserve> =
        input<IRtSideMenu.FavoriteActionsReserve>('none');

    /** Низкий экран: в полный рост списки влезают целиком, и признаку прокрутки взяться неоткуда. */
    public readonly short: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, { transform: booleanAttribute });

    public logout(): void {
        // eslint-disable-next-line no-console
        console.log('Logout action');
    }

    public onSubMenu({ item }: { item: IRtSideMenu.Item; event: MouseEvent }): void {
        // eslint-disable-next-line no-console
        console.log('sub menu action: ', item);
    }

    public onSubMenuAdditional({ data }: { data: IRtSideMenu.ItemData | undefined; event: MouseEvent }): void {
        // eslint-disable-next-line no-console
        console.log('sub menu additional action: ', data);
    }

    public closeMobileMenu(): void {
        // eslint-disable-next-line no-console
        console.log('Close mobile menu action');
    }
}
