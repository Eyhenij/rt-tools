import { describe, expect, it } from 'vitest';

import { ECargoState } from '@rt/message-bus-common';

import { postmortemArrivalUpdate } from './postmortem-arrival.util';

const TEXT: string = 'Промах: гейт правил звал на серверную сторону правило витрины.';

describe('postmortemArrivalUpdate', () => {
    it('SC-MB-169 — приезд с другим текстом возвращает разбор в «новое»', () => {
        expect(postmortemArrivalUpdate(TEXT, 'исправленный текст')).toEqual({ text: 'исправленный текст', state: ECargoState.New });
    });

    it('SC-MB-170 — приезд с тем же текстом состояния не называет вовсе', () => {
        expect(postmortemArrivalUpdate(TEXT, TEXT)).toEqual({ text: TEXT });
    });

    it('лежащего текста нет: состояние ставит умолчание колонки, а не правка', () => {
        expect(postmortemArrivalUpdate(undefined, TEXT)).toEqual({ text: TEXT });
    });
});
