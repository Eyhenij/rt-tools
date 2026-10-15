import { OutputEmitterRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { createRtFixture, hostClasses, qa, textOf } from '../../../testing/rt-kit-testing';
import { ThemeService } from '../../platform';
import { RtIconComponent } from '../icon/rt-icon.component';
import { RtTooltipDirective } from '../tooltip/rt-tooltip.directive';
import { IRtProfileMenu } from './rt-profile-menu.model';
import { RtProfileMenuComponent } from './rt-profile-menu.component';

const LOCALES: ReadonlyArray<IRtProfileMenu.Locale> = [
    { value: 'ru', label: 'Русский' },
    { value: 'en', label: 'English' },
];

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtProfileMenuComponent> {
    return createRtFixture(RtProfileMenuComponent, { userName: 'maria', organizationName: 'North', ...inputs });
}

function press<T>(fixture: ComponentFixture<T>, id: string): void {
    qa(fixture, id)?.nativeElement.click();
    fixture.detectChanges();
}

function countEmits<T>(emitter: OutputEmitterRef<T>): T[] {
    const values: T[] = [];
    emitter.subscribe((value: T): void => {
        values.push(value);
    });

    return values;
}

describe('RtProfileMenuComponent', (): void => {
    afterEach((): void => {
        document.documentElement.removeAttribute('data-theme');
        localStorage.clear();
    });

    it('несёт свой BEM-блок', (): void => {
        expect(hostClasses(setup())).toContain('rt-profile-menu');
    });

    describe('SC-UKV-857: человек и организация нарисованы', (): void => {
        it('круг несёт первую букву, под ним имя, строка организации с подписью', (): void => {
            const fixture: ComponentFixture<RtProfileMenuComponent> = setup();

            expect(textOf(fixture.nativeElement.querySelector('.rt-profile-menu__avatar'))).toBe('M');
            expect(textOf(qa(fixture, 'profile-user-name'))).toBe('maria');
            expect(textOf(qa(fixture, 'profile-organization'))).toContain('North');
            expect(textOf(qa(fixture, 'profile-organization'))).toContain('— organization');
        });
    });

    it('SC-UKV-858: пустая организация убирает свою строку', (): void => {
        const fixture: ComponentFixture<RtProfileMenuComponent> = setup({ organizationName: '' });

        expect(qa(fixture, 'profile-user-name')).not.toBeNull();
        expect(qa(fixture, 'profile-organization')).toBeNull();
    });

    describe('SC-UKV-859: смена организации по своему режиму', (): void => {
        it('по умолчанию пункта нет', (): void => {
            const fixture: ComponentFixture<RtProfileMenuComponent> = setup();

            expect(qa(fixture, 'profile-logout')).not.toBeNull();
            expect(qa(fixture, 'profile-change-organization')).toBeNull();
        });

        it('недоступный пункт приглушён, объясняет причину и ничего не шлёт', (): void => {
            const fixture: ComponentFixture<RtProfileMenuComponent> = setup({ organizationChange: 'denied' });
            const sent: void[] = countEmits(fixture.componentInstance.changeOrganization);

            press(fixture, 'profile-change-organization');

            expect(qa(fixture, 'profile-change-organization')?.nativeElement.getAttribute('aria-disabled')).toBe('true');
            expect(qa(fixture, 'profile-change-organization')?.injector.get(RtTooltipDirective).text()).toBe(
                'The organization comes from the membership: there is nothing to choose.'
            );
            expect(sent).toHaveLength(0);
        });

        it('доступный пункт шлёт смену один раз', (): void => {
            const fixture: ComponentFixture<RtProfileMenuComponent> = setup({ organizationChange: 'allowed' });
            const sent: void[] = countEmits(fixture.componentInstance.changeOrganization);

            press(fixture, 'profile-change-organization');

            expect(sent).toHaveLength(1);
        });
    });

    describe('SC-UKV-860: смена пароля и язык — только включённые', (): void => {
        it('без включения обоих нет', (): void => {
            const fixture: ComponentFixture<RtProfileMenuComponent> = setup();

            expect(qa(fixture, 'profile-logout')).not.toBeNull();
            expect(qa(fixture, 'profile-password-change')).toBeNull();
            expect(qa(fixture, 'profile-locale-select')).toBeNull();
        });

        it('включённые стоят, смена пароля и выбор языка уходят наружу', (): void => {
            const fixture: ComponentFixture<RtProfileMenuComponent> = setup({ passwordChange: true, locales: LOCALES, locale: 'ru' });
            const passwords: void[] = countEmits(fixture.componentInstance.changePassword);
            const locales: string[] = countEmits(fixture.componentInstance.localeChange);

            press(fixture, 'profile-password-change');
            qa(fixture, 'profile-locale-select')?.triggerEventHandler('ngModelChange', 'en');

            expect(qa(fixture, 'profile-locale-select')).not.toBeNull();
            expect(passwords).toHaveLength(1);
            expect(locales).toEqual(['en']);
        });
    });

    it('SC-UKV-861: тема переключается через службу темы', (): void => {
        localStorage.clear();
        const fixture: ComponentFixture<RtProfileMenuComponent> = setup();
        const theme: ThemeService = TestBed.inject(ThemeService);
        expect(theme.isDark()).toBe(false);

        press(fixture, 'profile-theme-toggle');

        expect(theme.isDark()).toBe(true);
        expect(qa(fixture, 'profile-theme-toggle')?.query(By.directive(RtIconComponent)).componentInstance.name()).toBe('ico-sun');
    });

    describe('SC-UKV-862: выход уходит, пока доступен', (): void => {
        it('доступный выход шлётся один раз', (): void => {
            const fixture: ComponentFixture<RtProfileMenuComponent> = setup();
            const sent: void[] = countEmits(fixture.componentInstance.signOut);

            press(fixture, 'profile-logout');

            expect(sent).toHaveLength(1);
        });

        it('недоступный выход не шлёт ничего', (): void => {
            const fixture: ComponentFixture<RtProfileMenuComponent> = setup({ signOutDisabled: true });
            const sent: void[] = countEmits(fixture.componentInstance.signOut);

            press(fixture, 'profile-logout');

            expect(sent).toHaveLength(0);
        });
    });
});
