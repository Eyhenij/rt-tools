import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
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

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AdminHeaderComponent],
            providers: [provideZonelessChangeDetection(), provideRouter([])],
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

    it('имя вошедшего видно в ряду, а нажатие на профиль уходит выходом', () => {
        show(SECTIONS, { name: 'owner' });

        let clicks: number = 0;
        fixture.componentInstance.profileClick.subscribe((): void => {
            clicks += 1;
        });

        const name: HTMLElement = fixture.debugElement.query(By.css('[qa-dataid="header-user-name"]')).nativeElement as HTMLElement;

        expect(name.textContent?.trim()).toBe('owner');

        (fixture.debugElement.query(By.css('.rt-page-header__user')).nativeElement as HTMLElement).click();

        expect(clicks).toBe(1);
    });

    it('без вошедшего профиля в ряду нет вовсе', () => {
        show(SECTIONS, null);

        expect(fixture.debugElement.query(By.css('[qa-dataid="header-user-name"]'))).toBeNull();
    });
});
