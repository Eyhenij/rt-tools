import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { provideRtKitTesting } from '../../../testing/rt-kit-testing';
import { RtDialogService } from '../dialog/rt-dialog.service';
import { IRtWelcomeDialog, RtWelcomeDialogComponent } from './rt-welcome-dialog.component';

function open(data: IRtWelcomeDialog.Data | null): void {
    TestBed.configureTestingModule({ providers: [...provideRtKitTesting()] });
    TestBed.inject(RtDialogService).open(RtWelcomeDialogComponent, { data });
    TestBed.inject(ApplicationRef).tick();
}

function node(id: string): HTMLElement | null {
    return document.querySelector(`[qa-dataid="${id}"]`);
}

function nodes(id: string): HTMLElement[] {
    return Array.from(document.querySelectorAll(`[qa-dataid="${id}"]`));
}

describe('RtWelcomeDialogComponent', (): void => {
    it('первый абзац сообщения становится заголовком, остальные — текстом', (): void => {
        // Приветствие приходит одной строкой из настроек приложения, поэтому
        // компонент сам решает, что в ней заголовок: это первый абзац.
        open({ message: 'Добро пожаловать\n\nЗдесь появятся ваши заявки.\n\nНачните с создания первой.' });

        expect(node('welcome-dialog-title')?.textContent?.trim()).toBe('Добро пожаловать');
        expect(nodes('welcome-dialog-description').map((n: HTMLElement): string => (n.textContent ?? '').trim())).toEqual([
            'Здесь появятся ваши заявки.',
            'Начните с создания первой.',
        ]);
    });

    it('сообщение из одного абзаца даёт только заголовок', (): void => {
        open({ message: 'Добро пожаловать' });

        expect(node('welcome-dialog-title')?.textContent?.trim()).toBe('Добро пожаловать');
        expect(nodes('welcome-dialog-description').length).toBe(0);
    });

    it('пустые абзацы отбрасываются', (): void => {
        open({ message: 'Заголовок\n\n\n\n   \n\nТекст' });

        expect(nodes('welcome-dialog-description').map((n: HTMLElement): string => (n.textContent ?? '').trim())).toEqual(['Текст']);
    });

    it('без данных диалог рисуется пустым, но не падает', (): void => {
        open(null);

        expect(node('welcome-dialog-title')).toBeNull();
        expect(node('welcome-dialog-cta')).not.toBeNull();
    });

    describe('кнопка', (): void => {
        it('без своей подписи берёт переведённую', (): void => {
            open({ message: 'Привет' });

            expect(node('welcome-dialog-cta')?.textContent?.trim()).toBe('Continue');
        });

        it('своя подпись перебивает переведённую', (): void => {
            open({ message: 'Привет', ctaLabel: 'Поехали' });

            expect(node('welcome-dialog-cta')?.textContent?.trim()).toBe('Поехали');
        });

        it('нажатие закрывает диалог', (): void => {
            open({ message: 'Привет' });

            node('welcome-dialog-cta')?.click();

            expect(document.querySelector('rt-welcome-dialog')).toBeNull();
        });
    });
});
