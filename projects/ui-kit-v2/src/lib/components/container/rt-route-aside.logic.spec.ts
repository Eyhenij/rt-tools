import { rootSegmentsOf } from './rt-route-aside.logic';

describe('rootSegmentsOf', () => {
    it('разбирает абсолютный адрес на сегменты', () => {
        expect(rootSegmentsOf(['/settings/properties', 'abc'])).toEqual(['settings', 'properties', 'abc']);
    });

    it('сохраняет вложенный аутлет связанной записи', () => {
        const outlets: unknown = { outlets: { ro: ['booking', 'b1'] } };

        expect(rootSegmentsOf(['/bookings', outlets])).toEqual(['bookings', outlets]);
    });

    it('оставляет относительные команды как есть', () => {
        expect(rootSegmentsOf(['booking', 'b1'])).toEqual(['booking', 'b1']);
    });

    it('оставляет как есть команды, начинающиеся не со строки', () => {
        const outlets: unknown = { outlets: { ro: null } };

        expect(rootSegmentsOf([outlets])).toEqual([outlets]);
    });
});
