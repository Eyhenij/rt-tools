import { ApplicationRef, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideRtStorage, provideRtUtils } from '@rt-tools/core';
import { IRtPageHeader } from '@rt-tools/ui-kit-v2';

import { AdminHeaderComponent } from './admin-header.component';

const SECTIONS: ReadonlyArray<IRtPageHeader.Item> = Object.freeze([
    { id: '/postmortems', label: 'Разборы происшествий', route: '/postmortems' },
    { id: '/proposals', label: 'Предложения', route: '/proposals' },
]);

describe('AdminHeaderComponent', () => {
    let fixture: ComponentFixture<AdminHeaderComponent>;

    function show(items: ReadonlyArray<IRtPageHeader.Item>, user: IRtPageHeader.User | null): void {
        fixture.componentRef.setInput('items', items);
        fixture.componentRef.setInput('user', user);
        fixture.detectChanges();
    }

    /**
     * Содержимое наложения само не рисуется: попап живёт вне фикстуры, у конца страницы, и
     * появляется он после того, как приложение отрисовало свой ход.
     */
    async function openOverlay(): Promise<void> {
        TestBed.inject(ApplicationRef).tick();
        await fixture.whenStable();
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AdminHeaderComponent],
            providers: [provideZonelessChangeDetection(), provideRouter([]), provideRtUtils(), provideRtStorage()],
        });

        fixture = TestBed.createComponent(AdminHeaderComponent);
    });

    afterEach(() => {
        TestBed.resetTestingModule();
    });

    it('SC-MB-142 — разделы стоят пунктами верхнего ряда, а плиток колонки в шапке нет', () => {
        show(SECTIONS, { name: 'owner' });

        expect(fixture.debugElement.queryAll(By.css('[qa-dataid="header-nav-item"]')).length).toBe(SECTIONS.length);
        expect(fixture.debugElement.query(By.css('rt-page-header'))).not.toBeNull();
        expect(fixture.debugElement.query(By.css('rt-section-nav'))).toBeNull();
    });

    it('SC-MB-143 — пункт ведёт адресом раздела: подсветку считает маршрутизатор, а не шапка', () => {
        show(SECTIONS, { name: 'owner' });

        const links: ReadonlyArray<HTMLAnchorElement> = fixture.debugElement
            .queryAll(By.css('[qa-dataid="header-nav-item"] a'))
            .map((node): HTMLAnchorElement => node.nativeElement as HTMLAnchorElement);

        expect(links.length).toBe(SECTIONS.length);
        expect(links.map((link: HTMLAnchorElement): string => new URL(link.href).pathname)).toEqual(['/postmortems', '/proposals']);
    });

    it('приложение называет себя словом из словаря, а не пустым местом под знак', () => {
        show(SECTIONS, { name: 'owner' });

        const brand: HTMLElement = fixture.debugElement.query(By.css('[qa-dataid="admin-brand"]')).nativeElement as HTMLElement;

        expect(brand.textContent?.trim()).toBe('Приёмник');
        expect(fixture.debugElement.query(By.css('rt-logo'))).toBeNull();
    });

    it('имя вошедшего видно в ряду', () => {
        show(SECTIONS, { name: 'owner' });

        const name: HTMLElement = fixture.debugElement.query(By.css('[qa-dataid="header-user-name"]')).nativeElement as HTMLElement;

        expect(name.textContent?.trim()).toBe('owner');
    });

    it('SC-MB-145 — нажатие на профиль открывает попап, а не выходит', async () => {
        show(SECTIONS, { name: 'owner' });

        let signOuts: number = 0;
        fixture.componentInstance.signOut.subscribe((): void => {
            signOuts += 1;
        });

        (fixture.debugElement.query(By.css('[qa-dataid="header-user-menu"]')).nativeElement as HTMLElement).click();
        await openOverlay();

        expect(document.querySelector('[qa-dataid="profile-menu"]')).not.toBeNull();
        expect(signOuts).toBe(0);
    });

    it('SC-MB-146 — выход идёт пунктом попапа', async () => {
        show(SECTIONS, { name: 'owner' });

        let signOuts: number = 0;
        fixture.componentInstance.signOut.subscribe((): void => {
            signOuts += 1;
        });

        (fixture.debugElement.query(By.css('[qa-dataid="header-user-menu"]')).nativeElement as HTMLElement).click();
        await openOverlay();

        const action: HTMLElement | null = document.querySelector('[qa-dataid="profile-sign-out"]');

        expect(action).not.toBeNull();
        expect(action?.textContent?.trim()).toBe('Выйти');

        action?.click();

        expect(signOuts).toBe(1);
    });

    it('SC-MB-147 — попап несёт переключатель темы, а не одно только имя с выходом', async () => {
        show(SECTIONS, { name: 'owner' });

        (fixture.debugElement.query(By.css('[qa-dataid="header-user-menu"]')).nativeElement as HTMLElement).click();
        await openOverlay();

        expect(document.querySelector('[qa-dataid="profile-menu"]')).not.toBeNull();
        expect(document.querySelector('[qa-dataid="profile-theme"]')).not.toBeNull();
    });

    it('SC-MB-150 — язык выбирается в попапе обоими значениями сразу', async () => {
        show(SECTIONS, { name: 'owner' });

        (fixture.debugElement.query(By.css('[qa-dataid="header-user-menu"]')).nativeElement as HTMLElement).click();
        await openOverlay();

        const options: ReadonlyArray<Element> = Array.from(
            document.querySelectorAll('[qa-dataid="profile-language"] [qa-dataid="toggle-button-group-option"]')
        );

        expect(options.map((option: Element): string => option.textContent?.trim() ?? '')).toEqual(['RU', 'EN']);
    });

    it('попап называет вошедшего и не обещает смены пароля', async () => {
        show(SECTIONS, { name: 'owner' });

        (fixture.debugElement.query(By.css('[qa-dataid="header-user-menu"]')).nativeElement as HTMLElement).click();
        await openOverlay();

        expect(document.querySelector('[qa-dataid="profile-name"]')?.textContent?.trim()).toBe('owner');
        expect(document.body.textContent).not.toContain('пароль');
    });

    it('без вошедшего профиля в ряду нет вовсе', () => {
        show(SECTIONS, null);

        expect(fixture.debugElement.query(By.css('[qa-dataid="header-user-name"]'))).toBeNull();
    });
});
