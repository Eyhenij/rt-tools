import {
    rtAllOnPage,
    rtAnyOnPage,
    rtExcludedAfterEntity,
    rtExcludedAfterPageMarked,
    rtExcludedAfterPageUnmarked,
    rtKeysOf,
    rtPresetEntities,
    rtSelectedAfterPage,
    rtWithEntity,
    rtWithoutPageEntities,
    rtWithPageEntities,
} from './rt-table-selection.core';

interface IRow {
    id: number;
    name: string;
}

const A: IRow = { id: 1, name: 'А' };
const B: IRow = { id: 2, name: 'Б' };
const C: IRow = { id: 3, name: 'В' };
const D: IRow = { id: 4, name: 'Г' };

describe('ядро выбора строк', () => {
    it('ключи записей берутся по названному полю', () => {
        expect(rtKeysOf([A, C], 'id')).toEqual([1, 3]);
    });

    it('страница добавляется к отмеченным без повторов по ключу', () => {
        expect(rtWithPageEntities([A, B], [{ ...B, name: 'другая копия' }, C], 'id')).toEqual([A, B, C]);
    });

    it('записи страницы снимаются с отметки по ключу, чужие остаются', () => {
        expect(rtWithoutPageEntities([A, B, D], [B, C], 'id')).toEqual([A, D]);
    });

    it('одна запись отмечается в конец и снимается по ключу', () => {
        expect(rtWithEntity([A, B], C, true, 'id')).toEqual([A, B, C]);
        expect(rtWithEntity([A, B], { ...A, name: 'копия' }, false, 'id')).toEqual([B]);
        expect(rtWithEntity([A, B], { ...A, name: 'копия' }, true, 'id')).toEqual([B, { ...A, name: 'копия' }]);
    });

    it('хоть одна и все записи страницы отмечены', () => {
        expect(rtAnyOnPage([A, B], [2], 'id')).toBe(true);
        expect(rtAnyOnPage([A, B], [3], 'id')).toBe(false);
        expect(rtAllOnPage([A, B], [1, 2, 3], 'id')).toBe(true);
        expect(rtAllOnPage([A, B], [1], 'id')).toBe(false);
    });

    it('пустая страница считается отмеченной целиком, как в первом ките', () => {
        expect(rtAllOnPage<IRow, 'id'>([], [], 'id')).toBe(true);
        expect(rtAnyOnPage<IRow, 'id'>([], [1], 'id')).toBe(false);
    });

    it('заранее отмеченные — только записи страницы с названными ключами', () => {
        expect(rtPresetEntities([A, B, C], [3, 1, 99], 'id')).toEqual([A, C]);
    });

    it('под «отметить все» пришедшая страница отмечается, кроме исключённых', () => {
        expect(rtSelectedAfterPage([A], [B, C, D], [C], 'id')).toEqual([A, B, D]);
    });

    it('под «отметить все» снятая запись становится исключением, отмеченная уходит из них', () => {
        expect(rtExcludedAfterEntity([A], B, false, 'id')).toEqual([A, B]);
        expect(rtExcludedAfterEntity([A, B], B, true, 'id')).toEqual([A]);
    });

    it('под «отметить все» отмеченная страница уходит из исключений, снятая становится ими', () => {
        expect(rtExcludedAfterPageMarked([A, B, D], [B, C], 'id')).toEqual([A, D]);
        expect(rtExcludedAfterPageUnmarked([A], [A, C], 'id')).toEqual([A, C]);
    });
});
