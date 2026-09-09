import { ECargoState } from '@rt/message-bus-common';

import { PostmortemMapper, PostmortemShortMapper } from './postmortem.mapper';
import { IPostmortem } from './postmortem.model';

/** Ответ приёмника строкой списка: времена в нём строки — так они переживают передачу. */
function apiShort(patch: Partial<IPostmortem.Short.Api> = {}): IPostmortem.Short.Api {
    return {
        id: 'p1',
        tree: { slug: 'a1b2', name: 'Приёмник' },
        file: '2026-08-14-incident.md',
        state: 'in_work',
        releaseVersion: null,
        arrivedAt: '2026-08-14T21:30:00.000Z',
        updatedAt: '2026-08-15T06:00:00.000Z',
        ...patch,
    };
}

describe('PostmortemShortMapper', () => {
    const mapper: PostmortemShortMapper = new PostmortemShortMapper();

    it('время приезжает строкой, а на экран уходит временем', () => {
        const row: IPostmortem.Short.State = mapper.mapFrom(apiShort());

        expect(row.arrivedAt).toBeInstanceOf(Date);
        expect(row.arrivedAt.toISOString()).toBe('2026-08-14T21:30:00.000Z');
        expect(row.updatedAt.toISOString()).toBe('2026-08-15T06:00:00.000Z');
    });

    it('дерево читается по полям: признак и имя', () => {
        const row: IPostmortem.Short.State = mapper.mapFrom(apiShort());

        expect(row.tree).toEqual({ slug: 'a1b2', name: 'Приёмник' });
    });

    it('поля, которых в ответе нет, не роняют перевод', () => {
        const row: IPostmortem.Short.State = mapper.mapFrom({ ...apiShort(), tree: undefined, file: undefined } as never);

        expect(row.tree).toEqual({ slug: '', name: '' });
        expect(row.file).toBe('');
    });

    it('поле, которого модель не называла, на экран не переезжает', () => {
        const row: IPostmortem.Short.State = mapper.mapFrom({ ...apiShort(), text: 'весь разбор' } as never);

        expect(Object.keys(row).sort()).toEqual([
            'arrivedAt',
            'closedByPublisher',
            'file',
            'id',
            'quarantineNote',
            'releaseVersion',
            'state',
            'stateLabel',
            'tree',
            'updatedAt',
        ]);
    });

    it('SC-MB-237 — версия выпуска доезжает до строки списка как есть', () => {
        expect(mapper.mapFrom(apiShort({ releaseVersion: '0.10.0' })).releaseVersion).toBe('0.10.0');
    });

    it('SC-MB-238 — строка записи без версии несёт пустую строку, а не пустоту', () => {
        expect(mapper.mapFrom(apiShort()).releaseVersion).toBe('');
    });

    it('SC-MB-167 — состояние приезжает строкой, а на экран уходит значением набора', () => {
        expect(mapper.mapFrom(apiShort()).state).toBe(ECargoState.InWork);
        expect(mapper.mapFrom(apiShort({ state: 'new' })).state).toBe(ECargoState.New);
    });

    it('SC-MB-171 — рядом с состоянием строка несёт его слово человека', () => {
        expect(mapper.mapFrom(apiShort()).stateLabel).toBe('В работе');
        expect(mapper.mapFrom(apiShort({ state: 'released' })).stateLabel).toBe('Выпущено');
    });

    it('состояние вне набора читается как новое, а не уходит на экран машинной строкой', () => {
        expect(mapper.mapFrom(apiShort({ state: 'разобрано наполовину' })).state).toBe(ECargoState.New);
        expect(mapper.mapFrom({ ...apiShort(), state: undefined } as never).state).toBe(ECargoState.New);
    });

    it('строка списка текста разбора не несёт', () => {
        const row: IPostmortem.Short.State = mapper.mapFrom(apiShort());

        expect(Reflect.has(row, 'text')).toBe(false);
    });
});

describe('PostmortemMapper', () => {
    const mapper: PostmortemMapper = new PostmortemMapper();

    it('запись целиком повторяет строку списка и добавляет текст', () => {
        const entity: IPostmortem.State = mapper.mapFrom({ ...apiShort(), text: '# Разбор\nупало ночью' });

        expect(entity.file).toBe('2026-08-14-incident.md');
        expect(entity.tree.name).toBe('Приёмник');
        expect(entity.arrivedAt).toBeInstanceOf(Date);
        expect(entity.text).toBe('# Разбор\nупало ночью');
    });

    it('запись без текста читается пустым текстом, а не поломкой', () => {
        const entity: IPostmortem.State = mapper.mapFrom(apiShort() as IPostmortem.Api);

        expect(entity.text).toBe('');
    });

    it('разметка, приехавшая с дерева, доезжает до экрана как есть', () => {
        const raw: string = '<script>alert(1)</script>';
        const entity: IPostmortem.State = mapper.mapFrom({ ...apiShort(), text: raw });

        expect(entity.text).toBe(raw);
    });

    it('SC-MB-189 — текст починки доезжает до экрана как есть', () => {
        const entity: IPostmortem.State = mapper.mapFrom({ ...apiShort(), text: '# Разбор', fixNote: 'статьёй правила' });

        expect(entity.fixNote).toBe('статьёй правила');
    });

    it('SC-MB-190 — запись без текста починки читается пустой строкой, а не пустотой', () => {
        const entity: IPostmortem.State = mapper.mapFrom({ ...apiShort(), text: '# Разбор', fixNote: null });

        expect(entity.fixNote).toBe('');
    });

    it('SC-MB-205 — версия выпуска доезжает до экрана как есть', () => {
        const entity: IPostmortem.State = mapper.mapFrom({ ...apiShort(), text: '# Разбор', releaseVersion: 'rt-agent-kit@0.10.1' });

        expect(entity.releaseVersion).toBe('rt-agent-kit@0.10.1');
    });

    it('SC-MB-206 — запись без версии читается пустой строкой, а не пустотой', () => {
        const entity: IPostmortem.State = mapper.mapFrom({ ...apiShort(), text: '# Разбор', releaseVersion: null });

        expect(entity.releaseVersion).toBe('');
    });
});
