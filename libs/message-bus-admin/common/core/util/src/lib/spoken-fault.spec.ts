import { describe, expect, it } from 'vitest';

import { EReadFault } from './read-fault';
import { spokenFaultOf, spokenFaultText } from './spoken-fault';

describe('отказ правки со словом приёмника', (): void => {
    it('SC-MB-362 — отклонённое обращение несёт слово приёмника как есть', (): void => {
        expect(spokenFaultOf(409, { message: ' имя занято ' })).toEqual({ kind: EReadFault.Service, said: 'имя занято' });
        expect(spokenFaultOf(400, 'ждёт имя')).toEqual({ kind: EReadFault.Service, said: 'ждёт имя' });
        expect(spokenFaultOf(404, { message: 'записи нет' })).toEqual({ kind: EReadFault.Missing, said: 'записи нет' });
    });

    it('SC-MB-362 — поломка службы и кончившийся вход слова не несут', (): void => {
        expect(spokenFaultOf(500, { message: 'обращение 1a2b' }).said).toBe('');
        expect(spokenFaultOf(401, { message: 'войдите' })).toEqual({ kind: EReadFault.Session, said: '' });
        expect(spokenFaultOf(0, null)).toEqual({ kind: EReadFault.Timeout, said: '' });
    });

    it('SC-MB-362 — текст человеку: слово приёмника, а без него — строка экрана', (): void => {
        expect(spokenFaultText({ kind: EReadFault.Service, said: 'имя занято' }, 'не удалось')).toBe('имя занято');
        expect(spokenFaultText({ kind: EReadFault.Service, said: '' }, 'не удалось')).toBe('не удалось');
        expect(spokenFaultText(new Error('чужая'), 'не удалось')).toBe('не удалось');
        expect(spokenFaultText({ kind: 'nothing', said: 'x' }, 'не удалось')).toBe('не удалось');
    });
});
