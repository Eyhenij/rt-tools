import { ECargoState } from '@rt/message-bus-common';

import { ProposalMapper, ProposalShortMapper } from './proposal.mapper';
import { IProposal } from './proposal.model';

/** Ответ приёмника строкой списка: время в нём строка — так оно переживает передачу. */
function apiShort(patch: Partial<IProposal.Short.Api> = {}): IProposal.Short.Api {
    return {
        id: 'q1',
        tree: { slug: 'a1b2', name: 'Приёмник' },
        resource: 'rules/lists.md',
        address: 'Ловушки',
        state: 'in_work',
        arrivedAt: '2026-08-14T21:30:00.000Z',
        ...patch,
    };
}

describe('ProposalShortMapper', () => {
    const mapper: ProposalShortMapper = new ProposalShortMapper();

    it('время приезжает строкой, а на экран уходит временем', () => {
        const row: IProposal.Short.State = mapper.mapFrom(apiShort());

        expect(row.arrivedAt).toBeInstanceOf(Date);
        expect(row.arrivedAt.toISOString()).toBe('2026-08-14T21:30:00.000Z');
    });

    it('дерево читается по полям: признак и имя', () => {
        const row: IProposal.Short.State = mapper.mapFrom(apiShort());

        expect(row.tree).toEqual({ slug: 'a1b2', name: 'Приёмник' });
    });

    it('поля, которых в ответе нет, не роняют перевод', () => {
        const row: IProposal.Short.State = mapper.mapFrom({
            ...apiShort(),
            tree: undefined,
            resource: undefined,
            address: undefined,
        } as never);

        expect(row.tree).toEqual({ slug: '', name: '' });
        expect(row.resource).toBe('');
        expect(row.address).toBe('');
    });

    it('поле, которого модель не называла, на экран не переезжает', () => {
        const row: IProposal.Short.State = mapper.mapFrom({ ...apiShort(), text: 'всё предложение' } as never);

        expect(Object.keys(row).sort()).toEqual(['address', 'arrivedAt', 'id', 'resource', 'state', 'tree']);
    });

    it('SC-MB-167 — состояние приезжает строкой, а на экран уходит значением набора', () => {
        expect(mapper.mapFrom(apiShort()).state).toBe(ECargoState.InWork);
        expect(mapper.mapFrom(apiShort({ state: 'new' })).state).toBe(ECargoState.New);
    });

    it('состояние вне набора читается как новое, а не уходит на экран машинной строкой', () => {
        expect(mapper.mapFrom(apiShort({ state: 'разобрано наполовину' })).state).toBe(ECargoState.New);
        expect(mapper.mapFrom({ ...apiShort(), state: undefined } as never).state).toBe(ECargoState.New);
    });

    it('строка списка ни текста предложения, ни месяца не несёт', () => {
        const row: IProposal.Short.State = mapper.mapFrom(apiShort());

        expect(Reflect.has(row, 'text')).toBe(false);
        expect(Reflect.has(row, 'month')).toBe(false);
    });
});

describe('ProposalMapper', () => {
    const mapper: ProposalMapper = new ProposalMapper();

    it('запись целиком повторяет строку списка и добавляет текст и месяц', () => {
        const entity: IProposal.State = mapper.mapFrom({ ...apiShort(), text: 'ловушку стоит назвать', month: '2026-08' });

        expect(entity.resource).toBe('rules/lists.md');
        expect(entity.address).toBe('Ловушки');
        expect(entity.tree.name).toBe('Приёмник');
        expect(entity.arrivedAt).toBeInstanceOf(Date);
        expect(entity.text).toBe('ловушку стоит назвать');
        expect(entity.month).toBe('2026-08');
    });

    it('запись без текста и месяца читается пустыми строками, а не поломкой', () => {
        const entity: IProposal.State = mapper.mapFrom(apiShort() as IProposal.Api);

        expect(entity.text).toBe('');
        expect(entity.month).toBe('');
    });

    it('разметка, приехавшая с дерева, доезжает до экрана как есть', () => {
        const raw: string = '<script>alert(1)</script>';
        const entity: IProposal.State = mapper.mapFrom({ ...apiShort(), text: raw, month: '2026-08' });

        expect(entity.text).toBe(raw);
    });
});
