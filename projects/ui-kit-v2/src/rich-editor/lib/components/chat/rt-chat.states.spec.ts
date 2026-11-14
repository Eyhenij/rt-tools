import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { RtEmptyStateComponent } from '../../../../lib/components/empty-state/rt-empty-state.component';
import { QuillMock } from '../../../../testing/quill-mock';
import { createRtFixture, qa, textOf } from '../../../../testing/rt-kit-testing';
import { RtChatEmptyDirective, RtChatErrorDirective } from './rt-chat-states.directive';
import { IRtChat } from './rt-chat.model';
import { RtChatComponent } from './rt-chat.component';

// Редактор с разметкой грузит Quill динамическим импортом — в jsdom он не поднимается.
jest.mock('quill', (): { __esModule: true; default: typeof QuillMock } => ({ __esModule: true, default: QuillMock }));

const MESSAGES: readonly IRtChat.Message[] = [
    { id: 1, author: 'Иванов', own: false, text: 'Здравствуйте', createdAt: '2026-03-15T10:00:00Z' },
];

/** Чат со своими шаблонами заглушки и ошибки. */
@Component({
    selector: 'rt-chat-own-views-host',
    template: `
        <rt-chat [hasThread]="hasThread()" [error]="error()" (retry)="retryCount = retryCount + 1">
            <ng-template rtChatEmpty>
                <span qa-dataid="own-empty">свой пустой</span>
            </ng-template>
            <ng-template rtChatError let-message let-retry="retry">
                <button qa-dataid="own-error" type="button" (click)="retry()">{{ message }}</button>
            </ng-template>
        </rt-chat>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtChatComponent, RtChatEmptyDirective, RtChatErrorDirective],
})
class OwnViewsHostComponent {
    public readonly hasThread: WritableSignal<boolean> = signal<boolean>(false);
    public readonly error: WritableSignal<string | null> = signal<string | null>(null);
    public retryCount: number = 0;
}

describe('RtChatComponent — ошибка и заглушки', (): void => {
    it('SC-UKV-1276 — без переписки заглушка показывает свой заголовок, подсказку и иконку', (): void => {
        const fixture: ComponentFixture<RtChatComponent> = createRtFixture(RtChatComponent, {
            hasThread: false,
            emptyTitle: 'Переписка не выбрана',
            emptyHint: 'Выберите переписку слева.',
            emptyIcon: 'comment',
        });

        expect(textOf(qa(fixture, 'chat-empty-hint'))).toContain('Переписка не выбрана');
        expect(textOf(qa(fixture, 'chat-empty-hint'))).toContain('Выберите переписку слева.');
        expect((qa(fixture, 'chat-empty-hint')?.componentInstance as RtEmptyStateComponent).icon()).toBe('comment');
    });

    it('SC-UKV-1276 — без своей подсказки стоит подпись кита', (): void => {
        const fixture: ComponentFixture<RtChatComponent> = createRtFixture(RtChatComponent, { hasThread: false });

        expect(textOf(qa(fixture, 'chat-empty-hint')).length).toBeGreaterThan(0);
    });

    it('SC-UKV-1277 — ошибка прячет ленту и поле ответа, «Повторить» поднимает retry', (): void => {
        const fixture: ComponentFixture<RtChatComponent> = createRtFixture(RtChatComponent, {
            hasThread: true,
            canReply: true,
            messages: MESSAGES,
            error: '',
        });
        const retries: jest.Mock = jest.fn();
        fixture.componentInstance.retry.subscribe(retries);

        expect(qa(fixture, 'chat-error')).not.toBeNull();
        expect(textOf(qa(fixture, 'chat-error'))).toContain('Could not load');
        expect(qa(fixture, 'chat-message')).toBeNull();
        expect(qa(fixture, 'chat-composer')).toBeNull();

        (qa(fixture, 'chat-retry')?.nativeElement as HTMLButtonElement).click();

        expect(retries).toHaveBeenCalledTimes(1);
    });

    it('SC-UKV-1277 — свои шаблоны встают вместо заглушки и ошибки целиком', (): void => {
        const fixture: ComponentFixture<OwnViewsHostComponent> = createRtFixture(OwnViewsHostComponent, {}, { skipInitialDetect: true });
        fixture.detectChanges();

        expect(qa(fixture, 'own-empty')).not.toBeNull();
        expect(qa(fixture, 'chat-empty-hint')).toBeNull();

        fixture.componentInstance.hasThread.set(true);
        fixture.componentInstance.error.set('Нет сети');
        fixture.detectChanges();

        expect(qa(fixture, 'chat-error')).toBeNull();
        expect(textOf(qa(fixture, 'own-error'))).toBe('Нет сети');

        (qa(fixture, 'own-error')?.nativeElement as HTMLButtonElement).click();

        expect(fixture.componentInstance.retryCount).toBe(1);
    });
});
