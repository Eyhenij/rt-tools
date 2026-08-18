import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideRtStorage, provideRtUtils } from '@rt-tools/core';

import { AdminContainerComponent } from './admin-container.component';

describe('AdminContainerComponent', () => {
    let fixture: ComponentFixture<AdminContainerComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AdminContainerComponent],
            providers: [
                provideZonelessChangeDetection(),
                provideRouter([]),
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRtUtils(),
                provideRtStorage(),
            ],
        });

        fixture = TestBed.createComponent(AdminContainerComponent);
        fixture.detectChanges();
    });

    afterEach(() => {
        TestBed.resetTestingModule();
        localStorage.clear();
    });

    it('стопка тостов на странице одна, и рисует её каркас', () => {
        const toasters: ReadonlyArray<unknown> = fixture.debugElement.queryAll(By.css('rt-toaster'));

        expect(toasters.length).toBe(1);
        expect(fixture.debugElement.query(By.css('rt-container rt-toaster'))).not.toBeNull();
    });

    it('шапка стоит в зоне шапки каркаса, а раздел — в зоне содержимого', () => {
        expect(fixture.debugElement.query(By.css('[qa-dataid="container-header"] admin-header'))).not.toBeNull();
        expect(fixture.debugElement.query(By.css('[qa-dataid="container-content"] router-outlet'))).not.toBeNull();
    });

    it('SC-MB-142 — разделы приходят в шапку декларацией меню, а колонки с ними нет', () => {
        const items: ReadonlyArray<unknown> = fixture.debugElement.queryAll(By.css('[qa-dataid="header-nav-item"]'));

        expect(items.length).toBeGreaterThan(0);
        expect(fixture.debugElement.query(By.css('rt-section-nav'))).toBeNull();
    });
});
