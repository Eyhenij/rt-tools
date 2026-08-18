import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideRtStorage, provideRtUtils } from '@rt-tools/core';

import { AdminSignInComponent } from './admin-sign-in.component';

describe('AdminSignInComponent', () => {
    let fixture: ComponentFixture<AdminSignInComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AdminSignInComponent],
            providers: [
                provideZonelessChangeDetection(),
                provideRouter([]),
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRtUtils(),
                provideRtStorage(),
            ],
        });

        fixture = TestBed.createComponent(AdminSignInComponent);
        fixture.detectChanges();
    });

    afterEach(() => {
        TestBed.resetTestingModule();
        localStorage.clear();
    });

    it('SC-MB-148 — на входе стоят и переключатель темы, и выбор языка', () => {
        expect(fixture.debugElement.query(By.css('[qa-dataid="sign-in-chrome"]'))).not.toBeNull();
        expect(fixture.debugElement.query(By.css('[qa-dataid="sign-in-theme"]'))).not.toBeNull();

        const languages: ReadonlyArray<string> = fixture.debugElement
            .queryAll(By.css('[qa-dataid="sign-in-language"] [qa-dataid="toggle-button-group-option"]'))
            .map((node): string => (node.nativeElement as HTMLElement).textContent?.trim() ?? '');

        expect(languages).toEqual(['RU', 'EN']);
    });

    it('приложение называет себя словом из словаря, а не пустым местом под знак', () => {
        const brand: HTMLElement = fixture.debugElement.query(By.css('[qa-dataid="sign-in-brand"]')).nativeElement as HTMLElement;

        expect(brand.textContent?.trim()).toBe('Приёмник');
        expect(fixture.debugElement.query(By.css('rt-logo'))).toBeNull();
    });

    it('заголовок карточки говорит, куда человек входит', () => {
        const title: HTMLElement = fixture.debugElement.query(By.css('[qa-dataid="sign-in-title"]')).nativeElement as HTMLElement;

        expect(title.textContent?.trim()).toBe('Вход в админку');
    });

    it('форма входа стоит внутри карточки', () => {
        expect(fixture.debugElement.query(By.css('admin-sign-in-form'))).not.toBeNull();
        expect(fixture.debugElement.query(By.css('[qa-dataid="sign-in-submit"]'))).not.toBeNull();
    });
});
