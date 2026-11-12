import { join } from 'node:path';

import { ComponentFixture } from '@angular/core/testing';

import * as sass from 'sass';

import { QuillMock } from '../../../../testing/quill-mock';
import { createRtFixture, qa, textOf } from '../../../../testing/rt-kit-testing';
import { RtChatComponent } from './rt-chat.component';
import { IRtChat } from './rt-chat.model';

// Редактор с разметкой грузит Quill динамическим импортом — в jsdom он не
// поднимается. `__esModule` обязателен для интеропа.
jest.mock('quill', (): { __esModule: true; default: typeof QuillMock } => ({ __esModule: true, default: QuillMock }));

const STYLES: string = join(__dirname, 'rt-chat-translation.scss');

function message(patch: Partial<IRtChat.Message> = {}): IRtChat.Message {
    return {
        id: 7,
        author: 'Гость',
        own: false,
        text: 'Good afternoon!',
        createdAt: '2026-03-15T10:00:00Z',
        dateLabel: '12:58',
        ...patch,
    };
}

function setup(messages: readonly IRtChat.Message[]): ComponentFixture<RtChatComponent> {
    return createRtFixture(RtChatComponent, { hasThread: true, messages });
}

/** Текст узла одной строкой: шаблон разносит подпись и время по строкам разметки. */
function line(fixture: ComponentFixture<RtChatComponent>, id: string): string {
    const node: ReturnType<typeof qa> = qa(fixture, id);

    return node === null ? '' : textOf(node).replace(/\s+/g, ' ').trim();
}

describe('перевод реплики чата', (): void => {
    it('SC-UKV-1237 — подпись перевода стоит в строке времени перед временем', (): void => {
        const fixture: ComponentFixture<RtChatComponent> = setup([message({ translationLabel: 'Переведено' })]);

        expect(line(fixture, 'chat-message-translation')).toBe('Переведено');
        expect(line(fixture, 'chat-message-date')).toBe('Переведено · 12:58');
    });

    it('SC-UKV-1238 — без подписи строка времени прежняя, кнопки нет', (): void => {
        const fixture: ComponentFixture<RtChatComponent> = setup([message()]);

        expect(line(fixture, 'chat-message-translation')).toBe('');
        expect(qa(fixture, 'chat-message-show-translation')).toBeNull();
        expect(line(fixture, 'chat-message-date')).toBe('12:58');
    });

    it('SC-UKV-1239 — кнопка «Показать перевод» отдаёт реплику событием', (): void => {
        const original: IRtChat.Message = message({ translationLabel: 'Оригинал', canShowTranslation: true });
        const fixture: ComponentFixture<RtChatComponent> = setup([original]);
        const asked: IRtChat.Message[] = [];
        fixture.componentInstance.showTranslation.subscribe((reply: IRtChat.Message): number => asked.push(reply));

        const button: HTMLButtonElement = qa(fixture, 'chat-message-show-translation')?.nativeElement as HTMLButtonElement;
        button.click();

        expect(button.type).toBe('button');
        expect(button.textContent?.trim()).not.toBe('');
        expect(asked).toEqual([original]);
        // Текст реплики меняет приложение: кит его не трогает
        expect(line(fixture, 'chat-message-text')).toBe('Good afternoon!');
    });

    it('SC-UKV-1240 — в своём пузыре мессенджера кнопка берёт цвет текста на заливке и подчёркнута', (): void => {
        const css: string = sass.compile(STYLES, { style: 'expanded' }).css;

        expect(css).toMatch(
            /\.rt-chat--messenger \.rt-chat__message--own \.rt-chat__message-translate \{\s+color: var\(--rt-color-action-on-primary\);\s+text-decoration: underline;/
        );
        expect(css).toMatch(/\.rt-chat__message-translate \{[^}]*color: var\(--rt-color-action-primary\);/);
    });
});
