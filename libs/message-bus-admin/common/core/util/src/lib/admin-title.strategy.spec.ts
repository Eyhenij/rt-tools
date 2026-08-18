import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, Router, TitleStrategy } from '@angular/router';

import { AdminTitleStrategy } from './admin-title.strategy';

/** Пустой экран: спека судит заголовок вкладки, а не то, что на странице нарисовано. */
@Component({ selector: 'admin-title-probe', template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class ProbeComponent {}

describe('AdminTitleStrategy', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideZonelessChangeDetection(),
                provideRouter([
                    { path: 'postmortems', title: 'Разборы происшествий', component: ProbeComponent },
                    { path: 'anonymous', component: ProbeComponent },
                ]),
                { provide: TitleStrategy, useClass: AdminTitleStrategy },
            ],
        });
    });

    afterEach(() => {
        TestBed.resetTestingModule();
    });

    it('SC-MB-152 — вкладка называет раздел и приложение, а не проект сборки', async () => {
        await TestBed.inject(Router).navigateByUrl('/postmortems');

        expect(TestBed.inject(Title).getTitle()).toBe('Разборы происшествий · Приёмник');
    });

    it('SC-MB-152 — раздел без своего названия оставляет вкладке одно имя приложения', async () => {
        await TestBed.inject(Router).navigateByUrl('/anonymous');

        expect(TestBed.inject(Title).getTitle()).toBe('Приёмник');
    });
});
