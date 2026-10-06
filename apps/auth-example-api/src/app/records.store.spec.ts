import { describe, expect, it } from 'vitest';

import { IExampleRecord, RecordsStore, TITLE_LIMIT } from './records.store';

describe('RecordsStore', () => {
    it('keeps records in the order they came, numbered from one', () => {
        const store: RecordsStore = new RecordsStore();

        store.add('first', 'reader@example.test');
        store.add('second', null);

        expect(store.list()).toEqual([
            { id: 1, title: 'first', author: 'reader@example.test' },
            { id: 2, title: 'second', author: null },
        ]);
    });

    it('trims the title and cuts it at the limit', () => {
        const store: RecordsStore = new RecordsStore();

        const record: IExampleRecord = store.add(`  ${'a'.repeat(TITLE_LIMIT + 10)}  `, null);

        expect(record.title).toBe('a'.repeat(TITLE_LIMIT));
    });

    it('gives out a copy of the list, not the list itself', () => {
        const store: RecordsStore = new RecordsStore();

        (store.list() as IExampleRecord[]).push({ id: 9, title: 'foreign', author: null });

        expect(store.list()).toEqual([]);
    });
});
