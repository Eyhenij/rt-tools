import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { createRtFixture, el } from '../../../testing/rt-kit-testing';
import { RtMenuItemComponent } from './rt-menu-item.component';
import { RtMenuComponent } from './rt-menu.component';

/** Страница, куда ведёт пункт-ссылка: самой разметки у неё нет. */
@Component({ selector: 'rt-user-page', template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class UserPageComponent {}

/** Меню строки, как у приложения: первый пункт ведёт на страницу записи, второй — обычный. */
@Component({
    selector: 'rt-menu-link-host',
    template: `
        <rt-menu ariaLabel="Действия">
            <rt-menu-item
                label="Карточка"
                icon="ico-eye"
                [link]="['/users', 7]"
                [disabled]="linkDisabled()"
                (selected)="opened = opened + 1" />
            <rt-menu-item label="Удалить" icon="ico-trash" (selected)="removed = removed + 1" />
        </rt-menu>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtMenuComponent, RtMenuItemComponent],
})
class MenuLinkHostComponent {
    public readonly linkDisabled: WritableSignal<boolean> = signal<boolean>(false);
    public opened: number = 0;
    public removed: number = 0;
}

function panel(): HTMLElement | null {
    return document.querySelector('[qa-dataid="menu-panel"]');
}

function link(): HTMLAnchorElement {
    return document.querySelector('[qa-dataid="menu-item-link"]') as HTMLAnchorElement;
}

function setup(linkDisabled: boolean = false): ComponentFixture<MenuLinkHostComponent> {
    const fixture: ComponentFixture<MenuLinkHostComponent> = createRtFixture(
        MenuLinkHostComponent,
        {},
        { skipInitialDetect: true, providers: [provideRouter([{ path: 'users/:id', component: UserPageComponent }])] }
    );
    fixture.componentInstance.linkDisabled.set(linkDisabled);
    fixture.detectChanges();
    el(fixture, '[qa-dataid="menu-trigger"] [qa-dataid="icon-button-control"]')?.nativeElement.click();
    fixture.detectChanges();
    return fixture;
}

function url(): string {
    return TestBed.inject(Router).url;
}

describe('RtMenuItemComponent — пункт-ссылка', (): void => {
    it('рисует ссылку с адресом, и роль пункта меню несёт она, а не хост', (): void => {
        setup();

        expect(link().getAttribute('href')).toBe('/users/7');
        expect(link().getAttribute('role')).toBe('menuitem');
        expect(link().closest('rt-menu-item')?.getAttribute('role')).toBe('none');
        expect(link().closest('rt-menu-item')?.hasAttribute('tabindex')).toBe(false);
    });

    it('открытое меню ставит фокус на ссылку — стрелки её не пропускают', (): void => {
        setup();

        expect(document.activeElement).toBe(link());
    });

    it('клик переходит по ссылке, поднимает выбор и закрывает меню', async (): Promise<void> => {
        const fixture: ComponentFixture<MenuLinkHostComponent> = setup();

        link().click();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(url()).toBe('/users/7');
        expect(fixture.componentInstance.opened).toBe(1);
        expect(panel()).toBeNull();
    });

    it('Enter пункт не гасит: нажатие ссылки делает браузер, а переход — ссылка', (): void => {
        setup();
        const enter: KeyboardEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });

        link().dispatchEvent(enter);

        expect(enter.defaultPrevented).toBe(false);
    });

    it('пробел нажимает ссылку и не прокручивает страницу', async (): Promise<void> => {
        const fixture: ComponentFixture<MenuLinkHostComponent> = setup();
        const space: KeyboardEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });

        link().dispatchEvent(space);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(space.defaultPrevented).toBe(true);
        expect(url()).toBe('/users/7');
        expect(panel()).toBeNull();
    });

    it('Ctrl-click и Shift-click отданы браузеру, а меню закрывается', async (): Promise<void> => {
        for (const modifier of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }]) {
            const fixture: ComponentFixture<MenuLinkHostComponent> = setup();
            const click: MouseEvent = new MouseEvent('click', { ...modifier, bubbles: true, cancelable: true });

            link().dispatchEvent(click);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(click.defaultPrevented).toBe(false);
            expect(url()).toBe('/');
            expect(panel()).toBeNull();
        }
    });

    it('средняя кнопка отдана браузеру и закрывает меню', (): void => {
        const fixture: ComponentFixture<MenuLinkHostComponent> = setup();

        link().dispatchEvent(new MouseEvent('auxclick', { button: 1, bubbles: true }));
        fixture.detectChanges();

        expect(fixture.componentInstance.opened).toBe(1);
        expect(panel()).toBeNull();
    });

    it('правая кнопка меню не закрывает', (): void => {
        const fixture: ComponentFixture<MenuLinkHostComponent> = setup();

        link().dispatchEvent(new MouseEvent('auxclick', { button: 2, bubbles: true }));
        fixture.detectChanges();

        expect(panel()).not.toBeNull();
    });

    it('недоступный пункт-ссылка без адреса, не переходит и меню не закрывает', async (): Promise<void> => {
        const fixture: ComponentFixture<MenuLinkHostComponent> = setup(true);

        link().click();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(link().hasAttribute('href')).toBe(false);
        expect(link().getAttribute('aria-disabled')).toBe('true');
        expect(url()).toBe('/');
        expect(panel()).not.toBeNull();
    });

    it('обычный пункт рядом остаётся пунктом без ссылки', (): void => {
        setup();
        const plain: Element = document.querySelectorAll('rt-menu-item')[1];

        expect(plain.getAttribute('role')).toBe('menuitem');
        expect(plain.querySelector('a')).toBeNull();
    });
});
