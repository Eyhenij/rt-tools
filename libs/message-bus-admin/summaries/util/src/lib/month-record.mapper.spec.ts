import { MonthRecordMapper, MonthRecordShortMapper } from './month-record.mapper';
import { IMonthRecord } from './month-record.model';

/** Ответ приёмника строкой списка: время в нём строка — так оно переживает передачу. */
function apiShort(patch: Partial<IMonthRecord.Short.Api> = {}): IMonthRecord.Short.Api {
    return {
        id: 'm1',
        tree: { slug: 'a1b2', name: 'Приёмник' },
        month: '2026-08',
        sessions: 19,
        schema: '1',
        ranAt: '2026-08-15T09:20:05.257Z',
        ...patch,
    };
}

describe('MonthRecordShortMapper', () => {
    const mapper: MonthRecordShortMapper = new MonthRecordShortMapper();

    it('время приезжает строкой, а на экран уходит временем', () => {
        const row: IMonthRecord.Short.State = mapper.mapFrom(apiShort());

        expect(row.ranAt).toBeInstanceOf(Date);
        expect(row.ranAt.toISOString()).toBe('2026-08-15T09:20:05.257Z');
    });

    it('дерево читается по полям: признак и имя', () => {
        const row: IMonthRecord.Short.State = mapper.mapFrom(apiShort());

        expect(row.tree).toEqual({ slug: 'a1b2', name: 'Приёмник' });
    });

    it('месяц без сводки приходит нулём заходов, а не пустотой в ячейке', () => {
        const row: IMonthRecord.Short.State = mapper.mapFrom(apiShort({ sessions: null }));

        expect(row.sessions).toBe(0);
        expect(Number.isNaN(row.sessions)).toBe(false);
    });

    it('поле контракта, которого экрану не надо, до него не доезжает', () => {
        const row: IMonthRecord.Short.State = mapper.mapFrom(apiShort());

        expect(Object.keys(row).sort()).toEqual(['id', 'month', 'ranAt', 'sessions', 'tree']);
        expect(Reflect.has(row, 'schema')).toBe(false);
    });

    it('строка списка сводки не несёт', () => {
        const row: IMonthRecord.Short.State = mapper.mapFrom(apiShort());

        expect(Reflect.has(row, 'summary')).toBe(false);
    });
});

describe('MonthRecordMapper', () => {
    const mapper: MonthRecordMapper = new MonthRecordMapper();

    it('сводка приезжает телом, а на экран уходит текстом', () => {
        const entity: IMonthRecord.State = mapper.mapFrom({ ...apiShort(), summary: { days: 3, kinds: [{ name: 'md', count: 30 }] } });

        expect(typeof entity.summary).toBe('string');
        expect(entity.summary).toContain('"days": 3');
        expect(entity.summary).toContain('"md"');
    });

    it('тело раскладывается по строкам, а не идёт одной', () => {
        const entity: IMonthRecord.State = mapper.mapFrom({ ...apiShort(), summary: { days: 3, tree: 'a1b2' } });

        expect(entity.summary.split('\n').length).toBeGreaterThan(1);
    });

    it('тело объявлено блоком кода: разметкой сводка не приезжает, а отступы её раскладки видны', () => {
        const entity: IMonthRecord.State = mapper.mapFrom({ ...apiShort(), summary: { days: 3, tree: 'a1b2' } });
        const lines: string[] = entity.summary.split('\n');

        expect(lines[0]).toBe('```json');
        expect(lines[lines.length - 1]).toBe('```');
        expect(entity.summary).toContain('    "days": 3');
    });

    it('месяц без сводки читается пустым текстом, а не строкой «null»', () => {
        const entity: IMonthRecord.State = mapper.mapFrom({ ...apiShort(), summary: null });

        expect(entity.summary).toBe('');
        expect(entity.sessions).toBe(19);
    });

    it('тело, которого не разложить в текст, даёт пустоту, а не роняет перевод', () => {
        const looped: Record<string, unknown> = {};

        looped['self'] = looped;

        const entity: IMonthRecord.State = mapper.mapFrom({ ...apiShort(), summary: looped });

        expect(entity.summary).toBe('');
    });

    it('разметка, приехавшая с дерева, доезжает до экрана как есть', () => {
        const entity: IMonthRecord.State = mapper.mapFrom({ ...apiShort(), summary: { note: '<script>alert(1)</script>' } });

        expect(entity.summary).toContain('<script>alert(1)</script>');
    });
});
