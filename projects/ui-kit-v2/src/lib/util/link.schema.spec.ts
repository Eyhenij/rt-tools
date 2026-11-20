import Ajv2020, { ValidateFunction } from 'ajv/dist/2020';

import { IRtLinkData, rtLinkData } from './link-data';
import { RT_AI_CHAT_LINK_SCHEMA } from './link.schema';

/** Схема написана рукой. Спека проверяет образцы настоящим валидатором и сверяет принятое с данными блока. */
describe('RT_AI_CHAT_LINK_SCHEMA', (): void => {
    const validate: ValidateFunction = new Ajv2020({ strict: false }).compile(RT_AI_CHAT_LINK_SCHEMA);

    it('SC-UKV-1497 — схема принимает блок с названием и адресом и отвергает блок без адреса', (): void => {
        expect(validate({ title: 'Продажи', url: '/reports', section: 'Отчёты · Продажи', icon: 'chart-bar' })).toBe(true);
        expect(validate({ title: 'Продажи', url: '/reports' })).toBe(true);
        expect(validate({ title: 'Продажи', section: 'Отчёты · Продажи' })).toBe(false);
        expect(validate({ title: '', url: '/reports' })).toBe(false);
        expect(validate({ title: 'Продажи', url: 42 })).toBe(false);
    });

    it('SC-UKV-1497 — в схеме нет исхода открытия и причины: их дописывает приложение', (): void => {
        const properties: unknown = Reflect.get(RT_AI_CHAT_LINK_SCHEMA, 'properties');

        expect(Reflect.get(RT_AI_CHAT_LINK_SCHEMA, '$schema')).toBe('https://json-schema.org/draft/2020-12/schema');
        expect(Reflect.get(RT_AI_CHAT_LINK_SCHEMA, 'required')).toEqual(['title', 'url']);
        expect(Object.keys(properties ?? {})).toEqual(['title', 'url', 'section', 'icon']);
    });

    it('SC-UKV-1497 — блок, принятый схемой, рисуется целиком', (): void => {
        const block: object = { title: 'Продажи', url: '/reports', section: 'Отчёты · Продажи', icon: 'chart-bar' };
        const read: IRtLinkData | null = rtLinkData(block);

        expect(validate(block)).toBe(true);
        expect(read).toEqual({ ...block, state: null, reason: null });
    });
});
