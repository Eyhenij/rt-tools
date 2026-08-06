import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { classesOf, createRtFixture, el, hostClasses, qa } from '../../../testing/rt-kit-testing';
import { RtHeaderComponent } from './rt-header.component';

/** Колокольчик приходит проекцией — нужна host-обёртка. */
@Component({
    selector: 'rt-header-host',
    template: `
        <rt-header>
            <button rtHeaderBell type="button" qa-dataid="host-bell">Уведомления</button>
        </rt-header>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtHeaderComponent],
})
class HeaderHostComponent {}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtHeaderComponent> {
    return createRtFixture(RtHeaderComponent, inputs);
}

function press(fixture: ComponentFixture<RtHeaderComponent>, id: string): void {
    el(fixture, `[qa-dataid="${id}"] [qa-dataid="icon-button-control"]`)?.nativeElement.click();
    fixture.detectChanges();
}

describe('RtHeaderComponent', (): void => {
    it('несёт свой BEM-блок и рисует логотип', (): void => {
        const fixture: ComponentFixture<RtHeaderComponent> = setup();

        expect(hostClasses(fixture)).toContain('rt-header');
        expect(qa(fixture, 'header-logo')).not.toBeNull();
    });

    describe('кнопка «назад»', (): void => {
        it('в разметке есть всегда, но без входа спрятана модификатором', (): void => {
            // Кнопка не появляется и не исчезает, а проявляется: иначе соседние
            // элементы шапки прыгали бы при каждом переходе.
            const fixture: ComponentFixture<RtHeaderComponent> = setup();

            expect(qa(fixture, 'header-back')).not.toBeNull();
            expect(classesOf(qa(fixture, 'header-back'))).not.toContain('rt-header__back--visible');
        });

        it('проявляется, когда есть куда возвращаться', (): void => {
            expect(classesOf(qa(setup({ canGoBack: true }), 'header-back'))).toContain('rt-header__back--visible');
        });

        it('нажатие поднимает событие', (): void => {
            const fixture: ComponentFixture<RtHeaderComponent> = setup({ canGoBack: true });
            const clicks: jest.Mock = jest.fn();
            fixture.componentInstance.backClick.subscribe(clicks);

            press(fixture, 'header-back');

            expect(clicks).toHaveBeenCalledTimes(1);
        });
    });

    describe('приглашение', (): void => {
        it('без входа кнопки нет', (): void => {
            expect(qa(setup(), 'header-invite')).toBeNull();
        });

        it('появляется по входу и поднимает своё событие', (): void => {
            const fixture: ComponentFixture<RtHeaderComponent> = setup({ showInvite: true });
            const clicks: jest.Mock = jest.fn();
            fixture.componentInstance.inviteClick.subscribe(clicks);

            press(fixture, 'header-invite');

            expect(clicks).toHaveBeenCalledTimes(1);
        });
    });

    it('кнопка профиля есть всегда и поднимает своё событие', (): void => {
        const fixture: ComponentFixture<RtHeaderComponent> = setup();
        const clicks: jest.Mock = jest.fn();
        fixture.componentInstance.profileClick.subscribe(clicks);

        press(fixture, 'header-profile');

        expect(clicks).toHaveBeenCalledTimes(1);
    });

    it('колокольчик приходит проекцией — шапка не знает про уведомления', (): void => {
        const fixture: ComponentFixture<HeaderHostComponent> = createRtFixture(HeaderHostComponent);

        expect(el(fixture, '[qa-dataid="host-bell"]')).not.toBeNull();
    });

    describe('подписи', (): void => {
        it('берутся из словаря кита', (): void => {
            const fixture: ComponentFixture<RtHeaderComponent> = setup({ showInvite: true });

            expect(el(fixture, '[qa-dataid="header-back"] [qa-dataid="icon-button-control"]')?.attributes['aria-label']).toBe('Back');
            expect(el(fixture, '[qa-dataid="header-profile"] [qa-dataid="icon-button-control"]')?.attributes['aria-label']).toBe('Profile');
        });
    });

    it('кнопки действий подогнаны под высоту шапки инлайновым размером', (): void => {
        const fixture: ComponentFixture<RtHeaderComponent> = setup();

        expect((qa(fixture, 'header-profile')?.nativeElement as HTMLElement).style.getPropertyValue('--rt-icon-button-size')).toBe('35px');
    });
});
