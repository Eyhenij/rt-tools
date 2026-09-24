import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { EChatSide, IChat, IChatTalkWords } from '@rt/message-bus-admin/chat/util';
import { EChatTalkState } from '@rt/message-bus-common';
import { provideRtStorage, provideRtUtils } from '@rt-tools/core';

import { AdminChatTalkComponent } from './admin-chat-talk.component';

/** Минута последней реплики: часы машины в спеке не читаются. */
const AT: string = '2026-09-20T10:00:00.000Z';

/** Слова экрана. На экране их даёт словарь, здесь — вход компонента. */
const WORDS: IChatTalkWords = {
    site: 'Площадка',
    state: 'Состояние',
    lastMessageAt: 'Последняя реплика',
    stateLive: 'Живой',
    stateClosed: 'Закрытый',
    close: 'Закрыть разговор',
    reopen: 'Открыть снова',
    untitled: 'Разговор без реплик',
    sideOperator: 'Оператор',
    sideVisitor: 'Посетитель',
};

/** Разговор строки. Состояние называется доводом: о нём и спрашивают. */
function talk(state: EChatTalkState): IChat.Talk.State {
    return {
        state,
        id: 'разговор-1',
        siteId: 'площадка-1',
        lastMessageAt: AT,
        lastMessage: 'где мой заказ?',
        lastMessageSide: EChatSide.Visitor,
    };
}

/** Тег состояния, каким его видит человек. */
function markOf(fixture: ComponentFixture<AdminChatTalkComponent>): HTMLElement {
    return fixture.debugElement.query(By.css('[qa-dataid="chat-talk-state-mark"]')).nativeElement as HTMLElement;
}

describe('AdminChatTalkComponent', () => {
    let fixture: ComponentFixture<AdminChatTalkComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AdminChatTalkComponent],
            providers: [provideRtUtils(), provideRtStorage()],
        });

        fixture = TestBed.createComponent(AdminChatTalkComponent);
        fixture.componentRef.setInput('talk', talk(EChatTalkState.Live));
        fixture.componentRef.setInput('words', WORDS);
        fixture.detectChanges();
    });

    afterEach(() => {
        TestBed.resetTestingModule();
    });

    it('SC-CH-94 — состояние живого разговора стоит в строке тегом', () => {
        // положительная пара: место тега найдено, и в нём стоит слово живого разговора
        expect(markOf(fixture).textContent?.trim()).toBe('Живой');
        expect(fixture.debugElement.query(By.css('rt-tag'))).not.toBeNull();
    });

    it('SC-CH-94 — закрытый разговор назван в теге своим словом', () => {
        fixture.componentRef.setInput('talk', talk(EChatTalkState.Closed));
        fixture.detectChanges();

        expect(markOf(fixture).textContent?.trim()).toBe('Закрытый');
    });

    it('строка показывает площадку и последнюю реплику со стороной', () => {
        const row: HTMLElement = fixture.nativeElement as HTMLElement;

        expect(row.textContent).toContain('площадка-1');
        expect(row.textContent).toContain('Посетитель: где мой заказ?');
    });

    it('слова строки приходят входом, а не словарём одного из экранов', () => {
        fixture.componentRef.setInput('words', { ...WORDS, stateLive: 'Open', sideVisitor: 'Visitor' });
        fixture.detectChanges();

        expect(markOf(fixture).textContent?.trim()).toBe('Open');
        expect((fixture.nativeElement as HTMLElement).textContent).toContain('Visitor: где мой заказ?');
    });
});
