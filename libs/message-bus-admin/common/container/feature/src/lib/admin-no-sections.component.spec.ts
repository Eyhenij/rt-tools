import { HttpRequest, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { AuthStore } from '@rt/message-bus-admin/auth/data-access';
import { provideRtStorage, provideRtUtils } from '@rt-tools/core';

import { MockInstance, vi } from 'vitest';

import { AdminNoSectionsComponent } from './admin-no-sections.component';

describe('AdminNoSectionsComponent', () => {
    let fixture: ComponentFixture<AdminNoSectionsComponent>;
    let http: HttpTestingController;

    /**
     * Ответ приёмника о том, кто вошёл. Права приезжают им, а не подставляются в состояние:
     * подставленные, они проверяли бы то, чего в дереве нет, — путь ответа тот же, что у экрана.
     */
    function signedInWith(rights: readonly string[]): void {
        TestBed.inject(AuthStore).restore().subscribe();
        http.expectOne('/api/auth/session').flush({ name: 'Владелец', rights });
        fixture.detectChanges();
    }

    /** Слова пустого состояния: по ним видно, что именно человеку сказали. */
    function shownWords(): string {
        return (fixture.debugElement.query(By.css('[qa-dataid="container-no-sections"]'))?.nativeElement as HTMLElement)?.textContent ?? '';
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AdminNoSectionsComponent],
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
        fixture = TestBed.createComponent(AdminNoSectionsComponent);
        fixture.detectChanges();
    });

    afterEach(() => {
        // Значки кит просит тем же клиентом: без слива они читаются проверкой как неотвеченные
        // запросы экрана, и падает на них любая спека, что бы она ни проверяла.
        http.match((request: HttpRequest<unknown>): boolean => request.url.startsWith('/icons/'));
        http.verify();
        TestBed.resetTestingModule();
        localStorage.clear();
    });

    it('SC-MB-302 — экран говорит, что доступа нет, и к кому идти за правами', () => {
        signedInWith([]);

        expect(shownWords()).toContain('Доступа ни к одному разделу нет');
        expect(shownWords()).toContain('Права выдаёт владелец приёмника');
    });

    it('SC-MB-302 — своей кнопки выхода экран не ставит: выход один, и стоит он в шапке', () => {
        signedInWith([]);

        // Сперва положительное: экран вообще нарисован — иначе проверка на отсутствие зеленела бы
        // и на пустом месте.
        expect(fixture.debugElement.query(By.css('[qa-dataid="container-no-sections"]'))).not.toBeNull();
        expect(fixture.debugElement.query(By.css('button'))).toBeNull();
    });

    it('SC-MB-399 — приехавшее право уводит с экрана в открывшийся раздел', async () => {
        const router: Router = TestBed.inject(Router);
        const gone: MockInstance = vi.spyOn(router, 'navigate').mockResolvedValue(true);

        // Сперва отрицательное: до ответа о вошедшем никуда не уводят — права неизвестны, а не
        // выданы, и увод по ним унёс бы человека в раздел, которого ему не открывали.
        expect(gone).not.toHaveBeenCalled();

        signedInWith(['summaries:read']);
        await fixture.whenStable();

        expect(gone).toHaveBeenCalledWith(['/summaries']);
    });
});
