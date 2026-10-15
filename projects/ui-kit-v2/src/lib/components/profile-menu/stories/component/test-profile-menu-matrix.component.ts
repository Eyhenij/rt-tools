import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtProfileMenuComponent } from '../../rt-profile-menu.component';
import { IRtProfileMenu } from '../../rt-profile-menu.model';
import { PROFILE_MENU_LOCALES, PROFILE_MENU_ORGANIZATION, PROFILE_MENU_USER } from './test-profile-menu.data';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TProfileMenuMatrixPart = 'presets' | 'themes';

/** Случай ячейки: подпись и что передано компоненту. */
interface IProfileMenuCase {
    readonly name: string;
    readonly organizationName: string;
    readonly organizationChange: IRtProfileMenu.OrganizationChange;
    readonly passwordChange: boolean;
    readonly locales: ReadonlyArray<IRtProfileMenu.Locale>;
    readonly signOutDisabled: boolean;
}

/**
 * Матрицы `rt-profile-menu` для витрины. Меню рисуется прямо на странице, без шапки: его панель —
 * часть самого компонента, и попап ему для показа не нужен.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-profile-menu-matrix',
    templateUrl: './test-profile-menu-matrix.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtProfileMenuComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtProfileMenuMatrixComponent {
    public part: TProfileMenuMatrixPart = 'presets';

    public readonly userName: string = PROFILE_MENU_USER;

    public readonly cases: readonly IProfileMenuCase[] = [
        {
            name: 'всё включено',
            organizationName: PROFILE_MENU_ORGANIZATION,
            organizationChange: 'allowed',
            passwordChange: true,
            locales: PROFILE_MENU_LOCALES,
            signOutDisabled: false,
        },
        {
            name: 'смена недоступна',
            organizationName: PROFILE_MENU_ORGANIZATION,
            organizationChange: 'denied',
            passwordChange: false,
            locales: [],
            signOutDisabled: false,
        },
        {
            name: 'без организации, выход идёт',
            organizationName: '',
            organizationChange: 'hidden',
            passwordChange: false,
            locales: [],
            signOutDisabled: true,
        },
    ];

    public readonly caseLabel: (value: IProfileMenuCase) => string = (value: IProfileMenuCase): string => value.name;
}
