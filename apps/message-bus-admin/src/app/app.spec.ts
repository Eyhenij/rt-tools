import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';
import { appRoutes } from './app.routes';

describe('App', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [App],
            providers: [provideZonelessChangeDetection(), provideRouter(appRoutes)],
        }).compileComponents();
    });

    it('корень приложения держит только место под раздел', async () => {
        const fixture: ComponentFixture<App> = TestBed.createComponent(App);
        await fixture.whenStable();

        const root: HTMLElement = fixture.nativeElement as HTMLElement;
        expect(root.querySelector('router-outlet')).not.toBeNull();
    });
});
