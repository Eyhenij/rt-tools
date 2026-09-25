import { describe, expect, it } from 'vitest';

import { EChatTalkState } from '@rt/message-bus-common';
import { IRtWorkspaceDetails } from '@rt-tools/ui-kit-v2';

import {
    chatTalkActions,
    chatTalkDetailRows,
    chatTalkStateAfter,
    chatTalkTitle,
    EChatTalkAction,
    IChatTalkWords,
} from './chat-workspace.logic';
import { EChatSide, IChat } from './chat.model';

/** Минута последней реплики: часы машины в спеке не читаются. */
const AT: string = '2026-09-20T10:00:00.000Z';

/** Подписи экрана. На экране их даёт словарь админки, здесь — довод. */
const WORDS: IChatTalkWords = {
    site: 'Площадка',
    state: 'Состояние',
    lastMessageAt: 'Последняя реплика',
    stateLive: 'Живой',
    stateClosed: 'Закрыт',
    close: 'Закрыть разговор',
    reopen: 'Открыть снова',
    untitled: 'Без реплик',
};

/** Разговор списка. Состояние называется доводом: о нём и спрашивают. */
function talk(state: EChatTalkState, lastMessage: string = 'где мой заказ?'): IChat.Talk.State {
    return {
        state,
        lastMessage,
        id: 'разговор-1',
        siteId: 'площадка-1',
        lastMessageAt: AT,
        lastMessageSide: EChatSide.Visitor,
    };
}

describe('разговор на рабочем столе', () => {
    it('SC-CH-95 — подробности показывают площадку, состояние и минуту последней реплики', () => {
        const rows: IRtWorkspaceDetails.Row[] = chatTalkDetailRows(talk(EChatTalkState.Live), WORDS, 'ru-RU');

        expect(rows.map((row: IRtWorkspaceDetails.Row): string => row.label)).toEqual(['Площадка', 'Состояние', 'Последняя реплика']);
        expect(rows[0].value).toBe('площадка-1');
        expect(rows[1].value).toBe('Живой');
        expect(rows[2].value).not.toBe('');
    });

    it('SC-CH-95 — без выбранного разговора подробности пусты', () => {
        expect(chatTalkDetailRows(null, WORDS, 'ru-RU')).toEqual([]);
        expect(chatTalkActions(null, WORDS)).toEqual([]);
        expect(chatTalkTitle(null, WORDS)).toBe('');
    });

    it('SC-CH-95 — состояние закрытого разговора названо своим словом', () => {
        const rows: IRtWorkspaceDetails.Row[] = chatTalkDetailRows(talk(EChatTalkState.Closed), WORDS, 'ru-RU');

        expect(rows[1].value).toBe('Закрыт');
    });

    it('SC-CH-96 — живому разговору предлагают закрыть его, и действие одно', () => {
        const actions: IRtWorkspaceDetails.Action[] = chatTalkActions(talk(EChatTalkState.Live), WORDS);

        expect(actions).toHaveLength(1);
        expect(actions[0].id).toBe(EChatTalkAction.Close);
        expect(actions[0].label).toBe('Закрыть разговор');
    });

    it('SC-CH-96 — закрытому разговору предлагают открыть его снова', () => {
        const actions: IRtWorkspaceDetails.Action[] = chatTalkActions(talk(EChatTalkState.Closed), WORDS);

        expect(actions[0].id).toBe(EChatTalkAction.Reopen);
        expect(actions[0].label).toBe('Открыть снова');
    });

    it('SC-CH-96 — нажатое действие называет состояние, в которое переводит разговор', () => {
        expect(chatTalkStateAfter(EChatTalkAction.Close)).toBe(EChatTalkState.Closed);
        expect(chatTalkStateAfter(EChatTalkAction.Reopen)).toBe(EChatTalkState.Live);
    });

    it('заголовок ленты — последняя реплика разговора', () => {
        expect(chatTalkTitle(talk(EChatTalkState.Live), WORDS)).toBe('где мой заказ?');
    });

    it('разговор без последней реплики зовётся своим словом, а не пустой строкой', () => {
        expect(chatTalkTitle(talk(EChatTalkState.Live, '   '), WORDS)).toBe('Без реплик');
    });
});
