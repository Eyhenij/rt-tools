import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { AuthStore } from '@rt/message-bus-admin/auth/data-access';
import { provideRtStorage, provideRtUtils } from '@rt-tools/core';

import { AdminSetupComponent } from './admin-setup.component';

const SETUP_URL: string = '/api/setup';

describe('AdminSetupComponent', () => {
    let fixture: ComponentFixture<AdminSetupComponent>;
    let http: HttpTestingController;
    let router: Router;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AdminSetupComponent],
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
        vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

        fixture = TestBed.createComponent(AdminSetupComponent);
        fixture.detectChanges();
    });

    // Иконки кита уходят тем же клиентом, и полной тишины у двойника не бывает: сверяется только
    // обращение экрана
    afterEach(() => {
        TestBed.resetTestingModule();
        localStorage.clear();
    });

    function answerOpen(open: boolean): void {
        http.expectOne({ method: 'GET', url: SETUP_URL }).flush({ open });
        fixture.detectChanges();
    }

    function type(id: string, value: string): void {
        const input: HTMLInputElement = fixture.debugElement.query(By.css(`[qa-dataid="${id}"] input`)).nativeElement as HTMLInputElement;
        input.value = value;
        input.dispatchEvent(new Event('input'));
    }

    function press(): void {
        const form: HTMLFormElement = fixture.debugElement.query(By.css('form')).nativeElement as HTMLFormElement;
        form.dispatchEvent(new Event('submit'));
        fixture.detectChanges();
    }

    it('SC-MB-390 — на открытом первом запуске стоят заголовок, подсказка, имя, пароль и «Завести»', () => {
        expect(fixture.debugElement.query(By.css('form'))).toBeNull();

        answerOpen(true);

        const title: HTMLElement = fixture.debugElement.query(By.css('[qa-dataid="setup-title"]')).nativeElement as HTMLElement;
        const submit: HTMLElement = fixture.debugElement.query(By.css('[qa-dataid="setup-submit"]')).nativeElement as HTMLElement;

        expect(title.textContent?.trim()).toBe('Первая запись');
        expect(fixture.debugElement.query(By.css('[qa-dataid="setup-hint"]'))).not.toBeNull();
        expect(fixture.debugElement.query(By.css('[qa-dataid="setup-name"]'))).not.toBeNull();
        expect(fixture.debugElement.query(By.css('[qa-dataid="setup-password"]'))).not.toBeNull();
        expect(submit.getAttribute('aria-label')).toBe('Завести');
        expect(fixture.debugElement.query(By.css('[qa-dataid="setup-chrome"]'))).not.toBeNull();
    });

    it('SC-MB-392 — закрытый первый запуск уводит на вход, и формы не показывает', () => {
        answerOpen(false);

        expect(router.navigate).toHaveBeenCalledWith(['sign-in']);
        expect(fixture.debugElement.query(By.css('form'))).toBeNull();
    });

    it('SC-MB-391 — заведённая пара кладёт вход в стор и ведёт на первый раздел', () => {
        const store: AuthStore = TestBed.inject(AuthStore);
        answerOpen(true);

        type('setup-name', 'Ольга');
        type('setup-password', 'тайный');
        press();

        http.expectOne({ method: 'POST', url: SETUP_URL }).flush({ name: 'Ольга', rights: ['accounts:manage'] });
        fixture.detectChanges();

        expect(store.session()?.name).toBe('Ольга');
        expect(router.navigateByUrl).toHaveBeenCalledWith('/');
        expect(fixture.debugElement.query(By.css('[qa-dataid="setup-fault"]'))).toBeNull();
    });

    it('SC-MB-391 — отказ приёмника показывается его словом над полями, и человек остаётся на экране', () => {
        answerOpen(true);

        type('setup-name', 'Ольга');
        type('setup-password', 'тайный');
        press();

        http.expectOne({ method: 'POST', url: SETUP_URL }).flush(
            { message: 'первая запись уже заведена' },
            { status: 409, statusText: 'Conflict' }
        );
        fixture.detectChanges();

        const fault: HTMLElement = fixture.debugElement.query(By.css('[qa-dataid="setup-fault"]')).nativeElement as HTMLElement;

        expect(fault.textContent?.trim()).toBe('первая запись уже заведена');
        expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('SC-MB-391 — пустая форма наверх не уходит', () => {
        answerOpen(true);

        press();

        http.expectNone({ method: 'POST', url: SETUP_URL });
    });
});
