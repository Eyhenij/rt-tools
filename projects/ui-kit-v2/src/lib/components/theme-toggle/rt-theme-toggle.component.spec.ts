import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createRtFixture, el, hostClasses, qa } from '../../../testing/rt-kit-testing';
import { ThemeService } from '../../platform';
import { IRtThemeToggle } from './rt-theme-toggle.model';
import { RtThemeToggleComponent } from './rt-theme-toggle.component';

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtThemeToggleComponent> {
    return createRtFixture(RtThemeToggleComponent, inputs);
}

function theme(): ThemeService {
    return TestBed.inject(ThemeService);
}

function press<T>(fixture: ComponentFixture<T>, selector: string): void {
    el(fixture, selector)?.nativeElement.click();
    fixture.detectChanges();
}

describe('RtThemeToggleComponent', (): void => {
    beforeEach((): void => {
        // Тема переживает перезагрузку: сервис читает её из хранилища
        // устройства. Между тестами его надо чистить, иначе выбор предыдущего
        // теста становится начальным состоянием следующего.
        localStorage.clear();
    });

    afterEach((): void => {
        document.documentElement.removeAttribute('data-theme');
        localStorage.clear();
    });

    it('несёт свой BEM-блок', (): void => {
        expect(hostClasses(setup())).toContain('rt-theme-toggle');
    });

    describe('вид', (): void => {
        it('без входа рисуется иконочной кнопкой', (): void => {
            const fixture: ComponentFixture<RtThemeToggleComponent> = setup();

            expect((qa(fixture, 'theme-toggle-control')?.nativeElement as HTMLElement).tagName).toBe('RT-ICON-BUTTON');
        });

        it.each<[IRtThemeToggle.Appearance, string]>([
            ['icon', 'RT-ICON-BUTTON'],
            ['switch', 'RT-TOGGLE-SWITCH'],
        ])('вид %s рисуется своим контролом', (appearance: IRtThemeToggle.Appearance, tag: string): void => {
            const fixture: ComponentFixture<RtThemeToggleComponent> = setup({ appearance });

            expect((qa(fixture, 'theme-toggle-control')?.nativeElement as HTMLElement).tagName).toBe(tag);
        });
    });

    describe('переключение', (): void => {
        it('нажатие переключает тему в общем сервисе', (): void => {
            // Своего состояния у контрола нет: тему держит `ThemeService`,
            // и любой другой переключатель на странице увидит то же значение.
            const fixture: ComponentFixture<RtThemeToggleComponent> = setup();
            expect(theme().isDark()).toBe(false);

            press(fixture, '[qa-dataid="icon-button-control"]');

            expect(theme().isDark()).toBe(true);
        });

        it('повторное нажатие возвращает светлую тему', (): void => {
            const fixture: ComponentFixture<RtThemeToggleComponent> = setup();

            press(fixture, '[qa-dataid="icon-button-control"]');
            press(fixture, '[qa-dataid="icon-button-control"]');

            expect(theme().isDark()).toBe(false);
        });

        it('в виде тумблера нажатие делает то же самое', (): void => {
            const fixture: ComponentFixture<RtThemeToggleComponent> = setup({ appearance: 'switch' });

            press(fixture, '[qa-dataid="toggle-switch-control"]');

            expect(theme().isDark()).toBe(true);
        });
    });

    describe('состояние', (): void => {
        it('иконка показывает, куда переключит: в светлой теме — луну', (): void => {
            const fixture: ComponentFixture<RtThemeToggleComponent> = setup();

            expect(el(fixture, 'use')?.attributes['href']).toBe('#rt-icon-moon');
        });

        it('в тёмной теме иконка меняется на солнце, а кнопка помечается нажатой', (): void => {
            const fixture: ComponentFixture<RtThemeToggleComponent> = setup();

            press(fixture, '[qa-dataid="icon-button-control"]');

            expect(el(fixture, 'use')?.attributes['href']).toBe('#rt-icon-ico-sun');
            expect(el(fixture, '[qa-dataid="icon-button-control"]')?.attributes['aria-pressed']).toBe('true');
        });

        it('тумблер отражает текущую тему', async (): Promise<void> => {
            // `ngModel` пишет значение в контрол не сразу, а следующей задачей
            // микроочереди — без ожидания проверялось бы состояние до записи.
            const fixture: ComponentFixture<RtThemeToggleComponent> = setup({ appearance: 'switch' });

            theme().setTheme('dark');
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();

            expect(el(fixture, '[qa-dataid="toggle-switch-control"]')?.attributes['aria-checked']).toBe('true');
        });
    });

    it('подпись берётся из словаря кита', (): void => {
        const fixture: ComponentFixture<RtThemeToggleComponent> = setup();

        expect(el(fixture, '[qa-dataid="icon-button-control"]')?.attributes['aria-label']).toBe('Switch theme');
    });
});
