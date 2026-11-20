import Ajv2020, { ValidateFunction } from 'ajv/dist/2020';

import { rtAiChatSectionSchema } from './section.schema';
import { IRtSourcesData, rtSourcesData } from './sources-data';
import { RT_AI_CHAT_SOURCES_SCHEMA } from './sources.schema';

/** Схема написана рукой. Спека проверяет образцы настоящим валидатором и сверяет принятое с данными блока. */
describe('RT_AI_CHAT_SOURCES_SCHEMA', (): void => {
    const validate: ValidateFunction = new Ajv2020({ strict: false }).compile(RT_AI_CHAT_SOURCES_SCHEMA);

    it('SC-UKV-1553 — схема принимает блок с названиями и отвергает блок без списка и источник без названия', (): void => {
        expect(validate({ items: [{ title: 'Продажи', detail: 'Ноябрь', icon: 'chart-bar', url: '/reports' }] })).toBe(true);
        expect(validate({ items: [{ title: 'Продажи' }] })).toBe(true);
        expect(validate({})).toBe(false);
        expect(validate({ items: [] })).toBe(false);
        expect(validate({ items: [{ detail: 'Ноябрь' }] })).toBe(false);
        expect(validate({ items: [{ title: '' }] })).toBe(false);
    });

    it('SC-UKV-1553 — название из одних пробелов схема отвергает, как и блок отбрасывает такой источник', (): void => {
        expect(validate({ items: [{ title: '   ' }] })).toBe(false);
        expect(validate({ items: [{ title: ' Продажи ' }] })).toBe(true);
        expect(rtSourcesData({ items: [{ title: '   ' }] })).toBeNull();
    });

    it('SC-UKV-1553 — блок, принятый схемой, рисуется целиком', (): void => {
        const block: { items: object[] } = {
            items: [{ title: 'Продажи', detail: 'Ноябрь', icon: 'chart-bar', url: '/reports' }, { title: 'Склад' }],
        };
        const read: IRtSourcesData | null = rtSourcesData(block);

        expect(validate(block)).toBe(true);
        expect(read?.items).toEqual([
            { title: 'Продажи', detail: 'Ноябрь', icon: 'chart-bar', url: '/reports' },
            { title: 'Склад', detail: null, icon: 'file', url: null },
        ]);
    });

    it('SC-UKV-1553 — схема секции держит схему блока источников как свою', (): void => {
        expect(JSON.stringify(rtAiChatSectionSchema())).toContain('Sources');
    });
});
