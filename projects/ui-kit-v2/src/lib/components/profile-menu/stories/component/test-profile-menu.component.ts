import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtProfileMenuComponent } from '../../rt-profile-menu.component';
import { IRtProfileMenu } from '../../rt-profile-menu.model';
import { PROFILE_MENU_LOCALES } from './test-profile-menu.data';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое Storybook вешает
 * контролы. Входы кита сигнальные и извне не пишутся — поэтому история целится сюда, а не в сам
 * компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-profile-menu-playground',
    templateUrl: './test-profile-menu.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtProfileMenuComponent,
    ],
})
export class TestRtProfileMenuComponent {
    public userName: string = '';

    public organizationName: string = '';

    public organizationChange: IRtProfileMenu.OrganizationChange = 'hidden';

    public passwordChange: boolean = false;

    public withLocales: boolean = false;

    public signOutDisabled: boolean = false;

    public locale: string = 'ru';

    public readonly locales: ReadonlyArray<IRtProfileMenu.Locale> = PROFILE_MENU_LOCALES;

    public readonly noLocales: ReadonlyArray<IRtProfileMenu.Locale> = [];

    /** Показ запоминает выбранный язык: другого словаря у него нет, и выбор остаётся выбором. */
    public onLocaleChange(code: string): void {
        this.locale = code;
    }
}
