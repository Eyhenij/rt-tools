import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { provideRtStorage, provideRtUtils } from '@rt-tools/core';

import { AdminSignInComponent } from './admin-sign-in.component';

describe('AdminSignInComponent', () => {
    let fixture: ComponentFixture<AdminSignInComponent>;
    let http: HttpTestingController;
    let router: Router;

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

        http = TestBed.inject(HttpTestingController);
        router = TestBed.inject(Router);
        vi.spyOn(router, 'navigate').mockResolvedValue(true);

        fixture = TestBed.createComponent(AdminSignInComponent);
        fixture.detectChanges();
    });

    // Иконки кита уходят тем же клиентом, и полной тишины у двойника не бывает: сверяется только
    // обращение экрана
    afterEach(() => {
        TestBed.resetTestingModule();
        localStorage.clear();
    });

    /** Ответ приёмника о первом запуске: обычный узел, записи есть. */
    function answerOpen(open: boolean): void {
        http.expectOne({ method: 'GET', url: '/api/setup' }).flush({ open });
        fixture.detectChanges();
    }

    it('SC-MB-390 — узел без записей уводит с входа на экран первой записи', () => {
        answerOpen(true);

        expect(router.navigate).toHaveBeenCalledWith(['setup']);
    });

    it('SC-MB-390 — узел с записями показывает форму входа сразу и никуда не уводит', () => {
        expect(fixture.debugElement.query(By.css('admin-sign-in-form'))).not.toBeNull();

        answerOpen(false);

        expect(router.navigate).not.toHaveBeenCalled();
    });

    it('SC-MB-148 — на входе стоят и переключатель темы, и выбор языка', () => {
        answerOpen(false);

        expect(fixture.debugElement.query(By.css('[qa-dataid="sign-in-chrome"]'))).not.toBeNull();
        expect(fixture.debugElement.query(By.css('[qa-dataid="sign-in-theme"]'))).not.toBeNull();

        const languages: ReadonlyArray<string> = fixture.debugElement
            .queryAll(By.css('[qa-dataid="sign-in-language"] [qa-dataid="toggle-button-group-option"]'))
            .map((node): string => (node.nativeElement as HTMLElement).textContent?.trim() ?? '');

        expect(languages).toEqual(['RU', 'EN']);
    });

    it('приложение называет себя словом из словаря, а не пустым местом под знак', () => {
        answerOpen(false);
        const brand: HTMLElement = fixture.debugElement.query(By.css('[qa-dataid="sign-in-brand"]')).nativeElement as HTMLElement;

        expect(brand.textContent?.trim()).toBe('Приёмник');
        expect(fixture.debugElement.query(By.css('rt-logo'))).toBeNull();
    });

    it('заголовок карточки говорит, куда человек входит', () => {
        answerOpen(false);
        const title: HTMLElement = fixture.debugElement.query(By.css('[qa-dataid="sign-in-title"]')).nativeElement as HTMLElement;

        expect(title.textContent?.trim()).toBe('Вход в админку');
    });

    it('форма входа стоит внутри карточки', () => {
        answerOpen(false);
        expect(fixture.debugElement.query(By.css('admin-sign-in-form'))).not.toBeNull();
        expect(fixture.debugElement.query(By.css('[qa-dataid="sign-in-submit"]'))).not.toBeNull();
    });
});
